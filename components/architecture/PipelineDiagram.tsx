"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Cpu,
  GitFork,
  FlaskConical,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = {
  step: number;
  kicker: string;
  title: string;
  icon: LucideIcon;
  body: string;
  items: string[];
  accent: {
    text: string;
    border: string;
    glow: string;
    bg: string;
  };
};

const STAGES: Stage[] = [
  {
    step: 1,
    kicker: "Input",
    title: "Your context",
    icon: ClipboardList,
    body: "The intake decision, options, values, constraints, fears — plus your answers to AI-generated clarifying questions.",
    items: ["Decision + options", "Values & constraints", "Clarifying answers"],
    accent: {
      text: "text-quant",
      border: "border-quant/40",
      glow: "shadow-[0_0_40px_-12px_rgba(94,234,212,0.45)]",
      bg: "bg-quant/10",
    },
  },
  {
    step: 2,
    kicker: "Reasoning",
    title: "Multi-agent debate",
    icon: Cpu,
    body: "Nine specialised roles retrieve evidence, traverse the graph, build scenarios, debate optimist vs skeptic, calibrate, and safety-check — emitted as one structured, auditable record.",
    items: ["Context → Retrieval → Evidence", "Scenario → Optimist ⇄ Skeptic", "Calibration → Safety → Synthesis"],
    accent: {
      text: "text-brand-glow",
      border: "border-brand/40",
      glow: "shadow-[0_0_40px_-12px_rgba(99,102,241,0.5)]",
      bg: "bg-brand/10",
    },
  },
  {
    step: 3,
    kicker: "Output",
    title: "Three futures",
    icon: GitFork,
    body: "Three evidence-grounded branches, each with qualitative calibration — evidence strength, fit, constraint risk, uncertainty — and no fabricated probabilities.",
    items: ["3 plausible branches", "Provenance-tagged claims", "Qualitative calibration"],
    accent: {
      text: "text-research",
      border: "border-research/40",
      glow: "shadow-[0_0_40px_-12px_rgba(192,132,252,0.45)]",
      bg: "bg-research/10",
    },
  },
  {
    step: 4,
    kicker: "Action",
    title: "Test, then decide",
    icon: FlaskConical,
    body: "Each branch ships a 7-day experiment with kill criteria, and a Decision Brief frames what the AI will not decide — so the call stays with you.",
    items: ["7-day experiments", "Kill criteria", "Decision Brief"],
    accent: {
      text: "text-startup",
      border: "border-startup/40",
      glow: "shadow-[0_0_40px_-12px_rgba(252,166,90,0.45)]",
      bg: "bg-startup/10",
    },
  },
];

/**
 * Visual input → reasoning → output → action flow. Numbered stages with glowing
 * connectors; stacks vertically on small screens, flows horizontally on lg+.
 */
export function PipelineDiagram({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-2",
        className,
      )}
    >
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        return (
          <div key={stage.step} className="contents">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-panel/60 p-5 backdrop-blur-xl",
                stage.accent.border,
                stage.accent.glow,
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold",
                    stage.accent.border,
                    stage.accent.bg,
                    stage.accent.text,
                  )}
                >
                  {stage.step}
                </span>
                <div>
                  <div
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.18em]",
                      stage.accent.text,
                    )}
                  >
                    {stage.kicker}
                  </div>
                  <div className="text-sm font-semibold text-white">{stage.title}</div>
                </div>
                <Icon className={cn("ml-auto h-5 w-5 shrink-0", stage.accent.text)} />
              </div>

              <p className="mt-3.5 text-sm leading-relaxed text-soft/85">{stage.body}</p>

              <ul className="mt-4 space-y-1.5">
                {stage.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-center gap-2 text-xs text-mute"
                  >
                    <span
                      className={cn("h-1 w-1 shrink-0 rounded-full", stage.accent.bg, stage.accent.text)}
                      style={{ backgroundColor: "currentColor" }}
                    />
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>

            {i < STAGES.length - 1 && (
              <div
                aria-hidden
                className="flex items-center justify-center text-mute/50 lg:px-1"
              >
                <ChevronRight className="hidden h-5 w-5 lg:block" />
                <ChevronRight className="h-5 w-5 rotate-90 lg:hidden" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
