/**
 * Autonomous research agent. Plans safe public queries, retrieves results via the
 * active search provider (live if configured, else the curated mock corpus),
 * ranks/rejects sources with reasons, clusters the evidence, derives trajectory
 * anchors, and assembles a transparent ResearchDossier. Mock-first: it always
 * returns a high-quality dossier with no search key.
 */
import type { FutureBranch, UserContext } from "../types";
import type { RawSearchResult } from "../web/types";
import type { ResearchDossier } from "./types";
import { getSearchProvider, liveSearchAvailable } from "../web/searchProvider";
import { planQueries } from "./queryPlanner";
import { rankSources, type RankInput } from "./sourceRanker";
import { buildClusters, extractAnchors } from "./trajectoryExtractor";
import { buildClaimLedger } from "./claimLedger";

const uniq = (a: string[]): string[] => Array.from(new Set(a));

export async function runResearch(
  ctx: UserContext,
  branches?: FutureBranch[],
  opts: { now?: string; perQueryLimit?: number } = {},
): Promise<ResearchDossier> {
  const now = opts.now ?? new Date().toISOString();
  const provider = getSearchProvider();
  const mocked = !liveSearchAvailable();
  const queries = planQueries(ctx, branches);

  const inputs: RankInput[] = [];
  for (const query of queries) {
    let raw: RawSearchResult[] = [];
    try {
      raw = await provider.search(query.q, { limit: opts.perQueryLimit ?? 6 });
    } catch {
      raw = []; // a failed query never breaks the dossier
    }
    for (const r of raw) inputs.push({ raw: r, intent: query.intent });
  }

  const { used, rejected } = rankSources(inputs, { now });
  const clusters = buildClusters(used);
  const anchors = extractAnchors(ctx);

  const limitations = uniq([
    ...used.slice(0, 5).map((s) => `${s.publisher}: ${s.limitation}`),
    "Aggregate and public sources describe groups and general guidance — not your individual outcome.",
  ]);
  const survivorshipBiasWarnings = uniq([
    ...used.filter((s) => s.survivorshipNote).map((s) => `${s.publisher}: ${s.survivorshipNote}`),
    "Public success stories are heavily filtered for survivors; the absence of failures is not evidence.",
  ]);
  const confidenceNotes = [
    "Official statistical sources are kept at occupation / program / cohort / population level.",
    "Public references are treated as analogies, not base rates, and flagged for survivorship bias.",
    mocked
      ? "Running on the curated mock corpus (no search key) — results are representative, not live."
      : `Running live via ${provider.name} search.`,
  ];

  const whatWouldChangeAssessment = (
    branches?.length
      ? branches.map((b) => b.reasoningAuditTrail?.whatWouldChangeThisAssessment?.[0]).filter((x): x is string => Boolean(x))
      : []
  );
  const validationExperiments = (
    branches?.length
      ? branches.map((b) => b.sevenDayExperiment?.[0]?.action).filter((x): x is string => Boolean(x))
      : []
  );

  return {
    decision: ctx.decision,
    provider: provider.name,
    mocked,
    generatedQueries: queries,
    sourcesFound: [...used, ...rejected],
    sourcesUsed: used,
    sourcesRejected: rejected,
    evidenceClusters: clusters,
    trajectoryAnchors: anchors,
    limitations,
    survivorshipBiasWarnings,
    confidenceNotes,
    claims: buildClaimLedger(ctx, branches ?? []),
    whatWouldChangeAssessment: whatWouldChangeAssessment.length
      ? whatWouldChangeAssessment
      : ["A cheap real-world test that confirms or weakens the load-bearing assumption."],
    validationExperiments: validationExperiments.length
      ? validationExperiments
      : ["Run the smallest decisive 7-day experiment for your top option."],
    generatedNote: mocked
      ? "Autonomous research over a curated public-source corpus (no search key required). Sources are aggregates and analogies, not predictions."
      : `Autonomous live web research via ${provider.name}. Sources are aggregates and analogies, not predictions.`,
  };
}
