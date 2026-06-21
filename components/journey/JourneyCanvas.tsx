"use client";

/**
 * JourneyCanvas — the MAP-FIRST guided-journey interface.
 *
 * The whole questions phase is this canvas: a foggy decision-tree path the user
 * walks. Past answers are stations on a highlighted path; the current node glows
 * and carries the question bubble itself; the answer choices are rendered as
 * BRANCH PATHS extending from that node — clicking a branch walks the traveler
 * forward. Unchosen options stay visible as greyed "unlived" branches. A blurry
 * "unknown" node sits ahead. Dark Signal Horizon theme, CSS/SVG only, no graph
 * library; motion is framer-motion (traveler glides via shared layout; bob
 * respects prefers-reduced-motion).
 *
 * All journey state + the fetch flow live in app/journey/page.tsx; this component
 * is presentational and calls back on interaction.
 */
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Flag,
  HelpCircle,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { PixelTraveler } from "@/components/shared/PixelTraveler";
import { cn } from "@/lib/utils";
import type { JourneyQuestion } from "@/lib/journey/types";

export interface JourneyNode {
  id: string;
  status: "answered" | "current" | "revealed";
  /** Short topic label for the node. */
  topic: string;
  /** Chosen answer (short), shown on answered nodes as the walked path. */
  answer?: string;
  /** True when the user skipped this node (rendered muted, not as a chosen path). */
  skipped?: boolean;
  /** Unchosen option labels — greyed "unlived" branches. */
  unchosen?: string[];
  /** At the reveal node: the possible destinations (not used inside the canvas). */
  routes?: { id: string; title: string }[];
}

export function JourneyCanvas({
  nodes,
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
}: {
  nodes: JourneyNode[];
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
}) {
  const spine = nodes.filter((n) => n.status !== "revealed");
  const travelerId = spine.find((n) => n.status === "current")?.id ?? spine[spine.length - 1]?.id;
  const showCurrentBubble = !!question && !loadingNext && !loadingReveal;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-panel/30 p-5 backdrop-blur-xl sm:p-7">
      {/* fog top/bottom */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-void/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-void/80 to-transparent" />

      <div className="relative mb-5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-glow/80">
          Decision-tree map
        </span>
        <span className="text-[11px] text-mute">
          Node {Math.min(nodeNumber, totalNodes)} of ~{totalNodes}
        </span>
      </div>

      <ol className="relative mx-auto max-w-2xl">
        {/* the walked spine */}
        <span className="absolute left-[15px] top-3 bottom-6 w-[2px] bg-gradient-to-b from-brand/50 via-brand/25 to-line/20" />

        {spine.map((node) => {
          const isCurrent = node.status === "current";
          return (
            <li key={node.id} className="relative pb-7 pl-12 last:pb-2">
              {/* station dot */}
              <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
                {isCurrent ? (
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand bg-brand/25 shadow-glow-sm">
                    <span className="absolute inset-0 rounded-full bg-brand/30 blur-md animate-pulse-glow" />
                  </span>
                ) : node.skipped ? (
                  <span className="mt-0.5 h-4 w-4 rounded-full border border-dashed border-mute/50" />
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand/60 bg-brand/30">
                    <Check className="h-2.5 w-2.5 text-brand-glow" />
                  </span>
                )}
              </span>

              {/* traveler — glides between stations */}
              {travelerId === node.id && (
                <motion.span
                  layoutId="journey-traveler"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="absolute left-[8px] -top-[13px] z-20"
                >
                  <PixelTraveler accent="brand" size={22} />
                </motion.span>
              )}

              {/* node content */}
              {isCurrent && showCurrentBubble && question ? (
                <>
                  {/* connector from the station dot into the question bubble */}
                  <span
                    aria-hidden
                    className="absolute left-[16px] top-[15px] z-0 h-[2px] w-8 bg-gradient-to-r from-brand/50 to-brand/30"
                  />
                  <CurrentNodeBubble
                  question={question}
                  showOptions={showOptions}
                  showText={showText}
                  options={options}
                  text={text}
                  setText={setText}
                  onChoose={onChoose}
                  onWalkForward={onWalkForward}
                  onSkip={onSkip}
                  canWalkForward={canWalkForward}
                  nodeNumber={nodeNumber}
                  totalNodes={totalNodes}
                  />
                </>
              ) : isCurrent ? (
                <div className="flex items-center gap-2 rounded-xl border border-line/60 bg-white/[0.02] px-4 py-3 text-sm text-mute">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
                  {loadingReveal ? "Reading the shape of your fork…" : "Following the thread from your last answer…"}
                </div>
              ) : (
                <AnsweredStation node={node} />
              )}
            </li>
          );
        })}

        {/* blurry unknown node ahead */}
        {!loadingReveal && (
          <li className="relative pl-12">
            <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
              <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-dashed border-mute/40">
                <HelpCircle className="h-2.5 w-2.5 text-mute/50" />
              </span>
            </span>
            <div className="select-none pt-0.5 text-xs italic text-mute/40 blur-[0.4px]">
              {loadingNext ? "the path is forming…" : "the path ahead is still fogged in"}
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}

/* ------------------------------ current node ------------------------------ */

function CurrentNodeBubble({
  question,
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
}: {
  question: JourneyQuestion;
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
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl border border-brand/40 bg-panel/70 p-4 shadow-glow-sm sm:p-5"
    >
      {/* bubble tail pointing back to the station */}
      <span className="absolute -left-[7px] top-4 h-3 w-3 rotate-45 border-b border-l border-brand/40 bg-panel/70" />

      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-glow/80">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-glow animate-pulse-glow" />
        You are here · Node {Math.min(nodeNumber, totalNodes)}
      </div>

      <h2 className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl">
        {question.prompt}
      </h2>

      {(question.whatItSeparates?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(question.whatItSeparates ?? []).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md border border-line/60 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <details className="group mt-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs text-brand-glow/80 transition-colors hover:text-brand-glow">
          <Lightbulb className="h-3.5 w-3.5" /> Why this question matters
        </summary>
        <p className="mt-1.5 rounded-lg border border-brand/20 bg-brand/[0.05] px-3 py-2 text-xs leading-relaxed text-soft/90">
          {question.whyThisQuestion}
        </p>
      </details>

      {/* branches */}
      <div className="mt-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-glow/60">
          {showOptions ? "Choose a branch to walk forward" : "Walk your own path forward"}
        </div>

        {showOptions && (
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChoose(opt)}
                className="group/branch flex w-full items-stretch text-left"
              >
                {/* elbow branch connector */}
                <span aria-hidden className="relative w-6 shrink-0">
                  <span className="absolute left-[9px] top-0 h-1/2 w-[2px] bg-brand/40 transition-colors group-hover/branch:bg-brand" />
                  <span className="absolute left-[9px] top-1/2 h-[2px] w-3.5 bg-brand/40 transition-colors group-hover/branch:bg-brand" />
                </span>
                <span className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-line/60 bg-white/[0.02] px-4 py-2.5 text-sm text-soft transition-all group-hover/branch:-translate-y-px group-hover/branch:border-brand/50 group-hover/branch:bg-brand/[0.07] group-hover/branch:text-white group-hover/branch:shadow-glow-sm">
                  <span>{opt}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-glow/0 transition-all group-hover/branch:text-brand-glow" />
                </span>
              </button>
            ))}
          </div>
        )}

        {showText && (
          <div className={cn("space-y-2", showOptions && "mt-2")}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder={showOptions ? "…or add your own in words (optional)" : "Answer in your own words…"}
              className="w-full resize-y rounded-xl border border-line/70 bg-void/40 px-3.5 py-2.5 text-sm leading-relaxed text-white placeholder:text-mute/60 transition-colors focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="button"
              onClick={onWalkForward}
              disabled={!canWalkForward}
              className="inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand/20 disabled:opacity-40"
            >
              Walk this path forward <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onSkip}
          className="mt-3 text-xs text-mute transition-colors hover:text-soft"
        >
          skip this node
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------ answered node ----------------------------- */

function AnsweredStation({ node }: { node: JourneyNode }) {
  return (
    <div className="pt-0.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mute">{node.topic}</div>
      {/* skipped node — muted, not a chosen path */}
      {node.skipped ? (
        <div className="mt-1 inline-flex items-center rounded-lg border border-dashed border-mute/40 px-2.5 py-1 text-xs italic text-mute">
          skipped this node
        </div>
      ) : node.answer ? (
        /* the chosen path — highlighted */
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/[0.08] px-2.5 py-1 text-sm text-white">
          <Flag className="h-3 w-3 text-brand-glow" />
          <span className="truncate" title={node.answer}>{node.answer}</span>
        </div>
      ) : null}
      {/* unchosen — greyed unlived branches */}
      {node.unchosen && node.unchosen.length > 0 && (
        <div className="mt-2 space-y-1">
          {node.unchosen.map((g, i) => (
            <div key={i} className="flex items-center gap-2 opacity-45">
              <span className="h-[2px] w-5 border-t border-dashed border-mute/50" />
              <span className="truncate rounded-md border border-mute/30 px-2 py-0.5 text-[11px] text-mute" title={g}>
                {g}
              </span>
            </div>
          ))}
          <div className="pl-7 text-[9px] uppercase tracking-wider text-mute/45">unlived branches</div>
        </div>
      )}
    </div>
  );
}
