/**
 * Official-source evidence pack loader. Curated cards describing what public /
 * official sources cover (College Scorecard, BLS OOH, O*NET, NACE, NCES B&B,
 * ACS PUMS) plus decision-science frameworks. These carry full provenance
 * (publisher, url, coverage level, limitations) but NO invented exact
 * statistics — coverage is always aggregate, never individual prediction.
 *
 * Mock fallback never depends on this module, so the keyless demo stays stable
 * regardless of the pack; the live pipeline uses it to ground branch evidence.
 */
import collegeScorecard from "@/knowledge/sources/college_scorecard.json";
import blsOoh from "@/knowledge/sources/bls_ooh.json";
import onet from "@/knowledge/sources/onet.json";
import nace from "@/knowledge/sources/nace_first_destination.json";
import nces from "@/knowledge/sources/nces_baccalaureate_beyond.json";
import acsPums from "@/knowledge/sources/acs_pums.json";
import decisionScience from "@/knowledge/sources/decision_science.json";
import type { SourcedEvidenceCard } from "../types";

const SOURCE_FILES = [
  collegeScorecard,
  blsOoh,
  onet,
  nace,
  nces,
  acsPums,
  decisionScience,
];

export const ALL_SOURCE_CARDS: SourcedEvidenceCard[] = SOURCE_FILES.flatMap(
  (f) => (f.items ?? []) as unknown as SourcedEvidenceCard[],
);

const BY_ID = new Map(ALL_SOURCE_CARDS.map((c) => [c.id, c]));

export function sourceCardById(id: string): SourcedEvidenceCard | undefined {
  return BY_ID.get(id);
}

export function sourceCardsByIds(ids: string[]): SourcedEvidenceCard[] {
  return ids
    .map((id) => BY_ID.get(id))
    .filter((c): c is SourcedEvidenceCard => Boolean(c));
}

/** Track keyword -> the official-source card ids most relevant to it. */
const TRACK_SOURCE_IDS: Record<string, string[]> = {
  quant: [
    "bls-quant-outlook",
    "onet-quant-skills",
    "acs-field-to-occupation",
    "scorecard-earnings",
  ],
  startup: [
    "acs-income-distribution",
    "nace-first-destination",
    "scorecard-cost",
  ],
  research: [
    "bls-postsec-outlook",
    "onet-research-activities",
    "nces-earnings-debt",
    "nace-continuing-education",
  ],
};

/** Always-include decision-science framing so every run is framework-grounded. */
const CORE_SOURCE_IDS = ["dsci-premortem", "dsci-smallest-test"];

function trackKeyFor(option: string): string | undefined {
  const o = option.toLowerCase();
  if (o.includes("quant") || o.includes("trading") || o.includes("finance"))
    return "quant";
  if (o.includes("startup") || o.includes("found") || o.includes("build"))
    return "startup";
  if (
    o.includes("research") ||
    o.includes("grad") ||
    o.includes("phd") ||
    o.includes("academ")
  )
    return "research";
  return undefined;
}

/**
 * Select the official-source cards relevant to a decision context. Used by the
 * live RetrievalAgent to inject provenance the model can copy into its branches.
 */
export function retrieveSourceCards(options: string[]): SourcedEvidenceCard[] {
  const ids = new Set<string>(CORE_SOURCE_IDS);
  for (const option of options) {
    const key = trackKeyFor(option);
    if (key) for (const id of TRACK_SOURCE_IDS[key]) ids.add(id);
  }
  // If nothing matched a known track, fall back to a broad, honest sample.
  if (ids.size === CORE_SOURCE_IDS.length) {
    ["bls-quant-outlook", "acs-field-to-occupation", "nace-first-destination"].forEach(
      (id) => ids.add(id),
    );
  }
  return sourceCardsByIds(Array.from(ids));
}
