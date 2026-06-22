/**
 * Branch normalization — the P0 invariant for the decision-graph journey.
 *
 * THE RULE: every active question node must render with visible branch gates.
 * No active fork may ever become a dead-end card with nothing to the right but a
 * dotted "the path ahead". The product thesis is "the decision is a map you
 * walk" — a node with no branches collapses the experience back into a form.
 *
 * normalizeQuestionBranches() guarantees at least three (and at most five)
 * deterministic, de-duplicated, non-empty answer branches for ANY question —
 * even one that arrives from a live model with empty/missing options, or a pure
 * free-text node. It layers three sources in strict priority order:
 *
 *   A. Real options returned by the journey question API (question.options).
 *   B. Suggested options derived from the question text + the journey state.
 *   C. Generic safe fallback options (success-metric flavored for the final node).
 *
 * branchGatesFor() then appends "Write my own" as a first-class branch gate, so
 * custom input is never demoted to a bottom textarea — it is a road on the map.
 *
 * Everything here is pure and deterministic: the same (question, state) always
 * yields the same branches, so the layout is stable and the eval can assert it.
 */
import type { JourneyQuestion, JourneyState } from "./types";
import { rankTags, VALUE_PHRASE } from "./values";

/** Minimum branch gates an active node must offer (excluding "Write my own"). */
export const MIN_BRANCHES = 3;
/** Maximum answer branches we fan out (keeps the gate stack readable). */
export const MAX_BRANCHES = 5;

/** The always-present custom branch label. */
export const WRITE_MY_OWN_LABEL = "Write my own";

export type BranchKind = "option" | "suggested" | "fallback" | "custom";

/** One branch gate on the decision map. */
export interface BranchOption {
  /** Stable, label-derived id (deterministic across renders). */
  id: string;
  /** Visible gate label — never empty, never duplicated. */
  label: string;
  /** Optional one-line rationale shown under/around the gate. */
  shortHint?: string;
  /** Provenance of the branch — drives subtle styling and the eval. */
  kind: BranchKind;
}

/* -------------------------------- helpers --------------------------------- */

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Does this question ask the user to define what success / the yardstick is? */
export function isSuccessMetricQuestion(question: JourneyQuestion | null): boolean {
  if (!question) return false;
  const hay = [question.prompt, ...(question.whatItSeparates ?? [])].join(" ").toLowerCase();
  return /\bsuccess|successful|yardstick|12[\s-]?month|measure|metric|criteria|feel.*worth\b/.test(hay);
}

/**
 * B. Suggested branches inferred from the question text + journey state. These
 * mirror the kinds of choices the structured questions already offer, so a
 * free-text node reads as a real fork rather than a blank prompt. Keyword
 * matching is checked first (most specific), then a value-state fallback.
 */
function suggestedBranches(
  question: JourneyQuestion,
  state: JourneyState,
): { label: string; shortHint: string }[] {
  // Success-metric questions have their own fitting branches in fallbackBranches;
  // don't let a generic keyword (e.g. "feel") hijack them at the suggested tier.
  if (isSuccessMetricQuestion(question)) return [];

  const p = question.prompt.toLowerCase();

  if (/\bfreedom|autonom|control|own\b/.test(p)) {
    return [
      { label: "Control over my time", shortHint: "Freedom of schedule" },
      { label: "Control over what I build", shortHint: "Freedom of direction" },
      { label: "Control over who I answer to", shortHint: "Freedom from a boss" },
    ];
  }
  if (/\bopportun|rare|window|miss|once\b/.test(p)) {
    return [
      { label: "A specific opportunity I can name", shortHint: "Concrete and testable" },
      { label: "A feeling that a window is closing", shortHint: "Worth pressure-testing" },
      { label: "A bit of both", shortHint: "Real, but partly fear" },
    ];
  }
  if (/\bidentit|meaning|alive|energiz|feel.*you|like .*you\b/.test(p)) {
    return [
      { label: "When I had real ownership", shortHint: "Identity through agency" },
      { label: "When I was learning fast", shortHint: "Identity through growth" },
      { label: "When the work mattered to others", shortHint: "Identity through impact" },
    ];
  }
  if (/\bgrowth|skill|reputation|scope|level up\b/.test(p)) {
    return [
      { label: "Depth of skill", shortHint: "Get measurably better" },
      { label: "External reputation", shortHint: "Build a visible signal" },
      { label: "Scope of responsibility", shortHint: "Take on more" },
    ];
  }
  if (/\buncertain|painful|resolve|test first\b/.test(p)) {
    return [
      { label: "Income / security", shortHint: "The money question" },
      { label: "Ownership / freedom", shortHint: "The autonomy question" },
      { label: "Whether I'd even enjoy it", shortHint: "The fit question" },
    ];
  }

  // Value-state fallback: lead with the values the journey has already surfaced.
  const tags = rankTags(state, []);
  const fromState = tags
    .slice(0, 3)
    .map((t) => ({ label: `Lean into ${VALUE_PHRASE[t]}`, shortHint: "From what you've told us" }));
  if (fromState.length >= MIN_BRANCHES) return fromState;
  return [];
}

/**
 * C. Generic safe fallback. Success-metric questions get yardstick-flavored
 * branches; everything else gets the universal prioritization set. These are the
 * last line of defense so a node is NEVER branchless.
 */
function fallbackBranches(question: JourneyQuestion | null): string[] {
  if (isSuccessMetricQuestion(question)) {
    return [
      "Define external validation",
      "Define personal satisfaction",
      "Define financial/security milestone",
      "Define learning/growth milestone",
    ];
  }
  return ["Prioritize safety", "Prioritize growth", "Prioritize flexibility"];
}

/* --------------------------------- core ----------------------------------- */

/**
 * Guarantee 3–5 deterministic, de-duplicated, non-empty answer branches for any
 * question, layering real → suggested → fallback in strict priority order. Does
 * NOT include "Write my own" (that is appended by branchGatesFor as a custom
 * branch). Safe to call with a null question — returns generic fallbacks.
 */
export function normalizeQuestionBranches(
  question: JourneyQuestion | null,
  state: JourneyState,
): BranchOption[] {
  const out: BranchOption[] = [];
  const seen = new Set<string>();

  const add = (rawLabel: string, kind: BranchKind, shortHint?: string) => {
    if (out.length >= MAX_BRANCHES) return;
    const label = (rawLabel || "").trim();
    if (!label) return; // no empty labels
    const key = label.toLowerCase();
    if (seen.has(key)) return; // no duplicate labels
    seen.add(key);
    out.push({ id: `branch-${slug(label)}`, label, shortHint, kind });
  };

  // A. Real API options first.
  if (question?.options) for (const o of question.options) add(o, "option");

  // B. Suggested, only if we still fall short of the minimum.
  if (question && out.length < MIN_BRANCHES) {
    for (const s of suggestedBranches(question, state)) add(s.label, "suggested", s.shortHint);
  }

  // C. Generic safe fallback — the guarantee that we never go below three.
  if (out.length < MIN_BRANCHES) {
    for (const f of fallbackBranches(question)) add(f, "fallback");
  }

  return out;
}

/**
 * The full set of branch gates rendered on an active node: the normalized answer
 * branches plus "Write my own" as a first-class custom branch. This is what the
 * canvas renders — so custom input always lives on the map, never only in a
 * bottom textarea.
 */
export function branchGatesFor(
  question: JourneyQuestion | null,
  state: JourneyState,
): BranchOption[] {
  return [
    ...normalizeQuestionBranches(question, state),
    {
      id: "branch-write-my-own",
      label: WRITE_MY_OWN_LABEL,
      shortHint: "Walk a path in your own words",
      kind: "custom",
    },
  ];
}
