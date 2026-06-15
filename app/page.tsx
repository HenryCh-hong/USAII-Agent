"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  FlaskConical,
  GitBranch,
  Layers,
  Play,
  ScanSearch,
  Scale,
  Sparkles,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { Logo } from "@/components/shared/Logo";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Section";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BranchMap } from "@/components/map/BranchMap";
import { useForkedStore } from "@/lib/store";
import {
  DEMO_BRANCHES,
  DEMO_CONTEXT,
  DEMO_QUESTIONS,
  DEMO_SIMULATION,
} from "@/lib/mock";

const WHY_AI = [
  {
    icon: Scale,
    accent: "text-quant",
    border: "group-hover:border-quant/40",
    title: "Models tradeoffs, not lookups",
    body:
      "A rules engine matches rows in a table. Real decisions are tangled tradeoffs that may shift as your context changes — that comparison has to be reasoned through, not looked up.",
  },
  {
    icon: Brain,
    accent: "text-brand-glow",
    border: "group-hover:border-brand/40",
    title: "Reasons over YOUR messy context",
    body:
      "Your skills, values, fears, and constraints don't fit a fixed schema. A model can weigh that unstructured context together, where a hard-coded flow could only ignore it.",
  },
  {
    icon: ScanSearch,
    accent: "text-research",
    border: "group-hover:border-research/40",
    title: "Surfaces hidden assumptions",
    body:
      "Each path rests on beliefs you may not have noticed. The system tends to name those assumptions, tag where each claim came from, and show uncertainty instead of hiding it.",
  },
  {
    icon: FlaskConical,
    accent: "text-startup",
    border: "group-hover:border-startup/40",
    title: "Turns uncertainty into a test",
    body:
      "Where the evidence is thin, it could propose a small, reversible experiment — so you replace one assumption with real signal before you commit to anything.",
  },
];

const PIPELINE = [
  {
    icon: Layers,
    label: "Input",
    title: "Your context",
    body: "Decision, options, skills, values, constraints, and fears — in your own words.",
  },
  {
    icon: Brain,
    label: "Reasoning",
    title: "Evidence + assumptions",
    body: "Curated evidence and base-rate signals are weighed, with every assumption made explicit.",
  },
  {
    icon: GitBranch,
    label: "Output",
    title: "Three futures",
    body: "Plausible branches with tradeoffs, uncertainty, and provenance shown side by side.",
  },
  {
    icon: FlaskConical,
    label: "Action",
    title: "A first experiment",
    body: "A small, reversible 7-day test that turns the biggest unknown into real signal.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const hydrateDemo = useForkedStore((s) => s.hydrateDemo);

  function openDemo() {
    hydrateDemo(DEMO_CONTEXT, DEMO_QUESTIONS, DEMO_SIMULATION);
    router.push("/map");
  }

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      {/* HERO */}
      <Section className="pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            <Eyebrow>AI Future Simulator for real life</Eyebrow>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Rehearse your future{" "}
              <span className="bg-gradient-to-r from-brand-glow via-quant to-research bg-clip-text text-transparent">
                before you commit
              </span>{" "}
              to it.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-soft/90 sm:text-lg">
              For students and early-career decisions — like quant recruiting vs.
              a startup vs. grad school — Forked Futures turns overwhelming choices
              into simulated paths, visible tradeoffs, and first-step experiments.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton href="/intake" size="lg">
                Start a Future Simulation <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <Button variant="outline" size="lg" onClick={openDemo}>
                <Play className="h-4 w-4" /> See the Alex demo
              </Button>
            </div>

            <p className="text-xs leading-relaxed text-mute">
              These are plausible scenarios, not predictions. The system can help
              you understand a decision — it never makes it for you.
            </p>
          </motion.div>

          {/* Decorative branch motif — reuses the production BranchMap as a preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl border border-line/60 bg-panel/40 p-5 backdrop-blur-xl sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <Badge tone="brand">
                  <Sparkles className="h-3 w-3" />
                  Live preview
                </Badge>
                <span className="text-[11px] text-mute">Alex · quant vs. startup vs. research</span>
              </div>
              <BranchMap branches={DEMO_BRANCHES} />
            </div>
          </motion.div>
        </div>
      </Section>

      {/* WHY THIS NEEDS AI */}
      <Section className="pt-24">
        <div className="space-y-3">
          <Eyebrow>Why this needs AI, not a rules engine</Eyebrow>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            A lookup table can&apos;t reason about a life decision.
          </h2>
          <p className="max-w-2xl leading-relaxed text-soft/80">
            The hard part isn&apos;t fetching a fact — it&apos;s weighing your
            specific tradeoffs under uncertainty. That is reasoning, and it tends
            to need a model.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_AI.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Card hover className={`group h-full ${item.border}`}>
                  <CardBody className="space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line/60 bg-white/[0.03]">
                      <Icon className={`h-5 w-5 ${item.accent}`} />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <p className="text-sm leading-relaxed text-soft/80">{item.body}</p>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* PIPELINE TEASER */}
      <Section className="pt-24">
        <div className="rounded-3xl border border-line/60 bg-panel/40 p-6 backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <Eyebrow>How a simulation is built</Eyebrow>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Input → reasoning → output → action
              </h2>
            </div>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-white"
            >
              See the full architecture <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {PIPELINE.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative">
                  <div className="flex h-full flex-col gap-3 rounded-2xl border border-line/60 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-glow/80">
                        {step.label}
                      </span>
                      <span className="text-[11px] text-mute/70">0{i + 1}</span>
                    </div>
                    <Icon className="h-5 w-5 text-soft" />
                    <div className="text-sm font-medium text-white">{step.title}</div>
                    <p className="text-xs leading-relaxed text-mute">{step.body}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-line md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* RESPONSIBLE AI */}
      <Section className="pt-20">
        <div className="space-y-4 rounded-2xl border border-brand/25 bg-brand/[0.05] p-6 sm:p-8">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              It does not predict your future. It does not choose for you.
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-soft/80">
              Forked Futures opens the futures you&apos;re choosing between so you
              can see them clearly — the decision, and what you weigh against what,
              stays entirely with you.
            </p>
          </div>
          <ResponsibleAIBanner />
        </div>
      </Section>

      {/* CLOSING CTA */}
      <Section className="pt-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-line/60 bg-panel/50 p-7 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-1.5">
            <div className="text-lg font-medium text-white">
              Ready to see what you&apos;re really deciding?
            </div>
            <div className="max-w-xl text-sm text-mute">
              Walk one decision through intake, clarifying questions, three
              futures, and a first experiment — in a few minutes.
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="ghost" size="md" onClick={openDemo}>
              Watch the demo
            </Button>
            <LinkButton href="/intake" size="md">
              Start your simulation <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <Section className="pt-16">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-line/50 pt-8 sm:flex-row">
          <Logo />
          <p className="text-xs text-mute">
            USAII Global AI Hackathon 2026 · Challenge Brief 3
          </p>
        </div>
      </Section>
    </main>
  );
}
