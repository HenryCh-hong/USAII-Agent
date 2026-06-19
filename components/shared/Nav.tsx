"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, RotateCcw, Telescope } from "lucide-react";
import { Logo } from "./Logo";
import { useForkedStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const reset = useForkedStore((s) => s.reset);

  const links = [
    { href: "/research", label: "Explore", icon: Telescope },
    { href: "/architecture", label: "How it works", icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/50 bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1.5">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active ? "text-white bg-white/5" : "text-mute hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            title="Reset this demo session and start over"
            className="ml-1.5 inline-flex items-center gap-1.5 rounded-lg border border-line/60 px-3 py-1.5 text-sm text-mute transition-colors hover:border-line hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart run
          </button>
        </nav>
      </div>
    </header>
  );
}

const STEPS = [
  { key: "intake", label: "Intake", href: "/intake" },
  { key: "questions", label: "Clarify", href: "/questions" },
  { key: "map", label: "Future Map", href: "/map" },
  { key: "brief", label: "Brief", href: "/brief" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

/** Journey stepper shown across the simulation flow. */
export function ProgressSteps({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href={step.href}
              className={cn(
                "group inline-flex items-center gap-2 text-xs sm:text-sm transition-colors",
                active ? "text-white" : done ? "text-soft hover:text-white" : "text-mute/60",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-all",
                  active
                    ? "border-brand bg-brand/20 text-white shadow-glow-sm"
                    : done
                      ? "border-brand/40 bg-brand/10 text-brand-glow"
                      : "border-line/70 text-mute/60",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </Link>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px w-4 sm:w-8 transition-colors",
                  i < currentIdx ? "bg-brand/50" : "bg-line/60",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
