/**
 * Mock journey — the always-available, keyless path.
 *
 * Deterministic but genuinely dynamic: the next question is keyed off the most
 * recent answer, and the revealed path-set is *selected and reframed* from the
 * accumulated journey signal — so two different journeys surface different
 * questions and different paths, with no API key. Everything is hedged and
 * labeled by honest provenance; nothing here is a prediction or a recommendation.
 */
import type {
  JourneyNextResponse,
  JourneyQuestion,
  JourneyRevealResponse,
  JourneyState,
  QuestionAnswer,
  ReferenceNote,
  RevealedPath,
} from "./types";
import { JOURNEY_TARGET_NODES, emptyJourneyState } from "./types";

/* ----------------------------- Signal model ------------------------------ */

type ValueTag = "growth" | "freedom" | "security" | "identity" | "opportunity" | "open";

// Prefix (stem) matching: a leading word-boundary then the stem, with NO trailing
// boundary — so "secur" matches "security/secure", "opportun" matches "opportunity",
// etc. A trailing \b would (wrongly) require the stem to be a whole word.
const VALUE_KEYWORDS: [ValueTag, RegExp][] = [
  ["freedom", /\b(freedom|ownership|own|autonom|independ|control|build|founder)/],
  ["security", /\b(secur|stable|stabil|safe|income|salary|money|steady|certain|reliab)/],
  ["growth", /\b(growth|momentum|fast|acceler|ambit|level up|skill|compound|learn)/],
  ["identity", /\b(identity|meaning|purpose|who i am|fit|alive|energiz|matter|fulfil)/],
  ["opportunity", /\b(opportun|rare|once|window|miss out|upside|bet|big swing|variance)/],
];

/** Human phrasing for a value tag, used to make follow-ups visibly causal. */
const VALUE_PHRASE: Record<ValueTag, string> = {
  growth: "fast growth and momentum",
  freedom: "freedom and ownership",
  security: "security and a clear footing",
  identity: "identity and meaning",
  opportunity: "not missing a rare opportunity",
  open: "clarity about what you actually want",
};

function classify(text: string): ValueTag {
  const t = (text || "").toLowerCase();
  for (const [tag, re] of VALUE_KEYWORDS) if (re.test(t)) return tag;
  return "open";
}

/** Fold the whole answer chain into a fresh JourneyState (idempotent). */
export function deriveState(situation: string, prev: QuestionAnswer[]): JourneyState {
  const state = emptyJourneyState();
  const blob = [situation, ...prev.map((p) => p.answer)].join(" \n ").toLowerCase();

  const tags = new Set<ValueTag>();
  for (const qa of prev) {
    const tag = classify(qa.selectedOption || qa.answer);
    if (tag !== "open") tags.add(tag);
  }
  for (const tag of tags) {
    if (!state.discoveredValues.includes(VALUE_PHRASE[tag])) {
      state.discoveredValues.push(VALUE_PHRASE[tag]);
    }
  }

  if (/\b(scared|afraid|fear|worry|worried|hate|stuck|trapped|regret|wrong path|miss)\b/.test(blob)) {
    state.fears.push("Choosing a path and finding it doesn't fit a year in");
  }
  if (/\b(money|income|pay|salary|rent|loan|afford|debt|fund)\b/.test(blob)) {
    state.constraints.push("Needs a viable financial footing");
  }
  const horizon = blob.match(/\b(\d{1,2})\s?(?:months?|years?)\b/);
  if (horizon) state.timeHorizon = horizon[0];

  // Risk posture inferred from the balance of security vs. opportunity/freedom signals.
  if (tags.has("opportunity") || tags.has("freedom")) {
    state.riskTolerance = tags.has("security") ? "mixed — drawn to upside but wants a floor" : "leans toward upside and optionality";
  } else if (tags.has("security")) {
    state.riskTolerance = "leans toward protecting a stable footing";
  }

  if (tags.has("identity")) state.identitySignals.push("Wants the path to feel like a fit, not just a résumé line");
  if (tags.has("growth")) state.identitySignals.push("Measures a good year by how much they grew");

  // Loose, reframed directions — never commitments.
  const hints = new Set<string>();
  if (tags.has("growth") || tags.has("security")) hints.add("Build a credible, legible signal on a structured runway");
  if (tags.has("freedom")) hints.add("Self-directed building where you own the outcome");
  if (tags.has("identity")) hints.add("Go deeper on the work that feels alive, even if slower");
  if (tags.has("opportunity")) hints.add("Take one concentrated, time-boxed swing at the rare window");
  if (hints.size < 2) hints.add("Keep two doors open in parallel before committing");
  state.possibleRouteHints = [...hints];

  // Surface the most painful uncertainty as a tag, drawn from explicit answers.
  for (const qa of prev) {
    const a = (qa.selectedOption || qa.answer || "").trim();
    if (qa.prompt.toLowerCase().includes("uncertainty") && a) {
      state.uncertaintyTags.push(a.toLowerCase().slice(0, 40));
    }
  }

  return state;
}

/* ------------------------------ Question bank ----------------------------- */

function questionForNode(index: number, prevTag: ValueTag): JourneyQuestion {
  if (index === 0) {
    return {
      id: "jq1",
      prompt: "When you picture this going well a year from now, what are you most trying to protect?",
      type: "choice",
      options: [
        "Momentum & growth",
        "Freedom & ownership",
        "Security & a clear footing",
        "Identity & meaning",
        "Not missing a rare opportunity",
      ],
      whyThisQuestion:
        "Your dominant pull reshapes which paths are even worth comparing — the same option can be a win or a loss depending on it.",
      whatItSeparates: ["core value", "what you optimize for"],
    };
  }

  if (index === 1) {
    // Causally led by the value chosen at node 0.
    const lead = `Based on your last answer, ${VALUE_PHRASE[prevTag]} seems to matter most. `;
    if (prevTag === "freedom") {
      return {
        id: "jq2",
        prompt: lead + "What kind of freedom are you really protecting?",
        type: "choice",
        options: ["Control over my time", "Control over what I build", "Control over who I answer to"],
        whyThisQuestion: "Different kinds of freedom point to very different paths and tradeoffs.",
        whatItSeparates: ["freedom type", "autonomy"],
      };
    }
    if (prevTag === "security") {
      return {
        id: "jq2",
        prompt: lead + "Is the security you want financial, or more about a clear next step you can actually see?",
        type: "choice",
        options: ["Financial floor", "A visible, legible next step", "Both, roughly equally"],
        whyThisQuestion: "Financial security and legibility look similar but pull toward different paths.",
        whatItSeparates: ["security type", "binding constraint"],
      };
    }
    if (prevTag === "opportunity") {
      return {
        id: "jq2",
        prompt: lead + "Is that rare opportunity something specific you can name, or a feeling that a window is closing?",
        type: "short_text",
        whyThisQuestion: "A nameable opportunity is testable; a vague closing window is often a fear worth checking.",
        whatItSeparates: ["concreteness", "untested assumption"],
      };
    }
    if (prevTag === "identity") {
      return {
        id: "jq2",
        prompt: lead + "When has work felt most like *you* — and what was present in that moment?",
        type: "short_text",
        whyThisQuestion: "The texture of past fit is better signal for identity-fit than any label.",
        whatItSeparates: ["identity fit", "what energizes you"],
      };
    }
    // growth / open
    return {
      id: "jq2",
      prompt: lead + "Growth in what, exactly — your skills, your reputation, or the size of what you can take on?",
      type: "choice",
      options: ["Depth of skill", "External reputation/signal", "Scope of responsibility"],
      whyThisQuestion: "These three kinds of growth reward very different next moves.",
      whatItSeparates: ["growth type", "compounding"],
    };
  }

  if (index === 2) {
    return {
      id: "jq3",
      prompt:
        "Which uncertainty feels most painful right now — the one you'd most want resolved before deciding?",
      type: "choice",
      options: [
        "Income / security",
        "Ownership / freedom",
        "Intellectual depth",
        "External validation",
        "Whether I'd even enjoy it",
      ],
      whyThisQuestion: "The most painful uncertainty is usually the first thing worth a small test.",
      whatItSeparates: ["binding uncertainty", "what to test first"],
    };
  }

  if (index === 3) {
    return {
      id: "jq4",
      prompt: "What would make this decision feel successful 12 months from now — in your own words?",
      type: "short_text",
      whyThisQuestion:
        "Your own definition of success is the yardstick the paths should be measured against — not a generic one.",
      whatItSeparates: ["success criteria", "12-month yardstick"],
    };
  }

  // Fallback (should not be reached before the done check).
  return {
    id: `jq${index + 1}`,
    prompt: "Anything important about this decision we haven't touched yet?",
    type: "short_text",
    whyThisQuestion: "A final open prompt can surface a constraint the structured questions missed.",
    whatItSeparates: ["residual signal"],
  };
}

/* ------------------------------- Next node -------------------------------- */

export function buildMockJourneyNext(
  situation: string,
  previousQuestions: QuestionAnswer[],
): JourneyNextResponse {
  const index = previousQuestions.length;
  const updatedState = deriveState(situation, previousQuestions);

  if (index >= JOURNEY_TARGET_NODES) {
    return {
      mocked: true,
      done: true,
      updatedState,
      references: buildReferences(situation, previousQuestions, updatedState),
    };
  }

  const prevTag = index > 0 ? classify(previousQuestions[index - 1].selectedOption || previousQuestions[index - 1].answer) : "open";
  const question = questionForNode(index, prevTag);

  return { mocked: true, done: false, question, updatedState };
}

/* ------------------------------ References -------------------------------- */

function buildReferences(
  situation: string,
  prev: QuestionAnswer[],
  state: JourneyState,
): ReferenceNote[] {
  const refs: ReferenceNote[] = [];

  // 1. User-provided signals — drawn from the user's actual answers.
  for (const v of state.discoveredValues.slice(0, 2)) {
    refs.push({
      label: "What you told us",
      sourceType: "user_answer",
      summary: `You signaled that ${v} weighs heavily for you.`,
      usedFor: "Choosing and reframing which paths to put in front of you",
    });
  }
  if (state.timeHorizon) {
    refs.push({
      label: "Your time horizon",
      sourceType: "user_answer",
      summary: `You framed this over roughly ${state.timeHorizon}.`,
      usedFor: "Sizing each path's first test to your window",
    });
  }

  // 2. Curated references — real, well-known framings, kept at framework/occupation
  // level with no invented statistics.
  refs.push({
    label: "Decision-science framing (premortem · reversibility)",
    sourceType: "curated_reference",
    summary:
      "Standard decision-quality practice: name how each path could fail in advance and judge how reversible it is, rather than optimizing a single forecast.",
    usedFor: "Structuring each path's risks and its 7-day test",
  });
  refs.push({
    label: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook",
    sourceType: "curated_reference",
    summary:
      "Public, occupation-level framing of duties, typical demand direction, and the education a field tends to expect — never an individual outcome.",
    usedFor: "Grounding the career-shaped paths at their true coverage level",
  });

  // 3. AI-inferred assumptions — clearly flagged.
  if (state.riskTolerance) {
    refs.push({
      label: "Inferred risk posture",
      sourceType: "ai_inferred",
      summary: `From the balance of your answers, your posture reads as: ${state.riskTolerance}. This is an assumption to confirm, not a measurement.`,
      usedFor: "Tuning how aggressive each path's first move is",
    });
  }
  refs.push({
    label: "Inferred fork",
    sourceType: "ai_inferred",
    summary:
      "The reframed paths are inferred from patterns across your answers — a reasonable reading you should edit, not a verdict.",
    usedFor: "Naming paths you may not have listed yourself",
  });

  return refs;
}

/* -------------------------------- Reveal ---------------------------------- */

type Archetype = {
  key: string;
  idBase: string;
  scores: Partial<Record<ValueTag, number>>;
  build: (ctx: { dominant: ValueTag; horizon?: string }) => RevealedPath;
};

const ARCHETYPES: Archetype[] = [
  {
    key: "credible-signal",
    idBase: "credible-signal",
    scores: { security: 3, growth: 2, opportunity: 1 },
    build: () => ({
      id: "credible-signal-path",
      title: "Build one credible, legible signal",
      shortDescription:
        "Concentrate the near term on a single, demonstrable signal that opens structured doors — trading some breadth for a clear on-ramp.",
      whatItOptimizesFor: "A legible footing and momentum others can recognize quickly",
      whatItRisks: "Narrowing early and under-weighting paths that don't show up on a résumé",
      whatYouMightMiss: "The compounding that comes from owning something end-to-end yourself",
      sevenDayTest:
        "Spend 5 focused days producing one small, sharable artifact in the target direction, then show it to two people in that world and note what they push on.",
      evidenceNotes: [
        {
          label: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook",
          sourceType: "curated_reference",
          summary: "Occupation-level framing of how structured fields tend to screen and on-ramp talent.",
          usedFor: "Shaping what a 'legible signal' looks like here",
        },
        {
          label: "Your stated pull toward a clear footing",
          sourceType: "user_answer",
          summary: "You weighted security/legibility highly in your answers.",
          usedFor: "Why this path is on the board",
        },
      ],
    }),
  },
  {
    key: "independent-builder",
    idBase: "independent-builder",
    scores: { freedom: 3, opportunity: 2, growth: 1 },
    build: () => ({
      id: "independent-builder-path",
      title: "Self-directed building you own",
      shortDescription:
        "Bias toward making something where you hold the outcome — slower legibility, but the work and the upside are yours.",
      whatItOptimizesFor: "Ownership, optionality, and learning that compounds across futures",
      whatItRisks: "Thin external validation and a longer, lonelier feedback loop",
      whatYouMightMiss: "The fast, structured mentorship a more legible track can provide",
      sevenDayTest:
        "Ship the smallest real version of the thing this week and put it in front of five potential users; track whether anyone returns unprompted.",
      evidenceNotes: [
        {
          label: "Your stated pull toward ownership",
          sourceType: "user_answer",
          summary: "Freedom/ownership recurred across your answers.",
          usedFor: "Why this path is on the board",
        },
        {
          label: "Reversibility framing",
          sourceType: "curated_reference",
          summary: "Building small and reversibly lets you test the path without committing the year.",
          usedFor: "Designing the 7-day test",
        },
      ],
    }),
  },
  {
    key: "depth-first",
    idBase: "depth-first",
    scores: { identity: 3, growth: 2 },
    build: () => ({
      id: "depth-first-path",
      title: "Go deeper on the work that feels alive",
      shortDescription:
        "Follow the thread that energizes you and invest in real depth — accepting slower legibility for a stronger fit and a distinctive edge.",
      whatItOptimizesFor: "Identity fit and a durable, hard-to-copy depth",
      whatItRisks: "Slower external payoff and the pull of paths that look more 'sensible' from outside",
      whatYouMightMiss: "Near-term security and the optionality of staying broad",
      sevenDayTest:
        "Spend the week on the most demanding real problem in that area and notice, honestly, whether the hard parts energize or drain you.",
      evidenceNotes: [
        {
          label: "Your stated pull toward meaning/fit",
          sourceType: "user_answer",
          summary: "Identity and 'work that feels alive' showed up in your answers.",
          usedFor: "Why this path is on the board",
        },
        {
          label: "AI-inferred fit hypothesis",
          sourceType: "ai_inferred",
          summary: "That depth suits you is an assumption worth testing this week, not a conclusion.",
          usedFor: "Framing the test honestly",
        },
      ],
    }),
  },
  {
    key: "time-boxed-swing",
    idBase: "time-boxed-swing",
    scores: { opportunity: 3, freedom: 1 },
    build: () => ({
      id: "time-boxed-swing-path",
      title: "One time-boxed swing at the rare window",
      shortDescription:
        "Take a concentrated, deadline-bound shot at the opportunity that feels rare — with a pre-set point where you stop and reassess.",
      whatItOptimizesFor: "Upside and resolving 'what if I'd tried' without an open-ended gamble",
      whatItRisks: "Sinking real time into a window that may be less rare than it feels",
      whatYouMightMiss: "Steadier compounding on a path you could hold for years",
      sevenDayTest:
        "Write the one falsifiable thing that would prove the window is real, then spend the week trying to find that evidence before committing further.",
      evidenceNotes: [
        {
          label: "Your stated fear of missing out",
          sourceType: "user_answer",
          summary: "A sense of a closing opportunity recurred in your answers.",
          usedFor: "Why this path is on the board",
        },
        {
          label: "Premortem framing",
          sourceType: "curated_reference",
          summary: "Pre-committing a stop point turns a gamble into a bounded experiment.",
          usedFor: "Designing the kill-criteria for the swing",
        },
      ],
    }),
  },
  {
    key: "parallel-paths",
    idBase: "parallel-paths",
    scores: { open: 3, security: 1, identity: 1 },
    build: () => ({
      id: "parallel-paths-path",
      title: "Keep two doors open, briefly",
      shortDescription:
        "Run a short, deliberate parallel test of your two strongest directions before committing — buying information instead of a guess.",
      whatItOptimizesFor: "Resolving the core uncertainty cheaply before it's expensive",
      whatItRisks: "Spreading thin and mistaking motion for progress if it drags on",
      whatYouMightMiss: "The compounding focus that comes from committing fully and early",
      sevenDayTest:
        "Give each of your two leading directions one real, comparable task this week, then write down which one you found yourself protecting time for.",
      evidenceNotes: [
        {
          label: "Information-value framing",
          sourceType: "curated_reference",
          summary: "When the cost of deciding now is high and a cheap test exists, buying information first tends to pay off.",
          usedFor: "Justifying a brief parallel test",
        },
        {
          label: "AI-inferred uncertainty",
          sourceType: "ai_inferred",
          summary: "Your answers read as still genuinely split — an assumption you can confirm by trying both small.",
          usedFor: "Why a parallel test is offered",
        },
      ],
    }),
  },
];

function dominantTag(state: JourneyState, answers: QuestionAnswer[]): ValueTag {
  const counts: Record<ValueTag, number> = {
    growth: 0, freedom: 0, security: 0, identity: 0, opportunity: 0, open: 0,
  };
  for (const qa of answers) counts[classify(qa.selectedOption || qa.answer)] += 1;
  let best: ValueTag = "open";
  let bestN = -1;
  for (const tag of Object.keys(counts) as ValueTag[]) {
    if (tag !== "open" && counts[tag] > bestN) {
      best = tag;
      bestN = counts[tag];
    }
  }
  return bestN <= 0 ? "open" : best;
}

export function buildMockJourneyReveal(
  situation: string,
  answers: QuestionAnswer[],
  journeyState: JourneyState,
): JourneyRevealResponse {
  const state =
    journeyState && journeyState.discoveredValues.length
      ? journeyState
      : deriveState(situation, answers);
  const dominant = dominantTag(state, answers);

  // Score archetypes against the journey and take the three best — so different
  // journeys reveal different (reframed) path-sets. Always include a contrast.
  const scored = ARCHETYPES.map((a) => ({
    a,
    score: (a.scores[dominant] ?? 0) + (a.scores.open ?? 0) * (dominant === "open" ? 1 : 0),
  }));
  scored.sort((x, y) => y.score - x.score);
  const chosen = scored.slice(0, 3).map((s) => s.a);
  // Guarantee a contrasting third path if the top three cluster on one value.
  if (chosen.length < 3) {
    for (const a of ARCHETYPES) {
      if (chosen.length >= 3) break;
      if (!chosen.includes(a)) chosen.push(a);
    }
  }

  const routes = chosen.map((a) => a.build({ dominant, horizon: state.timeHorizon }));

  const valuePhrase = state.discoveredValues[0] ?? VALUE_PHRASE[dominant];
  const secondPhrase = state.discoveredValues[1] ?? "a steadier footing";

  return {
    mocked: true,
    decision:
      "Over the next chapter, which of these directions do you want to actually try first — knowing you can still revisit the others?",
    coreQuestion: `Underneath the surface choice, you seem to be deciding how much to weight ${valuePhrase} against ${secondPhrase}.`,
    valueConflict: `A pull toward ${valuePhrase} set against the comfort of ${secondPhrase} — both real, and not fully satisfiable at once.`,
    routes,
    references: buildReferences(situation, answers, state),
  };
}
