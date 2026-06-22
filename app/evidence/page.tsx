"use client";

/**
 * /evidence — the visible Evidence Base / RAG explainer.
 *
 * Lets judges (and users) see exactly how the evidence layer works: that it is
 * used to GROUND route assumptions and clarify tradeoffs, never to predict a
 * personal outcome. Shows the pipeline, the curated source cards with what each
 * can and cannot support, the three provenance labels, an honest breakdown of the
 * evidence-fit MATCH score, and the responsible-AI limitations. Mock-first and
 * keyless; an optional live provider is described honestly, not depended on.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Database,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  User2,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pill } from "@/components/ui/Primitives";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  EVIDENCE_CARDS,
  PROVENANCE_LABELS,
  SOURCE_TYPE_LABELS,
  isCareerDataCard,
} from "@/lib/journey/evidence";
import type { EvidenceCard } from "@/lib/journey/evidence";

const PIPELINE = [
  { label: "Your answers", icon: User2, note: "one messy situation + a short causal question chain" },
  { label: "Journey state", icon: Layers, note: "inferred values, constraints, fears — soft signals, never verdicts" },
  { label: "Route archetypes", icon: GitBranch, note: "10 distinct strategies scored against your signal" },
  { label: "Curated evidence cards", icon: Database, note: "public sources + frameworks, gated to the decision" },
  { label: "Evidence-fit score", icon: Sparkles, note: "a transparent match score — not a probability" },
  { label: "Route review", icon: BookOpen, note: "assumptions, tradeoffs, and a low-cost first test" },
];

const SCORE_COMPONENTS: { label: string; effect: "adds" | "subtracts"; note: string }[] = [
  { label: "User signal match", effect: "adds", note: "how much of your stated direction the route reflects" },
  { label: "Constraint fit", effect: "adds", note: "how well it fits the constraints you named (higher when reversible)" },
  { label: "Route archetype fit", effect: "adds", note: "how strongly the strategy matches your dominant values" },
  { label: "Curated evidence support", effect: "adds", note: "how many curated reference cards apply to the route" },
  { label: "Uncertainty penalty", effect: "subtracts", note: "lowers the score when the route is inherently uncertain" },
  { label: "Inference penalty", effect: "subtracts", note: "lowers it for every assumption the system had to infer" },
];

const LIMITATIONS = [
  "Not a prediction of what will happen to you.",
  "Not a success probability or any kind of odds.",
  "Not a personal outcome forecast — sources are occupation-, cohort-, population-, or framework-level only.",
  "No private data required; the app never identifies real people.",
  "Mock-first in production — the full experience runs locally with no API key.",
];

const PROVENANCE_NOTES: Record<string, { icon: typeof User2; note: string }> = {
  user_answer: { icon: User2, note: "Something you actually told us in the journey — your values, constraints, or fears." },
  curated_reference: { icon: BookOpen, note: "A public source or decision framework, used at its true coverage level — never as a per-person forecast." },
  ai_inferred: { icon: Brain, note: "A reasonable assumption the system inferred from your answers. Flagged as such, and never shown as a citation." },
};

export default function EvidencePage() {
  const dataSources = EVIDENCE_CARDS.filter(isCareerDataCard);
  const decisionFrameworks = EVIDENCE_CARDS.filter((c) => c.sourceType === "decision_framework");
  const startupFrameworks = EVIDENCE_CARDS.filter((c) => c.sourceType === "startup_framework");

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      {/* Header */}
      <Section className="pt-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-5">
          <SectionTitle
            eyebrow="Evidence Base · how grounding works"
            title="Evidence grounds the tradeoffs — it does not predict your future"
            subtitle="Forked Futures does not use evidence to forecast a personal outcome. It uses a small, curated base of public sources and decision frameworks to ground each route's assumptions and make its tradeoffs clearer. Every piece of evidence is labeled by where it came from, and occupation-level data is only attached when the decision is actually occupation-shaped."
          />
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand"><Database className="h-3 w-3" /> {EVIDENCE_CARDS.length} curated cards</Badge>
            <Badge tone="research">Provenance-labeled</Badge>
            <Badge tone="quant">Match score, not a probability</Badge>
            <Badge tone="neutral">Mock-first · keyless</Badge>
          </div>
        </motion.div>
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner variant="compact" />
      </Section>

      {/* 1) Pipeline */}
      <Section className="pt-14">
        <SectionTitle
          eyebrow="1 · Evidence pipeline"
          title="From your answers to a grounded route review"
          subtitle="A directed flow. Your own answers drive it; evidence enters to ground the route assumptions, never to score you."
        />
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {PIPELINE.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-stretch gap-3">
              <Card className="flex-1">
                <CardBody className="space-y-1.5 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand/30 bg-brand/10">
                      <step.icon className="h-3.5 w-3.5 text-brand-glow" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-glow/70">Step {i + 1}</span>
                  </div>
                  <div className="text-sm font-medium text-white">{step.label}</div>
                  <p className="text-[11.5px] leading-snug text-mute">{step.note}</p>
                </CardBody>
              </Card>
              {i < PIPELINE.length - 1 && (
                <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-mute/50 lg:block" />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 2) Provenance labels */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="2 · Provenance labels"
          title="Every piece of evidence is labeled by where it came from"
          subtitle="So you can weigh it accordingly. An inferred assumption is never dressed up as a sourced citation."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {(Object.keys(PROVENANCE_LABELS) as (keyof typeof PROVENANCE_LABELS)[]).map((key) => {
            const meta = PROVENANCE_NOTES[key];
            return (
              <Card key={key}>
                <CardBody className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    <meta.icon className="h-4 w-4 text-brand-glow" /> {PROVENANCE_LABELS[key]}
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-soft/85">{meta.note}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* 3) Source cards */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="3 · Source cards"
          title="The curated evidence base"
          subtitle="Each card states what its source can and cannot support, at its true coverage level. No invented statistics; nothing here is an individual prediction."
        />
        <div className="mt-8 space-y-8">
          <SourceGroup
            title="Public data sources"
            sub="Occupation, education, labor-market and outcome data — attached only when the decision is occupation-shaped."
            cards={dataSources}
            badge="career-shaped only"
          />
          <SourceGroup
            title="Decision frameworks"
            sub="Framework-level reasoning lenses that apply to any decision."
            cards={decisionFrameworks}
          />
          <SourceGroup
            title="Startup / customer-discovery frameworks"
            sub="For routes that involve building or validating something new."
            cards={startupFrameworks}
          />
        </div>
      </Section>

      {/* 4) Evidence-fit score explanation */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="4 · Evidence-fit score"
          title="A match / support score — not a probability"
          subtitle="The evidence-fit score expresses how strongly a route matches your answers and the reference support behind it. It is not a probability of success and not a forecast. It is computed transparently in code from six components:"
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCORE_COMPONENTS.map((comp) => (
            <Card key={comp.label}>
              <CardBody className="space-y-1.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">{comp.label}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                      comp.effect === "adds" ? "bg-brand/10 text-brand-glow" : "bg-high/10 text-high",
                    )}
                  >
                    {comp.effect === "adds" ? "+ raises" : "− lowers"}
                  </span>
                </div>
                <p className="text-[11.5px] leading-snug text-mute">{comp.note}</p>
              </CardBody>
            </Card>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-mute">
          The result is clamped to a sane band and shown with a qualitative label (Strong / Moderate / Loose), so the
          number never reads as certainty. It is a way to compare routes — not a claim about your outcome.
        </p>
      </Section>

      {/* 5) Responsible-AI limitations + optional provider honesty */}
      <Section className="pt-16">
        <SectionTitle
          eyebrow="5 · Responsible-AI limitations"
          title="What this evidence layer is — and is not"
          subtitle="Stated plainly, because honesty about limits is the point."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card glow>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-glow" />
                <CardTitle>What it will not do</CardTitle>
              </div>
              <ul className="space-y-2.5">
                {LIMITATIONS.map((l) => (
                  <li key={l} className="flex gap-2.5 text-sm leading-relaxed text-soft/90">
                    <span className="mt-0.5 select-none text-brand-glow/70">•</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-brand-glow" />
                <CardTitle>Optional providers, honestly stated</CardTitle>
              </div>
              <ul className="space-y-2.5 text-sm leading-relaxed text-soft/85">
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    The production demo defaults to this <span className="text-white">curated local evidence</span> — it
                    does not depend on live web search.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    An <span className="text-white">optional live research / search provider</span> can be connected when
                    keys are present; the dispatcher upgrades transparently and is provider-ready.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 text-brand-glow/70">•</span>
                  <span>
                    If no provider is configured, the fallback stays <span className="text-white">deterministic</span> —
                    the same curated cards and local mock, so the demo never breaks.
                  </span>
                </li>
              </ul>
              <p className="text-[11.5px] leading-relaxed text-mute">
                No required environment variables. Nothing here sends your answers to a third party in the keyless demo.
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Footer links */}
      <Section className="pt-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">See the evidence layer in action.</div>
            <div className="text-sm text-mute">Walk the decision tree, then open any route's full review to see its cards.</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/architecture" className="text-sm text-mute transition-colors hover:text-white">
              ← How it works
            </Link>
            <LinkButton href="/journey" size="md">
              Start the journey <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Section>
    </main>
  );
}

function SourceGroup({
  title,
  sub,
  cards,
  badge,
}: {
  title: string;
  sub: string;
  cards: EvidenceCard[];
  badge?: string;
}) {
  if (!cards.length) return null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        {badge && (
          <span className="rounded-full border border-startup/30 bg-startup/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-startup/90">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[12px] text-mute">{sub}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <SourceCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function SourceCard({ card }: { card: EvidenceCard }) {
  return (
    <Card hover>
      <CardBody className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{card.sourceName}</div>
            <div className="text-[11px] text-mute">{card.publisher}</div>
          </div>
          {card.url ? (
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-mute transition-colors hover:text-brand-glow"
              aria-label={`Open ${card.sourceName}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill className="text-[10px]">{SOURCE_TYPE_LABELS[card.sourceType]}</Pill>
          <Pill className="text-[10px]">{card.coverageLevel}-level</Pill>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-glow/70">Can support</div>
          <ul className="mt-1 space-y-1">
            {card.whatItCanSupport.slice(0, 3).map((s) => (
              <li key={s} className="flex gap-1.5 text-[11.5px] leading-snug text-soft/85">
                <span className="shrink-0 text-brand-glow/70">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-startup/70">Cannot support</div>
          <ul className="mt-1 space-y-1">
            {card.whatItCannotSupport.slice(0, 2).map((s) => (
              <li key={s} className="flex gap-1.5 text-[11.5px] leading-snug text-mute">
                <span className="shrink-0 text-startup/60">–</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line/50 bg-void/20 px-2.5 py-1.5 text-[11px] leading-snug text-mute">
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-mute/80">
            <FlaskConical className="h-3 w-3" /> Limitation
          </span>{" "}
          {card.limitations[0]}
        </div>
      </CardBody>
    </Card>
  );
}
