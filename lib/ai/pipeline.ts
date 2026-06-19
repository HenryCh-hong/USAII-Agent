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
  forkSuggestionSchema,
  type ForkSuggestion,
} from "../schemas";
import { z } from "zod";
import { DOMAIN_HINTS, retrieve, type KnowledgeItem } from "../knowledge";
import { retrieveSourceCards } from "../knowledge/sources";
import {
  BRANCH_GRAPH_NODE_IDS,
  branchKeyFor,
  graphSnapshotForBranch,
} from "../knowledge/graph";
import { generateJSON, generateText, hasApiKey } from "./client";
import {
  BRIEF_SYSTEM,
  FORK_SUGGEST_SYSTEM,
  QUESTIONS_SYSTEM,
  SIMULATE_SYSTEM,
  buildBriefUser,
  buildChatSystem,
  buildQuestionsUser,
  buildSimulateUser,
  buildSuggestForkUser,
} from "./prompts";
import {
  buildMockBrief,
  buildMockFork,
  buildMockQuestions,
  buildMockSimulation,
  mockChatReply,
} from "../mock";

/* ----------------------------- SafetyAgent -------------------------------- */

/**
 * The SafetyAgent's substitution table. Each entry is [pattern, replacement,
 * category] — `category` is a CLEAN description of the rewrite (it never
 * contains a banned phrase itself) so it is safe to surface in the audit trail
 * as a rejectedOverclaim. The eval harness imports this as its source of truth.
 */
export const DETERMINISTIC_REPLACEMENTS: [RegExp, string, string][] = [
  [/\byou will\b/gi, "you may", "Softened a deterministic outcome claim into hedged language."],
  [/\byou'll\b/gi, "you may", "Softened a deterministic outcome claim into hedged language."],
  [/\bwill definitely\b/gi, "may", "Removed an overconfident certainty claim."],
  [/\bguaranteed\b/gi, "possible", "Replaced an absolute promise with a possibility."],
  [/\bguarantee\b/gi, "possibility", "Replaced an absolute promise with a possibility."],
  [/\bthis is the best choice\b/gi, "this could be a strong option", "Reframed a single-best-option assertion as one option to weigh."],
  [/\bthe best choice\b/gi, "a strong option", "Reframed a single-best-option assertion as one option to weigh."],
  [/\byou should choose\b/gi, "one option could be", "Removed prescriptive advice; the choice stays with you."],
  [/\byou should pick\b/gi, "one option could be", "Removed prescriptive advice; the choice stays with you."],
  [/\bis certain to\b/gi, "may", "Removed an overconfident certainty claim."],
  [/\bwill certainly\b/gi, "may", "Removed an overconfident certainty claim."],
  [/\bdefinitely\b/gi, "possibly", "Softened an overconfident qualifier."],
  [/\balmost certainly\b/gi, "plausibly", "Removed near-certainty phrasing."],
  [/\bwithout (a )?doubt\b/gi, "possibly", "Removed near-certainty phrasing."],
  [/\bno doubt\b/gi, "possibly", "Removed near-certainty phrasing."],
  [/\bclearly the (right|best) (move|choice|path)\b/gi, "one option worth weighing", "Reframed a 'clearly right' assertion as one option to weigh."],
  [/\bsuccess rate\b/gi, "base-rate pattern", "Removed a fabricated likelihood framing."],
  [/\b(probability|chance) of success\b/gi, "range of possible outcomes", "Removed a fabricated likelihood framing."],
  [/\bsuccess probability\b/gi, "range of possible outcomes", "Removed a fabricated likelihood framing."],
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

/** Scrub a string, recording (in `hits`) the clean category of any rewrite. */
function scrubStringLogged(s: string, hits: Set<string>): string {
  let out = s;
  for (const [re, rep, category] of DETERMINISTIC_REPLACEMENTS) {
    const next = out.replace(re, rep);
    if (next !== out) hits.add(category);
    out = next;
  }
  return out;
}

/**
 * Like safetyScrub, but also returns the set of overclaim categories that were
 * actually rewritten — so the SafetyAgent can populate `rejectedOverclaims`
 * with what it changed (the category, never the raw banned phrase).
 */
export function scrubWithLog<T>(value: T): { value: T; rejected: string[] } {
  const hits = new Set<string>();
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return scrubStringLogged(v, hits);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) out[k] = walk(val);
      return out;
    }
    return v;
  };
  const scrubbed = walk(value) as T;
  return { value: scrubbed, rejected: Array.from(hits) };
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
    const sourceCards = retrieveSourceCards(
      ctx.options.length ? ctx.options : [ctx.decision],
    );
    const out = await generateJSON(
      branchesOnlySchema,
      SIMULATE_SYSTEM,
      buildSimulateUser(ctx, answers, evidence, sourceCards),
      // Larger budget: the 9-role debate + agentReview + audit trail are emitted
      // inside the single validated object, so the payload is bigger than v1.
      { maxTokens: 12000, temperature: 0.6 },
    );
    const branches = out.branches.map((raw) => enrichLiveBranch(raw as FutureBranch));
    return {
      context: ctx,
      branches,
      mocked: false,
      generatedNote:
        "Generated live from your context, curated + official-source evidence, and the local evidence graph via the multi-agent debate pipeline. These are plausible scenarios, not predictions.",
    };
  } catch {
    return buildMockSimulation(ctx);
  }
}

/**
 * Post-process one live branch: SafetyAgent scrub (recording any rejected
 * overclaims), then attach the evidence-graph snapshot for its track if the
 * model didn't already provide one. Keeps the single-call contract intact.
 */
function enrichLiveBranch(raw: FutureBranch): FutureBranch {
  const { value, rejected } = scrubWithLog(raw);
  const b = value as FutureBranch;
  const key = branchKeyFor(`${b.track} ${b.title} ${b.id}`);
  const mergedRejected = Array.from(
    new Set([...(b.rejectedOverclaims ?? []), ...rejected]),
  );
  return {
    ...b,
    rejectedOverclaims: mergedRejected.length ? mergedRejected : undefined,
    graphNodeIds: b.graphNodeIds ?? (key ? BRANCH_GRAPH_NODE_IDS[key] : undefined),
    evidenceGraphSnapshot:
      b.evidenceGraphSnapshot ?? (key ? graphSnapshotForBranch(key) : undefined),
  };
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

/* ---------------------------- Suggest a fork ------------------------------ */

/**
 * Stage 2: from a messy free-text situation, suggest ONE plausible decision fork
 * (decision + 2-3 routes + value conflict + one clarifying question). Optional
 * live path; mock fallback with no key. Additive — never touches the other
 * pipeline functions, and the result is just a starting point the user edits.
 */
export async function runSuggestFork(
  situation: string,
): Promise<{ fork: ForkSuggestion; mocked: boolean }> {
  if (!hasApiKey()) return { fork: buildMockFork(situation), mocked: true };
  try {
    const fork = await generateJSON(
      forkSuggestionSchema,
      FORK_SUGGEST_SYSTEM,
      buildSuggestForkUser(situation),
      { maxTokens: 800, temperature: 0.6 },
    );
    return { fork: safetyScrub(fork), mocked: false };
  } catch {
    return { fork: buildMockFork(situation), mocked: true };
  }
}
