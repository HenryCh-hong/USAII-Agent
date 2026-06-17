/**
 * Trajectory Atlas — curated ROLE archetypes used as analogies, never
 * predictions and never named real people. A deterministic matcher compares the
 * user's stated anchors (from their context) against each archetype's keywords
 * and returns a qualitative resonance label. No percentages, no person-matching.
 *
 * This is an additive module: it imports UserContext as a type only and does not
 * modify the canonical data model, mock data, or AI pipeline.
 */
import type { UserContext } from "../types";
import archetypeData from "./archetypes.data.json";

export type Resonance = "strong" | "partial" | "weak" | "missing";

export interface TrajectoryArchetype {
  id: string;
  label: string;
  blurb: string;
  /** Lowercase tokens (single or multi-word) that suggest resonance. */
  keywords: string[];
  whatRhymes: string;
  whatDoesNotTransfer: string;
  hiddenTradeoffs: string[];
  survivorshipWarning: string;
  evidenceCoverage: string;
  strongerIf: string;
  weakerIf: string;
  sevenDayTest: string;
}

export interface AnchoredArchetype {
  archetype: TrajectoryArchetype;
  resonance: Resonance;
  matched: string[];
}

/* Curated archetype content (knowledge/trajectories source-of-truth JSON). */
export const ARCHETYPES: TrajectoryArchetype[] = archetypeData as unknown as TrajectoryArchetype[];

const STOP = new Set([
  "the", "a", "an", "to", "of", "and", "or", "for", "in", "on", "is", "are",
  "i", "my", "me", "we", "should", "between", "with", "about", "vs", "versus",
  "be", "do", "this", "that", "it", "as", "at", "by", "from", "want", "into",
  "go", "all", "out", "not", "but", "if", "so", "than", "then", "you", "your",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

/** The user's anchor tokens, drawn from every free-text field of their context. */
export function anchorTokens(ctx: UserContext): Set<string> {
  const blob = [
    ctx.decision,
    ...ctx.options,
    ctx.major,
    ...ctx.skills,
    ...ctx.values,
    ...ctx.constraints,
    ...ctx.fears,
    ctx.background,
  ].join(" ");
  return new Set(tokenize(blob));
}

/** Labeled anchor chips for display (institution/field/skill/value/constraint/risk). */
export function anchorChips(ctx: UserContext): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = [];
  if (ctx.major) chips.push({ label: "Field", value: ctx.major });
  if (ctx.skills[0]) chips.push({ label: "Skill", value: ctx.skills[0] });
  if (ctx.values[0]) chips.push({ label: "Motivation", value: ctx.values[0] });
  if (ctx.constraints[0]) chips.push({ label: "Constraint", value: ctx.constraints[0] });
  const risk =
    ctx.urgency === "deciding_now"
      ? "Deciding now — time-pressured"
      : ctx.urgency === "soon"
        ? "Deciding soon"
        : "Exploring — lower time pressure";
  chips.push({ label: "Risk profile", value: risk });
  return chips;
}

function resonanceFor(count: number): Resonance {
  if (count >= 4) return "strong";
  if (count >= 2) return "partial";
  if (count >= 1) return "weak";
  return "missing";
}

const ORDER: Record<Resonance, number> = { strong: 3, partial: 2, weak: 1, missing: 0 };

/**
 * Score every archetype against the user's anchors and return them sorted by
 * resonance. Multi-word keywords match only when all their tokens are present.
 */
export function matchArchetypes(ctx: UserContext): AnchoredArchetype[] {
  const tokens = anchorTokens(ctx);
  return ARCHETYPES.map((archetype) => {
    const matched = archetype.keywords.filter((k) =>
      k
        .toLowerCase()
        .split(/\s+/)
        .every((t) => tokens.has(t)),
    );
    return { archetype, resonance: resonanceFor(matched.length), matched };
  }).sort(
    (x, y) => ORDER[y.resonance] - ORDER[x.resonance] || y.matched.length - x.matched.length,
  );
}
