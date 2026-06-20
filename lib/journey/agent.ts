/**
 * Journey orchestrators — own the live-vs-mock decision and emit { mocked }.
 *
 * Same contract as the rest of the pipeline: no key → deterministic mock; with a
 * key → generateJSON validates the model's (small) output against a Zod schema,
 * retries once, and on any failure falls back to the mock so the journey can
 * never hard-fail. Live output is run through the shared SafetyAgent scrub.
 */
import { generateJSON, hasApiKey } from "../ai/client";
import { safetyScrub } from "../ai/pipeline";
import {
  JOURNEY_NEXT_SYSTEM,
  JOURNEY_REVEAL_SYSTEM,
  buildJourneyNextUser,
  buildJourneyRevealUser,
} from "./prompts";
import { journeyNextLLMSchema, journeyRevealLLMSchema } from "./schema";
import { buildMockJourneyNext, buildMockJourneyReveal, deriveState } from "./mock";
import {
  JOURNEY_MAX_NODES,
  emptyJourneyState,
} from "./types";
import type {
  JourneyNextResponse,
  JourneyRevealResponse,
  JourneyState,
  QuestionAnswer,
} from "./types";

export async function runJourneyNext(
  situation: string,
  previousQuestions: QuestionAnswer[],
  journeyState: JourneyState | undefined,
): Promise<JourneyNextResponse> {
  // Hard server-side cap: never let a live model loop past the node ceiling.
  const atCeiling = previousQuestions.length >= JOURNEY_MAX_NODES;

  if (!hasApiKey()) {
    const mock = buildMockJourneyNext(situation, previousQuestions);
    return atCeiling ? { ...mock, done: true, question: undefined } : mock;
  }

  try {
    const out = await generateJSON(
      journeyNextLLMSchema,
      JOURNEY_NEXT_SYSTEM,
      buildJourneyNextUser(situation, previousQuestions, journeyState),
      { maxTokens: 1200, temperature: 0.7 },
    );
    const scrubbed = safetyScrub(out);
    const done = atCeiling || scrubbed.done || !scrubbed.question;
    return {
      mocked: false,
      done,
      question: done ? undefined : scrubbed.question,
      updatedState: scrubbed.updatedState ?? deriveState(situation, previousQuestions),
      references: scrubbed.references,
    };
  } catch {
    const mock = buildMockJourneyNext(situation, previousQuestions);
    return atCeiling ? { ...mock, done: true, question: undefined } : mock;
  }
}

export async function runJourneyReveal(
  situation: string,
  answers: QuestionAnswer[],
  journeyState: JourneyState,
): Promise<JourneyRevealResponse> {
  const state = journeyState ?? emptyJourneyState();
  if (!hasApiKey()) return buildMockJourneyReveal(situation, answers, state);

  try {
    const out = await generateJSON(
      journeyRevealLLMSchema,
      JOURNEY_REVEAL_SYSTEM,
      buildJourneyRevealUser(situation, answers, state),
      { maxTokens: 3000, temperature: 0.6 },
    );
    const scrubbed = safetyScrub(out);
    return { mocked: false, ...scrubbed };
  } catch {
    return buildMockJourneyReveal(situation, answers, state);
  }
}
