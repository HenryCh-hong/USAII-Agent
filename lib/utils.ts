import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Level = "low" | "medium" | "high";

/** Maps a qualitative level to a 0..1 fill used by bars/gauges. */
export function levelToFraction(level: Level): number {
  return level === "high" ? 1 : level === "medium" ? 0.6 : 0.3;
}

/** Tailwind text/bg/border tokens for a semantic level. */
export function levelClasses(level: Level): {
  text: string;
  bg: string;
  border: string;
  dot: string;
} {
  switch (level) {
    case "high":
      return {
        text: "text-high",
        bg: "bg-high/10",
        border: "border-high/40",
        dot: "bg-high",
      };
    case "medium":
      return {
        text: "text-medium",
        bg: "bg-medium/10",
        border: "border-medium/40",
        dot: "bg-medium",
      };
    default:
      return {
        text: "text-low",
        bg: "bg-low/10",
        border: "border-low/40",
        dot: "bg-low",
      };
  }
}

export type BranchAccent = "quant" | "startup" | "research";

/** Per-branch accent tokens, derived from branch index when track is unknown. */
export function accentFor(index: number): BranchAccent {
  return (["quant", "startup", "research"] as const)[index % 3];
}

export function accentClasses(accent: BranchAccent) {
  const map = {
    quant: {
      text: "text-quant",
      ring: "ring-quant/40",
      border: "border-quant/40",
      bg: "bg-quant/10",
      glow: "shadow-[0_0_40px_-10px_rgba(94,234,212,0.5)]",
      // Static hover-glow literal (must be a full class, never interpolated, or JIT purges it).
      glowHover: "group-hover:shadow-[0_0_40px_-10px_rgba(94,234,212,0.5)]",
      stroke: "#5eead4",
      from: "from-quant/20",
    },
    startup: {
      text: "text-startup",
      ring: "ring-startup/40",
      border: "border-startup/40",
      bg: "bg-startup/10",
      glow: "shadow-[0_0_40px_-10px_rgba(252,166,90,0.5)]",
      glowHover: "group-hover:shadow-[0_0_40px_-10px_rgba(252,166,90,0.5)]",
      stroke: "#fca65a",
      from: "from-startup/20",
    },
    research: {
      text: "text-research",
      ring: "ring-research/40",
      border: "border-research/40",
      bg: "bg-research/10",
      glow: "shadow-[0_0_40px_-10px_rgba(192,132,252,0.5)]",
      glowHover: "group-hover:shadow-[0_0_40px_-10px_rgba(192,132,252,0.5)]",
      stroke: "#c084fc",
      from: "from-research/20",
    },
  };
  return map[accent];
}

/** Stable accent for a known branch id, falling back to index. */
export function accentForBranch(id: string, index: number): BranchAccent {
  if (id.includes("quant")) return "quant";
  if (id.includes("startup")) return "startup";
  if (id.includes("research") || id.includes("grad")) return "research";
  return accentFor(index);
}
