/**
 * Forked Futures — guided journey type contract.
 *
 * The "AI-guided decision adventure": a user enters one messy situation, the
 * system asks one causally-led question at a time, and after a few nodes it
 * reveals 2–3 reframed possible paths. These types are deliberately small and
 * isolated from the core lib/types.ts contract — the journey output is mapped
 * into the canonical SimulationResult by lib/journey/adapter.ts, so the rest of
 * the app (map / branch / brief) never depends on these shapes directly.
 *
 * Responsible-AI is first-class here too: every ReferenceNote carries an honest
 * source label, questions never name the user's options for them, and nothing
 * is framed as a prediction or a recommendation.
 */

/** One answered (or skipped) question node in the journey. */
export interface QuestionAnswer {
  questionId: string;
  prompt: string;
  answer: string;
  /** Set when the user picked a multiple-choice option rather than free text. */
  selectedOption?: string;
}

/**
 * Structured state inferred as the user answers — accumulates across nodes so
 * each next question is causally led by what came before. Every field is a soft
 * signal, never a verdict.
 */
export interface JourneyState {
  discoveredValues: string[];
  constraints: string[];
  fears: string[];
  timeHorizon?: string;
  riskTolerance?: string;
  identitySignals: string[];
  uncertaintyTags: string[];
  possibleRouteHints: string[];
}

/** Honest provenance for a piece of evidence shaping the reveal. */
export interface ReferenceNote {
  label: string;
  /** The three honest evidence labels — never "sourced" for an inference. */
  sourceType: "user_answer" | "curated_reference" | "ai_inferred";
  summary: string;
  usedFor: string;
}

export type JourneyQuestionType = "choice" | "short_text" | "mixed";

/** A single guided question node returned by /api/journey/next. */
export interface JourneyQuestion {
  id: string;
  prompt: string;
  type: JourneyQuestionType;
  /** Present for "choice"/"mixed" — short, editable, non-prescriptive options. */
  options?: string[];
  /** Small visible explanation: "why this question matters". */
  whyThisQuestion: string;
  /** What this question is trying to separate (1–3 short tags). */
  whatItSeparates: string[];
}

/** A reframed possible path surfaced at reveal — not one of the user's named options. */
export interface RevealedPath {
  id: string;
  title: string;
  shortDescription: string;
  whatItOptimizesFor: string;
  whatItRisks: string;
  whatYouMightMiss: string;
  sevenDayTest: string;
  evidenceNotes: ReferenceNote[];
}

/* --------------------------- Route universe (v3) -------------------------- */

/** Qualitative axis level for the route portfolio — never a probability. */
export type RouteLevel = "Low" | "Medium" | "High";
/** Time-horizon band a route plays out over. */
export type RouteHorizon = "Short" | "Medium" | "Long";
/** Qualitative confidence band — a match/coverage read, not a forecast. */
export type RouteConfidence = "Low" | "Medium" | "High";

/** Honest provenance split for what shaped a single route. */
export interface RouteEvidenceSupport {
  /** Signals the user actually gave (from their answers + journey state). */
  userInputs: string[];
  /** Real, public/framework-level reference framings — never invented stats. */
  curatedReferences: string[];
  /** Assumptions the system inferred — flagged, never shown as a citation. */
  aiInferredAssumptions: string[];
}

/** Transparent 0–1 components behind a route's evidence-fit score. */
export interface RouteScoreBreakdown {
  valueMatch: number;
  constraintFit: number;
  routeArchetypeFit: number;
  curatedEvidenceSupport: number;
  uncertaintyPenalty: number;
  inferencePenalty: number;
}

/** The honest "why it scored this way" companion to the number. */
export interface RouteScoreRationale {
  strongestUserSignal: string;
  strongestReferenceSupport: string;
  biggestUncertainty: string;
  aiInferredAssumption: string;
}

/**
 * One candidate route in the "Possible Futures Library" — a meaningfully
 * distinct strategy, carrying full micro-level decision-review data. Generated
 * deterministically (mock-first) from the journey; the evidence-fit score and
 * provenance are computed in code, never a prediction. 6–10 of these make up the
 * route universe; exactly three are marked `isPrimaryRoute` for deep simulation.
 */
export interface RouteCandidate {
  id: string;
  /** Archetype family, e.g. "Conservative anchor", "Ambitious sprint". */
  archetype: string;
  title: string;
  shortDescription: string;

  /* --- A. Why this route exists --- */
  coreIdea: string;
  whyItMakesSense: string;
  bestFitUser: string;
  assumptions: string[];

  /* --- B. Tradeoffs --- */
  gains: string[];
  givesUp: string[];
  hiddenTradeoffs: string[];
  opportunityCost: string;

  /* --- C. Action plan --- */
  sevenDayActionPlan: string[];
  thirtyDayActionPlan: string[];
  ninetyDayDirection: string;
  lowCostExperiment: string;

  /* --- D. Risks and friction --- */
  keyRisks: string[];
  earlyWarningSigns: string[];
  resourcesNeeded: string[];
  emotionalFriction: string;

  /* --- E. Evidence and uncertainty --- */
  confidenceLevel: RouteConfidence;
  uncertainty: string;
  evidenceSupport: RouteEvidenceSupport;

  /** Ids into the curated journey evidence base (lib/journey/evidence) that this
   * route leans on — already gated to the journey (occupation data dropped for
   * non-career decisions). Empty when no curated source applies directly. */
  evidenceCardIds: string[];

  /** First-layer chips: how risky / reversible / over what horizon. */
  risk: RouteLevel;
  reversibility: RouteLevel;
  timeHorizon: RouteHorizon;

  /** Evidence-fit score (0–100). A match score, never a probability of success. */
  evidenceFitScore: number;
  /** Qualitative band so the number never reads as odds. */
  scoreBand: "Strong" | "Moderate" | "Loose";
  scoreBreakdown: RouteScoreBreakdown;
  scoreRationale: RouteScoreRationale;

  /** True for the three routes routed into deep simulation (/map). */
  isPrimaryRoute: boolean;
}

/** Why a particular three routes were chosen as the primary comparison set. */
export interface PrimarySelection {
  primaryRouteIds: string[];
  /** One honest line per primary route on the role it plays in the contrast. */
  roleNotes: { id: string; role: string; why: string }[];
  /** A single "why these three" summary of the comparison set. */
  summary: string;
  /** True when the three were auto-selected (user has not overridden). */
  auto: boolean;
}

/* ------------------------------- API I/O ---------------------------------- */

export interface JourneyNextRequest {
  situation: string;
  previousQuestions: QuestionAnswer[];
  journeyState?: JourneyState;
}

export interface JourneyNextResponse {
  mocked: boolean;
  done: boolean;
  question?: JourneyQuestion;
  updatedState: JourneyState;
  references?: ReferenceNote[];
}

export interface JourneyRevealRequest {
  situation: string;
  answers: QuestionAnswer[];
  journeyState: JourneyState;
}

export interface JourneyRevealResponse {
  mocked: boolean;
  decision: string;
  coreQuestion: string;
  valueConflict: string;
  /**
   * The three primary routes, down-projected to the small RevealedPath shape the
   * deterministic adapter expands into exactly three /map branches. Kept for the
   * adapter boundary; the rich UI reads `universe` instead.
   */
  routes: RevealedPath[];
  references: ReferenceNote[];

  /* --- v3 additive: the full route universe + which three are primary --- */
  /** 6–10 meaningfully distinct route candidates (the Possible Futures Library). */
  universe?: RouteCandidate[];
  /** Auto-selected sharpest-comparison set; the user may re-pick on the reveal. */
  primarySelection?: PrimarySelection;
}

/** Honest, human-readable labels for the three evidence source types. */
export const REFERENCE_LABELS: Record<ReferenceNote["sourceType"], string> = {
  user_answer: "User-provided signal",
  curated_reference: "Curated reference",
  ai_inferred: "AI-inferred assumption",
};

/** A fresh, empty journey state — the starting point before any answers. */
export function emptyJourneyState(): JourneyState {
  return {
    discoveredValues: [],
    constraints: [],
    fears: [],
    identitySignals: [],
    uncertaintyTags: [],
    possibleRouteHints: [],
  };
}

/** How many question nodes the journey asks before revealing paths. */
export const JOURNEY_TARGET_NODES = 4;
/** Hard server-side cap so a live model can never loop forever. */
export const JOURNEY_MAX_NODES = 5;
