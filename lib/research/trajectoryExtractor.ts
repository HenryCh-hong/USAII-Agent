/**
 * Trajectory extractor — clusters the accepted sources into themed evidence
 * groups and derives trajectory anchors by reusing the Trajectory Atlas matcher.
 * Anchors are analogies only; the notes never claim the user "is like" anyone.
 */
import type { UserContext } from "../types";
import type { EvidenceCluster, ResearchSource, TrajectoryAnchorFinding } from "./types";
import { matchArchetypes } from "../trajectory/archetypes";

const CLUSTERS: { id: string; label: string; types: string[]; coverageLevel: string; summary: string }[] = [
  {
    id: "official-data",
    label: "Official labor & education data",
    types: ["official_data", "education_outcomes", "labor_market"],
    coverageLevel: "occupation / program / cohort / population",
    summary: "Aggregate statistical sources describing roles, programs, and cohorts — direction, not individual outcomes.",
  },
  {
    id: "frameworks",
    label: "Decision-science frameworks",
    types: ["decision_framework"],
    coverageLevel: "framework",
    summary: "Structured reasoning techniques for surfacing failure modes and testing assumptions cheaply.",
  },
  {
    id: "public-references",
    label: "Public trajectory references (analogies)",
    types: ["public_reference"],
    coverageLevel: "public-reference",
    summary: "Public career-guidance used as analogies — informative, but skewed toward visible successes.",
  },
];

export function buildClusters(used: ResearchSource[]): EvidenceCluster[] {
  return CLUSTERS.map((c) => {
    const sourceIds = used.filter((s) => c.types.includes(s.sourceType)).map((s) => s.id);
    return { id: c.id, label: c.label, summary: c.summary, coverageLevel: c.coverageLevel, sourceIds };
  }).filter((c) => c.sourceIds.length > 0);
}

export function extractAnchors(ctx: UserContext): TrajectoryAnchorFinding[] {
  return matchArchetypes(ctx)
    .filter((a) => a.resonance !== "missing")
    .slice(0, 4)
    .map((a) => ({
      archetypeId: a.archetype.id,
      label: a.archetype.label,
      resonance: a.resonance,
      note: "Rhymes with your anchors as an analogy — see the Trajectory Atlas for what does and doesn't transfer.",
    }));
}
