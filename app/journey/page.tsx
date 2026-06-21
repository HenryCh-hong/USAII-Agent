"use client";

/**
 * The guided journey — Forked Futures' main entry point, as a MAP-FIRST
 * decision-tree adventure.
 *
 * The user writes one messy situation; the journey then becomes a pixel
 * decision-tree map (components/journey/JourneyCanvas): the current question is
 * the bubble on the current node, the answer choices are branch paths you click
 * to walk forward, unchosen options stay as greyed "unlived" branches, and the
 * traveler glides node to node. After a few nodes the tree opens into route
 * gates — each a possible path with an evidence-fit score and what shaped it.
 * "Open the route map" maps it into the canonical SimulationResult
 * (lib/journey/adapter) and hands off to the existing /map → /branch → /brief
 * loop. Mock-first: every fetch degrades gracefully, with or without an API key.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  BookOpen,
  Compass,
  DoorOpen,
  GitBranch,
  Loader2,
  Map as MapIcon,
  Pencil,
  Sparkles,
  TriangleAlert,
  User2,
  Wand2,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { PixelTraveler } from "@/components/shared/PixelTraveler";
import { Section, SectionTitle, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import { useForkedStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { revealToSimulation } from "@/lib/journey/adapter";
import { buildMockJourneyNext, buildMockJourneyReveal } from "@/lib/journey/mock";
import { routeFit } from "@/lib/journey/score";
import type { RouteFit } from "@/lib/journey/score";
import { JourneyCanvas } from "@/components/journey/JourneyCanvas";
import type { JourneyNode } from "@/components/journey/JourneyCanvas";
import { JOURNEY_TARGET_NODES, emptyJourneyState } from "@/lib/journey/types";
import type {
  JourneyNextResponse,
  JourneyQuestion,
  JourneyRevealResponse,
  JourneyState,
  QuestionAnswer,
} from "@/lib/journey/types";

type Phase = "situation" | "questions" | "reveal";

/** Short, ellipsised label for a tree node. */
function short(s: string, n = 64): string {
  const t = (s || "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

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
  const [text, setText] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);

  const [reveal, setReveal] = useState<JourneyRevealResponse | null>(null);
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [editDecision, setEditDecision] = useState("");
  const [editTitles, setEditTitles] = useState<string[]>([]);

  // Synchronous latch against a sub-frame double-click on a branch.
  const submittingRef = useRef(false);

  // Client-side decision-tree state (ephemeral UI; not persisted).
  const [nodes, setNodes] = useState<JourneyNode[]>([]);

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
    setNodes((ns) =>
      ns.some((n) => n.id === "reveal")
        ? ns
        : [
            ...ns,
            {
              id: "reveal",
              status: "revealed",
              topic: "Your fork",
              routes: data.routes.map((r) => ({ id: r.id, title: r.title })),
            },
          ],
    );
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
    const q = data.question;
    setQuestion(q);
    setText("");
    // Reveal the next node on the spine. The node id is INDEX-derived, never the
    // model's question.id (a live model could reuse it, which would otherwise
    // leave the new node stuck as "answered" and freeze the canvas).
    const nodeId = `step-${answers.length}`;
    setNodes((ns) =>
      ns.some((n) => n.id === nodeId)
        ? ns
        : [...ns, { id: nodeId, status: "current", topic: q.whatItSeparates?.[0] ?? "Next question" }],
    );
  }

  /* -------------------------------- actions ------------------------------- */

  function startJourney() {
    if (!situation.trim() || loadingNext) return;
    setPhase("questions");
    // Seed the tree at the foggy origin (the messy situation).
    setNodes([{ id: "origin", status: "answered", topic: "Your situation", answer: short(situation, 70) }]);
    void fetchNext([], emptyJourneyState());
  }

  /** Answer the current node — by choosing a branch, walking a typed path, or skipping. */
  function answer(opts?: { skip?: boolean; chosen?: string; typed?: string }) {
    if (!question || loadingNext || submittingRef.current) return;
    submittingRef.current = true;
    const chosen = (opts?.chosen ?? "").trim();
    const typed = (opts?.typed ?? text).trim();
    const answerStr = opts?.skip ? "" : [chosen, typed].filter(Boolean).join(" — ");
    // Index-derived id so the match is robust even if a live model reuses question.id.
    const stepId = `step-${prev.length}`;
    const qa: QuestionAnswer = {
      questionId: stepId,
      prompt: question.prompt,
      answer: answerStr,
      selectedOption: chosen || undefined,
    };
    const nextPrev = [...prev, qa];
    setPrev(nextPrev);
    // Grey out the options not chosen — but only when the user actually picked a
    // branch (typing your own words shouldn't grey out every option).
    const ghosts = chosen ? (question.options ?? []).filter((o) => o !== chosen) : [];
    setNodes((ns) =>
      ns.map((n) =>
        n.id === stepId
          ? opts?.skip
            ? { ...n, status: "answered", skipped: true, answer: undefined, unchosen: [] }
            : {
                ...n,
                status: "answered",
                answer: short(answerStr, 64),
                unchosen: ghosts.map((g) => short(g, 40)),
              }
          : n,
      ),
    );
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
  const canWalkForward = showText && text.trim().length > 0;

  /* -------------------------------- render -------------------------------- */

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-10">
        <JourneyTrail phase={phase} nodeNumber={nodeNumber} />
      </Section>

      <>
        {phase === "situation" && (
          <motion.div
            key="situation"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Section className="pt-10">
              <SectionTitle
                eyebrow="Begin the fork run"
                title="Start with the messy version."
                subtitle="You don't need to name your options or frame a clean decision. Tell us the blurry situation — then walk the decision tree, one branch at a time, until it opens into a few paths you can test."
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
                          Enter the decision tree <ArrowRight className="h-4 w-4" />
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
          >
            <Section className="pt-6">
              <ResponsibleAIBanner variant="compact" />
            </Section>
            <Section className="pt-6">
              <JourneyCanvas
                nodes={nodes}
                question={question}
                loadingNext={loadingNext}
                loadingReveal={loadingReveal}
                showOptions={showOptions}
                showText={showText}
                options={opts}
                text={text}
                setText={setText}
                onChoose={(o) => answer({ chosen: o })}
                onWalkForward={() => answer({})}
                onSkip={() => answer({ skip: true })}
                canWalkForward={canWalkForward}
                nodeNumber={nodeNumber}
                totalNodes={JOURNEY_TARGET_NODES}
              />
            </Section>

            {prev.length > 0 && (
              <Section className="pt-5">
                <details className="group rounded-xl border border-line/60 bg-white/[0.02] p-4">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-mute transition-colors hover:text-soft">
                    <Brain className="h-3.5 w-3.5 text-brand-glow/70" />
                    Trail so far ({prev.length} answered) · full text
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
          >
            {loadingReveal || !reveal ? (
              <Section className="pt-16">
                <Card glow>
                  <div className="flex flex-col items-center gap-4 p-12 text-center">
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10">
                      <Sparkles className="h-6 w-6 text-brand-glow" />
                      <span className="absolute inset-0 rounded-2xl bg-brand/20 blur-md animate-pulse-glow" />
                    </span>
                    <div className="text-lg font-medium text-white">Your path is reaching its fork…</div>
                    <div className="max-w-md text-sm text-mute">
                      Reading across your answers to open a few route gates — including ones you may
                      not have named yourself.
                    </div>
                  </div>
                </Card>
              </Section>
            ) : (
              <RevealView
                reveal={reveal}
                state={journeyState}
                walked={nodes.filter((n) => n.status === "answered").length}
                editDecision={editDecision}
                setEditDecision={setEditDecision}
                editTitles={editTitles}
                setEditTitles={setEditTitles}
                onOpenMap={openMap}
              />
            )}
          </motion.div>
        )}
      </>

      {!hydrated && null}
    </main>
  );
}

/* ------------------------------- sub-views -------------------------------- */

function JourneyTrail({ phase, nodeNumber }: { phase: Phase; nodeNumber: number }) {
  const steps = [
    { key: "situation", label: "Situation" },
    { key: "questions", label: "Decision tree" },
    { key: "reveal", label: "Route gates" },
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
  state,
  walked,
  editDecision,
  setEditDecision,
  editTitles,
  setEditTitles,
  onOpenMap,
}: {
  reveal: JourneyRevealResponse;
  state: JourneyState;
  walked: number;
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
          eyebrow="The path forks here"
          title="Your journey opens into route gates."
          subtitle="These are possibilities to weigh and test, not predictions — and not the only ones. Review and edit before you open the map; nothing here is decided for you."
        />
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner variant="compact" />
      </Section>

      {/* Arrival + decision review */}
      <Section className="pt-8">
        <Card>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex items-center gap-3 rounded-xl border border-brand/25 bg-brand/[0.05] px-4 py-3">
              <PixelTraveler accent="brand" size={20} />
              <div className="text-sm text-soft/90">
                You walked <span className="text-white">{walked} node{walked === 1 ? "" : "s"}</span> — the path now
                forks into <span className="text-white">{reveal.routes.length} route gates</span> below.
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-mute">
                <Pencil className="h-3.5 w-3.5" /> The decision you're really facing (editable)
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

      {/* Route gates */}
      <Section className="pt-8">
        <p className="mb-4 max-w-2xl text-xs leading-relaxed text-mute">
          Each gate is a possible path. The <span className="text-soft">evidence-fit score</span> shows how strongly
          a route matches your answers and the reference support behind it — <span className="text-soft">not a prediction</span>.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reveal.routes.map((r, i) => (
            <RouteGate
              key={r.id}
              index={i}
              route={r}
              fit={routeFit(r, state)}
              title={editTitles[i] ?? r.title}
              onTitle={(v) => {
                const next = [...editTitles];
                next[i] = v;
                setEditTitles(next);
              }}
            />
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="pt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              Enter one gate to walk it — the others stay on the map as unlived futures you can still explore.
            </div>
            <div className="text-sm text-mute">
              Opening the route map turns these gates into a full simulation you can compare.
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

/* ------------------------------- route gate ------------------------------- */

function RouteGate({
  index,
  route,
  fit,
  title,
  onTitle,
}: {
  index: number;
  route: JourneyRevealResponse["routes"][number];
  fit: RouteFit;
  title: string;
  onTitle: (v: string) => void;
}) {
  return (
    <Card hover className="relative flex h-full flex-col overflow-hidden">
      {/* gate header bar */}
      <div className="flex items-center justify-between border-b border-line/60 bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-glow/80">
          <DoorOpen className="h-3.5 w-3.5" /> Route gate {index + 1}
        </div>
        <GitBranch className="h-3.5 w-3.5 text-mute/60" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          aria-label={`Route ${index + 1} title (editable)`}
          className="w-full rounded-lg border border-transparent bg-transparent text-base font-semibold text-white transition-colors hover:border-line/50 focus:border-brand/50 focus:bg-void/40 focus:px-2 focus:py-1 focus:outline-none"
        />
        <p className="text-sm leading-relaxed text-soft/85">{route.shortDescription}</p>

        {/* evidence-fit score — visual */}
        <div className="flex items-center gap-3 rounded-xl border border-line/60 bg-white/[0.02] p-3">
          <ScoreRing score={fit.score} />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-soft">
              Evidence-fit · <span className="text-brand-glow">{fit.band}</span>
            </div>
            <div className="text-[11px] leading-snug text-mute">
              Match to your answers + reference support. <span className="text-soft">Not a prediction.</span>
            </div>
          </div>
        </div>

        {/* what shaped this route */}
        <div className="space-y-2 rounded-xl border border-line/60 bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-glow/70">
            What shaped this route
          </div>
          <Shaped icon={User2} label="User signal" body={fit.strongestUserSignal} />
          <Shaped icon={BookOpen} label="Curated reference" body={fit.strongestReferenceSignal} />
          <Shaped icon={Brain} label="AI-inferred assumption" body={fit.aiInferredAssumption} />
          <Shaped icon={TriangleAlert} label="Biggest uncertainty" body={fit.biggestUncertainty} tone="text-startup/90" />
        </div>

        {/* 7-day test */}
        <div className="mt-auto rounded-xl border border-line/60 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-glow/80">
            <Sparkles className="h-3 w-3" /> 7-day test
          </div>
          <p className="mt-1 text-xs leading-relaxed text-soft/85">{route.sevenDayTest}</p>
        </div>
      </div>
    </Card>
  );
}

function Shaped({
  icon: Icon,
  label,
  body,
  tone = "text-soft/85",
}: {
  icon: typeof User2;
  label: string;
  body: string;
  tone?: string;
}) {
  return (
    <div className="flex gap-2 text-[11px] leading-relaxed">
      <Icon className={cn("mt-0.5 h-3 w-3 shrink-0", tone === "text-startup/90" ? "text-startup/90" : "text-brand-glow/70")} />
      <div className="min-w-0">
        <span className="text-mute">{label}: </span>
        <span className={tone}>{body}</span>
      </div>
    </div>
  );
}

/** Visual evidence-fit ring (a match score, never a prediction). */
function ScoreRing({ score }: { score: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const off = c * (1 - clamped / 100);
  const tone = score >= 66 ? "#5eead4" : score >= 45 ? "#c084fc" : "#fca65a";
  return (
    <div className="relative h-[60px] w-[60px] shrink-0">
      <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold leading-none text-white">{score}</span>
        <span className="text-[8px] text-mute">/100</span>
      </div>
    </div>
  );
}
