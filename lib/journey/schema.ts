/**
 * Zod contracts for the guided journey.
 *
 * Two kinds of schema live here:
 *  - request schemas (validate the inbound POST body; routes degrade to mock on
 *    failure rather than 400-ing, per the app-wide convention), and
 *  - LLM-output schemas (the SMALL shapes the model must return). They are kept
 *    intentionally minimal so generateJSON's validate-and-retry-once is reliable
 *    and the deterministic adapter — not the model — guarantees the big
 *    FutureBranch contract the rest of the app depends on.
 */
import { z } from "zod";

export const journeyStateSchema = z.object({
  discoveredValues: z.array(z.string()),
  constraints: z.array(z.string()),
  fears: z.array(z.string()),
  timeHorizon: z.string().optional(),
  riskTolerance: z.string().optional(),
  identitySignals: z.array(z.string()),
  uncertaintyTags: z.array(z.string()),
  possibleRouteHints: z.array(z.string()),
});

export const questionAnswerSchema = z.object({
  questionId: z.string(),
  prompt: z.string(),
  answer: z.string(),
  selectedOption: z.string().optional(),
});

export const referenceNoteSchema = z.object({
  label: z.string(),
  sourceType: z.enum(["user_answer", "curated_reference", "ai_inferred"]),
  summary: z.string(),
  usedFor: z.string(),
});

export const journeyQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  type: z.enum(["choice", "short_text", "mixed"]),
  options: z.array(z.string()).optional(),
  whyThisQuestion: z.string(),
  whatItSeparates: z.array(z.string()),
});

export const revealedPathSchema = z.object({
  id: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  whatItOptimizesFor: z.string(),
  whatItRisks: z.string(),
  whatYouMightMiss: z.string(),
  sevenDayTest: z.string(),
  evidenceNotes: z.array(referenceNoteSchema),
});

/* ------------------------------- Requests --------------------------------- */

export const journeyNextRequestSchema = z.object({
  situation: z.string(),
  previousQuestions: z.array(questionAnswerSchema),
  journeyState: journeyStateSchema.optional(),
});

export const journeyRevealRequestSchema = z.object({
  situation: z.string(),
  answers: z.array(questionAnswerSchema),
  journeyState: journeyStateSchema,
});

/* ----------------------------- LLM output --------------------------------- */

/**
 * What the model returns for one "next question" step. `done` lets the model
 * end the journey early; the server still caps the node count regardless.
 */
export const journeyNextLLMSchema = z.object({
  done: z.boolean(),
  question: journeyQuestionSchema.optional(),
  updatedState: journeyStateSchema,
  references: z.array(referenceNoteSchema).optional(),
});

/** What the model returns at reveal — small shapes; the adapter does the rest. */
export const journeyRevealLLMSchema = z.object({
  decision: z.string(),
  coreQuestion: z.string(),
  valueConflict: z.string(),
  routes: z.array(revealedPathSchema).min(2).max(3),
  references: z.array(referenceNoteSchema),
});

export type JourneyNextLLM = z.infer<typeof journeyNextLLMSchema>;
export type JourneyRevealLLM = z.infer<typeof journeyRevealLLMSchema>;
