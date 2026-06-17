/**
 * Source ranker — turns raw search results into enriched ResearchSources and
 * splits them into "used" vs "rejected" with explicit reasons. Mock results are
 * enriched from the curated corpus; live results are classified by domain
 * heuristics (official .gov / .edu rank high; unknown domains are treated as
 * low-reliability leads, not evidence). Prefers official sources; flags
 * survivorship bias on public references.
 */
import type { RawSearchResult } from "../web/types";
import type { Level } from "../types";
import type { ResearchSource } from "./types";
import { CURATED_SOURCES, type ReliabilityTier, type ResearchSourceType } from "./corpus";

const BY_URL = new Map(CURATED_SOURCES.map((s) => [s.url, s]));
const TIER_CONF: Record<ReliabilityTier, Level> = { high: "high", medium: "medium", low: "low" };

const KNOWN_DOMAINS: Record<string, { sourceType: ResearchSourceType; tier: ReliabilityTier }> = {
  "hbr.org": { sourceType: "decision_framework", tier: "high" },
  "ycombinator.com": { sourceType: "public_reference", tier: "medium" },
  "80000hours.org": { sourceType: "public_reference", tier: "medium" },
  "review.firstround.com": { sourceType: "public_reference", tier: "medium" },
  "naceweb.org": { sourceType: "education_outcomes", tier: "medium" },
};

function classifyDomain(domain: string): { sourceType: ResearchSourceType; tier: ReliabilityTier } {
  if (domain.endsWith(".gov")) return { sourceType: "official_data", tier: "high" };
  if (domain.endsWith(".edu")) return { sourceType: "education_outcomes", tier: "medium" };
  return KNOWN_DOMAINS[domain] ?? { sourceType: "anecdotal", tier: "low" };
}

export interface RankInput {
  raw: RawSearchResult;
  intent: string;
}

export function rankSources(
  items: RankInput[],
  opts: { now: string },
): { used: ResearchSource[]; rejected: ResearchSource[] } {
  const used: ResearchSource[] = [];
  const rejected: ResearchSource[] = [];
  const seen = new Set<string>();

  for (const { raw, intent } of items) {
    if (seen.has(raw.url)) continue;
    seen.add(raw.url);

    const curated = BY_URL.get(raw.url);
    let src: ResearchSource;
    let reject: string | undefined;

    if (curated) {
      src = {
        id: curated.id,
        title: curated.title,
        url: curated.url,
        domain: curated.domain,
        publisher: curated.publisher,
        sourceType: curated.sourceType,
        reliabilityTier: curated.reliabilityTier,
        relevanceReason: intent,
        coverageLevel: curated.coverageLevel,
        limitation: curated.limitation,
        retrievedAt: opts.now,
        usedFor: intent,
        confidenceLevel: TIER_CONF[curated.reliabilityTier],
        isPublicTrajectory: curated.isPublicTrajectory,
        survivorshipNote: curated.survivorshipNote,
      };
      if (curated.rejectable) reject = curated.rejectable.reason;
    } else {
      const c = classifyDomain(raw.domain);
      const aggregate = c.sourceType === "official_data" || c.sourceType === "education_outcomes";
      src = {
        id: raw.url,
        title: raw.title,
        url: raw.url,
        domain: raw.domain,
        publisher: raw.domain,
        sourceType: c.sourceType,
        reliabilityTier: c.tier,
        relevanceReason: intent,
        coverageLevel: aggregate ? "aggregate" : "public-reference",
        limitation:
          c.tier === "low"
            ? "Unverified public page — treat as a lead, not evidence."
            : "Aggregate/public source — describes groups or general guidance, not an individual.",
        retrievedAt: opts.now,
        usedFor: intent,
        confidenceLevel: TIER_CONF[c.tier],
        isPublicTrajectory: c.sourceType === "public_reference",
        survivorshipNote:
          c.sourceType === "public_reference"
            ? "Public references skew toward visible successes — mind survivorship bias."
            : undefined,
      };
      if (c.tier === "low") reject = "Low-reliability domain — kept as a lead, not used as evidence.";
    }

    if (reject) {
      src.rejectionReason = reject;
      rejected.push(src);
    } else {
      used.push(src);
    }
  }

  return { used, rejected };
}
