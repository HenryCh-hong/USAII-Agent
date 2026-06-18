"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  EyeOff,
  Ban,
  RotateCcw,
  Compass,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { BulletList } from "@/components/ui/Primitives";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { CalibrationBadges } from "@/components/shared/LevelBadge";
import { Trajectory } from "@/components/branch/Trajectory";
import { AssumptionLedger } from "@/components/branch/AssumptionLedger";
import { AssumptionStressTest } from "@/components/branch/AssumptionStressTest";
import { EvidenceCards } from "@/components/branch/EvidenceCards";
import { Premortem } from "@/components/branch/Premortem";
import { RegretRadar } from "@/components/branch/RegretRadar";
import { ExperimentPlan } from "@/components/branch/ExperimentPlan";
import { CalibrationPanel } from "@/components/branch/CalibrationPanel";
import { MockTemplateNotice } from "@/components/shared/MockTemplateNotice";
import { JumpNav } from "@/components/shared/JumpNav";
import { FutureRunTimeline } from "@/components/shared/FutureRunTimeline";
import { BranchBottleneckCard } from "@/components/shared/DecisionDna";
import { buildDecisionDna } from "@/lib/decision/decisionDna";
import { AgentReview } from "@/components/branch/AgentReview";
import { EvidenceGraph } from "@/components/branch/EvidenceGraph";
import { ReasoningAuditTrail } from "@/components/branch/ReasoningAuditTrail";
import { EvaluationSignals } from "@/components/branch/EvaluationSignals";
import { RejectedOverclaims } from "@/components/branch/RejectedOverclaims";
import { useForkedStore } from "@/lib/store";
import { useEnsureSimulation, useHydrated } from "@/lib/hooks";
import { accentClasses, accentForBranch, cn } from "@/lib/utils";

export default function BranchPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const hydrated = useHydrated();
  useEnsureSimulation();
  const simulation = useForkedStore((s) => s.simulation);
  const branch = useForkedStore((s) => s.getBranch(id));

  if (!hydrated || !simulation) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24 text-center text-mute">Opening this future…</Section>
      </main>
    );
  }

  if (!branch) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24">
          <Card className="mx-auto max-w-lg text-center">
            <CardBody className="space-y-4">
              <Compass className="mx-auto h-8 w-8 text-mute" />
              <h2 className="text-xl font-semibold text-white">
                That branch isn&apos;t open
              </h2>
              <p className="text-sm leading-relaxed text-soft/85">
                We couldn&apos;t find a future with that id in your current
                simulation. It may have been from a different session.
              </p>
              <div className="flex justify-center pt-1">
                <LinkButton href="/map" size="md">
                  <ArrowLeft className="h-4 w-4" /> Back to the Future Map
                </LinkButton>
              </div>
            </CardBody>
          </Card>
        </Section>
      </main>
    );
  }

  const index = simulation.branches.findIndex((b) => b.id === branch.id);
  const accentKey = accentForBranch(branch.id, index);
  const accent = accentClasses(accentKey);
  const bottleneck = buildDecisionDna(simulation.context, simulation.branches).branchBottlenecks.find(
    (x) => x.branchId === branch.id,
  );

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      {/* Colored hero header */}
      <Section className="pt-8">
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the Future Map
        </Link>
      </Section>

      <Section className="pt-5">
        <FutureRunTimeline current="Pressure-test assumptions" />
      </Section>

      <Section className="pt-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card glow className={cn("overflow-hidden", accent.glow)}>
            <div className={cn("h-1 w-full bg-gradient-to-r", accent.from, "to-transparent")} />
            <CardBody className="space-y-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone={accentKey}>{branch.track}</Badge>
                <span className="text-[11px] uppercase tracking-wider text-mute">
                  Reversibility ·{" "}
                  <span className="capitalize text-soft">{branch.reversibility}</span>
                </span>
              </div>

              <div className="space-y-3">
                <h1 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", accent.text)}>
                  {branch.title}
                </h1>
                <p className="max-w-3xl text-base leading-relaxed text-soft/90">
                  {branch.thesis}
                </p>
              </div>

              <CalibrationBadges calibration={branch.calibration} />

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <LinkButton href={`/chat/${branch.id}`} size="md">
                  <MessageCircle className="h-4 w-4" /> Talk to this Future Self
                </LinkButton>
                <Link
                  href="/map"
                  className="text-sm text-mute transition-colors hover:text-white"
                >
                  Compare with the other futures
                </Link>
              </div>

              <p className="text-xs leading-relaxed text-mute/80">
                This is a plausible scenario built from your context and explicit
                assumptions — not a prediction or a recommendation.
              </p>
            </CardBody>
          </Card>
        </motion.div>
      </Section>

      <Section className="pt-6">
        <MockTemplateNotice simulation={simulation} />
      </Section>

      {bottleneck && (
        <Section className="pt-6" id="bottleneck">
          <BranchBottleneckCard b={bottleneck} />
        </Section>
      )}

      <Section className="pt-6">
        <JumpNav
          items={[
            { id: "bottleneck", label: "Bottleneck" },
            { id: "agent-review", label: "Agent review" },
            { id: "trajectory", label: "Trajectory" },
            { id: "evidence", label: "Evidence" },
            { id: "calibration", label: "Calibration" },
            { id: "audit", label: "Audit trail" },
            { id: "experiment", label: "7-day test" },
          ]}
        />
      </Section>

      <ChapterDivider n={1} label="Route mechanics" />

      {/* Agent Review — the multi-agent debate behind this branch */}
      {branch.agentReview && (
        <Section className="pt-8" id="agent-review">
          <SectionTitle
            eyebrow="Agent review"
            title="How the system reasoned about this branch"
            subtitle="Forked Futures runs a multi-agent debate, not a single answer. Here is a judge-safe summary of what each agent contributed — never raw chain-of-thought."
          />
          <div className="mt-6">
            <AgentReview review={branch.agentReview} />
          </div>
        </Section>
      )}

      {/* Trajectory */}
      <Section className="pt-14" id="trajectory">
        <SectionTitle
          eyebrow="12-month trajectory"
          title="How this path could unfold"
          subtitle="A plausible month-by-month arc. Each step carries its own uncertainty, surfaced rather than smoothed over."
        />
        <div className="mt-6">
          <Trajectory items={branch.twelveMonthTrajectory} accentKey={accentKey} />
        </div>
      </Section>

      {/* Hidden tradeoffs + opportunity costs */}
      <Section className="pt-14">
        <SectionTitle
          eyebrow="The fine print"
          title="What this path could quietly cost"
          subtitle="The tradeoffs and foregone options that are easy to miss when a path looks attractive on the surface."
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <EyeOff className="h-4 w-4 text-startup" />
                Hidden tradeoffs
              </div>
              <BulletList items={branch.hiddenTradeoffs} />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Ban className="h-4 w-4 text-research" />
                Opportunity costs
              </div>
              <BulletList items={branch.opportunityCosts} />
            </CardBody>
          </Card>
        </div>
      </Section>

      <ChapterDivider n={2} label="Evidence trail" />

      {/* Assumption ledger — responsible-AI centerpiece */}
      <Section className="pt-8">
        <SectionTitle
          eyebrow="Assumption ledger"
          title="Every claim, tagged by where it came from"
          subtitle="The honest core of this branch: what we assume, how confident we are, and exactly how you could test each one."
        />
        <div className="mt-6">
          <AssumptionLedger assumptions={branch.assumptions} />
        </div>
      </Section>

      {/* Assumption stress test — qualitative sensitivity + firming tests */}
      <Section className="pt-14">
        <SectionTitle
          eyebrow="Assumption stress test"
          title="What if an assumption fails?"
          subtitle="Each assumption stressed qualitatively — how much the branch leans on it, and the cheapest way to firm it up before committing. Sensitivity reflects provenance and confidence, not a probability."
        />
        <div className="mt-6">
          <AssumptionStressTest assumptions={branch.assumptions} />
        </div>
      </Section>

      {/* Evidence console + base rates */}
      <Section className="pt-14" id="evidence">
        <SectionTitle
          eyebrow="Evidence console"
          title="What this scenario is built on"
          subtitle="The curated and official-source evidence behind the branch, with provenance, plus the aggregate base-rate patterns that frame it — kept at their true coverage level."
        />
        <div className="mt-6">
          <EvidenceCards
            cards={branch.evidenceCards}
            baseRateSignals={branch.baseRateSignals}
          />
        </div>
      </Section>

      {/* Evidence graph snapshot */}
      {branch.evidenceGraphSnapshot && branch.evidenceGraphSnapshot.nodes.length > 0 && (
        <Section className="pt-14">
          <SectionTitle
            eyebrow="Evidence graph"
            title="How the evidence connects"
            subtitle="A local node-and-edge view of why this branch exists: how sources, skills, constraints, risks and frameworks link to the path and the experiment that can test it."
          />
          <div className="mt-6">
            <EvidenceGraph snapshot={branch.evidenceGraphSnapshot} />
          </div>
        </Section>
      )}

      <ChapterDivider n={3} label="Decision pressure" />

      {/* Premortem */}
      <Section className="pt-8">
        <SectionTitle
          eyebrow="Premortem"
          title="If this path failed, why might that be?"
          subtitle="Reasoning backward from an imagined failure — and the kill criteria worth deciding on in advance."
        />
        <div className="mt-6">
          <Premortem premortem={branch.premortem} killCriteria={branch.killCriteria} />
        </div>
      </Section>

      {/* Regret radar */}
      <Section className="pt-14">
        <SectionTitle
          eyebrow="Regret radar"
          title="The regrets this path could surface"
          subtitle="Different paths risk different kinds of regret. These are surfaced for you to weigh — not scored for you."
        />
        <div className="mt-6">
          <RegretRadar items={branch.regretRadar} />
        </div>
      </Section>

      {/* Calibration cockpit */}
      <Section className="pt-14" id="calibration">
        <SectionTitle
          eyebrow="Calibration cockpit"
          title="How confident is this scenario?"
          subtitle="A qualitative readout — honest levels rather than false precision, with no individual-level prediction."
        />
        <div className="mt-6">
          <CalibrationPanel calibration={branch.calibration} />
        </div>
        {branch.calibration.calibrationRationale && (
          <p className="mt-4 rounded-xl border border-line/60 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-soft/85">
            <span className="mono-label">Why these levels · </span>
            {branch.calibration.calibrationRationale}
          </p>
        )}
      </Section>

      {/* Evaluation signals */}
      {branch.evaluationSignals && branch.evaluationSignals.length > 0 && (
        <Section className="pt-14">
          <SectionTitle
            eyebrow="Evaluation"
            title="The system's own self-checks"
            subtitle="Qualitative signals on how grounded, hedged, and provenance-backed this branch is — shown, not hidden."
          />
          <div className="mt-6">
            <EvaluationSignals signals={branch.evaluationSignals} />
          </div>
        </Section>
      )}

      {/* Reasoning audit trail */}
      {branch.reasoningAuditTrail && (
        <Section className="pt-14" id="audit">
          <SectionTitle
            eyebrow="Reasoning audit trail"
            title="The reasoning, made auditable"
            subtitle="A structured, judge-safe trail shown in place of raw chain-of-thought — what this rests on, what's uncertain, and what would change the call."
          />
          <div className="mt-6">
            <ReasoningAuditTrail trail={branch.reasoningAuditTrail} />
          </div>
        </Section>
      )}

      {/* Rejected overclaims */}
      {branch.rejectedOverclaims && branch.rejectedOverclaims.length > 0 && (
        <Section className="pt-14">
          <SectionTitle
            eyebrow="Safety layer"
            title="What the system refused to overclaim"
            subtitle="The deterministic and over-confident language the Safety agent rewrote before this branch reached you."
          />
          <div className="mt-6">
            <RejectedOverclaims items={branch.rejectedOverclaims} />
          </div>
        </Section>
      )}

      <ChapterDivider n={4} label="Next quest" />

      {/* Experiment plan — the closing next quest */}
      <Section className="pt-6" id="experiment">
        <SectionTitle
          eyebrow="7-day experiment"
          title="Replace an assumption with real signal"
          subtitle="A low-cost week of action to gather evidence before any commitment — with the context that makes it worth running."
        />
        <div className="mt-6">
          <ExperimentPlan
            steps={branch.sevenDayExperiment}
            skillCompounding={branch.skillCompounding}
            emotionalLoad={branch.emotionalLoad}
            bottlenecks={branch.bottlenecks}
            accentKey={accentKey}
          />
        </div>
      </Section>

      {/* Responsible AI + nav */}
      <Section className="pt-14">
        <ResponsibleAIBanner />
      </Section>

      <Section className="pt-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              The decision still stays with you.
            </div>
            <div className="text-sm text-mute">
              Pressure-test this future in conversation, compare the alternatives,
              or fold it into the Decision Brief.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Future Map
            </Link>
            <LinkButton href={`/chat/${branch.id}`} variant="subtle" size="md">
              <MessageCircle className="h-4 w-4" /> Talk to this Future Self
            </LinkButton>
            <LinkButton href="/brief" size="md">
              View Decision Brief <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Section>
    </main>
  );
}

/** Lightweight chapter break — chunks the long path page into readable acts so it
 * reads as a "path chapter," not a flat stack of analysis cards. Presentational. */
function ChapterDivider({ n, label }: { n: number; label: string }) {
  return (
    <Section className="pt-16">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-glow/70">
          Chapter {n}
        </span>
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-line/80 to-transparent" />
      </div>
    </Section>
  );
}
