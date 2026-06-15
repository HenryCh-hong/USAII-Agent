"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  Search,
  GitFork,
  Scale,
  ShieldAlert,
  Gauge,
  ShieldCheck,
  Network,
  Database,
  Brain,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { ClaimLegend } from "@/components/shared/ClaimTag";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Pill, Divider } from "@/components/ui/Primitives";
import { PipelineDiagram } from "@/components/architecture/PipelineDiagram";
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
    role: "Structures messy intake into a clean decision frame the rest of the pipeline can reason over.",
    icon: Layers,
    tone: "quant",
  },
  {
    name: "RetrievalAgent",
    role: "Runs keyword retrieval over the local /knowledge base to pull only relevant, coverage-honest evidence.",
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
    name: "TradeoffAgent",
    role: "Surfaces hidden tradeoffs, opportunity cost, reversibility, skill compounding, emotional load and bottlenecks.",
    icon: Scale,
    tone: "startup",
  },
  {
    name: "CriticAgent",
    role: "Runs a pre-mortem on each branch — assuming it failed, what most likely caused it.",
    icon: ShieldAlert,
    tone: "neutral",
  },
  {
    name: "CalibrationAgent",
    role: "Rates evidence, fit, constraint risk and uncertainty qualitatively — no invented probabilities.",
    icon: Gauge,
    tone: "quant",
  },
  {
    name: "SafetyAgent",
    role: "Strips deterministic language and enforces scenario framing, so output stays hedged, not predictive.",
    icon: ShieldCheck,
    tone: "brand",
  },
  {
    name: "SynthesisAgent",
    role: "Assembles the Future Map, Branch Detail, Future Self and Decision Brief into one coherent surface.",
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
            eyebrow="How it works"
            title="An AI decision operating system, not a chatbot"
            subtitle="Forked Futures does not predict your future and it does not choose for you. It helps you understand the futures you're choosing between — turning a single anxious question into three evidence-grounded, testable scenarios, each with its costs, assumptions and uncertainties made explicit so the final call can stay yours."
          />
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">
              <Sparkles className="h-3 w-3" /> Scenario engine
            </Badge>
            <Badge tone="quant">8-agent pipeline</Badge>
            <Badge tone="research">Evidence-grounded</Badge>
            <Badge tone="startup">Human-in-the-loop</Badge>
          </div>
        </motion.div>
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
          title="Eight specialists, one handoff chain"
          subtitle="Each agent does one job well and passes its output forward. Separating reasoning from retrieval, critique and safety is what keeps the system honest about what it does and doesn't know."
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
