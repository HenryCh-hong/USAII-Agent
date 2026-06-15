/**
 * Zod schemas — the runtime contract for every API route.
 *
 * These mirror lib/types.ts. API routes validate inbound requests and (after
 * an LLM call) the model's structured output against these schemas, retrying
 * once on failure before falling back to mock data. This is what keeps the AI
 * honest: malformed or off-contract generations never reach the UI.
 */
import { z } from "zod";

export const levelSchema = z.enum(["low", "medium", "high"]);
export const claimTypeSchema = z.enum([
  "user_provided",
  "source_supported",
  "ai_inferred",
]);
export const urgencySchema = z.enum(["exploring", "soon", "deciding_now"]);
export const sourceTypeSchema = z.enum([
  "curated_research",
  "framework",
  "labor_market",
  "user_provided",
  "ai_inferred",
]);
export const regretTypeSchema = z.enum([
  "action",
  "inaction",
  "identity",
  "financial",
  "relational",
  "opportunity",
]);

export const userContextSchema = z.object({
  decision: z.string().min(1),
  options: z.array(z.string()).min(2),
  major: z.string(),
  skills: z.array(z.string()),
  values: z.array(z.string()),
  constraints: z.array(z.string()),
  fears: z.array(z.string()),
  background: z.string(),
  timeHorizon: z.string(),
  urgency: urgencySchema,
});

export const clarifyingQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  why: z.string(),
  probes: z.string(),
  answer: z.string().optional(),
});

export const evidenceCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  content: z.string(),
  sourceType: sourceTypeSchema,
  usedFor: z.string(),
  evidenceStrength: levelSchema,
});

export const baseRateSignalSchema = z.object({
  claim: z.string(),
  source: z.string(),
  coverageLevel: z.string(),
  confidence: levelSchema,
  limitations: z.string(),
});

export const assumptionSchema = z.object({
  claim: z.string(),
  type: claimTypeSchema,
  confidence: levelSchema,
  howToTest: z.string(),
});

export const timelineItemSchema = z.object({
  time: z.string(),
  description: z.string(),
  uncertaintyNote: z.string(),
});

export const regretRadarItemSchema = z.object({
  regretType: regretTypeSchema,
  level: levelSchema,
  description: z.string(),
});

export const experimentStepSchema = z.object({
  day: z.number(),
  action: z.string(),
  purpose: z.string(),
});

export const calibrationResultSchema = z.object({
  evidenceStrength: levelSchema,
  userFit: levelSchema,
  constraintRisk: levelSchema,
  uncertaintyLevel: levelSchema,
  dataCoverageNote: z.string(),
});

export const futureBranchSchema = z.object({
  id: z.string(),
  track: z.string(),
  title: z.string(),
  thesis: z.string(),
  baseRateSignals: z.array(baseRateSignalSchema),
  evidenceCards: z.array(evidenceCardSchema),
  twelveMonthTrajectory: z.array(timelineItemSchema),
  hiddenTradeoffs: z.array(z.string()),
  opportunityCosts: z.array(z.string()),
  reversibility: levelSchema,
  skillCompounding: z.string(),
  emotionalLoad: z.string(),
  bottlenecks: z.array(z.string()),
  assumptions: z.array(assumptionSchema),
  premortem: z.array(z.string()),
  regretRadar: z.array(regretRadarItemSchema),
  sevenDayExperiment: z.array(experimentStepSchema),
  killCriteria: z.array(z.string()),
  calibration: calibrationResultSchema,
});

export const decisionBriefSchema = z.object({
  decisionFrame: z.string(),
  strongestSignals: z.array(z.string()),
  biggestUncertainties: z.array(z.string()),
  whatAIWillNotDecide: z.array(z.string()),
  recommendedExperiments: z.array(z.string()),
  humanInLoopStatement: z.string(),
  responsibleAIStatement: z.string(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const simulationResultSchema = z.object({
  context: userContextSchema,
  branches: z.array(futureBranchSchema).length(3),
  mocked: z.boolean(),
  generatedNote: z.string(),
});

/* ----------------------------- API I/O shapes ----------------------------- */

export const questionsRequestSchema = z.object({
  context: userContextSchema,
});
export const questionsResponseSchema = z.object({
  questions: z.array(clarifyingQuestionSchema).min(3).max(5),
  mocked: z.boolean(),
});

export const simulateRequestSchema = z.object({
  context: userContextSchema,
  answers: z.array(clarifyingQuestionSchema).optional(),
});

export const chatRequestSchema = z.object({
  branchId: z.string(),
  branch: futureBranchSchema,
  context: userContextSchema,
  history: z.array(chatMessageSchema),
  message: z.string().min(1),
});
export const chatResponseSchema = z.object({
  reply: z.string(),
  mocked: z.boolean(),
});

export const briefRequestSchema = z.object({
  context: userContextSchema,
  branches: z.array(futureBranchSchema),
});
export const briefResponseSchema = z.object({
  brief: decisionBriefSchema,
  mocked: z.boolean(),
});

/* For LLM structured-output validation of the 3-branch generation. */
export const branchesOnlySchema = z.object({
  branches: z.array(futureBranchSchema).length(3),
});
