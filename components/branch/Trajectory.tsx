"use client";

import { motion } from "framer-motion";
import { CircleDot, HelpCircle } from "lucide-react";
import type { TimelineItem } from "@/lib/types";
import { accentClasses, cn, type BranchAccent } from "@/lib/utils";

/**
 * The 12-month trajectory as a vertical timeline. Each step pairs a plausible
 * description with an explicit uncertaintyNote, surfaced (not hidden) in a
 * muted, italic style with a small "uncertainty" marker.
 */
export function Trajectory({
  items,
  accentKey,
}: {
  items: TimelineItem[];
  accentKey: BranchAccent;
}) {
  const accent = accentClasses(accentKey);

  return (
    <ol className="relative space-y-6">
      {/* Connecting spine */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 w-px bg-line/60"
      />
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="relative pl-8"
        >
          <span className="absolute left-0 top-0.5">
            <CircleDot className={cn("h-3.5 w-3.5", accent.text)} />
          </span>
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-mute">
              {item.time}
            </div>
            <p className="text-sm leading-relaxed text-soft">{item.description}</p>
            <div className="flex items-start gap-1.5 rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2">
              <HelpCircle className="mt-0.5 h-3 w-3 shrink-0 text-mute/80" />
              <p className="text-xs italic leading-relaxed text-mute/90">
                <span className="not-italic font-medium uppercase tracking-wider text-mute/70">
                  Uncertainty ·{" "}
                </span>
                {item.uncertaintyNote}
              </p>
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
