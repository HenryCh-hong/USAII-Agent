/**
 * Curated public-source corpus for the research agent's mock path. These are
 * public institutions, statistical sources, and decision-science / public
 * career-guidance references — used as evidence and as ANALOGIES, never to
 * identify or compare to a private individual. The mock search provider draws
 * raw results from this list; the ranker re-attaches the rich metadata.
 *
 * Rejected examples are clearly illustrative (example.com) so the dossier can
 * honestly show what the agent filters out and why — without pointing at any
 * real person's private page.
 */

export type ResearchSourceType =
  | "official_data"
  | "education_outcomes"
  | "labor_market"
  | "decision_framework"
  | "public_reference"
  | "anecdotal";

export type ReliabilityTier = "high" | "medium" | "low";

export interface CuratedSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  publisher: string;
  snippet: string;
  sourceType: ResearchSourceType;
  reliabilityTier: ReliabilityTier;
  coverageLevel: string;
  limitation: string;
  /** Lowercase tokens used to match this source to generated queries. */
  tags: string[];
  /** Public archetype/career-guidance reference used strictly as an analogy. */
  isPublicTrajectory?: boolean;
  survivorshipNote?: string;
  /** If present, the ranker rejects this source with the given reason. */
  rejectable?: { reason: string };
}

export const CURATED_SOURCES: CuratedSource[] = [
  /* ---- Official / statistical (high reliability) ---- */
  {
    id: "bls-ooh",
    title: "Occupational Outlook Handbook",
    url: "https://www.bls.gov/ooh/",
    domain: "bls.gov",
    publisher: "U.S. Bureau of Labor Statistics",
    snippet:
      "Occupation-level duties, typical wage framing, projected outlook, and education/training requirements across occupations.",
    sourceType: "labor_market",
    reliabilityTier: "high",
    coverageLevel: "occupation",
    limitation: "Occupation-level aggregates with a reporting lag — not an individual forecast.",
    tags: ["quant", "software", "engineer", "career", "wage", "outlook", "occupation", "job", "recruiting", "analyst", "research"],
  },
  {
    id: "onet",
    title: "O*NET OnLine",
    url: "https://www.onetonline.org/",
    domain: "onetonline.org",
    publisher: "U.S. Department of Labor (O*NET)",
    snippet:
      "Occupation-level skills, tasks, work activities, tools and technologies, and worker characteristics.",
    sourceType: "official_data",
    reliabilityTier: "high",
    coverageLevel: "occupation",
    limitation: "Typical role profile from analyst ratings/surveys — not an individual skill assessment.",
    tags: ["skills", "tasks", "quant", "software", "research", "occupation", "career", "analyst"],
  },
  {
    id: "scorecard",
    title: "College Scorecard",
    url: "https://collegescorecard.ed.gov/",
    domain: "collegescorecard.ed.gov",
    publisher: "U.S. Department of Education",
    snippet:
      "Program- and school-level cost, completion, and post-attendance earnings context by field of study.",
    sourceType: "education_outcomes",
    reliabilityTier: "high",
    coverageLevel: "program",
    limitation: "Program/school aggregates from past cohorts — not an individual earnings prediction.",
    tags: ["college", "program", "earnings", "cost", "completion", "grad", "school", "field", "degree", "research"],
  },
  {
    id: "nace",
    title: "First-Destination Survey",
    url: "https://www.naceweb.org/job-market/graduate-outcomes/first-destination/",
    domain: "naceweb.org",
    publisher: "National Association of Colleges and Employers (NACE)",
    snippet:
      "Graduating-cohort outcome categories: employed, continuing education, still seeking; continuing-education rates.",
    sourceType: "education_outcomes",
    reliabilityTier: "medium",
    coverageLevel: "cohort",
    limitation: "Cohort snapshot shaped by response rates and timing — not an individual prediction.",
    tags: ["graduate", "outcomes", "employment", "grad", "school", "cohort", "career", "destination"],
  },
  {
    id: "nces-bb",
    title: "Baccalaureate and Beyond Longitudinal Study (B&B)",
    url: "https://nces.ed.gov/surveys/b&b/",
    domain: "nces.ed.gov",
    publisher: "National Center for Education Statistics (NCES)",
    snippet:
      "Cohort-level post-bachelor earnings trajectories, loan debt and repayment, employment, and graduate enrollment.",
    sourceType: "education_outcomes",
    reliabilityTier: "medium",
    coverageLevel: "cohort",
    limitation: "Longitudinal cohort aggregates with self-reported elements — not an individual outcome.",
    tags: ["earnings", "debt", "grad", "research", "phd", "income", "deferred", "cohort"],
  },
  {
    id: "acs-pums",
    title: "American Community Survey — PUMS",
    url: "https://www.census.gov/programs-surveys/acs/microdata.html",
    domain: "census.gov",
    publisher: "U.S. Census Bureau",
    snippet:
      "Population-level field-of-degree to occupation flows and income distributions by occupation and field.",
    sourceType: "official_data",
    reliabilityTier: "high",
    coverageLevel: "population",
    limitation: "Population aggregates from a large sample — describe groups, not an individual.",
    tags: ["income", "occupation", "field", "degree", "population", "career", "distribution", "startup"],
  },

  /* ---- Decision-science frameworks (high reliability) ---- */
  {
    id: "premortem-hbr",
    title: "Performing a Project Premortem",
    url: "https://hbr.org/2007/09/performing-a-project-premortem",
    domain: "hbr.org",
    publisher: "Harvard Business Review (Gary Klein)",
    snippet:
      "A structured prospective-hindsight technique: imagine the decision has failed, then work backward to surface failure modes.",
    sourceType: "decision_framework",
    reliabilityTier: "high",
    coverageLevel: "framework",
    limitation: "A reasoning technique, not an outcome measure.",
    tags: ["premortem", "decision", "risk", "failure", "assumptions", "framework"],
  },
  {
    id: "mom-test",
    title: "The Mom Test",
    url: "https://www.momtestbook.com/",
    domain: "momtestbook.com",
    publisher: "Rob Fitzpatrick",
    snippet:
      "How to run customer-discovery conversations that surface real demand by asking about past behavior, not hypotheticals.",
    sourceType: "decision_framework",
    reliabilityTier: "high",
    coverageLevel: "framework",
    limitation: "A validation method; execution quality dominates results.",
    tags: ["startup", "validation", "customer", "discovery", "demand", "founder", "build", "framework"],
  },

  /* ---- Public career-guidance references (analogies; medium reliability) ---- */
  {
    id: "yc-library",
    title: "Y Combinator Startup Library",
    url: "https://www.ycombinator.com/library",
    domain: "ycombinator.com",
    publisher: "Y Combinator",
    snippet:
      "Public essays and talks on the founder path — idea, validation, distribution, and team — from an accelerator's vantage point.",
    sourceType: "public_reference",
    reliabilityTier: "medium",
    coverageLevel: "public-reference",
    limitation: "Guidance from a selective accelerator's perspective; advice is general, not personalized.",
    tags: ["startup", "founder", "build", "product", "distribution", "validation", "venture"],
    isPublicTrajectory: true,
    survivorshipNote: "Accelerator-sourced guidance skews toward companies that were selected and survived.",
  },
  {
    id: "eighty-thousand-hours",
    title: "80,000 Hours Career Guide",
    url: "https://80000hours.org/career-guide/",
    domain: "80000hours.org",
    publisher: "80,000 Hours",
    snippet:
      "A public, research-informed guide to high-impact career paths, including research and graduate trajectories.",
    sourceType: "public_reference",
    reliabilityTier: "medium",
    coverageLevel: "public-reference",
    limitation: "An opinionated framework reflecting one organization's priorities; general, not personalized.",
    tags: ["research", "impact", "career", "grad", "phd", "policy", "fellowship", "academia"],
    isPublicTrajectory: true,
    survivorshipNote: "Profiles tend to feature people who found a strong fit; non-fits are under-represented.",
  },
  {
    id: "first-round-review",
    title: "First Round Review",
    url: "https://review.firstround.com/",
    domain: "review.firstround.com",
    publisher: "First Round",
    snippet:
      "Public long-form articles on building companies and teams, drawn from operator and founder experience.",
    sourceType: "public_reference",
    reliabilityTier: "medium",
    coverageLevel: "public-reference",
    limitation: "Lessons from a curated set of (often successful) operators; not a base rate.",
    tags: ["startup", "founder", "build", "team", "product", "creator"],
    isPublicTrajectory: true,
    survivorshipNote: "Heavily skewed toward operators who succeeded enough to be interviewed.",
  },

  /* ---- Illustrative low-quality results the agent REJECTS (example.com) ---- */
  {
    id: "anecdote-quant-3-months",
    title: "\"How I became a quant in 3 months\" (personal blog)",
    url: "https://example.com/how-i-became-a-quant-in-3-months",
    domain: "example.com",
    publisher: "Personal blog (illustrative)",
    snippet:
      "A single first-person success story compressing a multi-year path into a few months.",
    sourceType: "anecdotal",
    reliabilityTier: "low",
    coverageLevel: "single-anecdote",
    limitation: "One self-reported story; no base rate and strong survivorship bias.",
    tags: ["quant", "anecdote", "blog", "story", "career"],
    isPublicTrajectory: true,
    survivorshipNote: "A single success story tells you nothing about how the path typically goes.",
    rejectable: { reason: "Single anecdote, strong survivorship bias, over-specific — not a base rate." },
  },
  {
    id: "forum-thread",
    title: "Forum thread: \"Is quant or startup better?\" (unverified)",
    url: "https://example.com/forum/quant-vs-startup",
    domain: "example.com",
    publisher: "Anonymous forum (illustrative)",
    snippet:
      "Unverified opinions debating which path is better, with no sourcing.",
    sourceType: "anecdotal",
    reliabilityTier: "low",
    coverageLevel: "opinion",
    limitation: "Unverified, unsourced opinions; not evidence.",
    tags: ["quant", "startup", "forum", "opinion", "career"],
    rejectable: { reason: "Unverified, unsourced opinions — low reliability." },
  },
  {
    id: "stale-salary-page",
    title: "Outdated 2015 salary roundup (stale)",
    url: "https://example.com/2015-salary-roundup",
    domain: "example.com",
    publisher: "Aggregator (illustrative)",
    snippet:
      "A salary roundup last updated years ago.",
    sourceType: "anecdotal",
    reliabilityTier: "low",
    coverageLevel: "stale",
    limitation: "Years out of date; labor conditions have shifted.",
    tags: ["salary", "income", "career", "quant", "software"],
    rejectable: { reason: "Stale (years out of date) — superseded by current official sources." },
  },
];
