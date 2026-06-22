/**
 * Eval — Journey branch invariant (P0).
 *
 * Proves the hard interaction rule: every active decision node renders with
 * visible branch gates. No active question may ever become a branchless dead-end.
 * Walks the keyless mock journey node-by-node and asserts the branch normalizer's
 * guarantees on each one:
 *
 *   - a normal API question with options → its options render as branches
 *   - a question with empty options → fallback branches render
 *   - an open-ended (free-text) question → suggested branches + "Write my own"
 *   - the final / success-metric question → branches render, with a custom branch
 *   - no empty or duplicate branch labels, ever
 *   - at least 3 answer branches (≥4 gates incl. "Write my own") on every node
 *
 * Framework-free: tsx + node:assert. No API key required.
 */
import assert from "node:assert/strict";
import {
  branchGatesFor,
  normalizeQuestionBranches,
  MIN_BRANCHES,
  MAX_BRANCHES,
  WRITE_MY_OWN_LABEL,
  isSuccessMetricQuestion,
} from "../lib/journey/branches";
import { buildMockJourneyNext } from "../lib/journey/mock";
import { deriveState } from "../lib/journey/values";
import { emptyJourneyState, JOURNEY_TARGET_NODES } from "../lib/journey/types";
import type { JourneyQuestion, QuestionAnswer } from "../lib/journey/types";

let checks = 0;
function ok(cond: unknown, msg: string): void {
  assert.ok(cond, msg);
  checks++;
}

/** The core invariant assertion, run against any question + state. */
function assertInvariant(q: JourneyQuestion | null, state: ReturnType<typeof emptyJourneyState>, ctx: string) {
  const answers = normalizeQuestionBranches(q, state);
  const gates = branchGatesFor(q, state);

  // Count + bounds.
  ok(answers.length >= MIN_BRANCHES, `${ctx}: ≥${MIN_BRANCHES} answer branches (${answers.length})`);
  ok(answers.length <= MAX_BRANCHES, `${ctx}: ≤${MAX_BRANCHES} answer branches (${answers.length})`);

  // No empty labels.
  ok(answers.every((b) => b.label.trim().length > 0), `${ctx}: no empty branch labels`);

  // No duplicate labels (case-insensitive), across the full gate set.
  const keys = gates.map((b) => b.label.toLowerCase());
  ok(new Set(keys).size === keys.length, `${ctx}: no duplicate branch labels`);

  // Every branch carries a stable id + label.
  ok(answers.every((b) => !!b.id && !!b.label), `${ctx}: every branch has id + label`);

  // "Write my own" is present as a first-class branch gate.
  const custom = gates.find((b) => b.kind === "custom");
  ok(custom && custom.label === WRITE_MY_OWN_LABEL, `${ctx}: "Write my own" renders as a branch`);

  // At least 3 visible gates on every active node (answers + custom ⇒ ≥4).
  ok(gates.length >= MIN_BRANCHES, `${ctx}: ≥${MIN_BRANCHES} visible gates (${gates.length})`);

  // Determinism: same input ⇒ identical output.
  const again = normalizeQuestionBranches(q, state);
  ok(JSON.stringify(again) === JSON.stringify(answers), `${ctx}: deterministic output`);

  return answers;
}

const situation =
  "I'm a sophomore CS student torn between quant recruiting, a startup, and research, and I can't tell what I actually want.";

/* ---- Walk the full mock journey: every live node must hold the invariant ---- */

let prev: QuestionAnswer[] = [];
let nodes = 0;
while (true) {
  const next = buildMockJourneyNext(situation, prev);
  if (next.done || !next.question) break;
  const q = next.question;
  const state = deriveState(situation, prev);
  const answers = assertInvariant(q, state, `node ${nodes + 1} (${q.type})`);

  // For a real choice question, the API options must be the branches that render.
  if (q.type === "choice" && (q.options?.length ?? 0) >= MIN_BRANCHES) {
    ok(
      q.options!.every((o) => answers.some((b) => b.label === o)),
      `node ${nodes + 1}: API options render as branches`,
    );
  }

  // Answer the node by picking its first available branch (or typing) and advance.
  const first = answers[0].label;
  prev = [
    ...prev,
    { questionId: `step-${nodes}`, prompt: q.prompt, answer: first, selectedOption: q.options?.includes(first) ? first : undefined },
  ];
  nodes += 1;
  if (nodes > JOURNEY_TARGET_NODES + 2) break; // safety
}
ok(nodes >= 3, `walked at least 3 live nodes (${nodes})`);

/* ---- Case: API question with EMPTY options → fallback branches render ---- */
{
  const q: JourneyQuestion = {
    id: "empty",
    prompt: "Which direction pulls at you most right now?",
    type: "choice",
    options: [], // model returned nothing
    whyThisQuestion: "test",
    whatItSeparates: ["direction"],
  };
  const answers = assertInvariant(q, emptyJourneyState(), "empty-options");
  ok(answers.every((b) => b.kind === "fallback"), "empty-options: falls back to generic safe branches");
}

/* ---- Case: open-ended free-text question → suggested branches + custom ---- */
{
  const q: JourneyQuestion = {
    id: "open",
    prompt: "What kind of freedom are you really protecting here?",
    type: "short_text",
    whyThisQuestion: "test",
    whatItSeparates: ["freedom type"],
  };
  const answers = assertInvariant(q, emptyJourneyState(), "open-ended");
  ok(answers.some((b) => b.kind === "suggested"), "open-ended: suggested branches derived from the prompt");
}

/* ---- Case: final / success-metric question → fitting branches + custom ---- */
{
  const q: JourneyQuestion = {
    id: "jq4",
    prompt: "What would make this decision feel successful 12 months from now — in your own words?",
    type: "short_text",
    whyThisQuestion: "test",
    whatItSeparates: ["success criteria", "12-month yardstick"],
  };
  ok(isSuccessMetricQuestion(q), "final: detected as a success-metric question");
  const answers = assertInvariant(q, emptyJourneyState(), "final-success");
  ok(
    answers.some((b) => /external validation|personal satisfaction|milestone/i.test(b.label)),
    "final: success-metric-fitting fallback branches render",
  );
}

/* ---- Case: a null question still yields safe branches (defensive) ---- */
assertInvariant(null, emptyJourneyState(), "null-question");

console.log(`PASS  eval-journey-branches — ${checks} checks (every active node has visible branches)`);
