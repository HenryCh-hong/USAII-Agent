"use client";

/**
 * The guided journey — Forked Futures' main entry point, as a MAP-FIRST
 * decision-GRAPH adventure.
 *
 * The user writes one messy situation; the journey then becomes a horizontal
 * pixel decision-tree map (components/journey/DecisionGraphCanvas): the current
 * question is the glowing node, its answer choices fan out to the right as branch
 * gates you click to walk forward, unchosen options stay as greyed "roads not
 * taken", and the traveler glides node to node. After a few nodes the tree fans
 * open into a route universe (components/journey/RouteUniverse) — 6–10 distinct
 * route candidates, each with full micro-level review. The user marks three as
 * primary; "Open the route map" projects those three through the deterministic
 * adapter (lib/journey/adapter) into the canonical SimulationResult and hands off
 * to the existing /map → /branch → /brief loop. Mock-first: every fetch degrades
 * gracefully, with or without an API key.
 */
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Compass,
  Loader2,
  Map as MapIcon,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { PixelTraveler } from "@/components/shared/PixelTraveler";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import { useForkedStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { revealToSimulation } from "@/lib/journey/adapter";
import { buildMockJourneyNext, buildMockJourneyReveal } from "@/lib/journey/mock";
import { primaryRevealedPaths } from "@/lib/journey/routeUniverse";
import { buildDecisionGraph } from "@/lib/journey/graph";
import type { AnsweredStep, RouteFanItem } from "@/lib/journey/graph";
import { DecisionGraphCanvas } from "@/components/journey/DecisionGraphCanvas";
import { RouteUniverse } from "@/components/journey/RouteUniverse";
import { branchGatesFor, normalizeQuestionBranches } from "@/lib/journey/branches";
import { JOURNEY_TARGET_NODES, emptyJourneyState } from "@/lib/journey/types";
import type {
  JourneyNextResponse,
  JourneyQuestion,
  JourneyRevealResponse,
  JourneyState,
  QuestionAnswer,
} from "@/lib/journey/types";

type Phase = "situation" | "questions" | "reveal";

/** Short, ellipsised label. */
function short(s: string, n = 64): string {
  const t = (s || "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

/** Set-equality of two id lists (order-insensitive). */
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
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
  const [answered, setAnswered] = useState<AnsweredStep[]>([]);
  const [journeyState, setJourneyState] = useState<JourneyState>(emptyJourneyState());

  const [question, setQuestion] = useState<JourneyQuestion | null>(null);
  const [text, setText] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);

  const [reveal, setReveal] = useState<JourneyRevealResponse | null>(null);
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [editDecision, setEditDecision] = useState("");
  const [primaryIds, setPrimaryIds] = useState<string[]>([]);

  // Synchronous latch against a sub-frame double-click on a branch.
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
    // A live response without a universe still works — synthesize one locally.
    if (!data.universe || !data.primarySelection) {
      const mock = buildMockJourneyReveal(situation, answers, state);
      data = { ...data, universe: mock.universe, primarySelection: mock.primarySelection };
    }
    setReveal(data);
    setEditDecision(data.decision);
    setPrimaryIds(data.primarySelection?.primaryRouteIds ?? []);
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
    setText("");
  }

  /* -------------------------------- actions ------------------------------- */

  function startJourney() {
    if (!situation.trim() || loadingNext) return;
    setPhase("questions");
    setPrev([]);
    setAnswered([]);
    setQuestion(null);
    void fetchNext([], emptyJourneyState());
  }

  /** Answer the current node — by choosing a branch, walking a typed path, or skipping. */
  function answer(opts?: { skip?: boolean; chosen?: string; typed?: string }) {
    if (!question || loadingNext || submittingRef.current) return;
    submittingRef.current = true;
    const chosen = (opts?.chosen ?? "").trim();
    const typed = (opts?.typed ?? text).trim();
    const answerStr = opts?.skip ? "" : [chosen, typed].filter(Boolean).join(" — ");
    const stepId = `step-${prev.length}`;

    const qa: QuestionAnswer = {
      questionId: stepId,
      prompt: question.prompt,
      answer: answerStr,
      selectedOption: chosen || undefined,
    };
    const nextPrev = [...prev, qa];
    setPrev(nextPrev);

    // Roads not taken are greyed only when the user actually picked a branch —
    // drawn from the normalized branch set shown on the map (minus "Write my own").
    const unchosen = chosen
      ? normalizeQuestionBranches(question, journeyState)
          .map((b) => b.label)
          .filter((label) => label !== chosen)
      : [];
    const step: AnsweredStep = {
      stepId,
      topic: question.whatItSeparates?.[0] ?? "Your answer",
      prompt: question.prompt,
      chosen: chosen || undefined,
      typed: typed || undefined,
      skipped: !!opts?.skip,
      unchosen,
    };
    setAnswered((a) => [...a, step]);
    setQuestion(null);
    void fetchNext(nextPrev, journeyState);
  }

  function togglePrimary(id: string) {
    setPrimaryIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= 3) return ids;
      return [...ids, id];
    });
  }

  function openMap() {
    if (!reveal) return;
    const ids = primaryIds.length === 3 ? primaryIds : reveal.primarySelection?.primaryRouteIds ?? [];
    const routes =
      reveal.universe && ids.length === 3 ? primaryRevealedPaths(reveal.universe, ids) : reveal.routes;
    const edited: JourneyRevealResponse = {
      ...reveal,
      decision: editDecision.trim() || reveal.decision,
      routes,
    };
    const { context, simulation } = revealToSimulation(situation, edited, journeyState);
    setContext(context);
    // A fresh fork replaces the map — clear any prior entered route.
    setEnteredBranch("");
    setSimulation(simulation);
    router.push("/map");
  }

  // INVARIANT (P0): every active node renders visible branch gates. The branch
  // normalizer guarantees ≥3 answer branches even when the question arrives with
  // empty/missing options or is pure free-text, and appends "Write my own" as a
  // first-class branch — so a node can never collapse into a branchless form.
  const branches = useMemo(
    () => (question ? branchGatesFor(question, journeyState) : []),
    [question, journeyState],
  );
  // The custom path is always answerable via the typed textarea.
  const canWalkForward = text.trim().length > 0;
  // The current node is the last question when its number meets the target.
  const isFinalNode = nodeNumber >= JOURNEY_TARGET_NODES;

  /* --------------------------------- graph -------------------------------- */

  const routeFan: RouteFanItem[] = useMemo(() => {
    if (phase !== "reveal" || !reveal?.universe) return [];
    return reveal.universe.map((c) => ({
      id: c.id,
      title: c.title,
      archetype: c.archetype,
      isPrimary: primaryIds.includes(c.id),
    }));
  }, [phase, reveal, primaryIds]);

  const graph = useMemo(
    () =>
      buildDecisionGraph({
        situation,
        answered,
        currentTopic: question?.whatItSeparates?.[0] ?? "Next question",
        phase: phase === "reveal" ? "reveal" : "questions",
        routeFan,
      }),
    [situation, answered, question, phase, routeFan],
  );

  const isAuto = !!reveal?.primarySelection && sameSet(primaryIds, reveal.primarySelection.primaryRouteIds);

  /* -------------------------------- render -------------------------------- */

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-10">
        <JourneyTrail phase={phase} nodeNumber={nodeNumber} />
      </Section>

      {phase === "situation" && (
        <motion.div key="situation" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Section className="pt-10">
            <SectionTitle
              eyebrow="Begin the fork run"
              title="Start with the messy version."
              subtitle="You don't need to name your options or frame a clean decision. Tell us the blurry situation — then walk the decision tree, one branch at a time, until it fans open into a universe of paths you can test."
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
                  <div className="text-xs uppercase tracking-wider text-mute">Or start from an example</div>
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
        <motion.div key="questions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Section className="pt-6">
            <ResponsibleAIBanner variant="compact" />
          </Section>
          <Section className="pt-6">
            <DecisionGraphCanvas
              graph={graph}
              phase="questions"
              question={question}
              loadingNext={loadingNext}
              loadingReveal={loadingReveal}
              branches={branches}
              text={text}
              setText={setText}
              onChoose={(o) => answer({ chosen: o })}
              onWalkForward={() => answer({})}
              onSkip={() => answer({ skip: true })}
              canWalkForward={canWalkForward}
              nodeNumber={nodeNumber}
              totalNodes={JOURNEY_TARGET_NODES}
              isFinalNode={isFinalNode}
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
        <motion.div key="reveal" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {loadingReveal || !reveal ? (
            <Section className="pt-16">
              <Card glow>
                <div className="flex flex-col items-center gap-4 p-12 text-center">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10">
                    <Sparkles className="h-6 w-6 text-brand-glow" />
                    <span className="absolute inset-0 rounded-2xl bg-brand/20 blur-md animate-pulse-glow" />
                  </span>
                  <div className="text-lg font-medium text-white">Your path is fanning open…</div>
                  <div className="max-w-md text-sm text-mute">
                    Reading across your answers to open a universe of route candidates — including ones you may not
                    have named yourself.
                  </div>
                </div>
              </Card>
            </Section>
          ) : (
            <RevealView
              reveal={reveal}
              graph={graph}
              walked={answered.filter((a) => !a.skipped).length}
              editDecision={editDecision}
              setEditDecision={setEditDecision}
              primaryIds={primaryIds}
              togglePrimary={togglePrimary}
              isAuto={isAuto}
              onOpenMap={openMap}
            />
          )}
        </motion.div>
      )}

      {!hydrated && null}
    </main>
  );
}

/* ------------------------------- sub-views -------------------------------- */

function JourneyTrail({ phase, nodeNumber }: { phase: Phase; nodeNumber: number }) {
  const steps = [
    { key: "situation", label: "Situation" },
    { key: "questions", label: "Decision tree" },
    { key: "reveal", label: "Route universe" },
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
  graph,
  walked,
  editDecision,
  setEditDecision,
  primaryIds,
  togglePrimary,
  isAuto,
  onOpenMap,
}: {
  reveal: JourneyRevealResponse;
  graph: ReturnType<typeof buildDecisionGraph>;
  walked: number;
  editDecision: string;
  setEditDecision: (v: string) => void;
  primaryIds: string[];
  togglePrimary: (id: string) => void;
  isAuto: boolean;
  onOpenMap: () => void;
}) {
  const universe = reveal.universe ?? [];
  const canOpen = primaryIds.length === 3;
  return (
    <>
      <Section className="pt-10">
        <SectionTitle
          eyebrow="The path fans open here"
          title="Your journey opens into a route universe."
          subtitle="These are possibilities to weigh and test, not predictions — and not the only ones. Inspect the library, pick the three you want to simulate deeply, then open the map. Nothing here is decided for you."
        />
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner variant="compact" />
      </Section>

      {/* The fanned-open tree */}
      <Section className="pt-8">
        <DecisionGraphCanvas
          graph={graph}
          phase="reveal"
          question={null}
          loadingNext={false}
          loadingReveal={false}
          branches={[]}
          text=""
          setText={() => {}}
          onChoose={() => {}}
          onWalkForward={() => {}}
          onSkip={() => {}}
          canWalkForward={false}
          nodeNumber={0}
          totalNodes={0}
          isFinalNode={false}
        />
      </Section>

      {/* Arrival + decision review */}
      <Section className="pt-8">
        <Card>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex items-center gap-3 rounded-xl border border-brand/25 bg-brand/[0.05] px-4 py-3">
              <PixelTraveler accent="brand" size={20} />
              <div className="text-sm text-soft/90">
                You walked <span className="text-white">{walked} branch{walked === 1 ? "" : "es"}</span> — the path now
                fans into a <span className="text-white">{universe.length}-route universe</span> below.
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

      {/* Route universe library */}
      <Section className="pt-8">
        <p className="mb-4 max-w-2xl text-xs leading-relaxed text-mute">
          Each route is a meaningfully different strategy. The{" "}
          <span className="text-soft">evidence-fit score</span> shows how strongly a route matches your answers and the
          reference support behind it — <span className="text-soft">not a prediction</span>.{" "}
          <Link href="/evidence" className="text-brand-glow/80 underline-offset-2 hover:underline">
            See how the evidence base works →
          </Link>
        </p>
        {reveal.primarySelection && (
          <RouteUniverse
            universe={universe}
            primaryIds={primaryIds}
            onTogglePrimary={togglePrimary}
            selection={reveal.primarySelection}
            isAuto={isAuto}
          />
        )}
      </Section>

      {/* CTA */}
      <Section className="pt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              Your three primary routes enter deep simulation — the rest stay in the library as routes you can still
              explore.
            </div>
            <div className="text-sm text-mute">
              {canOpen
                ? "Opening the route map turns the three primary routes into a full simulation you can compare."
                : "Pick exactly three primary routes above to open the map."}
            </div>
          </div>
          <Button size="lg" onClick={onOpenMap} disabled={!canOpen}>
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
