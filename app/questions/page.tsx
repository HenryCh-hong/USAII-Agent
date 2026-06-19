"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Wand2,
  Loader2,
  Database,
  GitBranch,
  Gauge,
} from "lucide-react";
import { TopNav, ProgressSteps } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill, Divider } from "@/components/ui/Primitives";
import { useForkedStore } from "@/lib/store";
import { useEnsureSimulation, useHydrated } from "@/lib/hooks";
import { DEMO_QUESTIONS, DEMO_SIMULATION } from "@/lib/mock";
import type { ClarifyingQuestion, SimulationResult } from "@/lib/types";

/** The reasoning stages we narrate while the simulation runs — a wow moment. */
const PIPELINE_STAGES = [
  {
    icon: Database,
    label: "Retrieving evidence",
    detail: "Pulling curated research, frameworks, and labor-market base rates relevant to your context.",
  },
  {
    icon: GitBranch,
    label: "Generating branches",
    detail: "Opening three plausible futures side by side — theses, tradeoffs, and 12-month trajectories.",
  },
  {
    icon: Gauge,
    label: "Calibrating uncertainty",
    detail: "Tagging each claim by provenance and grading evidence strength, fit, and constraint risk.",
  },
] as const;

export default function QuestionsPage() {
  const hydrated = useHydrated();
  useEnsureSimulation();

  const context = useForkedStore((s) => s.context);
  const questions = useForkedStore((s) => s.questions);
  const setQuestions = useForkedStore((s) => s.setQuestions);
  const answerQuestion = useForkedStore((s) => s.answerQuestion);
  const setSimulation = useForkedStore((s) => s.setSimulation);

  const router = useRouter();

  // Local draft answers, keyed by question id, so typing stays snappy.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);

  // Seed questions from the demo if the store is empty, so this page never
  // renders blank (strip pre-baked answers — the user fills those in).
  useEffect(() => {
    if (hydrated && questions.length === 0) {
      setQuestions(DEMO_QUESTIONS.map(({ answer, ...q }) => q));
    }
  }, [hydrated, questions.length, setQuestions]);

  // Prefill drafts from any answers already stored on the questions.
  useEffect(() => {
    if (questions.length === 0) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const q of questions) {
        if (next[q.id] === undefined) next[q.id] = q.answer ?? "";
      }
      return next;
    });
  }, [questions]);

  // While running, advance the narrated pipeline stages on a gentle cadence.
  useEffect(() => {
    if (!running) {
      setStage(0);
      return;
    }
    const id = setInterval(() => {
      setStage((s) => (s + 1) % PIPELINE_STAGES.length);
    }, 1100);
    return () => clearInterval(id);
  }, [running]);

  const answeredCount = useMemo(
    () => questions.filter((q) => (drafts[q.id] ?? "").trim().length > 0).length,
    [questions, drafts],
  );

  function fillAlexAnswers() {
    const byId = new Map(DEMO_QUESTIONS.map((q) => [q.id, q.answer ?? ""]));
    setDrafts((prev) => {
      const next = { ...prev };
      for (const q of questions) {
        const a = byId.get(q.id);
        if (a) next[q.id] = a;
      }
      return next;
    });
  }

  async function runSimulation() {
    if (running) return;
    setRunning(true);

    // Persist whatever the user typed (answers are optional).
    const answered: ClarifyingQuestion[] = questions.map((q) => {
      const answer = (drafts[q.id] ?? "").trim();
      if (answer) answerQuestion(q.id, answer);
      return answer ? { ...q, answer } : { ...q };
    });

    // Always finish on /map, even offline. The API never hard-fails, but we
    // still guard with a try/catch and fall back to the demo simulation.
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, answers: answered }),
      });
      if (!res.ok) throw new Error(`simulate failed: ${res.status}`);
      const result = (await res.json()) as SimulationResult;
      if (!result || !Array.isArray(result.branches) || result.branches.length === 0) {
        throw new Error("simulate returned an empty result");
      }
      setSimulation(result);
    } catch {
      // Graceful fallback so the journey never dead-ends.
      setSimulation(DEMO_SIMULATION);
    } finally {
      router.push("/map");
    }
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24 text-center text-mute">Loading clarifying questions…</Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-8">
        <ProgressSteps current="questions" />
      </Section>

      <Section className="pt-10">
        <SectionTitle
          eyebrow="Clarify"
          title="A few questions that change the analysis"
          subtitle="These aren't a quiz — they sharpen the simulation. Good clarifying questions tend to surface how you actually weight your values, which constraint is really binding, and which beliefs you're treating as facts but haven't tested. Answer in your own words, or skip any; either way the branches stay grounded in your context."
        />
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner variant="compact" />
      </Section>

      <Section className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-mute">
            {answeredCount} of {questions.length} answered
            <span className="text-mute/60"> · answers are optional</span>
          </div>
          <Button
            variant="subtle"
            size="sm"
            onClick={fillAlexAnswers}
            disabled={running}
          >
            <Wand2 className="h-3.5 w-3.5" />
            Use Alex&apos;s answers
          </Button>
        </div>
      </Section>

      <Section className="pt-6">
        <div className="space-y-4">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <Card hover>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-xs font-semibold text-brand-glow">
                      {i + 1}
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold leading-snug text-white sm:text-lg">
                        {q.question}
                      </h3>
                      <details className="text-sm leading-relaxed text-soft/80">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-mute transition-colors hover:text-soft">
                          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-brand-glow/70" />
                          Why this matters
                        </summary>
                        <p className="mt-1.5 pl-6">{q.why}</p>
                      </details>
                      <Pill className="gap-1.5">
                        <HelpCircle className="h-3 w-3 text-mute" />
                        Probes: {q.probes}
                      </Pill>
                    </div>
                  </div>

                  <Divider />

                  <textarea
                    value={drafts[q.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    disabled={running}
                    rows={3}
                    placeholder="Answer in your own words — or leave blank to skip."
                    className="w-full resize-y rounded-xl border border-line/70 bg-void/40 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-mute/60 transition-colors focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="pt-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              Ready when you are — answers may sharpen the branches, but they&apos;re not required.
            </div>
            <div className="text-sm text-mute">
              Running the simulation opens three plausible futures side by side. Nothing here decides for you.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/intake")}
              disabled={running}
              className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-white disabled:opacity-50"
            >
              ← Back to setup
            </button>
            <Button size="lg" onClick={runSimulation} disabled={running}>
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run the simulation
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Section>

      {/* Reasoning overlay — make the wait feel like multi-agent reasoning. */}
      {running && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 px-5 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <Card glow className="overflow-hidden">
              <div className="space-y-6 p-7">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand/40 bg-brand/10">
                    <Sparkles className="h-5 w-5 text-brand-glow" />
                    <span className="absolute inset-0 rounded-xl bg-brand/20 blur-md animate-pulse-glow" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Running multi-agent pipeline
                    </div>
                    <div className="text-xs text-mute">
                      Retrieving evidence → generating branches → calibrating uncertainty
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {PIPELINE_STAGES.map((s, idx) => {
                    const Icon = s.icon;
                    const active = idx === stage;
                    const done = idx < stage;
                    return (
                      <div
                        key={s.label}
                        className={
                          "flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300 " +
                          (active
                            ? "border-brand/40 bg-brand/[0.07]"
                            : done
                              ? "border-line/60 bg-white/[0.02] opacity-80"
                              : "border-line/50 bg-white/[0.01] opacity-50")
                        }
                      >
                        <span className="mt-0.5">
                          {active ? (
                            <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
                          ) : (
                            <Icon
                              className={
                                "h-4 w-4 " + (done ? "text-brand-glow/80" : "text-mute")
                              }
                            />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white">{s.label}</div>
                          <div className="text-xs leading-relaxed text-soft/70">{s.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-center text-[11px] leading-relaxed text-mute/70">
                  Building plausible scenarios from your context, curated evidence, and explicit
                  assumptions — not predictions. The final decision stays with you.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
