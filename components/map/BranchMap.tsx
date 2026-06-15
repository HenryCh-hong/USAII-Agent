"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { FutureBranch } from "@/lib/types";
import { accentClasses, accentForBranch, cn } from "@/lib/utils";
import { Dot } from "@/components/ui/Primitives";

/**
 * The Future Map hero: a single decision origin forking into three glowing
 * branch lines, each ending in a clickable destination pod. Custom SVG (no
 * React Flow) for full control of the cinematic look.
 */
export function BranchMap({ branches }: { branches: FutureBranch[] }) {
  // Endpoint x-centers (as % of width) aligned to the SVG path targets below.
  const cols = [16.5, 50, 83.5];
  const targets = [165, 500, 835];

  return (
    <div className="relative w-full">
      <div className="relative h-[300px] w-full sm:h-[340px]">
        {/* Glowing connector lines */}
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

        {/* Origin label */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-full border border-brand/40 bg-void/80 px-3 py-1 text-[11px] font-medium text-brand-glow shadow-glow-sm backdrop-blur">
            Your decision today
          </div>
        </div>

        {/* Destination pods */}
        {branches.map((b, i) => {
          const accent = accentClasses(accentForBranch(b.id, i));
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
                    `group-hover:${accent.glow}`,
                    accent.glow,
                  )}
                >
                  <div className={cn("text-[11px] font-semibold uppercase tracking-wider", accent.text)}>
                    {b.track}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm font-medium text-white">
                    {b.title}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-mute">
                    <Dot level={b.calibration.uncertaintyLevel} />
                    <span className="capitalize">{b.calibration.uncertaintyLevel} uncertainty</span>
                  </div>
                  <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100", accent.text)}>
                    Open branch <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
