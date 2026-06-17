import { GitFork, BookOpen, ScrollText, ShieldX, FlaskConical, HeartHandshake } from "lucide-react";
import type { FutureBranch } from "@/lib/types";
import { CockpitPanel } from "@/components/ui/CockpitPanel";

/**
 * A warm end-of-run summary — what this future run covered — framed as
 * exploration, with the human kept in control. Counts derive from real branch
 * data (no fake scores, no XP, no leaderboard).
 */
export function FutureRunSummary({ branches }: { branches: FutureBranch[] }) {
  const evidence = branches.reduce((n, b) => n + b.evidenceCards.length, 0);
  const assumptions = branches.reduce((n, b) => n + b.assumptions.length, 0);
  const setAside = branches.reduce((n, b) => n + (b.rejectedOverclaims?.length ?? 0), 0);
  const quests = branches.length;

  const stats: { icon: typeof GitFork; n: number; label: string }[] = [
    { icon: GitFork, n: branches.length, label: "paths explored" },
    { icon: BookOpen, n: evidence, label: "evidence cards checked" },
    { icon: ScrollText, n: assumptions, label: "assumptions surfaced" },
    { icon: ShieldX, n: setAside, label: "weak claims set aside" },
    { icon: FlaskConical, n: quests, label: "next quests unlocked" },
  ];

  return (
    <CockpitPanel label="Future Run · what you explored" icon={GitFork} accent="brand" status="run complete">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-line/60 bg-white/[0.02] p-3 text-center">
              <Icon className="mx-auto h-4 w-4 text-brand-glow/80" />
              <div className="mt-1 text-xl font-semibold text-white">{s.n}</div>
              <div className="mono-label !tracking-normal mt-0.5 leading-tight">{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand/25 bg-brand/[0.06] px-4 py-3">
        <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
        <p className="text-sm leading-relaxed text-soft/90">
          You explored these futures — you weren&apos;t handed an answer. Treat this
          run as a map to test this week, not a verdict to obey. The decision stays
          yours.
        </p>
      </div>
    </CockpitPanel>
  );
}
