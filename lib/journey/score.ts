/**
 * Evidence-fit scoring — a transparent, non-predictive match score.
 *
 * This is NOT a probability of success and NOT a forecast. It expresses how
 * strongly a revealed route matches the user's own answers and the curated
 * reference support behind it, with AI-inferred assumptions lowering confidence.
 * Pure function over data the journey already produced (a RevealedPath + the
 * inferred JourneyState) — no model call, no schema change, mock-first safe.
 *
 * score (0–100) = valueMatch*0.35 + constraintFit*0.25 + evidenceSupport*0.25
 *               − uncertaintyPenalty*0.15, clamped to a sane band so it never
 *               reads as certainty (0 or 100).
 */
import type { JourneyState, RevealedPath } from "./types";

export interface RouteFit {
  /** 0–100 evidence-fit score (a match score, never a prediction). */
  score: number;
  /** Qualitative band so the number never reads as odds/probability. */
  band: "Strong" | "Moderate" | "Loose";
  /** Transparent 0–1 components behind the score. */
  components: {
    valueMatch: number;
    constraintFit: number;
    evidenceSupport: number;
    uncertaintyPenalty: number;
  };
  /** One-line, honest explanation of why it scored this way. */
  rationale: string;
  strongestUserSignal: string;
  strongestReferenceSignal: string;
  /** The first AI-inferred assumption shaping the route (for "what shaped this route"). */
  aiInferredAssumption: string;
  biggestUncertainty: string;
  /** Present only when the route leans on AI-inferred assumptions. */
  inferredAssumptionWarning?: string;
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "for", "in", "on", "with", "your",
  "you", "it", "is", "are", "be", "this", "that", "what", "how", "more", "less",
  "than", "into", "over", "not", "but", "can", "could", "may", "might", "own",
  "one", "feel", "feels", "want", "wants", "matters", "matter",
]);

function tokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .match(/[a-z]+/g)
    ?.filter((t) => t.length > 2 && !STOP.has(t)) ?? [];
}

/** Fraction of `a`'s tokens that also appear in `b` (prefix-aware). */
function overlap(a: string[], b: string[]): number {
  if (!a.length) return 0;
  const bset = b;
  let hit = 0;
  for (const t of a) {
    if (bset.some((u) => u === t || u.startsWith(t) || t.startsWith(u))) hit++;
  }
  return hit / a.length;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function routeFit(path: RevealedPath, state: JourneyState): RouteFit {
  const notes = path.evidenceNotes ?? [];
  const userNotes = notes.filter((n) => n.sourceType === "user_answer");
  const curatedNotes = notes.filter((n) => n.sourceType === "curated_reference");
  const inferredNotes = notes.filter((n) => n.sourceType === "ai_inferred");

  // value match — how much of the user's stated direction is reflected in the path.
  const stateValueTokens = tokens(
    [...state.discoveredValues, ...state.possibleRouteHints, ...state.identitySignals].join(" "),
  );
  const pathValueTokens = tokens(
    `${path.title} ${path.whatItOptimizesFor} ${path.shortDescription}`,
  );
  const rawValueMatch = stateValueTokens.length ? overlap(stateValueTokens, pathValueTokens) : 0.5;
  const valueMatch = clamp(rawValueMatch + Math.min(userNotes.length * 0.1, 0.2), 0, 1);

  // constraint fit — lower when the path's named risk overlaps a stated constraint.
  const constraintTokens = tokens(state.constraints.join(" "));
  const threat = constraintTokens.length ? overlap(constraintTokens, tokens(path.whatItRisks)) : 0;
  const constraintFit = clamp(0.75 - threat * 0.5, 0.2, 1);

  // evidence support — curated references count most, user signals next.
  const evidenceSupport = clamp(0.25 + curatedNotes.length * 0.3 + userNotes.length * 0.15, 0, 1);

  // uncertainty penalty — more AI-inferred assumptions (or no curated grounding) → higher.
  const uncertaintyPenalty = clamp(
    inferredNotes.length * 0.3 + (state.uncertaintyTags.length ? 0.1 : 0) + (curatedNotes.length === 0 ? 0.2 : 0),
    0,
    1,
  );

  const raw =
    valueMatch * 0.35 + constraintFit * 0.25 + evidenceSupport * 0.25 - uncertaintyPenalty * 0.15;
  // Clamp to a band so the score never reads as certainty.
  const score = Math.round(clamp(raw, 0, 1) * 100);
  const banded = clamp(score, 28, 94);

  const strongestUserSignal =
    userNotes[0]?.summary || state.discoveredValues[0] || "Your stated direction in the journey";
  const strongestReferenceSignal =
    curatedNotes[0]?.label || "Decision-science framing (premortem · reversibility)";
  const aiInferredAssumption =
    inferredNotes[0]?.summary || "This route is a reasonable read of your answers — none flagged as a hard assumption.";
  const biggestUncertainty =
    path.whatItRisks || inferredNotes[0]?.summary || "Whether this path fits you specifically";

  const rationale =
    `Matches your stated values ${pct(valueMatch)}, fits your constraints ${pct(constraintFit)}, ` +
    `and is backed by ${curatedNotes.length} curated reference${curatedNotes.length === 1 ? "" : "s"} ` +
    `and ${userNotes.length} signal${userNotes.length === 1 ? "" : "s"} you gave — ` +
    `with ${inferredNotes.length} AI-inferred assumption${inferredNotes.length === 1 ? "" : "s"} lowering confidence.`;

  const inferredAssumptionWarning =
    inferredNotes.length > 0
      ? `Leans on ${inferredNotes.length} AI-inferred assumption${inferredNotes.length === 1 ? "" : "s"} — worth confirming before you weight this heavily.`
      : undefined;

  const band = banded >= 66 ? "Strong" : banded >= 45 ? "Moderate" : "Loose";

  return {
    score: banded,
    band,
    components: { valueMatch, constraintFit, evidenceSupport, uncertaintyPenalty },
    rationale,
    strongestUserSignal,
    strongestReferenceSignal,
    aiInferredAssumption,
    biggestUncertainty,
    inferredAssumptionWarning,
  };
}

function pct(n: number): string {
  if (n >= 0.66) return "strongly";
  if (n >= 0.4) return "moderately";
  return "loosely";
}
