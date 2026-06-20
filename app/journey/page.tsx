"use client";

/**
 * The guided journey — Forked Futures' main entry point.
 *
 * A route adventure, not a form: the user writes one messy situation, the app
 * asks one causally-led question at a time (each shaped by the previous answer),
 * and after a few nodes it reveals 2–3 reframed possible paths. The user can edit
 * the reveal, then "Open the route map" — which maps the journey into the
 * canonical SimulationResult (lib/journey/adapter) and hands off to the existing
 * /map → /branch → /brief loop. Mock-first: every fetch degrades gracefully so
 * the journey never dead-ends, with or without an API key.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Compass,
  Lightbulb,
  Loader2,
  Map as MapIcon,
  Pencil,
  Route,
  Sparkles,
  User2,
  BookOpen,
  Wand2,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { Section, SectionTitle, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill, Divider } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import { useForkedStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { revealToSimulation } from "@/lib/journey/adapter";
import { buildMockJourneyNext, buildMockJourneyReveal } from "@/lib/journey/mock";
import {
  JOURNEY_TARGET_NODES,
  REFERENCE_LABELS,
  emptyJourneyState,
} from "@/lib/journey/types";
import type {
  JourneyNextResponse,
  JourneyQuestion,
  JourneyRevealResponse,
  JourneyState,
  QuestionAnswer,
  ReferenceNote,
} from "@/lib/journey/types";

type Phase = "situation" | "questions" | "reveal";

const EXAMPLES = [
  "I'm a sophomore CS student deciding whether to go all-in on quant recruiting, build a startup, or aim for research — but I'm not sure what I actually want.",
  "I have a stable job offer and a chance to join a tiny early-stage startup, and I can't tell if I'd be brave or reckless to take it.",
  "I keep flip-flopping between doing a master's and staying in industry, and I don't really know why I can't settle it.",
];

export default function JourneyPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const setContext = useForkedStore((s) => s.setContext);
  const setSimulation = useForkedStore((s) => s.setSimulation);
  const setEnteredBranch = useForkedStore((s) => s.setEnteredBranch);

  const [phase, setPhase] = useState<Phase>("situation");
  const [situation, setSituation] = useState("");
  const [prev, setPrev] = useState<QuestionAnswer[]>([]);
  const [journeyState, setJourneyState] = useState<JourneyState>(emptyJourneyState());

  const [question, setQuestion] = useState<JourneyQuestion | null>(null);
  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);

  const [reveal, setReveal] = useState<JourneyRevealResponse | null>(null);
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [editDecision, setEditDecision] = useState("");
  const [editTitles, setEditTitles] = useState<string[]>([]);

  // Synchronous latch: guards against a sub-frame double-click on "Continue"
  // (loadingNext is async state and could be read stale within the same tick).
  const submittingRef = useRef(false);

  const nodeNumber = prev.length + 1;

  /* ------------------------------- fetching ------------------------------- */

  async function fetchReveal(answers: QuestionAnswer[], state: JourneyState) {
    setLoadingReveal(true);
    setPhase("reveal");
    let data: JourneyRevealResponse;
    try {
      const res = await fetch("/api/journey/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, answers, journeyState: state }),
      });
      if (!res.ok) throw new Error(`reveal ${res.status}`);
      data = (await res.json()) as JourneyRevealResponse;
      if (!data || !Array.isArray(data.routes) || data.routes.length < 2) {
        throw new Error("reveal returned too few routes");
      }
    } catch {
      data = buildMockJourneyReveal(situation, answers, state);
    }
    setReveal(data);
    setEditDecision(data.decision);
    setEditTitles(data.routes.map((r) => r.title));
    setLoadingReveal(false);
  }

  async function fetchNext(answers: QuestionAnswer[], state: JourneyState) {
    setLoadingNext(true);
    let data: JourneyNextResponse;
    try {
      const res = await fetch("/api/journey/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, previousQuestions: answers, journeyState: state }),
      });
      if (!res.ok) throw new Error(`next ${res.status}`);
      data = (await res.json()) as JourneyNextResponse;
    } catch {
      data = buildMockJourneyNext(situation, answers);
    }
    setJourneyState(data.updatedState);
    setLoadingNext(false);
    submittingRef.current = false;

    if (data.done || !data.question) {
      await fetchReveal(answers, data.updatedState);
      return;
    }
    setQuestion(data.question);
    setSelected("");
    setText("");
  }

  /* -------------------------------- actions ------------------------------- */

  function startJourney() {
    if (!situation.trim() || loadingNext) return;
    setPhase("questions");
    void fetchNext([], emptyJourneyState());
  }

  function answerCurrent(skip = false) {
    if (!question || loadingNext || submittingRef.current) return;
    submittingRef.current = true;
    const chosen = selected.trim();
    const typed = text.trim();
    const answer = skip ? "" : [chosen, typed].filter(Boolean).join(" — ");
    const qa: QuestionAnswer = {
      questionId: question.id,
      prompt: question.prompt,
      answer,
      selectedOption: chosen || undefined,
    };
    const nextPrev = [...prev, qa];
    setPrev(nextPrev);
    void fetchNext(nextPrev, journeyState);
  }

  function openMap() {
    if (!reveal) return;
    const edited: JourneyRevealResponse = {
      ...reveal,
      decision: editDecision.trim() || reveal.decision,
      routes: reveal.routes.map((r, i) => ({
        ...r,
        title: (editTitles[i] ?? r.title).trim() || r.title,
      })),
    };
    const { context, simulation } = revealToSimulation(situation, edited, journeyState);
    setContext(context);
    // A fresh fork replaces the map — clear any route entered in a prior run so
    // /map opens with nothing marked "current" until the user enters a path.
    setEnteredBranch("");
    setSimulation(simulation);
    router.push("/map");
  }

  // A live model could return a "choice"/"mixed" question without options — fall
  // back to a free-text input so the node is always answerable.
  const opts = question?.options ?? [];
  const showOptions =
    !!question && (question.type === "choice" || question.type === "mixed") && opts.length > 0;
  const showText =
    !!question && (question.type === "short_text" || question.type === "mixed" || !showOptions);
  const canSubmit =
    !!question && ((showOptions && selected.length > 0) || (showText && text.trim().length > 0));

  /* -------------------------------- render -------------------------------- */

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-10">
        <JourneyTrail phase={phase} nodeNumber={nodeNumber} />
      </Section>

      <AnimatePresence mode="wait">
        {phase === "situation" && (
          <motion.div
            key="situation"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <Section className="pt-10">
              <SectionTitle
                eyebrow="Begin the fork run"
                title="Start with the messy version."
                subtitle="You don't need to name your options or frame a clean decision. Tell us the blurry situation — we'll ask one question at a time, each shaped by your last answer, then surface a few possible paths you can test."
              />
            </Section>

            <Section className="pt-6">
              <ResponsibleAIBanner variant="compact" />
            </Section>

            <Section className="pt-8">
              <Card>
                <div className="space-y-5 p-5 sm:p-7">
                  <label className="flex items-center gap-2 text-sm font-medium text-soft">
                    <Compass className="h-4 w-4 text-brand-glow/80" />
                    Your situation — messy is welcome
                  </label>
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    rows={5}
                    placeholder="e.g. I'm partway through my degree and torn between a few directions, but I can't tell what I actually want…"
                    className="w-full resize-y rounded-xl border border-line/70 bg-void/40 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-mute/60 transition-colors focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />

                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-mute">
                      Or start from an example
                    </div>
                    <div className="flex flex-col gap-2">
                      {EXAMPLES.map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => setSituation(ex)}
                          className="rounded-xl border border-line/60 bg-white/[0.02] px-3.5 py-2.5 text-left text-sm text-soft/90 transition-colors hover:border-brand/40 hover:text-white"
                        >
                          <Wand2 className="mr-2 inline h-3.5 w-3.5 text-brand-glow/70" />
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs leading-relaxed text-mute">
                      Already framed your fork? You can{" "}
                      <button
                        type="button"
                        onClick={() => router.push("/intake")}
                        className="text-brand-glow/90 underline-offset-2 hover:underline"
                      >
                        enter it manually instead
                      </button>
                      .
                    </p>
                    <Button size="lg" onClick={startJourney} disabled={!situation.trim() || loadingNext}>
                      {loadingNext ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                        </>
                      ) : (
                        <>
                          Start the first question <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </Section>
          </motion.div>
        )}

        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <Section className="pt-10">
              <div className="flex items-center justify-between gap-3">
                <Eyebrow>
                  Question {Math.min(nodeNumber, JOURNEY_TARGET_NODES)} of ~{JOURNEY_TARGET_NODES}
                </Eyebrow>
                <span className="text-xs text-mute">Each question follows from your last answer.</span>
              </div>
            </Section>

            <Section className="pt-6">
              {!question || loadingNext ? (
                <Card>
                  <div className="flex items-center gap-3 p-8 text-sm text-mute">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
                    {loadingReveal ? "Reading the shape of your fork…" : "Following the thread from your last answer…"}
                  </div>
                </Card>
              ) : (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card glow>
                    <div className="space-y-6 p-5 sm:p-7">
                      <h2 className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                        {question.prompt}
                      </h2>

                      <div className="flex flex-wrap gap-2">
                        {question.whatItSeparates.map((t) => (
                          <Pill key={t} className="gap-1.5">
                            <Route className="h-3 w-3 text-brand-glow/70" />
                            {t}
                          </Pill>
                        ))}
                      </div>

                      <div className="flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/[0.05] px-4 py-3">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow/80" />
                        <p className="text-sm leading-relaxed text-soft/90">
                          <span className="font-medium text-white">Why this question matters:</span>{" "}
                          {question.whyThisQuestion}
                        </p>
                      </div>

                      <Divider />

                      {showOptions && (
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {opts.map((opt) => {
                            const active = selected === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setSelected(active ? "" : opt)}
                                className={cn(
                                  "rounded-xl border px-4 py-3 text-left text-sm transition-all",
                                  active
                                    ? "border-brand/60 bg-brand/[0.1] text-white shadow-glow-sm"
                                    : "border-line/60 bg-white/[0.02] text-soft hover:border-brand/40 hover:text-white",
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {showText && (
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          rows={3}
                          placeholder={
                            question.type === "mixed" && showOptions
                              ? "Add anything in your own words (optional)…"
                              : "Answer in your own words…"
                          }
                          className="w-full resize-y rounded-xl border border-line/70 bg-void/40 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-mute/60 transition-colors focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => answerCurrent(true)}
                          className="text-sm text-mute transition-colors hover:text-white"
                        >
                          Skip this one
                        </button>
                        <Button size="lg" onClick={() => answerCurrent(false)} disabled={!canSubmit}>
                          Continue <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </Section>

            {prev.length > 0 && (
              <Section className="pt-6">
                <details className="group rounded-xl border border-line/60 bg-white/[0.02] p-4">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-mute transition-colors hover:text-soft">
                    <Brain className="h-3.5 w-3.5 text-brand-glow/70" />
                    Your trail so far ({prev.length} answered)
                  </summary>
                  <ol className="mt-4 space-y-3">
                    {prev.map((qa, i) => (
                      <li key={qa.questionId} className="text-sm">
                        <div className="text-soft/80">
                          <span className="text-mute">{i + 1}. </span>
                          {qa.prompt}
                        </div>
                        <div className="mt-0.5 pl-5 text-white">
                          → {qa.answer || <span className="text-mute italic">skipped</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </details>
              </Section>
            )}
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {loadingReveal || !reveal ? (
              <Section className="pt-16">
                <Card glow>
                  <div className="flex flex-col items-center gap-4 p-12 text-center">
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10">
                      <Sparkles className="h-6 w-6 text-brand-glow" />
                      <span className="absolute inset-0 rounded-2xl bg-brand/20 blur-md animate-pulse-glow" />
                    </span>
                    <div className="text-lg font-medium text-white">Your fork is taking shape…</div>
                    <div className="max-w-md text-sm text-mute">
                      Reading across your answers to surface a few possible paths — including ones you
                      may not have named yourself.
                    </div>
                  </div>
                </Card>
              </Section>
            ) : (
              <RevealView
                reveal={reveal}
                editDecision={editDecision}
                setEditDecision={setEditDecision}
                editTitles={editTitles}
                setEditTitles={setEditTitles}
                onOpenMap={openMap}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!hydrated && null}
    </main>
  );
}

/* ------------------------------- sub-views -------------------------------- */

function JourneyTrail({ phase, nodeNumber }: { phase: Phase; nodeNumber: number }) {
  const steps = [
    { key: "situation", label: "Situation" },
    { key: "questions", label: "Questions" },
    { key: "reveal", label: "Paths" },
    { key: "map", label: "Route map" },
  ] as const;
  const activeIdx = phase === "situation" ? 0 : phase === "questions" ? 1 : 2;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "inline-flex items-center gap-2 text-xs sm:text-sm",
                active ? "text-white" : done ? "text-soft" : "text-mute/60",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                  active
                    ? "border-brand bg-brand/20 text-white shadow-glow-sm"
                    : done
                      ? "border-brand/40 bg-brand/10 text-brand-glow"
                      : "border-line/70 text-mute/60",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <span className="h-px w-4 bg-line/60 sm:w-8" />}
          </div>
        );
      })}
      {phase === "questions" && (
        <span className="ml-2 hidden text-xs text-mute md:inline">· node {nodeNumber}</span>
      )}
    </div>
  );
}

function RevealView({
  reveal,
  editDecision,
  setEditDecision,
  editTitles,
  setEditTitles,
  onOpenMap,
}: {
  reveal: JourneyRevealResponse;
  editDecision: string;
  setEditDecision: (v: string) => void;
  editTitles: string[];
  setEditTitles: (v: string[]) => void;
  onOpenMap: () => void;
}) {
  return (
    <>
      <Section className="pt-10">
        <SectionTitle
          eyebrow="Your fork is taking shape"
          title="Here's the fork hiding inside your situation."
          subtitle="These are possibilities to weigh and test, not predictions — and not the only ones. Edit anything before you continue; nothing here is decided for you."
        />
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner variant="compact" />
      </Section>

      {/* Decision + framing */}
      <Section className="pt-8">
        <Card>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-mute">
                <Pencil className="h-3.5 w-3.5" /> The decision (editable)
              </label>
              <textarea
                value={editDecision}
                onChange={(e) => setEditDecision(e.target.value)}
                rows={2}
                className="w-full resize-y rounded-xl border border-line/70 bg-void/40 px-4 py-3 text-base font-medium leading-relaxed text-white focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Framing label="The deeper question" body={reveal.coreQuestion} />
              <Framing label="The value conflict" body={reveal.valueConflict} />
            </div>
          </div>
        </Card>
      </Section>

      {/* Routes */}
      <Section className="pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Route className="h-4 w-4 text-brand-glow/80" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-soft">
            {reveal.routes.length} possible paths
          </h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {reveal.routes.map((r, i) => (
            <Card key={r.id} hover className="h-full">
              <div className="flex h-full flex-col gap-4 p-5">
                <input
                  value={editTitles[i] ?? r.title}
                  onChange={(e) => {
                    const next = [...editTitles];
                    next[i] = e.target.value;
                    setEditTitles(next);
                  }}
                  className="w-full rounded-lg border border-transparent bg-transparent text-base font-semibold text-white transition-colors hover:border-line/50 focus:border-brand/50 focus:bg-void/40 focus:px-2 focus:py-1 focus:outline-none"
                />
                <p className="text-sm leading-relaxed text-soft/85">{r.shortDescription}</p>
                <div className="space-y-2.5 text-sm">
                  <RouteFacet label="Optimizes for" body={r.whatItOptimizesFor} tone="text-quant" />
                  <RouteFacet label="Risks" body={r.whatItRisks} tone="text-startup" />
                  <RouteFacet label="You might miss" body={r.whatYouMightMiss} tone="text-research" />
                </div>
                <div className="mt-auto space-y-2 rounded-xl border border-line/60 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-brand-glow/80">
                    <Sparkles className="h-3 w-3" /> 7-day test
                  </div>
                  <p className="text-xs leading-relaxed text-soft/85">{r.sevenDayTest}</p>
                </div>
                {r.evidenceNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.evidenceNotes.map((n, j) => (
                      <Pill key={j} className="gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-glow/70" />
                        {REFERENCE_LABELS[n.sourceType]}
                      </Pill>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* What shaped these paths */}
      <Section className="pt-10">
        <EvidencePanel references={reveal.references} />
      </Section>

      {/* CTA */}
      <Section className="pt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              Enter one path to walk it — the others stay on the map as unlived futures you can still explore.
            </div>
            <div className="text-sm text-mute">
              Opening the route map turns these paths into a full simulation you can compare.
            </div>
          </div>
          <Button size="lg" onClick={onOpenMap}>
            <MapIcon className="h-4 w-4" /> Open the route map <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>
    </>
  );
}

function Framing({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-line/60 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-wider text-mute">{label}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-soft/90">{body}</p>
    </div>
  );
}

function RouteFacet({ label, body, tone }: { label: string; body: string; tone: string }) {
  return (
    <div>
      <span className={cn("text-[11px] font-semibold uppercase tracking-wider", tone)}>{label}: </span>
      <span className="text-soft/85">{body}</span>
    </div>
  );
}

const REFERENCE_ICON = {
  user_answer: User2,
  curated_reference: BookOpen,
  ai_inferred: Brain,
} as const;

function EvidencePanel({ references }: { references: ReferenceNote[] }) {
  const groups = (["user_answer", "curated_reference", "ai_inferred"] as const)
    .map((kind) => ({ kind, notes: references.filter((r) => r.sourceType === kind) }))
    .filter((g) => g.notes.length > 0);

  if (groups.length === 0) return null;

  return (
    <Card>
      <div className="space-y-5 p-5 sm:p-7">
        <div className="space-y-1.5">
          <Eyebrow>What shaped these paths</Eyebrow>
          <p className="max-w-2xl text-sm leading-relaxed text-soft/80">
            Every path is built from labeled signal. We separate what you told us, real public
            framings, and our own inferences — and we never present an inference as a citation.
          </p>
        </div>
        <Divider />
        <div className="grid gap-5 md:grid-cols-3">
          {groups.map((g) => {
            const Icon = REFERENCE_ICON[g.kind];
            return (
              <div key={g.kind} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon className="h-4 w-4 text-brand-glow/80" />
                  {REFERENCE_LABELS[g.kind]}
                </div>
                <ul className="space-y-3">
                  {g.notes.map((n, i) => (
                    <li key={i} className="rounded-xl border border-line/60 bg-white/[0.02] p-3">
                      <div className="text-xs font-medium text-soft">{n.label}</div>
                      <p className="mt-1 text-xs leading-relaxed text-mute">{n.summary}</p>
                      <p className="mt-1.5 text-[11px] text-brand-glow/70">Used for: {n.usedFor}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
