import {
  ArrowRight,
  HelpCircle,
  GitFork,
  BookOpen,
  ScrollText,
  Radar,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import type { FutureBranch, UserContext } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Decision Delta — a before/after impact surface. Everything on the "after" side
 * is a real count derived from the branches the system actually produced (no
 * fabricated metrics), making the move from vague uncertainty to structured,
 * testable action visible. Pure presentation: derives from existing
 * context + branch data, so it touches no intelligence-layer code.
 */
export function DecisionDelta({
  context,
  branches,
  compact = false,
}: {
  context: UserContext;
  branches: FutureBranch[];
  compact?: boolean;
}) {
  const evidenceCount = branches.reduce((n, b) => n + b.evidenceCards.length, 0);
  const sourcedCount = branches.reduce(
    (n, b) => n + b.evidenceCards.filter((c) => c.sourceName).length,
    0,
  );
  const assumptionsCount = branches.reduce((n, b) => n + b.assumptions.length, 0);
  const uncertaintyCount = branches.reduce(
    (n, b) => n + (b.reasoningAuditTrail?.uncertaintyDrivers.length ?? 0),
    0,
  );

  const before: { icon: LucideIcon; text: string }[] = [
    { icon: HelpCircle, text: `${context.options.length} options, weighed mostly by gut feeling` },
    { icon: HelpCircle, text: "Hidden tradeoffs and opportunity costs unnamed" },
    { icon: HelpCircle, text: "Assumptions untested and untagged — fact and guess blurred" },
    { icon: HelpCircle, text: "Uncertainty felt, but never made explicit" },
    { icon: HelpCircle, text: "No concrete next step to take this week" },
  ];

  const after: { icon: LucideIcon; text: string }[] = [
    { icon: GitFork, text: `${branches.length} future branches, opened side by side` },
    {
      icon: BookOpen,
      text: `${evidenceCount} evidence cards${sourcedCount ? ` (${sourcedCount} from official sources)` : ""}, with provenance`,
    },
    { icon: ScrollText, text: `${assumptionsCount} assumptions tagged by provenance, each with a way to test it` },
    {
      icon: Radar,
      text: uncertaintyCount
        ? `${uncertaintyCount} uncertainty drivers surfaced, not hidden`
        : "Uncertainty surfaced per branch, not hidden",
    },
    { icon: FlaskConical, text: `${branches.length} validation experiments to run this week` },
  ];

  return (
    <div
      className={cn(
        "grid items-stretch gap-4 rounded-2xl border border-line/70 bg-panel/40 p-5 backdrop-blur-xl md:grid-cols-[1fr_auto_1fr] md:gap-2 md:p-6",
      )}
    >
      {/* Before */}
      <div className="space-y-3">
        <div className="mono-label">Before Forked Futures</div>
        <ul className="space-y-2.5">
          {before.map((row, i) => {
            const Icon = row.icon;
            return (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-mute">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mute/70" />
                <span>{row.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center py-1 md:px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-brand-glow">
          <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
        </span>
      </div>

      {/* After */}
      <div className="space-y-3">
        <div className="mono-label text-brand-glow/80">After Forked Futures</div>
        <ul className="space-y-2.5">
          {after.map((row, i) => {
            const Icon = row.icon;
            return (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-soft">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow/80" />
                <span>{row.text}</span>
              </li>
            );
          })}
        </ul>
        {!compact && (
          <p className="mono-label pt-1">
            Same decision, still yours — now structured, evidenced, and testable.
          </p>
        )}
      </div>
    </div>
  );
}
