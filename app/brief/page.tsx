"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  Flag,
  Radar,
  HelpCircle,
  FlaskConical,
  Ban,
  ShieldCheck,
  HeartHandshake,
  Cpu,
  Database,
  RefreshCw,
} from "lucide-react";
import { TopNav, ProgressSteps } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { DecisionDelta } from "@/components/shared/DecisionDelta";
import { TrajectoryAtlas } from "@/components/shared/TrajectoryAtlas";
import { ClaimLedger } from "@/components/research/ClaimLedger";
import { buildClaimLedger } from "@/lib/research/claimLedger";
import { DecisionDnaPanel, BranchBottlenecks } from "@/components/shared/DecisionDna";
import { buildDecisionDna } from "@/lib/decision/decisionDna";
import { FutureRunTimeline } from "@/components/shared/FutureRunTimeline";
import { FutureRunSummary } from "@/components/shared/FutureRunSummary";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BulletList, Divider } from "@/components/ui/Primitives";
import { useForkedStore } from "@/lib/store";
import { useEnsureSimulation, useHydrated } from "@/lib/hooks";
import { DEMO_BRIEF } from "@/lib/mock";
import type { DecisionBrief } from "@/lib/types";
import { accentClasses, accentForBranch, cn } from "@/lib/utils";

export default function BriefPage() {
  const hydrated = useHydrated();
  useEnsureSimulation();

  const context = useForkedStore((s) => s.context);
  const simulation = useForkedStore((s) => s.simulation);
  const brief = useForkedStore((s) => s.brief);
  const setBrief = useForkedStore((s) => s.setBrief);

  const [loading, setLoading] = useState(false);
  const [mocked, setMocked] = useState<boolean | null>(null);

  // On mount: if no brief is in the store, ask the API to synthesize one.
  // The route never hard-fails, but we still fall back to DEMO_BRIEF on any error.
  useEffect(() => {
    if (!hydrated) return;
    if (brief) return;
    if (!simulation) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/decision-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: context ?? simulation.context,
            branches: simulation.branches,
          }),
        });
        const data: { brief: DecisionBrief; mocked?: boolean } = await res.json();
        if (cancelled) return;
        if (data?.brief) {
          setBrief(data.brief);
          setMocked(Boolean(data.mocked));
        } else {
          setBrief(DEMO_BRIEF);
          setMocked(true);
        }
      } catch {
        if (cancelled) return;
        // Offline / unexpected failure — keep the surface usable with the demo brief.
        setBrief(DEMO_BRIEF);
        setMocked(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, simulation]);

  if (!hydrated || !simulation) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24 text-center text-mute">
          Assembling your decision brief…
        </Section>
      </main>
    );
  }

  const branches = simulation.branches;
  const dna = buildDecisionDna(simulation.context, branches);
  const active = brief ?? DEMO_BRIEF;
  const isLoadingBrief = loading && !brief;

  // Above-the-fold payoff, built from already-hydrated simulation data (DNA +
  // branch tests) so it renders immediately and never flashes empty while the
  // async brief synthesis loads.
  const nextQuest =
    dna.branchBottlenecks[0]?.sevenDayTest ??
    active.recommendedExperiments?.[0] ??
    "Run the cheapest decisive 7-day test on the path you're most drawn to.";

  // Sections 6 & 10 are derived from branch data (no change to the brief contract):
  // what would move the assessment, and the honest evidence-coverage note.
  const whatWouldChange = branches.flatMap((b) =>
    (b.reasoningAuditTrail?.whatWouldChangeThisAssessment ?? [])
      .slice(0, 2)
      .map((x) => `${b.track}: ${x}`),
  );
  const coverageNotes = branches.map((b) => ({
    track: b.track,
    note: b.calibration.dataCoverageNote,
  }));

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-8">
        <ProgressSteps current="brief" />
      </Section>

      <Section className="pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Future Run Complete · decision brief"
            title="What you're really deciding"
            subtitle={simulation.context.decision}
          />
          <Badge tone={mocked === false ? "brand" : "neutral"}>
            <Sparkles className="h-3 w-3" />
            {mocked === false ? "Live synthesis" : "Demo synthesis"}
          </Badge>
        </div>
      </Section>

      {/* Future Run Complete — above-the-fold payoff (sync data, never flashes empty). */}
      <Section className="pt-6">
        <Card className="overflow-hidden border-brand/25 bg-brand/[0.05]">
          <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-[1.3fr_1fr]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-glow/80">
                <Flag className="h-3.5 w-3.5" /> Future Run Complete
              </div>
              <p className="text-base leading-relaxed text-white sm:text-lg">{dna.diagnosis}</p>
              <p className="text-xs leading-relaxed text-mute">
                A hypothesis to test — not a verdict. The final call stays yours.
              </p>
            </div>
            <div className="space-y-1.5 rounded-xl border border-line/60 bg-white/[0.02] p-4">
              <div className="mono-label flex items-center gap-1.5">
                <FlaskConical className="h-3 w-3" /> Your next quest
              </div>
              <p className="text-sm leading-relaxed text-soft/90">{nextQuest}</p>
            </div>
          </div>
        </Card>
      </Section>

      <Section className="pt-6">
        <FutureRunTimeline current="Choose the next quest" />
      </Section>

      {/* Decision frame — the prominent lead statement. */}
      <Section className="pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            glow
            className="overflow-hidden border-brand/30 bg-gradient-to-br from-brand/[0.08] via-panel/60 to-panel/60"
          >
            <div className="h-1 w-full bg-gradient-to-r from-brand/60 to-transparent" />
            <div className="space-y-4 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-glow/80">
                <Compass className="h-3.5 w-3.5" />
                The decision underneath the decision
              </div>
              {isLoadingBrief ? (
                <LoadingLines lines={3} />
              ) : (
                <p className="max-w-3xl text-lg leading-relaxed text-white sm:text-xl">
                  {active.decisionFrame}
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </Section>

      {/* Decision DNA — sharp diagnosis, near the top. */}
      <Section className="pt-10">
        <SectionTitle
          eyebrow="Decision DNA"
          title="What this decision is really about"
          subtitle="A sharp, testable diagnosis of the tension underneath your options — a hypothesis to test, not a verdict."
        />
        <div className="mt-6 space-y-4">
          <DecisionDnaPanel dna={dna} />
          <BranchBottlenecks items={dna.branchBottlenecks} />
        </div>
      </Section>

      {/* Decision Delta — before/after impact (derived from real branch data). */}
      <Section className="pt-10">
        <SectionTitle
          eyebrow="Decision Delta"
          title="From uncertainty to action"
          subtitle="What changed by running this decision through Forked Futures — real counts, not outcome claims."
        />
        <div className="mt-6">
          <DecisionDelta context={simulation.context} branches={branches} />
        </div>
      </Section>

      {/* Trajectory Atlas — reference futures (analogies, not predictions). */}
      <Section className="pt-10">
        <SectionTitle
          eyebrow="Trajectory Atlas"
          title="Reference futures your decision rhymes with"
          subtitle="Curated role trajectories that rhyme with your anchors — analogies, never predictions or real people."
        />
        <div className="mt-6">
          <TrajectoryAtlas context={simulation.context} />
        </div>
      </Section>

      {/* Claim Ledger — traceable claims (compact). */}
      <Section className="pt-10">
        <SectionTitle
          eyebrow="Claim Ledger"
          title="Every claim, traceable"
          subtitle="Each key claim mapped to its support, reliability, and limits — source-supported vs AI-inferred."
        />
        <div className="mt-6">
          <ClaimLedger claims={buildClaimLedger(simulation.context, branches)} compact />
        </div>
      </Section>

      {/* Branches at a glance. */}
      <Section className="pt-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] uppercase tracking-wider text-mute">
            The futures in play
          </span>
          {branches.map((b, i) => {
            const accent = accentClasses(accentForBranch(b.id, i));
            return (
              <Link
                key={b.id}
                href={`/branch/${b.id}`}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all hover:gap-2.5",
                  accent.border,
                  accent.bg,
                )}
              >
                <span className={cn("font-medium", accent.text)}>{b.track}</span>
                <span className="text-mute">·</span>
                <span className="capitalize text-soft">
                  {b.calibration.uncertaintyLevel} uncertainty
                </span>
                <ArrowRight className={cn("h-3 w-3", accent.text)} />
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Three analysis sections. */}
      <Section className="pt-10">
        <div className="grid gap-5 lg:grid-cols-3">
          <BriefColumn
            icon={Radar}
            tone="text-quant"
            ring="border-quant/40"
            eyebrow="What's holding"
            title="Strongest signals"
            blurb="The findings that, based on current assumptions, tend to hold up across the evidence."
            items={active.strongestSignals}
            loading={isLoadingBrief}
            delay={0}
          />
          <BriefColumn
            icon={HelpCircle}
            tone="text-medium"
            ring="border-medium/40"
            eyebrow="What's unknown"
            title="Biggest uncertainties"
            blurb="The open questions where the picture could still shift — shown rather than hidden."
            items={active.biggestUncertainties}
            loading={isLoadingBrief}
            delay={0.08}
          />
          <BriefColumn
            icon={FlaskConical}
            tone="text-research"
            ring="border-research/40"
            eyebrow="What to test"
            title="Recommended experiments"
            blurb="Cheap moves that could replace an assumption with evidence before you commit."
            items={active.recommendedExperiments}
            loading={isLoadingBrief}
            delay={0.16}
          />
        </div>
      </Section>

      {/* What the AI will NOT decide — the judged panel. */}
      <Section className="pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-low/30 bg-gradient-to-br from-low/[0.06] via-panel/70 to-panel/70">
            <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_1.4fr] md:gap-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-low/40 bg-low/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-low">
                  <Ban className="h-3.5 w-3.5" />
                  Off-limits to the model
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  What this AI will not decide for you
                </h3>
                <p className="text-sm leading-relaxed text-soft/85">
                  These are human-only calls. They turn on your values, your risk
                  tolerance, your family and identity, and your lived experience —
                  things no model can hold for you. The system maps the futures; the
                  choice stays yours.
                </p>
              </div>

              <ul className="space-y-3">
                {(isLoadingBrief ? Array(3).fill("") : active.whatAIWillNotDecide).map(
                  (item: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-line/60 bg-white/[0.03] p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-low/40 bg-low/10 text-low">
                        <Ban className="h-3.5 w-3.5" />
                      </span>
                      {isLoadingBrief ? (
                        <span className="h-4 w-full animate-pulse rounded bg-white/10" />
                      ) : (
                        <div className="min-w-0">
                          <span className="text-sm leading-relaxed text-white">
                            {item}
                          </span>
                          <span className="mt-1 block text-[11px] uppercase tracking-wider text-low/80">
                            Yours to weigh — not the model's
                          </span>
                        </div>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </Card>
        </motion.div>
      </Section>

      {/* What would change the assessment + evidence coverage note. */}
      <Section className="pt-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="space-y-4 p-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-glow/80">
                <RefreshCw className="h-3.5 w-3.5" />
                What would change this assessment
              </div>
              <p className="text-xs leading-relaxed text-mute">
                This brief is provisional and meant to update. These are the signals
                that would raise or lower confidence across the branches.
              </p>
              <Divider />
              <BulletList
                items={
                  whatWouldChange.length ? whatWouldChange : active.biggestUncertainties
                }
              />
            </div>
          </Card>
          <Card>
            <div className="space-y-4 p-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-glow/80">
                <Database className="h-3.5 w-3.5" />
                Evidence coverage note
              </div>
              <p className="text-xs leading-relaxed text-mute">
                What the evidence does and doesn&apos;t cover — kept at aggregate
                (program, occupation, cohort, population, framework) levels, never an
                individual prediction.
              </p>
              <Divider />
              <ul className="space-y-2.5">
                {coverageNotes.map((c) => (
                  <li key={c.track} className="text-sm leading-relaxed text-soft/85">
                    <span className="font-medium text-white">{c.track}:</span> {c.note}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </Section>

      {/* Closing commitment statements. */}
      <Section className="pt-8">
        <div className="grid gap-5 md:grid-cols-2">
          <CommitmentCard
            icon={HeartHandshake}
            tone="text-brand-glow"
            ring="border-brand/40"
            label="Human in the loop"
            text={active.humanInLoopStatement}
            loading={isLoadingBrief}
          />
          <CommitmentCard
            icon={ShieldCheck}
            tone="text-quant"
            ring="border-quant/40"
            label="Responsible AI"
            text={active.responsibleAIStatement}
            loading={isLoadingBrief}
          />
        </div>
      </Section>

      <Section className="pt-8">
        <ResponsibleAIBanner />
      </Section>

      {/* Future run summary. */}
      <Section className="pt-10">
        <FutureRunSummary branches={branches} />
      </Section>

      {/* CTA row. */}
      <Section className="pt-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              The brief frames the choice — it doesn&apos;t make it.
            </div>
            <div className="text-sm text-mute">
              Revisit a future in depth, or see how this reasoning was assembled.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Future Map
            </Link>
            <LinkButton href="/architecture" size="md">
              <Cpu className="h-4 w-4" /> See how this was built
            </LinkButton>
          </div>
        </div>
      </Section>
    </main>
  );
}

/* ------------------------------ subcomponents ----------------------------- */

function BriefColumn({
  icon: Icon,
  tone,
  ring,
  eyebrow,
  title,
  blurb,
  items,
  loading,
  delay,
}: {
  icon: typeof Radar;
  tone: string;
  ring: string;
  eyebrow: string;
  title: string;
  blurb: string;
  items: string[];
  loading: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <Card hover className="h-full">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border bg-white/[0.03]",
                ring,
                tone,
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                {eyebrow}
              </div>
              <h3 className="text-base font-semibold tracking-tight text-white">
                {title}
              </h3>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-mute">{blurb}</p>
          <Divider />
          {loading ? (
            <LoadingLines lines={4} />
          ) : (
            <BulletList items={items} />
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function CommitmentCard({
  icon: Icon,
  tone,
  ring,
  label,
  text,
  loading,
}: {
  icon: typeof ShieldCheck;
  tone: string;
  ring: string;
  label: string;
  text: string;
  loading: boolean;
}) {
  return (
    <Card glow className="h-full">
      <div className="space-y-3 p-6">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border bg-white/[0.03]",
              ring,
              tone,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-soft">
            {label}
          </span>
        </div>
        {loading ? (
          <LoadingLines lines={3} />
        ) : (
          <p className="text-sm leading-relaxed text-soft">{text}</p>
        )}
      </div>
    </Card>
  );
}

function LoadingLines({ lines }: { lines: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 animate-pulse rounded bg-white/8"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
