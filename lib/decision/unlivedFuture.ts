/**
 * Unlived Future — the opportunity cost of NOT entering a route, framed as
 * "what might this route teach you that the others won't?" plus a low-cost way to
 * sample it later. Purely derived from existing branch fields (skillCompounding,
 * regretRadar, reversibility, sevenDayExperiment) — no schema change, no new data.
 *
 * Responsible-AI: opportunity cost and a cheap test, never "you will regret this."
 */
import type { FutureBranch, Level } from "../types";

export interface UnlivedFuture {
  branchId: string;
  track: string;
  /** What this route uniquely builds that the others won't. */
  teaches: string;
  reversibility: Level;
  /** A low-cost way to sample this route later (a one-week taste). */
  sampleTest: string;
}

function firstSentence(s: string, max = 120): string {
  const i = s.indexOf(". ");
  const t = (i > 0 ? s.slice(0, i + 1) : s).trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

export function buildUnlivedFuture(b: FutureBranch): UnlivedFuture {
  // Prefer an "opportunity/inaction" regret (the regret of not trying) for the
  // teaches line; fall back to the route's skill-compounding (its unique upside).
  const opp = b.regretRadar.find(
    (r) => r.regretType === "opportunity" || r.regretType === "inaction",
  );
  return {
    branchId: b.id,
    track: b.track,
    teaches: firstSentence(opp?.description || b.skillCompounding),
    reversibility: b.reversibility,
    sampleTest: b.sevenDayExperiment[0]?.action || b.bottlenecks[0] || "",
  };
}
