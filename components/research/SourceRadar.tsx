import { Radar } from "lucide-react";
import type { ResearchSource } from "@/lib/research/types";
import type { ReliabilityTier } from "@/lib/research/corpus";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { cn } from "@/lib/utils";

const TIERS: { tier: ReliabilityTier; label: string; cls: string; note: string }[] = [
  { tier: "high", label: "High reliability", cls: "text-quant", note: "Official / statistical / established frameworks" },
  { tier: "medium", label: "Medium reliability", cls: "text-medium", note: "Cohort surveys, public career guidance (analogies)" },
  { tier: "low", label: "Low reliability", cls: "text-high", note: "Anecdotes, unverified or stale pages — not used as evidence" },
];

/**
 * Source Radar — sources bucketed by reliability tier so a judge can see at a
 * glance that the agent prefers official data and treats anecdotes as leads, not
 * evidence.
 */
export function SourceRadar({ sources }: { sources: ResearchSource[] }) {
  return (
    <CockpitPanel label="Source Radar · reliability tiers" icon={Radar} accent="quant" status={`${sources.length} sources`}>
      <div className="space-y-3">
        {TIERS.map((t) => {
          const inTier = sources.filter((s) => s.reliabilityTier === t.tier);
          const types = Array.from(new Set(inTier.map((s) => s.sourceType)));
          return (
            <div key={t.tier} className="rounded-xl border border-line/60 bg-white/[0.02] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold", t.cls)}>{t.label}</span>
                <span className="mono-label">{inTier.length} sources</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-mute">{t.note}</p>
              {types.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {types.map((ty) => (
                    <span key={ty} className="rounded-md border border-line/60 bg-white/[0.03] px-2 py-0.5 text-[10px] text-soft">
                      {ty.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CockpitPanel>
  );
}
