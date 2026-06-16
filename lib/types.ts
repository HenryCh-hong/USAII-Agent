/**
 * Forked Futures — canonical type contract.
 *
 * These types are the single source of truth shared by the mock dataset,
 * the zustand store, every page, and the Zod schemas (lib/schemas.ts mirrors
 * this file at runtime). Responsible-AI primitives — claim provenance and
 * qualitative uncertainty levels — are first-class here so they cannot be
 * dropped by any downstream consumer.
 */

export type Level = "low" | "medium" | "high";

export type ClaimType = "user_provided" | "source_supported" | "ai_inferred";

export type Urgency = "exploring" | "soon" | "deciding_now";

export type SourceType =
  | "curated_research"
  | "framework"
  | "labor_market"
  | "user_provided"
  | "ai_inferred"
  // v2 additive: richer provenance for the official-source evidence pack.
  | "official_data"
  | "education_outcomes"
  | "decision_framework";

/** Reliability of a curated source (v2 official-source pack). */
export type ReliabilityLevel = "medium" | "high";

/**
 * Honest coverage level for an evidence claim. Data sources are never used for
 * individual prediction — the highest data granularity we claim is program/
 * school; "individual" exists only to label user-provided context.
 */
export type CoverageLevel =
  | "individual"
  | "school"
  | "program"
  | "field"
  | "occupation"
  | "cohort"
  | "population"
  | "framework";

/** Raw decision context captured on the Intake page. */
export interface UserContext {
  decision: string;
  options: string[];
  major: string;
  skills: string[];
  values: string[];
  constraints: string[];
  fears: string[];
  background: string;
  timeHorizon: string;
  urgency: Urgency;
}

/** An AI-generated clarifying question, optionally answered by the user. */
export interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  /** What the question is trying to disambiguate (shown subtly in UI). */
  probes: string;
  answer?: string;
}

/** A unit of curated/keyword-retrieved evidence backing a branch. */
export interface EvidenceCard {
  id: string;
  title: string;
  category: string;
  content: string;
  sourceType: SourceType;
  /** Short note on which reasoning step this card was used for. */
  usedFor: string;
  evidenceStrength: Level;
  /* ---- v2 optional provenance (present when derived from an official source) ---- */
  /** Human-readable source, e.g. "BLS Occupational Outlook Handbook". */
  sourceName?: string;
  publisher?: string;
  sourceUrl?: string;
  /** Honest coverage level of the underlying source. */
  coverageLevel?: CoverageLevel | string;
  /** What the source actually supports (kept at its true coverage level). */
  claim?: string;
  /** Explicit limitations of the source for this use. */
  limitations?: string;
  reliabilityLevel?: ReliabilityLevel;
  lastReviewed?: string;
  /** Links back to a SourcedEvidenceCard in the official-source pack. */
  sourceCardId?: string;
}

/**
 * A curated official-source evidence card (the v2 RAG "evidence pack").
 * Lives in knowledge/sources/*.json. These describe what a public/official
 * source covers and its limitations — never an individual prediction, and
 * never with invented exact statistics.
 */
export interface SourcedEvidenceCard {
  id: string;
  title: string;
  sourceName: string;
  publisher: string;
  sourceUrl: string;
  sourceType: SourceType;
  category: string;
  coverageLevel: CoverageLevel | string;
  claim: string;
  limitations: string;
  usedFor: string[];
  reliabilityLevel: ReliabilityLevel;
  lastReviewed: string;
}

/* ------------------------------ Evidence graph ---------------------------- */

export type EvidenceNodeType =
  | "source"
  | "career_path"
  | "skill"
  | "constraint"
  | "decision_framework"
  | "risk"
  | "experiment";

/** A node in the local evidence graph. */
export interface EvidenceNode {
  id: string;
  label: string;
  nodeType: EvidenceNodeType;
  /** Evidence cards (curated or sourced) associated with this node. */
  evidenceCardIds: string[];
}

export type EvidenceRelation =
  | "supports"
  | "requires"
  | "creates_risk"
  | "can_be_tested_by"
  | "informs"
  | "limits";

/** A directed, explained edge in the local evidence graph. */
export interface EvidenceEdge {
  from: string;
  to: string;
  relation: EvidenceRelation;
  explanation: string;
}

/** The subgraph relevant to a single branch ("why this branch exists"). */
export interface EvidenceGraphSnapshot {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

/** A base-rate framing signal — never an individual prediction. */
export interface BaseRateSignal {
  claim: string;
  source: string;
  /** "occupation-level" | "field-level" | "framework-level" etc. */
  coverageLevel: string;
  confidence: Level;
  limitations: string;
}

/** A single tracked assumption with explicit provenance + a way to test it. */
export interface Assumption {
  claim: string;
  type: ClaimType;
  confidence: Level;
  howToTest: string;
}

/** One step on a 12-month trajectory. */
export interface TimelineItem {
  time: string;
  description: string;
  uncertaintyNote: string;
}

export type RegretType =
  | "action"
  | "inaction"
  | "identity"
  | "financial"
  | "relational"
  | "opportunity";

export interface RegretRadarItem {
  regretType: RegretType;
  level: Level;
  description: string;
}

export interface ExperimentStep {
  day: number;
  action: string;
  purpose: string;
}

/** Qualitative calibration — no fake precise probabilities. */
export interface CalibrationResult {
  evidenceStrength: Level;
  userFit: Level;
  constraintRisk: Level;
  uncertaintyLevel: Level;
  dataCoverageNote: string;
  /** v2 optional: short prose on why these levels were assigned. */
  calibrationRationale?: string;
}

/**
 * Judge-safe, structured record of what each agent contributed to a branch.
 * This is NOT raw chain-of-thought — it is a per-agent summary of contribution.
 */
export interface AgentReview {
  branchId: string;
  contextAgentSummary: string;
  retrievalAgentSummary: string;
  evidenceAgentSummary: string;
  optimistView: string;
  skepticView: string;
  calibrationSummary: string;
  safetySummary: string;
  synthesisSummary: string;
}

/**
 * Structured reasoning artifact shown in place of raw chain-of-thought.
 * Every field is a summary/list — never the model's verbatim deliberation.
 */
export interface ReasoningAuditTrail {
  branchId: string;
  whyThisBranchExists: string;
  evidenceUsed: string[];
  assumptionsUsed: string[];
  uncertaintyDrivers: string[];
  optimistView: string;
  skepticView: string;
  /** Overclaims the safety layer rejected — stored as the category, not the raw phrase. */
  rejectedOverclaims: string[];
  whatWouldChangeThisAssessment: string[];
  nextValidationStep: string;
}

/** A qualitative self-check signal from the evaluation layer (no fake precision). */
export interface EvaluationSignal {
  name: string;
  level: Level;
  note: string;
}

/** A single plausible future branch (the system always emits exactly three). */
export interface FutureBranch {
  id: string;
  /** Short track label used for the map node, e.g. "Quant Signal Track". */
  track: string;
  title: string;
  thesis: string;
  baseRateSignals: BaseRateSignal[];
  evidenceCards: EvidenceCard[];
  twelveMonthTrajectory: TimelineItem[];
  hiddenTradeoffs: string[];
  opportunityCosts: string[];
  reversibility: Level;
  skillCompounding: string;
  emotionalLoad: string;
  bottlenecks: string[];
  assumptions: Assumption[];
  premortem: string[];
  regretRadar: RegretRadarItem[];
  sevenDayExperiment: ExperimentStep[];
  killCriteria: string[];
  calibration: CalibrationResult;
  /* ----------------------------- v2 optional fields ----------------------------- */
  /** Per-agent contribution summary (judge-safe, not chain-of-thought). */
  agentReview?: AgentReview;
  /** Structured reasoning trail shown instead of raw chain-of-thought. */
  reasoningAuditTrail?: ReasoningAuditTrail;
  /** Evidence-graph node ids this branch is connected to ("why this branch exists"). */
  graphNodeIds?: string[];
  /** The branch's subgraph of evidence nodes/edges. */
  evidenceGraphSnapshot?: EvidenceGraphSnapshot;
  /** Overclaims the safety layer rejected (category form, never the raw phrase). */
  rejectedOverclaims?: string[];
  /** Qualitative evaluation self-checks (groundedness, hedging, provenance...). */
  evaluationSignals?: EvaluationSignal[];
}

export interface DecisionBrief {
  decisionFrame: string;
  strongestSignals: string[];
  biggestUncertainties: string[];
  whatAIWillNotDecide: string[];
  recommendedExperiments: string[];
  humanInLoopStatement: string;
  responsibleAIStatement: string;
}

/** A single Future Self chat turn, grounded in a branch. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** The full simulation payload returned by /api/simulate. */
export interface SimulationResult {
  context: UserContext;
  branches: FutureBranch[];
  /** True when generated by mock fallback rather than a live model. */
  mocked: boolean;
  generatedNote: string;
}

/** Convenience labels for level/claim enums used across the UI. */
export const LEVEL_LABELS: Record<Level, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const CLAIM_LABELS: Record<ClaimType, string> = {
  user_provided: "You told us",
  source_supported: "Source-supported",
  ai_inferred: "AI-inferred",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  exploring: "Just exploring",
  soon: "Deciding soon",
  deciding_now: "Deciding now",
};
