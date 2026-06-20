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
  routes: RevealedPath[];
  references: ReferenceNote[];
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
