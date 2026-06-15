/**
 * The multi-agent pipeline orchestrator.
 *
 * Flow: ContextAgent (structured intake, done client-side) → RetrievalAgent
 * (keyword retrieval, code) → Scenario/Tradeoff/Critic/Calibration (one
 * grounded structured generation) → SafetyAgent (deterministic language scrub)
 * → SynthesisAgent (brief / chat). Every step degrades gracefully to the mock
 * layer so the demo can never hard-fail.
 */
import type {
  ChatMessage,
  ClarifyingQuestion,
  DecisionBrief,
  FutureBranch,
  SimulationResult,
  UserContext,
} from "../types";
import {
  branchesOnlySchema,
  decisionBriefSchema,
  clarifyingQuestionSchema,
} from "../schemas";
import { z } from "zod";
import { DOMAIN_HINTS, retrieve, type KnowledgeItem } from "../knowledge";
import { generateJSON, generateText, hasApiKey } from "./client";
import {
  BRIEF_SYSTEM,
  QUESTIONS_SYSTEM,
  SIMULATE_SYSTEM,
  buildBriefUser,
  buildChatSystem,
  buildQuestionsUser,
  buildSimulateUser,
} from "./prompts";
import {
  buildMockBrief,
  buildMockQuestions,
  buildMockSimulation,
  mockChatReply,
} from "../mock";

/* ----------------------------- SafetyAgent -------------------------------- */

const DETERMINISTIC_REPLACEMENTS: [RegExp, string][] = [
  [/\byou will\b/gi, "you may"],
  [/\byou'll\b/gi, "you may"],
  [/\bwill definitely\b/gi, "may"],
  [/\bguaranteed\b/gi, "possible"],
  [/\bguarantee\b/gi, "possibility"],
  [/\bthis is the best choice\b/gi, "this could be a strong option"],
  [/\bthe best choice\b/gi, "a strong option"],
  [/\byou should choose\b/gi, "one option could be"],
  [/\byou should pick\b/gi, "one option could be"],
  [/\bis certain to\b/gi, "may"],
  [/\bwill certainly\b/gi, "may"],
  [/\bdefinitely\b/gi, "possibly"],
];

function scrubString(s: string): string {
  return DETERMINISTIC_REPLACEMENTS.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
}

/** Recursively scrub deterministic language from any generated object. */
export function safetyScrub<T>(value: T): T {
  if (typeof value === "string") return scrubString(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => safetyScrub(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = safetyScrub(v);
    return out as T;
  }
  return value;
}

/* ---------------------------- RetrievalAgent ------------------------------ */

/** Retrieve evidence biased toward each option's likely domain. */
export function retrieveForContext(ctx: UserContext): KnowledgeItem[] {
  const seen = new Set<string>();
  const out: KnowledgeItem[] = [];
  const optionQueries = ctx.options.length ? ctx.options : [ctx.decision];

  for (const option of optionQueries) {
    const hintKey = Object.keys(DOMAIN_HINTS).find((k) =>
      option.toLowerCase().includes(k) ||
      (k === "research" && /grad|phd|research/.test(option.toLowerCase())),
    );
    const domains = hintKey ? DOMAIN_HINTS[hintKey] : undefined;
    const query = `${option} ${ctx.skills.join(" ")} ${ctx.values.join(" ")} ${ctx.constraints.join(" ")}`;
    for (const item of retrieve(query, { limit: 3, domains })) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  // always include core decision-science framing
  for (const item of retrieve("premortem reversibility calibration base rate experiment", {
    limit: 3,
    domains: ["decision_science"],
  })) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

/* ------------------------------- Questions -------------------------------- */

export async function runQuestions(
  ctx: UserContext,
): Promise<{ questions: ClarifyingQuestion[]; mocked: boolean }> {
  if (!hasApiKey()) return { questions: buildMockQuestions(ctx), mocked: true };
  try {
    const schema = z.object({ questions: z.array(clarifyingQuestionSchema).min(3).max(5) });
    const out = await generateJSON(schema, QUESTIONS_SYSTEM, buildQuestionsUser(ctx), {
      maxTokens: 1500,
      temperature: 0.7,
    });
    return { questions: safetyScrub(out.questions), mocked: false };
  } catch {
    return { questions: buildMockQuestions(ctx), mocked: true };
  }
}

/* ------------------------------- Simulation ------------------------------- */

export async function runSimulation(
  ctx: UserContext,
  answers?: ClarifyingQuestion[],
): Promise<SimulationResult> {
  if (!hasApiKey()) return buildMockSimulation(ctx);
  try {
    const evidence = retrieveForContext(ctx);
    const out = await generateJSON(
      branchesOnlySchema,
      SIMULATE_SYSTEM,
      buildSimulateUser(ctx, answers, evidence),
      { maxTokens: 8000, temperature: 0.6 },
    );
    const branches = safetyScrub(out.branches) as FutureBranch[];
    return {
      context: ctx,
      branches,
      mocked: false,
      generatedNote:
        "Generated live from your context and curated evidence via the multi-agent pipeline. These are plausible scenarios, not predictions.",
    };
  } catch {
    return buildMockSimulation(ctx);
  }
}

/* --------------------------------- Brief ---------------------------------- */

export async function runBrief(
  ctx: UserContext,
  branches: FutureBranch[],
): Promise<{ brief: DecisionBrief; mocked: boolean }> {
  if (!hasApiKey()) return { brief: buildMockBrief(ctx, branches), mocked: true };
  try {
    const out = await generateJSON(decisionBriefSchema, BRIEF_SYSTEM, buildBriefUser(ctx, branches), {
      maxTokens: 2500,
      temperature: 0.5,
    });
    return { brief: safetyScrub(out), mocked: false };
  } catch {
    return { brief: buildMockBrief(ctx, branches), mocked: true };
  }
}

/* ----------------------------- Future Self Chat --------------------------- */

export async function runChat(
  ctx: UserContext,
  branch: FutureBranch,
  history: ChatMessage[],
  message: string,
): Promise<{ reply: string; mocked: boolean }> {
  if (!hasApiKey()) {
    return { reply: mockChatReply(branch, message, history), mocked: true };
  }
  try {
    const system = buildChatSystem(ctx, branch);
    const convo =
      history
        .slice(-8)
        .map((m) => `${m.role === "user" ? "User" : "Future Self"}: ${m.content}`)
        .join("\n") + `\nUser: ${message}\nFuture Self:`;
    const reply = await generateText(system, convo, { maxTokens: 700, temperature: 0.7 });
    return { reply: scrubString(reply.trim()), mocked: false };
  } catch {
    return { reply: mockChatReply(branch, message, history), mocked: true };
  }
}
