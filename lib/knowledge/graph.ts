/**
 * Local evidence graph — a lightweight, dependency-free node/edge model that
 * makes the RAG layer feel like reasoning rather than keyword lookup. No Neo4j,
 * no external graph DB: just typed TypeScript the UI and pipeline can traverse.
 *
 * Nodes connect the user's CS foundation to each career path, the skills each
 * path requires, the constraints/risks that bound it, the decision frameworks
 * that inform it, the official sources that support it, and the 7-day experiment
 * that can test it. Every edge carries a human-readable explanation so a branch
 * can answer "why does this branch exist?" from the graph itself.
 */
import type {
  EvidenceEdge,
  EvidenceGraphSnapshot,
  EvidenceNode,
} from "../types";

export const EVIDENCE_NODES: EvidenceNode[] = [
  // Foundation
  {
    id: "cs-foundation",
    label: "CS major foundation",
    nodeType: "skill",
    evidenceCardIds: [],
  },
  // Career paths
  {
    id: "path-quant",
    label: "Quant Signal Track",
    nodeType: "career_path",
    evidenceCardIds: [
      "cc-quant-signals",
      "cc-internship-conversion",
      "cc-skill-compounding",
      "bls-quant-outlook",
      "onet-quant-skills",
    ],
  },
  {
    id: "path-startup",
    label: "Startup Validation Track",
    nodeType: "career_path",
    evidenceCardIds: [
      "sv-talk-to-users",
      "sv-mom-test",
      "sv-reversibility",
      "sv-cofounder-distribution",
    ],
  },
  {
    id: "path-research",
    label: "Research Depth Track",
    nodeType: "career_path",
    evidenceCardIds: [
      "gs-research-fit",
      "gs-advisor-leverage",
      "gs-funding-time",
      "bls-postsec-outlook",
      "onet-research-activities",
      "nces-earnings-debt",
    ],
  },
  // Skills
  {
    id: "skill-probability",
    label: "Probability / statistics fluency",
    nodeType: "skill",
    evidenceCardIds: ["onet-quant-skills"],
  },
  {
    id: "skill-coding",
    label: "Fast, clean coding under pressure",
    nodeType: "skill",
    evidenceCardIds: ["cc-quant-signals"],
  },
  {
    id: "skill-customer-discovery",
    label: "Customer discovery",
    nodeType: "skill",
    evidenceCardIds: ["sv-talk-to-users", "sv-mom-test"],
  },
  {
    id: "skill-distribution",
    label: "Distribution / reaching users",
    nodeType: "skill",
    evidenceCardIds: ["sv-cofounder-distribution"],
  },
  {
    id: "skill-research-writing",
    label: "Research output & writing",
    nodeType: "skill",
    evidenceCardIds: ["gs-advisor-leverage", "onet-research-activities"],
  },
  // Constraints
  {
    id: "constraint-paid-summer",
    label: "Paid summer internship (non-negotiable)",
    nodeType: "constraint",
    evidenceCardIds: [],
  },
  {
    id: "constraint-time",
    label: "~20 focused hours / week",
    nodeType: "constraint",
    evidenceCardIds: [],
  },
  // Decision frameworks
  {
    id: "fw-premortem",
    label: "Pre-mortem",
    nodeType: "decision_framework",
    evidenceCardIds: ["dsci-premortem"],
  },
  {
    id: "fw-reversibility",
    label: "Reversibility (one-way vs two-way doors)",
    nodeType: "decision_framework",
    evidenceCardIds: ["dsci-reversibility", "sv-reversibility"],
  },
  {
    id: "fw-smallest-test",
    label: "Smallest decisive experiment",
    nodeType: "decision_framework",
    evidenceCardIds: ["dsci-smallest-test"],
  },
  {
    id: "fw-values",
    label: "Values & tradeoffs",
    nodeType: "decision_framework",
    evidenceCardIds: ["dsci-values-tradeoffs"],
  },
  // Risks
  {
    id: "risk-timing",
    label: "Missed recruiting cycle (~1 year)",
    nodeType: "risk",
    evidenceCardIds: ["cc-internship-conversion"],
  },
  {
    id: "risk-build-before-validate",
    label: "Building before validating demand",
    nodeType: "risk",
    evidenceCardIds: ["sv-talk-to-users", "sv-mom-test"],
  },
  {
    id: "risk-fit-mismatch",
    label: "Untested research fit",
    nodeType: "risk",
    evidenceCardIds: ["gs-research-fit"],
  },
  {
    id: "risk-deferred-income",
    label: "Deferred income vs family stability",
    nodeType: "risk",
    evidenceCardIds: ["gs-funding-time", "nces-earnings-debt"],
  },
  // Experiments
  {
    id: "exp-quant-7day",
    label: "Quant 7-day signal test",
    nodeType: "experiment",
    evidenceCardIds: [],
  },
  {
    id: "exp-startup-7day",
    label: "Startup validation 7-day sprint",
    nodeType: "experiment",
    evidenceCardIds: [],
  },
  {
    id: "exp-research-7day",
    label: "Research-fit 7-day test",
    nodeType: "experiment",
    evidenceCardIds: [],
  },
  // Official sources
  {
    id: "src-bls",
    label: "BLS Occupational Outlook Handbook",
    nodeType: "source",
    evidenceCardIds: [
      "bls-quant-outlook",
      "bls-software-outlook",
      "bls-postsec-outlook",
    ],
  },
  {
    id: "src-onet",
    label: "O*NET OnLine",
    nodeType: "source",
    evidenceCardIds: [
      "onet-quant-skills",
      "onet-software-tasks",
      "onet-research-activities",
    ],
  },
  {
    id: "src-scorecard",
    label: "College Scorecard",
    nodeType: "source",
    evidenceCardIds: [
      "scorecard-earnings",
      "scorecard-completion",
      "scorecard-cost",
    ],
  },
  {
    id: "src-nace",
    label: "NACE First-Destination Survey",
    nodeType: "source",
    evidenceCardIds: ["nace-first-destination", "nace-continuing-education"],
  },
  {
    id: "src-nces",
    label: "NCES Baccalaureate & Beyond",
    nodeType: "source",
    evidenceCardIds: ["nces-earnings-debt", "nces-employment-enrollment"],
  },
  {
    id: "src-acs",
    label: "ACS PUMS (Census)",
    nodeType: "source",
    evidenceCardIds: ["acs-field-to-occupation", "acs-income-distribution"],
  },
  {
    id: "src-decision-science",
    label: "Decision-science frameworks",
    nodeType: "source",
    evidenceCardIds: [
      "dsci-premortem",
      "dsci-reversibility",
      "dsci-values-tradeoffs",
      "dsci-smallest-test",
    ],
  },
];

export const EVIDENCE_EDGES: EvidenceEdge[] = [
  // Foundation feeds every path
  { from: "cs-foundation", to: "path-quant", relation: "informs", explanation: "A CS foundation with probability/stats fluency feeds the legible signals quant screening rewards." },
  { from: "cs-foundation", to: "path-startup", relation: "informs", explanation: "Shipping side projects gives a validation sprint real building capability to deploy." },
  { from: "cs-foundation", to: "path-research", relation: "informs", explanation: "Coursework strength is a starting point for research, though it predicts research fit only weakly." },

  // Quant path
  { from: "path-quant", to: "skill-probability", relation: "requires", explanation: "Quant screening leans on demonstrated probability/statistics fluency." },
  { from: "path-quant", to: "skill-coding", relation: "requires", explanation: "Fast, clean coding under time pressure is a core quant interview signal." },
  { from: "src-bls", to: "path-quant", relation: "supports", explanation: "BLS frames occupation-level demand and entry requirements for quantitative roles." },
  { from: "src-onet", to: "skill-probability", relation: "supports", explanation: "O*NET lists the occupation-level skills quantitative roles screen for." },
  { from: "risk-timing", to: "path-quant", relation: "creates_risk", explanation: "Recruiting cycles open early; a missed window can delay the on-ramp by roughly a year." },
  { from: "constraint-paid-summer", to: "path-quant", relation: "informs", explanation: "Quant internships are paid, so the non-negotiable paid summer is compatible with this track — part of why its constraint risk is lower." },
  { from: "constraint-time", to: "path-quant", relation: "limits", explanation: "~20 focused hours/week caps how much interview prep can compound before the cycle." },
  { from: "fw-premortem", to: "path-quant", relation: "informs", explanation: "A pre-mortem surfaces 'started prep too late' as the dominant, timing-driven failure mode." },
  { from: "path-quant", to: "exp-quant-7day", relation: "can_be_tested_by", explanation: "The 7-day signal test checks interview-readiness and confirms real cycle dates." },

  // Startup path
  { from: "path-startup", to: "skill-customer-discovery", relation: "requires", explanation: "Finding urgent, frequent pain depends on disciplined customer discovery." },
  { from: "path-startup", to: "skill-distribution", relation: "requires", explanation: "A repeatable way to reach users is often the real bottleneck, not building." },
  { from: "risk-build-before-validate", to: "path-startup", relation: "creates_risk", explanation: "Building before confirming demand is the recurring early-founder failure mode." },
  { from: "fw-smallest-test", to: "risk-build-before-validate", relation: "limits", explanation: "A falsifiable demand test mitigates the build-before-validate risk before code is written." },
  { from: "fw-reversibility", to: "path-startup", relation: "informs", explanation: "Two-way-door framing reframes a time-boxed student sprint as more reversible than it feels." },
  { from: "constraint-paid-summer", to: "path-startup", relation: "creates_risk", explanation: "The non-negotiable paid summer tensions an unpaid validation sprint — the largest financial-regret surface of the three." },
  { from: "src-acs", to: "path-startup", relation: "informs", explanation: "ACS population-level field→occupation flows frame the fallback options if a venture winds down." },
  { from: "path-startup", to: "exp-startup-7day", relation: "can_be_tested_by", explanation: "The 7-day sprint runs Mom-Test interviews, a demand test, and a budget stress-test." },

  // Research path
  { from: "path-research", to: "skill-research-writing", relation: "requires", explanation: "Research output and writing are the high-leverage signals for this track." },
  { from: "src-bls", to: "path-research", relation: "supports", explanation: "BLS frames postsecondary/research-track roles and their education requirements." },
  { from: "src-nces", to: "risk-deferred-income", relation: "supports", explanation: "NCES cohort-level earnings and debt data frame the deferred-income tradeoff honestly." },
  { from: "src-nace", to: "path-research", relation: "informs", explanation: "NACE first-destination framing situates grad school as a continuing-education outcome category." },
  { from: "risk-fit-mismatch", to: "path-research", relation: "creates_risk", explanation: "Untested research fit is the dominant, personal risk for this branch." },
  { from: "risk-deferred-income", to: "path-research", relation: "creates_risk", explanation: "Deferred income during high-compounding years tensions the family-stability value." },
  { from: "fw-values", to: "path-research", relation: "informs", explanation: "Values/tradeoff framing surfaces the deferred-income-vs-family question the AI explicitly will not decide." },
  { from: "path-research", to: "exp-research-7day", relation: "can_be_tested_by", explanation: "The 7-day fit test cheaply replaces the untested 'I'd enjoy research' assumption with felt signal." },
];

/** Seed node ids per branch — the subgraph that explains why a branch exists. */
export const BRANCH_GRAPH_NODE_IDS: Record<string, string[]> = {
  "quant-signal": [
    "cs-foundation",
    "path-quant",
    "skill-probability",
    "skill-coding",
    "src-bls",
    "src-onet",
    "risk-timing",
    "constraint-paid-summer",
    "constraint-time",
    "fw-premortem",
    "exp-quant-7day",
  ],
  "startup-validation": [
    "cs-foundation",
    "path-startup",
    "skill-customer-discovery",
    "skill-distribution",
    "risk-build-before-validate",
    "fw-smallest-test",
    "fw-reversibility",
    "constraint-paid-summer",
    "src-acs",
    "exp-startup-7day",
  ],
  "research-depth": [
    "cs-foundation",
    "path-research",
    "skill-research-writing",
    "src-bls",
    "src-nces",
    "src-nace",
    "risk-fit-mismatch",
    "risk-deferred-income",
    "fw-values",
    "exp-research-7day",
  ],
};

/**
 * Map a live branch's track/title/id text to one of the three canonical branch
 * keys so the live path can attach the right evidence-graph snapshot even though
 * the model emits its own kebab ids. Returns undefined if no track matches.
 */
export function branchKeyFor(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/quant|trading|finance/.test(t)) return "quant-signal";
  if (/startup|found|build|venture|product/.test(t)) return "startup-validation";
  if (/research|grad|phd|academ|scholar/.test(t)) return "research-depth";
  return undefined;
}

const NODE_BY_ID = new Map(EVIDENCE_NODES.map((n) => [n.id, n]));

export function nodeById(id: string): EvidenceNode | undefined {
  return NODE_BY_ID.get(id);
}

/**
 * Build the subgraph for a branch: its seed nodes plus every edge whose
 * endpoints are both within that node set. Deterministic and dependency-free.
 */
export function graphSnapshotForBranch(branchId: string): EvidenceGraphSnapshot {
  const ids = BRANCH_GRAPH_NODE_IDS[branchId] ?? [];
  const idSet = new Set(ids);
  const nodes = ids
    .map((id) => NODE_BY_ID.get(id))
    .filter((n): n is EvidenceNode => Boolean(n));
  const edges = EVIDENCE_EDGES.filter(
    (e) => idSet.has(e.from) && idSet.has(e.to),
  );
  return { nodes, edges };
}

/**
 * One-hop graph expansion from a set of seed node ids — used by the retrieval
 * layer to widen evidence beyond a direct keyword hit. Capped by `maxNodes`.
 */
export function expandViaGraph(
  seedIds: string[],
  opts: { maxNodes?: number } = {},
): string[] {
  const { maxNodes = 24 } = opts;
  const out = new Set(seedIds);
  for (const e of EVIDENCE_EDGES) {
    if (out.has(e.from)) out.add(e.to);
    if (out.has(e.to)) out.add(e.from);
    if (out.size >= maxNodes) break;
  }
  return Array.from(out).slice(0, maxNodes);
}
