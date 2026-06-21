"use client";

/**
 * DecisionGraphCanvas — the horizontal, left-to-right decision GRAPH.
 *
 * This is the product model made visible: the journey is a map you walk, not a
 * vertical question list. The origin sits far left; each answered fork keeps its
 * chosen station on the centre line and its unchosen options as greyed "roads not
 * taken" above and below; the current question is a glowing node whose answer
 * choices fan out to the RIGHT as physical branch gates you click to walk
 * forward; a fog node marks the path ahead; and at reveal the tree fans open into
 * the route universe at the far right. The pixel traveler rides the current node
 * and glides rightward as you advance.
 *
 * Layout is pure data from lib/journey/graph (every node carries an absolute
 * x/y); this component only renders — absolute-positioned divs + SVG connectors,
 * no graph library. Live answer gates and the fog marker are laid out here since
 * they are ephemeral. Motion is framer-motion (traveler via shared layoutId; all
 * bobbing respects prefers-reduced-motion via the .traveler-bob CSS rule).
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  HelpCircle,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PixelTraveler } from "@/components/shared/PixelTraveler";
import { cn } from "@/lib/utils";
import { NODE_W } from "@/lib/journey/graph";
import type { DecisionGraphNode, DecisionGraphState } from "@/lib/journey/graph";
import type { JourneyQuestion } from "@/lib/journey/types";

const HALF_CARD = 44; // vertical half-extent reserved per node, for bounds
const GATE_DX = 232; // how far right of the current node the gate fan starts (clears the bubble)
const GATE_W = 170;
const GATE_GAP = 56; // vertical gap between stacked gates
const PAD = 56;

export interface DecisionGraphCanvasProps {
  graph: DecisionGraphState;
  phase: "questions" | "reveal";
  question: JourneyQuestion | null;
  loadingNext: boolean;
  loadingReveal: boolean;
  showOptions: boolean;
  showText: boolean;
  options: string[];
  text: string;
  setText: (v: string) => void;
  onChoose: (option: string) => void;
  onWalkForward: () => void;
  onSkip: () => void;
  canWalkForward: boolean;
  nodeNumber: number;
  totalNodes: number;
}

export function DecisionGraphCanvas(props: DecisionGraphCanvasProps) {
  const {
    graph,
    phase,
    question,
    loadingNext,
    loadingReveal,
    showOptions,
    showText,
    options,
    text,
    setText,
    onChoose,
    onWalkForward,
    onSkip,
    canWalkForward,
    nodeNumber,
    totalNodes,
  } = props;

  const current = graph.nodes.find((n) => n.id === "current") ?? null;
  const showBubble = phase === "questions" && !!question && !loadingNext && !loadingReveal;

  // Live answer gates fan out to the right of the current node (ephemeral layout).
  const gates = useMemo(() => {
    if (!current || !showBubble || !showOptions) return [];
    const n = options.length;
    const gateX = current.x + GATE_DX;
    return options.map((label, i) => ({
      label,
      x: gateX,
      y: current.y + (i - (n - 1) / 2) * GATE_GAP,
    }));
  }, [current, showBubble, showOptions, options]);

  // The fog marker sits just past the live gates (or past the current node).
  const fog = useMemo(() => {
    if (phase !== "questions" || !current) return null;
    const baseX = gates.length ? gates[0].x + GATE_W + 70 : current.x + 300;
    return { x: baseX, y: current.y };
  }, [phase, current, gates]);

  /* ------------------------------- bounds -------------------------------- */
  const layout = useMemo(() => {
    let maxX = 0;
    let extent = 120;
    const consider = (x: number, y: number, w: number, half: number) => {
      maxX = Math.max(maxX, x + w);
      extent = Math.max(extent, Math.abs(y) + half);
    };
    for (const node of graph.nodes) {
      if (node.id === "fog") continue; // fog rendered separately in questions phase
      const half = node.id === "current" && showBubble ? 96 : HALF_CARD;
      consider(node.x, node.y, NODE_W, half);
    }
    for (const g of gates) consider(g.x, g.y, GATE_W, 26);
    if (fog) consider(fog.x, fog.y, 130, 30);
    const centerY = extent + PAD / 2;
    return { width: maxX + PAD, height: centerY * 2, centerY };
  }, [graph.nodes, gates, fog, showBubble]);

  const cx = (node: { x: number }) => node.x + NODE_W / 2;
  const cy = (node: { y: number }) => layout.centerY + node.y;

  // Edge endpoints by node id (skip fog edges — fog is drawn relative to gates).
  const nodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-panel/30 p-3 backdrop-blur-xl sm:p-4">
      {/* faint coordinate grid for the "map" feel */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-[0.18]" style={{ backgroundSize: "34px 34px" }} />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-void/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-void/70 to-transparent" />

      <div className="relative mb-2 flex items-center justify-between px-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-glow/80">
          <Compass className="h-3.5 w-3.5" /> Decision-tree map · left to right
        </span>
        <span className="text-[11px] text-mute">
          {phase === "reveal"
            ? "the tree fans open →"
            : `Node ${Math.min(nodeNumber, totalNodes)} of ~${totalNodes}`}
        </span>
      </div>

      {/* horizontally scrollable canvas */}
      <div className="relative overflow-x-auto overflow-y-hidden pb-2">
        <div className="relative" style={{ width: layout.width, height: layout.height, minWidth: "100%" }}>
          {/* edges */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={layout.width}
            height={layout.height}
            aria-hidden
          >
            <defs>
              <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {graph.edges.map((e) => {
              if (e.to === "fog") return null;
              const a = nodeById.get(e.from);
              const b = nodeById.get(e.to);
              if (!a || !b) return null;
              const ax = cx(a);
              const ay = cy(a);
              const bx = cx(b);
              const by = cy(b);
              const dx = Math.max(40, (bx - ax) * 0.45);
              const d = `M ${ax} ${ay} C ${ax + dx} ${ay} ${bx - dx} ${by} ${bx} ${by}`;
              const primary = (b.metadata?.isPrimary as boolean) ?? false;
              const style = edgeStyle(e.status, primary);
              return (
                <path
                  key={e.id}
                  d={d}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash}
                  strokeLinecap="round"
                  opacity={style.opacity}
                  filter={e.status === "chosen" || (e.status === "revealed" && primary) ? "url(#edge-glow)" : undefined}
                />
              );
            })}

            {/* live gate connectors (bracket fork from the current node) */}
            {current &&
              gates.map((g, i) => {
                const ax = cx(current) + 16;
                const ay = cy(current);
                const bx = g.x;
                const by = layout.centerY + g.y;
                const dx = Math.max(36, (bx - ax) * 0.5);
                return (
                  <path
                    key={`gate-edge-${i}`}
                    d={`M ${ax} ${ay} C ${ax + dx} ${ay} ${bx - dx} ${by} ${bx} ${by}`}
                    fill="none"
                    stroke="#38e0d0"
                    strokeWidth={2.2}
                    opacity={0.7}
                    strokeLinecap="round"
                  />
                );
              })}

            {/* dotted thread to the fog node ahead */}
            {fog && current && (
              <path
                d={`M ${cx(current)} ${cy(current)} C ${cx(current) + 120} ${cy(current)} ${fog.x - 40} ${layout.centerY + fog.y} ${fog.x + 8} ${layout.centerY + fog.y}`}
                fill="none"
                stroke="#38e0d0"
                strokeWidth={1.3}
                strokeDasharray="1 7"
                opacity={0.3}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* nodes */}
          {graph.nodes.map((node) => {
            if (node.id === "fog") return null;
            if (node.id === "current" && showBubble && question) {
              return (
                <CurrentNode
                  key={node.id}
                  node={node}
                  left={node.x}
                  top={cy(node)}
                  question={question}
                  nodeNumber={nodeNumber}
                  totalNodes={totalNodes}
                />
              );
            }
            return (
              <NodeCard key={node.id} node={node} left={node.x} top={cy(node)} loadingReveal={loadingReveal} loadingNext={loadingNext} />
            );
          })}

          {/* live gates */}
          {gates.map((g, i) => (
            <button
              key={`gate-${i}`}
              type="button"
              onClick={() => onChoose(g.label)}
              className="group/gate absolute z-20 flex items-center justify-between gap-2 rounded-xl border border-line/70 bg-white/[0.035] px-3.5 py-2.5 text-left text-[14px] font-medium leading-snug text-soft shadow-sm backdrop-blur-sm transition-all hover:-translate-y-px hover:border-brand/60 hover:bg-brand/[0.1] hover:text-white hover:shadow-glow-sm"
              style={{ left: g.x, top: layout.centerY + g.y, width: GATE_W, transform: "translateY(-50%)" }}
            >
              <span className="line-clamp-2">{g.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-glow/30 transition-colors group-hover/gate:text-brand-glow" />
            </button>
          ))}

          {/* fog marker (questions phase) */}
          {fog && (
            <div
              className="absolute z-10 flex w-[130px] -translate-y-1/2 items-center gap-1.5 rounded-xl border border-dashed border-mute/35 px-3 py-2 text-[11px] italic text-mute/45 blur-[0.3px]"
              style={{ left: fog.x, top: layout.centerY + fog.y }}
            >
              <HelpCircle className="h-3.5 w-3.5 shrink-0" />
              {loadingNext ? "the path is forming…" : "the path ahead"}
            </div>
          )}

          {/* loading marker on the current node when fetching */}
          {phase === "questions" && current && (loadingNext || loadingReveal) && !showBubble && (
            <div
              className="absolute z-20 flex w-[200px] -translate-y-1/2 items-center gap-2 rounded-xl border border-line/60 bg-panel/80 px-3 py-2.5 text-xs text-mute"
              style={{ left: current.x, top: cy(current) }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
              {loadingReveal ? "reading the shape of your fork…" : "following the thread…"}
            </div>
          )}
        </div>
      </div>

      {/* controls — type your own path / skip (attached below the rail) */}
      {showBubble && question && (
        <div className="relative mt-1 flex flex-col gap-2 rounded-2xl border border-line/50 bg-void/30 px-3 py-3 sm:flex-row sm:items-center sm:gap-3">
          <details className="group shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] text-brand-glow/80 transition-colors hover:text-brand-glow">
              <Lightbulb className="h-3.5 w-3.5" /> Why this question
            </summary>
            <p className="mt-1.5 max-w-md rounded-lg border border-brand/20 bg-brand/[0.05] px-3 py-2 text-[11px] leading-relaxed text-soft/90">
              {question.whyThisQuestion}
            </p>
          </details>
          {showText && (
            <div className="flex flex-1 items-start gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={1}
                placeholder={showOptions ? "…or walk your own path in words" : "Answer in your own words…"}
                className="min-h-[40px] flex-1 resize-y rounded-xl border border-line/70 bg-void/40 px-3 py-2 text-[13px] leading-relaxed text-white placeholder:text-mute/60 transition-colors focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="button"
                onClick={onWalkForward}
                disabled={!canWalkForward}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-[13px] font-medium text-white transition-all hover:bg-brand/20 disabled:opacity-40"
              >
                Walk <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 text-[11px] text-mute transition-colors hover:text-soft"
          >
            skip this node
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- nodes ---------------------------------- */

function CurrentNode({
  node,
  left,
  top,
  question,
  nodeNumber,
  totalNodes,
}: {
  node: DecisionGraphNode;
  left: number;
  top: number;
  question: JourneyQuestion;
  nodeNumber: number;
  totalNodes: number;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute z-30 -translate-y-1/2"
      style={{ left, top, width: 218 }}
    >
      {/* traveler + you-are-here */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <motion.span layoutId="journey-traveler" transition={{ type: "spring", stiffness: 320, damping: 30 }}>
          <PixelTraveler accent="brand" size={22} />
        </motion.span>
        <span className="inline-flex items-center gap-1 rounded-full border border-brand/45 bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-glow">
          <span className="h-1 w-1 rounded-full bg-brand-glow animate-pulse-glow" /> You are here
        </span>
      </div>
      <div className="relative rounded-2xl border border-brand/55 bg-panel/90 p-3.5 shadow-glow">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-glow/75">
          Node {Math.min(nodeNumber, totalNodes)} · the fork
        </div>
        <h2 className="mt-1 text-[15.5px] font-semibold leading-snug text-white">{question.prompt}</h2>
        {(question.whatItSeparates?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(question.whatItSeparates ?? []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded border border-line/60 bg-white/[0.03] px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-mute"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-brand-glow/55">choose a branch →</div>
      </div>
    </motion.div>
  );
}

function NodeCard({
  node,
  left,
  top,
  loadingReveal,
  loadingNext,
}: {
  node: DecisionGraphNode;
  left: number;
  top: number;
  loadingReveal: boolean;
  loadingNext: boolean;
}) {
  const base = "absolute -translate-y-1/2";
  const style = { left, top, width: NODE_W } as const;

  if (node.kind === "origin") {
    return (
      <div className={cn(base, "z-10")} style={style}>
        <div className="rounded-2xl border border-brand/30 bg-brand/[0.06] p-3">
          <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-brand-glow/70">
            <Sparkles className="h-3 w-3" /> Origin · your situation
          </div>
          <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-soft/90">{node.answer}</p>
        </div>
      </div>
    );
  }

  if (node.kind === "ghost_choice") {
    return (
      <div className={cn(base, "z-10 opacity-65")} style={style}>
        <div className="flex items-center gap-1.5 rounded-xl border border-dashed border-mute/35 bg-white/[0.015] px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-mute/45" />
          <span className="line-clamp-1 text-[11.5px] text-mute/85" title={node.label}>
            {node.label}
          </span>
        </div>
        <div className="mt-0.5 pl-3 text-[9px] font-medium uppercase tracking-wider text-mute/55">Road not taken</div>
      </div>
    );
  }

  if (node.kind === "choice") {
    const skipped = node.metadata?.skipped as boolean | undefined;
    return (
      <div className={cn(base, "z-10")} style={style}>
        <div className="text-[9px] font-semibold uppercase tracking-wider text-mute">{node.label}</div>
        {skipped ? (
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-mute/40 px-2.5 py-1.5 text-[11px] italic text-mute">
            skipped
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-1.5 rounded-xl border border-brand/55 bg-brand/[0.12] px-2.5 py-1.5 shadow-glow-sm">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-brand/60 bg-brand/30">
              <Check className="h-2.5 w-2.5 text-brand-glow" />
            </span>
            <span className="line-clamp-2 text-[12.5px] font-medium text-white" title={node.answer}>
              {node.answer}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (node.kind === "route_universe") {
    return (
      <div className={cn(base, "z-20")} style={style}>
        <div className="rounded-2xl border border-brand/45 bg-panel/85 p-3 text-center shadow-glow-sm">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-brand-glow/80">Route universe</div>
          <div className="mt-1 text-[13px] font-semibold text-white">{node.label}</div>
          <div className="mt-0.5 text-[10px] text-mute">3 enter deep simulation</div>
        </div>
      </div>
    );
  }

  if (node.kind === "route_candidate" || node.kind === "primary_route") {
    const primary = node.kind === "primary_route";
    return (
      <div className={cn(base, "z-10")} style={{ left, top, width: NODE_W - 12 }}>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5",
            primary ? "border-brand/50 bg-brand/[0.1]" : "border-line/55 bg-white/[0.02]",
          )}
        >
          {primary && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow shadow-glow-sm" />}
          <span className={cn("line-clamp-1 text-[11px]", primary ? "font-medium text-white" : "text-soft/85")} title={node.label}>
            {node.label}
          </span>
        </div>
        {primary && <div className="mt-0.5 pl-3 text-[8px] uppercase tracking-wider text-brand-glow/60">primary</div>}
      </div>
    );
  }

  // question (current handled separately) / future fall-through
  return (
    <div className={cn(base, "z-10")} style={style}>
      <div className="flex items-center gap-1.5 rounded-xl border border-line/60 bg-white/[0.02] px-2.5 py-2 text-[11px] text-mute">
        <Loader2 className={cn("h-3.5 w-3.5", (loadingNext || loadingReveal) && "animate-spin text-brand-glow")} />
        {node.label}
      </div>
    </div>
  );
}

/* --------------------------------- styles --------------------------------- */

function edgeStyle(status: string, primary: boolean): {
  stroke: string;
  width: number;
  dash?: string;
  opacity: number;
} {
  switch (status) {
    case "chosen":
      return { stroke: "#38e0d0", width: 3.2, opacity: 1 };
    case "unchosen":
      return { stroke: "#5d6675", width: 1.4, dash: "4 5", opacity: 0.45 };
    case "revealed":
      return primary
        ? { stroke: "#38e0d0", width: 2.2, opacity: 0.85 }
        : { stroke: "#5d6675", width: 1.5, opacity: 0.5 };
    default:
      return { stroke: "#38e0d0", width: 1.3, dash: "1 7", opacity: 0.3 };
  }
}
