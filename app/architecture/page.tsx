"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  Search,
  GitFork,
  BookOpen,
  TrendingUp,
  TriangleAlert,
  Gauge,
  ShieldCheck,
  ShieldX,
  Network,
  Share2,
  Database,
  Brain,
  ArrowRight,
  Sparkles,
  ClipboardList,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { ClaimLegend } from "@/components/shared/ClaimTag";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Pill, Divider } from "@/components/ui/Primitives";
import { PipelineDiagram } from "@/components/architecture/PipelineDiagram";
import { EvalSummary } from "@/components/architecture/EvalSummary";
import { RubricMap } from "@/components/architecture/RubricMap";
import { ResearchTransparency } from "@/components/architecture/ResearchTransparency";
import { ClaimLedger } from "@/components/research/ClaimLedger";
import { buildClaimLedger } from "@/lib/research/claimLedger";
import { DecisionDnaPanel } from "@/components/shared/DecisionDna";
import { buildDecisionDna } from "@/lib/decision/decisionDna";
import { DecisionDelta } from "@/components/shared/DecisionDelta";
import { TrajectoryAtlas } from "@/components/shared/TrajectoryAtlas";
import { ALL_SOURCE_CARDS } from "@/lib/knowledge/sources";
import { EVIDENCE_NODES, EVIDENCE_EDGES } from "@/lib/knowledge/graph";
import { DEMO_CONTEXT, DEMO_BRANCHES, DEMO_BRIEF } from "@/lib/mock";
import { cn } from "@/lib/utils";

type Agent = {
  name: string;
  role: string;
  icon: LucideIcon;
  tone: "quant" | "brand" | "startup" | "research" | "neutral";
};

const AGENTS: Agent[] = [
  {
    name: "ContextAgent",
    role: "Structures messy intake — decision, options, values, constraints, fears — into a clean frame the rest of the pipeline reasons over.",
    icon: Layers,
    tone: "quant",
  },
  {
    name: "RetrievalAgent",
    role: "Pulls relevant cards from the curated knowledge base + official-source pack, then traverses the local evidence graph.",
    icon: Search,
    tone: "brand",
  },
  {
    name: "ScenarioAgent",
    role: "Drafts exactly three distinct, plausible future branches — never a single recommended path.",
    icon: GitFork,
    tone: "research",
  },
  {
    name: "EvidenceAgent",
    role: "Attaches evidence to each branch with full provenance and states each source's coverage limitations honestly.",
    icon: BookOpen,
    tone: "quant",
  },
  {
    name: "OptimistAgent",
    role: "Argues the strongest hedged case for why a branch could work — one side of an explicit debate.",
    icon: TrendingUp,
    tone: "quant",
  },
  {
    name: "SkepticAgent",
    role: "Argues how a branch could fail, feeding the pre-mortem and kill criteria — the other side of the debate.",
    icon: TriangleAlert,
    tone: "startup",
  },
  {
    name: "CalibrationAgent",
    role: "Rates evidence, fit, constraint risk and uncertainty qualitatively — no invented probabilities.",
    icon: Gauge,
    tone: "brand",
  },
  {
    name: "SafetyAgent",
    role: "Rewrites deterministic/overconfident language and records the categories of overclaim it rejected.",
    icon: ShieldCheck,
    tone: "brand",
  },
  {
    name: "SynthesisAgent",
    role: "Reconciles the debate into the Future Map, Branch Detail, Audit Trail and Decision Brief.",
    icon: Network,
    tone: "research",
  },
];

type Compare = { llm: string; rules: string };

const COMPARISONS: Compare[] = [
  {
    llm: "Reads open-ended, messy human context — values, fears, constraints written in your own words.",
    rules: "A fixed rules table needs every input pre-categorised; nuance falls through the cracks.",
  },
  {
    llm: "Reasons about novel combinations of options it has never seen paired before.",
    rules: "Only handles option sets someone explicitly hard-coded ahead of time.",
  },
  {
    llm: "Surfaces non-obvious tradeoffs and the unstated assumptions hiding inside a choice.",
    rules: "Can only return tradeoffs that were manually written down for that exact branch.",
  },
  {
    llm: "Explains its reasoning in natural language a person can question and push back on.",
    rules: "Returns opaque scores from a lookup table that cannot encode situational judgement.",
  },
];

const KNOWLEDGE_FILES = [
  "computing_careers",
  "startup_validation",
  "grad_school_research",
  "decision_science",
  "labor_market_sources",
];

const HUMAN_FACTORS = ["Values", "Risk tolerance", "Family", "Identity", "Lived experience"];

// One-screen "what the AI does" summary — input -> transformation -> output -> action.
const AI_SUMMARY: { k: string; v: string }[] = [
  { k: "Input", v: "a messy life / career decision + your values, constraints and fears" },
  {
    k: "AI transformation",
    v: "clarifying questions → evidence retrieval → source ranking → claim ledger → three futures → 9-role agent debate → assumption pressure-tests → safety review",
  },
  { k: "Output", v: "three evidence-traced paths + a Decision Brief + a concrete next quest" },
  { k: "User action", v: "run one 7-day validation test this week while keeping the final decision" },
];

// Why an LLM beats the obvious non-AI tools, named explicitly for judges.
const WHY_NOT = [
  "Search retrieves facts but does not reason over your personal tradeoffs.",
  "Forms collect fixed answers but cannot adapt to open-ended uncertainty.",
  "Spreadsheets compare static criteria but never surface hidden assumptions or generate a validation test.",
];

// Real data powering the judge-facing dashboard (deduped by source).
const OFFICIAL_SOURCES = Array.from(
  new Map(ALL_SOURCE_CARDS.map((c) => [c.sourceName, c.publisher])).entries(),
).map(([sourceName, publisher]) => ({ sourceName, publisher }));

const NODE_TYPES = [
  "source",
  "career_path",
  "skill",
  "constraint",
  "decision_framework",
  "risk",
  "experiment",
];

// The canonical Alex trace (quant-signal branch) — driven by the real mock data.
const ALEX = DEMO_BRANCHES[0];
const ALEX_SOURCED = ALEX.evidenceCards.filter((c) => c.sourceName);

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      {/* 1) Header */}
      <Section className="pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <SectionTitle
            eyebrow="How it works · Judge Mode"
            title="An agentic RAG decision cockpit, not a chatbot"
            subtitle="Forked Futures does not predict your future and it does not choose for you. It runs a major decision through evidence retrieval, a local evidence graph, a multi-agent debate, calibration, a safety layer, and an auditable reasoning trail — turning a single anxious question into three testable scenarios with their costs, assumptions and uncertainties made explicit, so the final call stays yours."
          />
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">
              <Sparkles className="h-3 w-3" /> Agentic RAG
            </Badge>
            <Badge tone="quant">9-role pipeline</Badge>
            <Badge tone="research">Evidence graph</Badge>
            <Badge tone="startup">Human-in-the-loop</Badge>
            <Badge tone="neutral">Mock-first · no API key needed</Badge>
          </div>
        </motion.div>
      </Section>

      {/* 1a) One-screen "what the AI does" — judge orientation */}
      <Section className="pt-12">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <CockpitPanel
            label="What the AI does · one screen"
            icon={Brain}
            accent="brand"
            status="input → action"
          >
            <ol className="space-y-3">
              {AI_SUMMARY.map((row) => (
                <li key={row.k} className="flex flex-col gap-1 rounded-lg border border-line/60 bg-white/[0.02] px-3.5 py-2.5 sm:flex-row sm:gap-3">
                  <span className="mono-label shrink-0 text-brand-glow/80 sm:w-36">{row.k}</span>
                  <span className="text-sm leading-relaxed text-soft/90">{row.v}</span>
                </li>
              ))}
            </ol>
          </CockpitPanel>
          <Card>
            <CardBody className="space-y-3">
              <CardTitle>Why AI — not search, a form, or a spreadsheet</CardTitle>
              <ul className="space-y-2.5">
                {WHY_NOT.map((w) => (
                  <li key={w} className="flex gap-2.5 text-sm leading-relaxed text-soft/85">
                    <span className="mt-0.5 select-none text-mute/60">–</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed text-soft">
                AI earns its place by turning messy context into{" "}
                <span className="text-white">structured futures, explicit disagreements, honest evidence limits, and a next action</span>{" "}
                — none of which a lookup, a form, or a grid can produce.
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* 1b) Rubric map — judge orientation */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="For judges"
          title="How this maps to the rubric"
          subtitle="Where each scoring category is demonstrated in the product — navigate straight to the evidence."
        />
        <div className="mt-8">
          <RubricMap />
        </div>
      </Section>

      {/* 2) The pipeline */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="The pipeline"
          title="Input → reasoning → output → action"
          subtitle="A directed flow, not a single prompt. Your context enters on the left; what comes out the right is something you can test this week — not a verdict."
        />
        <div className="mt-8 rounded-3xl border border-line/60 bg-panel/30 p-5 backdrop-blur-xl sm:p-8">
          <PipelineDiagram />
        </div>
      </Section>

      {/* 3) The agents */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="The agents"
          title="Nine specialised roles, one debate"
          subtitle="Each role does one job and passes its output forward — including an explicit Optimist vs Skeptic debate before calibration. Separating reasoning from retrieval, critique and safety is what keeps the system honest about what it does and doesn't know. In a single live call these roles are run in one pass; the mock fallback emits the same structured record."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 4) * 0.06, duration: 0.45 }}
              >
                <Card hover className="h-full">
                  <CardBody className="space-y-3">
                    <Badge tone={agent.tone}>
                      <Icon className="h-3 w-3" />
                      {agent.name}
                    </Badge>
                    <p className="text-sm leading-relaxed text-soft/85">{agent.role}</p>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* 4) Why an LLM, not a rules engine */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Design choice"
          title="Why an LLM — and not a rules engine"
          subtitle="A decision like this is not a lookup. The reasoning a fixed table cannot encode is exactly the reasoning that matters."
        />
        <Card className="mt-8 overflow-hidden">
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-line/60 p-6 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-glow" />
                <CardTitle>Language-model reasoning</CardTitle>
              </div>
              <ul className="mt-4 space-y-3.5">
                {COMPARISONS.map((c) => (
                  <li key={c.llm} className="flex gap-2.5 text-sm leading-relaxed text-soft">
                    <span className="mt-0.5 select-none text-brand-glow/70">+</span>
                    <span>{c.llm}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-mute" />
                <CardTitle className="text-mute">A fixed rules table</CardTitle>
              </div>
              <ul className="mt-4 space-y-3.5">
                {COMPARISONS.map((c) => (
                  <li key={c.rules} className="flex gap-2.5 text-sm leading-relaxed text-mute">
                    <span className="mt-0.5 select-none text-mute/60">–</span>
                    <span>{c.rules}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </Section>

      {/* 5) Evidence / data layer */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Evidence & data layer"
          title="Grounded in a local knowledge base — never fabricated"
          subtitle="The RetrievalAgent runs keyword retrieval over a small, curated set of local JSON files. Claims are kept at occupation, field or framework level — Forked Futures never invents a precise individual statistic about you."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-glow" />
                <CardTitle>Local /knowledge sources</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2">
                {KNOWLEDGE_FILES.map((f) => (
                  <Pill key={f}>{f}.json</Pill>
                ))}
              </div>
              <Divider />
              <p className="text-sm leading-relaxed text-soft/85">
                Keyword retrieval matches your decision and options against these files, then surfaces
                only the cards that are relevant. Every claim carries its true{" "}
                <span className="text-white">coverage level</span> — occupation, field or framework —
                so a field-wide signal is never dressed up as a personal forecast.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-4">
              <CardTitle>Claim provenance</CardTitle>
              <p className="text-sm leading-relaxed text-soft/85">
                Every claim is tagged by where it came from, so you can weigh it accordingly.
              </p>
              <ClaimLegend />
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* 5b) Official-source RAG pack + evidence graph */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Evidence pack & graph"
          title="An official-source RAG pack, wired into a local graph"
          subtitle="Beyond the curated knowledge base, branches cite a pack of official public sources — each card carrying its publisher, coverage level and limitations, with no invented exact statistics. A local evidence graph connects them to paths, skills, risks and experiments."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <CockpitPanel
            label={`RAG pack · ${ALL_SOURCE_CARDS.length} cards`}
            icon={Database}
            accent="brand"
            status="local JSON"
          >
            <ul className="space-y-2">
              {OFFICIAL_SOURCES.map((s) => (
                <li
                  key={s.sourceName}
                  className="flex items-start justify-between gap-3 rounded-lg border border-line/60 bg-white/[0.02] px-3 py-2"
                >
                  <span className="text-sm text-white">{s.sourceName}</span>
                  <span className="text-right text-xs text-mute">{s.publisher}</span>
                </li>
              ))}
            </ul>
          </CockpitPanel>
          <CockpitPanel
            label="Local evidence graph"
            icon={Share2}
            accent="quant"
            status={`${EVIDENCE_NODES.length} nodes · ${EVIDENCE_EDGES.length} edges`}
          >
            <p className="text-sm leading-relaxed text-soft/85">
              A dependency-free node/edge model (no graph database) links the CS
              foundation to each path, the skills it requires, the constraints and
              risks that bound it, the decision frameworks that inform it, the
              official sources that support it, and the 7-day experiment that can
              test it. Retrieval traverses it to widen evidence beyond a keyword hit.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {NODE_TYPES.map((t) => (
                <Pill key={t}>{t.replace(/_/g, " ")}</Pill>
              ))}
            </div>
          </CockpitPanel>
        </div>
      </Section>

      {/* 5b2) Autonomous research transparency */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Autonomous web research"
          title="An agent that researches, then reasons"
          subtitle="Forked Futures plans safe public queries, retrieves and ranks sources, rejects weak ones with reasons, and extracts trajectory anchors — live when a search key is present, otherwise over a curated corpus. See the live console at /research."
        />
        <div className="mt-8">
          <ResearchTransparency />
        </div>
        <div className="mt-4">
          <LinkButton href="/research" variant="subtle" size="md">
            Open the Research Console <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </Section>

      {/* 5b25) Decision DNA — what the decision is really about */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Decision DNA"
          title="What the decision is really about"
          subtitle="A sharp, hypothesis-framed diagnosis — shown here for the Alex demo; the same derivation runs for any decision."
        />
        <div className="mt-8">
          <DecisionDnaPanel dna={buildDecisionDna(DEMO_CONTEXT, DEMO_BRANCHES)} compact />
        </div>
      </Section>

      {/* 5b3) Claim Ledger — traceable accuracy */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Claim Ledger"
          title="How do we know it's accurate?"
          subtitle="Every important claim is traceable to its support, reliability, and limits — source-supported vs AI-inferred, made explicit. Shown here for the Alex demo."
        />
        <div className="mt-8">
          <ClaimLedger claims={buildClaimLedger(DEMO_CONTEXT, DEMO_BRANCHES)} compact />
        </div>
      </Section>

      {/* 5c) Sample Alex trace — the 30-second judge centerpiece */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Sample trace · Alex"
          title="One decision, end to end"
          subtitle="The exact path the Alex demo takes through the system — from input to a human-controlled brief — so the whole pipeline is auditable in about 30 seconds. Pulled live from the running mock data, not a screenshot."
        />
        <div className="mt-8">
          <CockpitPanel
            label="Decision trace · quant-signal branch"
            icon={GitFork}
            accent="research"
            status="judge mode"
          >
            <ol className="space-y-4">
              <TraceStep n={1} icon={ClipboardList} label="Input · context">
                {DEMO_CONTEXT.decision}
              </TraceStep>
              <TraceStep n={2} icon={Search} label="Retrieval · agentic RAG">
                {`${ALEX.evidenceCards.length} evidence cards attached, ${ALEX_SOURCED.length} from official sources` +
                  (ALEX_SOURCED.length
                    ? ` (${ALEX_SOURCED.map((c) => c.sourceName).join(", ")}).`
                    : ".")}
              </TraceStep>
              <TraceStep n={3} icon={Share2} label="Evidence graph">
                {`${ALEX.evidenceGraphSnapshot?.nodes.length ?? 0} nodes and ${
                  ALEX.evidenceGraphSnapshot?.edges.length ?? 0
                } links explain why this branch exists.`}
              </TraceStep>
              <TraceStep n={4} icon={TrendingUp} label="Debate · optimist">
                {ALEX.agentReview?.optimistView}
              </TraceStep>
              <TraceStep n={5} icon={TriangleAlert} label="Debate · skeptic">
                {ALEX.agentReview?.skepticView}
              </TraceStep>
              <TraceStep n={6} icon={Gauge} label="Calibration · qualitative">
                {`Evidence ${ALEX.calibration.evidenceStrength} · fit ${ALEX.calibration.userFit} · constraint-risk ${ALEX.calibration.constraintRisk} · uncertainty ${ALEX.calibration.uncertaintyLevel} — no fabricated probabilities.`}
              </TraceStep>
              <TraceStep n={7} icon={ShieldX} label="Safety · overclaims rejected">
                {ALEX.rejectedOverclaims?.[0]}
              </TraceStep>
              <TraceStep n={8} icon={FlaskConical} label="Action · first experiment">
                {ALEX.sevenDayExperiment[0]?.action}
              </TraceStep>
              <TraceStep n={9} icon={ShieldCheck} label="Human-controlled brief">
                {`The AI explicitly will not decide: ${DEMO_BRIEF.whatAIWillNotDecide[0]}`}
              </TraceStep>
            </ol>
          </CockpitPanel>
        </div>
      </Section>

      {/* 5d) Decision Delta — impact of running the decision through the system */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Impact · Decision Delta"
          title="From uncertainty to action"
          subtitle="What the Alex decision looks like before vs. after Forked Futures. Every figure on the right is a real count of what the system produced — not a claim about any outcome."
        />
        <div className="mt-8">
          <DecisionDelta context={DEMO_CONTEXT} branches={DEMO_BRANCHES} compact />
        </div>
      </Section>

      {/* 5e) Trajectory Atlas — reference futures */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Trajectory Atlas"
          title="Reference futures, as analogies"
          subtitle="The system maps the user's anchors to curated role trajectories — analogies to learn from, never predictions and never a real person. Shown here for the Alex demo."
        />
        <div className="mt-8">
          <TrajectoryAtlas context={DEMO_CONTEXT} compact />
        </div>
      </Section>

      {/* 6) Responsible AI + human-in-the-loop */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Responsible AI"
          title="Uncertainty shown, not hidden — and the decision stays yours"
          subtitle="Responsible framing is structural here, enforced at multiple layers rather than left to a single careful prompt."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-glow" />
                <CardTitle>How hedged framing is enforced</CardTitle>
              </div>
              <ul className="space-y-2.5 text-sm leading-relaxed text-soft">
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    The <span className="text-white">SafetyAgent</span> rewrites deterministic
                    language and enforces scenario framing.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    <span className="text-white">Zod-validated</span> structured outputs reject any
                    payload that breaks the contract, with automatic retry.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    A <span className="text-white">mock fallback</span> means the UI stays calibrated
                    and honest even with no API key.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    Uncertainty is rendered as a first-class signal — shown on every branch, never
                    buried.
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>
          <Card glow>
            <CardBody className="space-y-3">
              <CardTitle>What the AI will not decide</CardTitle>
              <p className="text-sm leading-relaxed text-soft/85">
                The system can frame, retrieve and stress-test — but it cannot weigh what only you
                can weigh. These belong to you, and the Decision Brief says so explicitly:
              </p>
              <div className="flex flex-wrap gap-2">
                {HUMAN_FACTORS.map((h) => (
                  <Pill key={h} className="border-brand/30 bg-brand/[0.06] text-brand-glow">
                    {h}
                  </Pill>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-soft/85">
                Based on current assumptions, Forked Futures may suggest experiments and surface
                tradeoffs — but the choice tends to hinge on context no model holds. That is by
                design, and the final decision stays with you.
              </p>
            </CardBody>
          </Card>
        </div>
        <ResponsibleAIBanner className="mt-4" />
      </Section>

      {/* 6b) System evaluation — in-app eval results */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="System evaluation"
          title="The safeguards are tested, not just asserted"
          subtitle="A framework-free evaluation harness guards overclaim safety, evidence coverage, the output schema, and the keyless demo journey. The last local run, reproducible in one command:"
        />
        <div className="mt-8">
          <EvalSummary lastRun="2026-06-17" />
        </div>
      </Section>

      {/* 7) Tech */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="Under the hood"
          title="Mock-first, so it runs with no API key"
          subtitle="A small, modern stack chosen so the experience is reliable offline and the structured outputs can be trusted."
        />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {[
            "Next.js 14 App Router",
            "TypeScript",
            "Tailwind CSS",
            "Zod-validated structured outputs",
            "Local knowledge base",
            "framer-motion",
            "Mock-first fallback",
          ].map((t) => (
            <Pill key={t} className="text-sm">
              {t}
            </Pill>
          ))}
        </div>
      </Section>

      {/* Closing one-liner */}
      <Section className="pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={cn(
            "rounded-3xl border border-brand/30 bg-gradient-to-b from-brand/[0.08] to-transparent p-8 text-center shadow-glow-sm sm:p-12",
          )}
        >
          <p className="mx-auto max-w-3xl text-xl font-semibold leading-snug text-white sm:text-2xl">
            Forked Futures does not use AI to choose your future. It uses AI to help you understand
            the futures you&apos;re choosing between.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/intake" size="md">
              Start with your decision <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <Link href="/map" className="text-sm text-mute transition-colors hover:text-white">
              See an example Future Map →
            </Link>
          </div>
        </motion.div>
      </Section>
    </main>
  );
}

/** One step in the judge-facing Alex decision trace. */
function TraceStep({
  n,
  icon: Icon,
  label,
  children,
}: {
  n: number;
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-xs font-semibold text-brand-glow">
        {n}
      </span>
      <div className="space-y-1 pb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-brand-glow/80" />
          <span className="mono-label">{label}</span>
        </div>
        <p className="text-sm leading-relaxed text-soft/90">{children}</p>
      </div>
    </li>
  );
}
