/**
 * Reveal → Simulation adapter.
 *
 * This is the safety keystone of the guided journey. The model (or mock) only
 * ever emits SMALL shapes (RevealedPath / ReferenceNote). This pure, deterministic
 * function expands them into the canonical contract the rest of the app depends
 * on: a valid UserContext plus EXACTLY THREE schema-complete FutureBranch objects
 * wrapped in a SimulationResult. Because every required FutureBranch field is
 * filled here in code, malformed AI can never reach /map, /branch, or /brief, and
 * the result always satisfies simulationResultSchema (3 branches).
 */
import type {
  EvidenceCard,
  FutureBranch,
  Level,
  SimulationResult,
  SourceType,
  UserContext,
} from "../types";
import type {
  JourneyRevealResponse,
  JourneyState,
  ReferenceNote,
  RevealedPath,
} from "./types";

function slugify(s: string, fallback: string): string {
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

/** Honest mapping from a journey evidence label to the core EvidenceCard provenance. */
function sourceTypeFor(note: ReferenceNote): SourceType {
  switch (note.sourceType) {
    case "user_answer":
      return "user_provided";
    case "curated_reference":
      return "curated_research";
    default:
      return "ai_inferred";
  }
}

function strengthFor(note: ReferenceNote): Level {
  return note.sourceType === "ai_inferred" ? "low" : "medium";
}

function evidenceCardsFor(path: RevealedPath, branchId: string): EvidenceCard[] {
  return path.evidenceNotes.map((note, i) => ({
    id: `${branchId}-ev-${i + 1}`,
    title: note.label,
    category: "Journey evidence",
    content: note.summary,
    sourceType: sourceTypeFor(note),
    usedFor: note.usedFor,
    evidenceStrength: strengthFor(note),
  }));
}

/** Expand a single RevealedPath into a full, schema-valid FutureBranch. */
function branchFromPath(path: RevealedPath, index: number, usedIds: Set<string>): FutureBranch {
  let id = slugify(path.id || path.title, `path-${index + 1}`);
  while (usedIds.has(id)) id = `${id}-${index + 1}`;
  usedIds.add(id);

  // Reversibility reads higher when the path is explicitly framed as a test/door.
  const reversibility: Level = /\b(test|door|parallel|reversible|small|try|window)\b/i.test(
    `${path.title} ${path.shortDescription} ${path.sevenDayTest}`,
  )
    ? "high"
    : "medium";

  const evidenceStrength: Level = path.evidenceNotes.some(
    (n) => n.sourceType === "curated_reference",
  )
    ? "medium"
    : "low";

  return {
    id,
    track: path.title,
    title: path.title,
    thesis: path.shortDescription,
    baseRateSignals: [
      {
        claim: `This path tends to optimize for ${path.whatItOptimizesFor.toLowerCase()} — a pattern, not a promise for your specific case.`,
        source: "Decision-science framing",
        coverageLevel: "framework-level",
        confidence: "medium",
        limitations:
          "Framework-level reasoning about a class of paths — it says nothing certain about your individual outcome.",
      },
    ],
    evidenceCards: evidenceCardsFor(path, id),
    twelveMonthTrajectory: [
      {
        time: "Week 1",
        description: `Run the small test: ${path.sevenDayTest}`,
        uncertaintyNote: "The point is to replace one assumption with real signal, not to commit.",
      },
      {
        time: "Month 1–3",
        description: `If the early signal holds, lean further into what this path optimizes for: ${path.whatItOptimizesFor.toLowerCase()}.`,
        uncertaintyNote: "Assumes the first week's signal generalizes — worth re-checking, not assuming.",
      },
      {
        time: "Month 4–12",
        description: `Watch the main risk as it compounds: ${path.whatItRisks.toLowerCase()}.`,
        uncertaintyNote: "A possible trajectory under current assumptions, not a forecast.",
      },
    ],
    hiddenTradeoffs: [path.whatItRisks],
    opportunityCosts: [path.whatYouMightMiss],
    reversibility,
    skillCompounding: `Over time this path may compound ${path.whatItOptimizesFor.toLowerCase()}.`,
    emotionalLoad:
      "The load here is mostly the tension of holding this path against the ones you're not taking — manageable if you keep the test small.",
    bottlenecks: [`The real bottleneck is testing whether this path delivers ${path.whatItOptimizesFor.toLowerCase()} for you specifically.`],
    assumptions: [
      {
        claim: `That this path actually delivers ${path.whatItOptimizesFor.toLowerCase()} for you.`,
        type: "ai_inferred",
        confidence: "low",
        howToTest: path.sevenDayTest,
      },
    ],
    premortem: [`A year on, the most likely disappointment is: ${path.whatItRisks.toLowerCase()}.`],
    regretRadar: [
      {
        regretType: "opportunity",
        level: "medium",
        description: path.whatYouMightMiss,
      },
    ],
    sevenDayExperiment: [
      {
        day: 1,
        action: `Write down the one thing that would tell you this path is worth more of your time.`,
        purpose: "Make the test falsifiable before you start.",
      },
      {
        day: 3,
        action: path.sevenDayTest,
        purpose: "Replace an assumption with a small piece of real signal.",
      },
      {
        day: 7,
        action: "Review what you learned and whether the signal pulled you toward or away from this path.",
        purpose: "Turn the week into a decision input, not a commitment.",
      },
    ],
    killCriteria: [`If the week's signal clearly points away from ${path.whatItOptimizesFor.toLowerCase()}, treat that as a reason to down-weight this path.`],
    calibration: {
      evidenceStrength,
      userFit: "medium",
      constraintRisk: "medium",
      uncertaintyLevel: "high",
      dataCoverageNote:
        "This path was reframed from your journey answers and framework-level reasoning — coverage is honest but qualitative, never an individual prediction.",
      calibrationRationale:
        "Uncertainty is high because the path is inferred from a short conversation; the 7-day test is how you lower it.",
    },
  };
}

/** A synthesized contrasting third path, used only when the reveal returned two. */
function fallbackThirdPath(): RevealedPath {
  return {
    id: "hold-and-compare",
    title: "Hold and compare, briefly",
    shortDescription:
      "Before committing to either path, run a short, deliberate comparison so the choice is made on signal rather than a guess.",
    whatItOptimizesFor: "Resolving the core uncertainty cheaply before it gets expensive",
    whatItRisks: "Drifting if the comparison drags on and becomes a way to avoid deciding",
    whatYouMightMiss: "The compounding focus that comes from committing fully and early",
    sevenDayTest:
      "Give each leading path one real, comparable task this week, then note which one you found yourself protecting time for.",
    evidenceNotes: [
      {
        label: "Information-value framing",
        sourceType: "curated_reference",
        summary:
          "When deciding now is costly and a cheap test exists, buying information first tends to pay off.",
        usedFor: "Justifying a brief, bounded comparison",
      },
    ],
  };
}

/** Coerce the revealed routes to exactly three distinct paths for the map. */
function exactlyThree(routes: RevealedPath[]): RevealedPath[] {
  const out = routes.slice(0, 3);
  while (out.length < 3) out.push(fallbackThirdPath());
  return out;
}

function userContextFromJourney(
  situation: string,
  reveal: JourneyRevealResponse,
  state: JourneyState,
  routes: RevealedPath[],
): UserContext {
  return {
    decision: reveal.decision || "Which direction do I want to try first?",
    options: routes.map((r) => r.title),
    major: "",
    skills: state.identitySignals,
    values: state.discoveredValues,
    constraints: state.constraints,
    fears: state.fears,
    background: situation,
    timeHorizon: state.timeHorizon ?? "",
    urgency: "exploring",
  };
}

export interface JourneySimulation {
  context: UserContext;
  simulation: SimulationResult;
}

/**
 * Build the canonical SimulationResult (+ UserContext) the rest of the app
 * consumes, from a journey reveal. Always returns exactly three valid branches.
 */
export function revealToSimulation(
  situation: string,
  reveal: JourneyRevealResponse,
  state: JourneyState,
): JourneySimulation {
  const routes = exactlyThree(reveal.routes);
  const usedIds = new Set<string>();
  const branches = routes.map((r, i) => branchFromPath(r, i, usedIds));
  const context = userContextFromJourney(situation, reveal, state, routes);

  return {
    context,
    simulation: {
      context,
      branches,
      mocked: reveal.mocked,
      generatedNote: reveal.mocked
        ? "Paths reframed from your guided journey using framework-level reasoning. These are possibilities to weigh and test, not predictions."
        : "Paths reframed live from your guided journey, kept at honest coverage levels. These are possibilities to weigh and test, not predictions.",
    },
  };
}
