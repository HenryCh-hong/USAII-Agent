/**
 * Curated journey evidence base — the structured "what grounds a route" layer.
 *
 * This is the honest RAG surface for the guided journey: a small, hand-curated set
 * of public reference sources and decision/startup frameworks, each described by
 * what it CAN and CANNOT support, its coverage level, and its limitations. It
 * reuses the same public sources as the core official-source pack
 * (knowledge/sources/*.json) but in the richer, route-facing shape the /evidence
 * page and the route micro-review render.
 *
 * Honesty is structural and matches the rest of the app:
 *  - No invented statistics. Sources are described at occupation / cohort /
 *    population / framework level — never as an individual prediction.
 *  - Occupation/career data cards are only attached when the user's decision is
 *    actually occupation-shaped (see isCareerDataCard + the gating in
 *    lib/journey/routeUniverse), so a non-career decision never shows BLS/O*NET as
 *    if it had been looked up for that person.
 *  - AI-inferred assumptions are NEVER stored here as curated evidence; they are a
 *    separate runtime provenance surfaced per route.
 *
 * Mock-first and keyless: this is local curated data. An optional live
 * research/search provider exists (lib/web/searchProvider) and can be connected,
 * but production defaults to this curated base and never depends on live search.
 */

export type EvidenceSourceType =
  | "occupation_data"
  | "education_data"
  | "labor_market_data"
  | "career_outcome_data"
  | "decision_framework"
  | "startup_framework"
  | "user_signal";

export type EvidenceCoverage =
  | "occupation"
  | "cohort"
  | "population"
  | "framework"
  | "user_session";

export type EvidenceProvenance = "curated_reference" | "user_answer" | "ai_inferred";

export interface EvidenceCard {
  id: string;
  sourceName: string;
  publisher: string;
  sourceType: EvidenceSourceType;
  coverageLevel: EvidenceCoverage;
  /** What this source can legitimately ground, at its true coverage level. */
  whatItCanSupport: string[];
  /** What it must NOT be used for — guards against overclaim. */
  whatItCannotSupport: string[];
  /** A concrete example of how a route uses it. */
  exampleUse: string;
  limitations: string[];
  provenanceLabel: EvidenceProvenance;
  url?: string;
}

/* --------------------------- The curated cards ---------------------------- */

export const EVIDENCE_CARDS: EvidenceCard[] = [
  /* ---- Occupation / labor-market / education / outcome data (career-shaped only) ---- */
  {
    id: "bls-ooh",
    sourceName: "Occupational Outlook Handbook",
    publisher: "U.S. Bureau of Labor Statistics",
    sourceType: "labor_market_data",
    coverageLevel: "occupation",
    whatItCanSupport: [
      "Typical day-to-day duties of an occupation",
      "The direction (not the magnitude for you) of projected demand for a role",
      "The education and training a role typically expects",
    ],
    whatItCannotSupport: [
      "Whether you specifically will get hired or how much you will earn",
      "Outcomes for a single person or a single employer",
      "A precise, current salary number (figures carry a reporting lag)",
    ],
    exampleUse:
      "Grounding the 'legible footing' of a conservative anchor route in what a target occupation actually does and expects.",
    limitations: [
      "Occupation-level aggregates with a multi-year projection and reporting lag",
      "Groups varied employers, regions, and seniorities into one summary",
    ],
    provenanceLabel: "curated_reference",
    url: "https://www.bls.gov/ooh/",
  },
  {
    id: "onet",
    sourceName: "O*NET OnLine",
    publisher: "U.S. Department of Labor",
    sourceType: "occupation_data",
    coverageLevel: "occupation",
    whatItCanSupport: [
      "The specific skills, tasks, and work activities an occupation involves",
      "Which of your strengths a role actually draws on day to day",
      "Adjacent occupations that share a skill profile",
    ],
    whatItCannotSupport: [
      "Whether a specific role will suit you personally",
      "Your individual performance or satisfaction in it",
      "Real-time openings at any particular company",
    ],
    exampleUse:
      "Checking whether a hybrid-signal route's two strengths genuinely combine in roles that exist.",
    limitations: [
      "Describes occupations in the aggregate, updated on a survey cycle",
      "Task lists are representative, not exhaustive for every employer",
    ],
    provenanceLabel: "curated_reference",
    url: "https://www.onetonline.org/",
  },
  {
    id: "college-scorecard",
    sourceName: "College Scorecard",
    publisher: "U.S. Department of Education",
    sourceType: "education_data",
    coverageLevel: "cohort",
    whatItCanSupport: [
      "Field- and program-level earnings and cost patterns across cohorts",
      "How outcomes vary by program rather than by school name alone",
      "The typical debt a program's graduates have carried",
    ],
    whatItCannotSupport: [
      "What you specifically will earn after a program",
      "Causation — earnings reflect who enrolls, not only the program",
      "Outcomes for the newest cohorts (data lags enrollment)",
    ],
    exampleUse:
      "Sizing the opportunity cost of a long-horizon transformation that requires more schooling.",
    limitations: [
      "Cohort aggregates, federally-aided students only in parts of the data",
      "Selection effects mean it cannot isolate a program's individual effect",
    ],
    provenanceLabel: "curated_reference",
    url: "https://collegescorecard.ed.gov/",
  },
  {
    id: "nace-first-destination",
    sourceName: "First-Destination Survey",
    publisher: "National Association of Colleges and Employers (NACE)",
    sourceType: "career_outcome_data",
    coverageLevel: "cohort",
    whatItCanSupport: [
      "Where recent graduate cohorts land roughly six months out (employed / continuing study / seeking)",
      "How first-destination patterns differ by field of study",
      "A base rate for 'still figuring it out shortly after graduating'",
    ],
    whatItCannotSupport: [
      "Your individual destination or timeline",
      "Long-run career outcomes (it is a first-destination snapshot)",
      "Quality or fit of the roles, only their category",
    ],
    exampleUse:
      "Giving a balanced-portfolio route an honest base rate so 'not landed yet' reads as common, not failure.",
    limitations: [
      "Self-reported, six-month snapshot by participating institutions",
      "Response rates and field coverage vary across schools",
    ],
    provenanceLabel: "curated_reference",
    url: "https://www.naceweb.org/job-market/graduate-outcomes/first-destination/",
  },
  {
    id: "nces-bb",
    sourceName: "Baccalaureate & Beyond (B&B)",
    publisher: "U.S. National Center for Education Statistics",
    sourceType: "career_outcome_data",
    coverageLevel: "cohort",
    whatItCanSupport: [
      "Longer-run employment and further-study patterns of bachelor's cohorts over years",
      "How early choices relate to later enrollment and debt across a cohort",
      "A multi-year view that a six-month snapshot cannot give",
    ],
    whatItCannotSupport: [
      "Your individual long-run path",
      "A causal effect of any one decision",
      "Outcomes for very recent graduates",
    ],
    exampleUse:
      "Stress-testing a long-horizon transformation route against how cohorts actually moved over several years.",
    limitations: [
      "Cohort longitudinal study with multi-year lag",
      "Aggregates many fields and institution types",
    ],
    provenanceLabel: "curated_reference",
    url: "https://nces.ed.gov/surveys/b&b/",
  },
  {
    id: "acs-pums",
    sourceName: "American Community Survey — PUMS",
    publisher: "U.S. Census Bureau",
    sourceType: "labor_market_data",
    coverageLevel: "population",
    whatItCanSupport: [
      "Population-level distributions of income, field-to-occupation flows, and demographics",
      "How spread out outcomes are within a field (the variance, not just an average)",
      "A reality check on how often a field leads to a given occupation",
    ],
    whatItCannotSupport: [
      "Any individual's income or path",
      "Forward-looking projections (it is a current cross-section)",
      "Causation between a field and an outcome",
    ],
    exampleUse:
      "Showing a high-risk/high-reward route that the upside exists in the distribution's tail — and so does the downside.",
    limitations: [
      "Population microdata sample; estimates carry margins of error",
      "Cross-sectional, so it describes today's stock, not your future",
    ],
    provenanceLabel: "curated_reference",
    url: "https://www.census.gov/programs-surveys/acs/microdata.html",
  },

  /* ---- Decision frameworks (universal — apply to any decision) ---- */
  {
    id: "premortem",
    sourceName: "Pre-mortem (prospective hindsight)",
    publisher: "Gary Klein, Harvard Business Review (2007)",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Surfacing failure modes by imagining the route has already failed",
      "Turning a vague worry into named, checkable risks",
      "Designing early-warning signs before committing",
    ],
    whatItCannotSupport: [
      "The probability that the route will fail",
      "Any individual outcome",
    ],
    exampleUse:
      "Generating a route's key-risks and early-warning-signs by working backward from an imagined failure.",
    limitations: ["A reasoning technique, not a measurement"],
    provenanceLabel: "curated_reference",
    url: "https://hbr.org/2007/09/performing-a-project-premortem",
  },
  {
    id: "two-way-doors",
    sourceName: "One-way vs two-way doors (reversibility)",
    publisher: "Decision-science / reversibility framing",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Classifying a route as reversible (two-way) or hard-to-undo (one-way)",
      "Matching deliberation to how reversible a step really is",
      "Justifying a fast, cheap try when the door swings both ways",
    ],
    whatItCannotSupport: [
      "Whether the route is right for you",
      "A forecast of the outcome",
    ],
    exampleUse:
      "Marking an optimize-in-place route as a two-way door, so a one-week test costs almost nothing.",
    limitations: ["A framing lens, not evidence about results"],
    provenanceLabel: "curated_reference",
  },
  {
    id: "outside-view",
    sourceName: "Outside view / base-rate thinking",
    publisher: "Decision-science framing (Kahneman & Tversky tradition)",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Anchoring on how a reference class of similar situations usually goes",
      "Counterweighting an over-optimistic inside view of your own plan",
      "Framing 'how long / how hard' more realistically",
    ],
    whatItCannotSupport: [
      "A precise number for your case",
      "Removing the genuine uncertainty in your specific situation",
    ],
    exampleUse:
      "Reminding an ambitious-sprint route that concentrated bets usually take longer than the inside view expects.",
    limitations: ["Only as good as the reference class you can honestly name"],
    provenanceLabel: "curated_reference",
  },
  {
    id: "regret-min",
    sourceName: "Regret minimization",
    publisher: "Decision-science framing",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Projecting forward to which path you'd most regret not trying",
      "Separating fear-of-loss from fear-of-missing-out",
      "Weighing action vs inaction regret explicitly",
    ],
    whatItCannotSupport: [
      "Which choice is correct for you",
      "How you will actually feel later",
    ],
    exampleUse:
      "Helping a high-risk/high-reward route weigh the regret of an untaken swing against the regret of a failed one.",
    limitations: ["A values-clarifying lens, not a predictor of feelings"],
    provenanceLabel: "curated_reference",
  },
  {
    id: "value-of-information",
    sourceName: "Smallest decisive experiment (value of information)",
    publisher: "Decision-science framing",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Designing the cheapest test that could actually change the decision",
      "Pre-committing a pass/fail signal before running it",
      "Spending effort where it most reduces uncertainty",
    ],
    whatItCannotSupport: [
      "The result of the test before you run it",
      "Certainty — only a cheaper way to learn",
    ],
    exampleUse:
      "Shaping a short-term-test route's one-week probe so a single result meaningfully moves your belief.",
    limitations: ["Quality depends on choosing a genuinely falsifiable signal"],
    provenanceLabel: "curated_reference",
  },
  {
    id: "deliberate-practice",
    sourceName: "Deliberate practice / skill compounding",
    publisher: "Skill-acquisition research framing (Ericsson tradition)",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Why focused, feedback-rich effort compounds a distinctive edge",
      "Structuring a long build around the hardest sub-skill",
      "Explaining why depth is hard to copy",
    ],
    whatItCannotSupport: [
      "How fast you specifically will improve",
      "That effort guarantees any outcome",
    ],
    exampleUse:
      "Grounding a long-horizon transformation in why concentrated depth tends to become hard-to-copy over time.",
    limitations: ["A mechanism, not a measured rate for your case"],
    provenanceLabel: "curated_reference",
  },
  {
    id: "barbell",
    sourceName: "Barbell (floor + upside) risk framing",
    publisher: "Risk-management framing (Taleb tradition)",
    sourceType: "decision_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Pairing a protected floor with a bounded, asymmetric upside bet",
      "Capping downside while keeping exposure to a large upside",
      "Justifying a fallback floor underneath a riskier move",
    ],
    whatItCannotSupport: [
      "The size of the upside in your case",
      "That the structure removes risk — it bounds it",
    ],
    exampleUse:
      "Structuring a fallback-floor route so a portable skill/savings base protects every other path.",
    limitations: ["A structuring lens, not a return estimate"],
    provenanceLabel: "curated_reference",
  },

  /* ---- Startup / customer-discovery frameworks ---- */
  {
    id: "customer-development",
    sourceName: "Customer Development",
    publisher: "Steve Blank",
    sourceType: "startup_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Testing whether a real demand exists before building heavily",
      "Getting out of the building to talk to target users early",
      "Separating a vision from evidence that anyone wants it",
    ],
    whatItCannotSupport: [
      "Whether your specific venture will succeed",
      "Market size or revenue figures",
    ],
    exampleUse:
      "Shaping an experimental-probe route's first week around demand interviews, not building.",
    limitations: ["A process framework; results depend on honest execution"],
    provenanceLabel: "curated_reference",
    url: "https://steveblank.com/",
  },
  {
    id: "mom-test",
    sourceName: "The Mom Test",
    publisher: "Rob Fitzpatrick",
    sourceType: "startup_framework",
    coverageLevel: "framework",
    whatItCanSupport: [
      "Asking about users' past behavior, not their opinions of your idea",
      "Avoiding false validation from polite encouragement",
      "Designing interview questions that surface real demand signals",
    ],
    whatItCannotSupport: [
      "Whether the idea will work",
      "A quantitative demand estimate",
    ],
    exampleUse:
      "Making a high-risk/high-reward route's customer interviews falsifiable instead of flattering.",
    limitations: ["An interviewing discipline, not a measurement of the market"],
    provenanceLabel: "curated_reference",
  },
];

/* ------------------------------- accessors -------------------------------- */

const BY_ID = new Map(EVIDENCE_CARDS.map((c) => [c.id, c]));

export function evidenceCardById(id: string): EvidenceCard | undefined {
  return BY_ID.get(id);
}

/** Career/occupation DATA cards (gated to occupation-shaped decisions). Frameworks are universal. */
const CAREER_DATA_TYPES = new Set<EvidenceSourceType>([
  "occupation_data",
  "education_data",
  "labor_market_data",
  "career_outcome_data",
]);

export function isCareerDataCard(card: EvidenceCard): boolean {
  return CAREER_DATA_TYPES.has(card.sourceType);
}

/**
 * Resolve a route's evidence-card ids into cards, dropping occupation/career DATA
 * cards when the decision is not career-shaped — those sources were never looked
 * up for a non-occupational decision, so they must not appear as support for it.
 * Frameworks (decision/startup) always remain.
 */
export function evidenceCardsForIds(ids: string[], careerShaped: boolean): EvidenceCard[] {
  return ids
    .map((id) => BY_ID.get(id))
    .filter((c): c is EvidenceCard => Boolean(c))
    .filter((c) => careerShaped || !isCareerDataCard(c));
}

/** Honest one-liner shown when no curated source applies directly to a route. */
export const NO_CURATED_SOURCE_NOTE =
  "No strong curated source applies directly to this route — it relies more on your own answers and clearly-flagged inferred assumptions than on reference data.";

/** Human labels for the three provenance types (UI + /evidence page). */
export const PROVENANCE_LABELS: Record<EvidenceProvenance, string> = {
  user_answer: "User-provided signal",
  curated_reference: "Curated / reference-backed",
  ai_inferred: "AI-inferred assumption",
};

/** Display label for an evidence source type. */
export const SOURCE_TYPE_LABELS: Record<EvidenceSourceType, string> = {
  occupation_data: "Occupation data",
  education_data: "Education data",
  labor_market_data: "Labor-market data",
  career_outcome_data: "Career-outcome data",
  decision_framework: "Decision framework",
  startup_framework: "Startup framework",
  user_signal: "User signal",
};
