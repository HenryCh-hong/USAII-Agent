"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { FutureBranch, Level } from "@/lib/types";
import { accentClasses, accentForBranch, cn, levelClasses } from "@/lib/utils";
import { PixelTraveler } from "@/components/shared/PixelTraveler";

/**
 * The Future Map hero: a single decision origin forking into three glowing
 * branch timelines, each with milestone ticks (now → ~12 months) and a clickable
 * destination pod carrying a compact calibration strip. Custom SVG (no React
 * Flow) for full control of the cinematic look.
 */

/** Sample the cubic Bezier used for each branch line, for milestone placement. */
function bezierPoint(t: number, tx: number): { x: number; y: number } {
  const mt = 1 - t;
  const x =
    mt * mt * mt * 500 + 3 * mt * mt * t * 500 + 3 * mt * t * t * tx + t * t * t * tx;
  const y =
    mt * mt * mt * 26 + 3 * mt * mt * t * 150 + 3 * mt * t * t * 150 + t * t * t * 300;
  return { x, y };
}

const MILESTONES = [0.4, 0.66, 0.9];

export function BranchMap({
  branches,
  explorerSize = 0,
}: {
  branches: FutureBranch[];
  /** When > 0, a pixel explorer "stands" at the decision fork (route-select cue). */
  explorerSize?: number;
}) {
  // Endpoint x-centers (as % of width) aligned to the SVG path targets below.
  const cols = [16.5, 50, 83.5];
  const targets = [165, 500, 835];

  return (
    <div className="relative w-full">
      {/* Vertical time axis cue */}
      <div className="pointer-events-none absolute left-0 top-2 bottom-12 hidden flex-col justify-between sm:flex">
        <span className="mono-label">now</span>
        <span className="mono-label">+12 mo</span>
      </div>

      <div className="relative h-[320px] w-full sm:h-[360px]">
        {/* Glowing connector lines + milestone ticks */}
        <svg
          viewBox="0 0 1000 340"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {branches.map((b, i) => {
            const accent = accentClasses(accentForBranch(b.id, i));
            const tx = targets[i];
            const d = `M500,26 C500,150 ${tx},150 ${tx},300`;
            return (
              <g key={b.id} filter="url(#glow)">
                <path
                  d={d}
                  fill="none"
                  stroke={accent.stroke}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="branch-line"
                  style={{ animationDelay: `${i * 0.18}s`, opacity: 0.85 }}
                />
                {MILESTONES.map((t, mi) => {
                  const p = bezierPoint(t, tx);
                  return (
                    <circle
                      key={mi}
                      cx={p.x}
                      cy={p.y}
                      r={2.2}
                      fill={accent.stroke}
                      opacity={0.9}
                    />
                  );
                })}
              </g>
            );
          })}
          {/* origin pulse */}
          <circle cx="500" cy="26" r="6" fill="#7c8cff" filter="url(#glow)" />
          <circle cx="500" cy="26" r="12" fill="none" stroke="#7c8cff" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Origin: a pixel explorer standing at the decision fork + the origin label */}
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
          {explorerSize > 0 && (
            <PixelTraveler size={explorerSize} className="shrink-0" />
          )}
          <div className="rounded-full border border-brand/40 bg-void/80 px-3 py-1 text-[11px] font-medium text-brand-glow shadow-glow-sm backdrop-blur">
            {explorerSize > 0 ? "You're here · choose a route" : "Your decision today"}
          </div>
        </div>

        {/* Destination pods */}
        {branches.map((b, i) => {
          const accentKey = accentForBranch(b.id, i);
          const accent = accentClasses(accentKey);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
              className="absolute bottom-0 w-[30%] max-w-[230px] -translate-x-1/2"
              style={{ left: `${cols[i]}%` }}
            >
              <Link href={`/branch/${b.id}`} className="group block">
                <div
                  className={cn(
                    "rounded-xl border bg-panel/80 p-3 text-center backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1",
                    accent.border,
                    accent.glow,
                    accent.glowHover,
                  )}
                >
                  <div className={cn("text-[11px] font-semibold uppercase tracking-wider", accent.text)}>
                    {b.track}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm font-medium text-white">
                    {b.title}
                  </div>
                  <CalibStrip
                    levels={[
                      ["E", b.calibration.evidenceStrength],
                      ["F", b.calibration.userFit],
                      ["C", b.calibration.constraintRisk],
                      ["U", b.calibration.uncertaintyLevel],
                    ]}
                  />
                  <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100", accent.text)}>
                    Open branch <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-mute/80">
        Branches are evidence-grounded future scripts — plausible, not deterministic
        predictions. E·F·C·U = evidence · fit · constraint-risk · uncertainty.
      </p>
    </div>
  );
}

/** Compact 4-letter calibration strip (evidence / fit / constraint / uncertainty). */
function CalibStrip({ levels }: { levels: [string, Level][] }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-2.5">
      {levels.map(([letter, level]) => (
        <span
          key={letter}
          className="inline-flex items-center gap-1"
          title={`${letter} · ${level}`}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", levelClasses(level).dot)} />
          <span className="mono-label !tracking-normal">{letter}</span>
        </span>
      ))}
    </div>
  );
}
