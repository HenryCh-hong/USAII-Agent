/**
 * Claim-to-source ledger — makes every important research claim traceable: what
 * supports it, how reliable that support is, what it can't tell us, whether it's
 * source-supported or AI-inferred, and what it affects (branch / archetype /
 * assumption / experiment). Pure and sync, derived from existing branch data, so
 * it renders anywhere (Research Console, Decision Brief, Judge Mode) without an
 * extra fetch. No invented statistics, no fake citations.
 */
import type { FutureBranch, Level, UserContext } from "../types";
import type { ClaimLedgerEntry } from "./types";

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function buildClaimLedger(_ctx: UserContext, branches: FutureBranch[]): ClaimLedgerEntry[] {
  const claims: ClaimLedgerEntry[] = [];

  branches.forEach((b) => {
    // Source-supported claim: prefer an official-source-backed evidence card.
    const sourced = b.evidenceCards.find((c) => c.sourceName) ?? b.evidenceCards[0];
    if (sourced) {
      const reliability: Level = sourced.reliabilityLevel ?? sourced.evidenceStrength;
      claims.push({
        id: `${b.id}-source`,
        claim: `${b.track}: ${truncate(sourced.claim ?? sourced.content, 180)}`,
        provenance: "source_supported",
        reliability,
        limitation:
          sourced.limitations ?? "Aggregate / curated source — direction, not an individual prediction.",
        affects: "branch",
        affectsLabel: b.track,
        sources: [
          { title: sourced.sourceName ?? sourced.title, url: sourced.sourceUrl, sourceType: sourced.sourceType },
        ],
      });
    }

    // AI-inferred claim: the load-bearing assumption, routed to a test.
    const inferred = b.assumptions.find((a) => a.type === "ai_inferred") ?? b.assumptions[0];
    if (inferred) {
      claims.push({
        id: `${b.id}-inferred`,
        claim: `${b.track}: ${truncate(inferred.claim, 180)}`,
        provenance: inferred.type === "ai_inferred" ? "ai_inferred" : "source_supported",
        reliability: inferred.confidence,
        limitation: "Flagged inference — routed to a validation experiment before it is trusted.",
        affects: "assumption",
        affectsLabel: b.track,
        sources: [],
      });
    }
  });

  // Framework + action (mixed): decision-science applied to this decision.
  claims.push({
    id: "framework-experiment",
    claim:
      "The highest-value next move is the smallest 7-day experiment that could change the decision, with a pre-committed pass/fail signal.",
    provenance: "mixed",
    reliability: "high",
    limitation: "A decision method, not a guarantee; execution quality dominates the outcome.",
    affects: "experiment",
    sources: [
      {
        title: "Smallest decisive experiment / pre-mortem (decision science)",
        url: "https://hbr.org/2007/09/performing-a-project-premortem",
        sourceType: "decision_framework",
      },
    ],
  });

  // Archetype claim (source-supported by public references, with survivorship caveat).
  claims.push({
    id: "archetype-survivorship",
    claim:
      "Public trajectory references rhyme with these paths as analogies — but they skew toward survivors, so treat them as patterns, not base rates.",
    provenance: "source_supported",
    reliability: "medium",
    limitation: "Survivorship bias; the absence of failures is not evidence.",
    affects: "archetype",
    sources: [
      {
        title: "Public career guidance (YC Library · 80,000 Hours)",
        url: "https://80000hours.org/career-guide/",
        sourceType: "public_reference",
      },
    ],
  });

  return claims;
}
