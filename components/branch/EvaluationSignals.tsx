import { Activity } from "lucide-react";
import type { EvaluationSignal } from "@/lib/types";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { LevelBar } from "@/components/ui/Primitives";
import { LevelBadge } from "@/components/shared/LevelBadge";

/**
 * Qualitative self-check signals from the evaluation layer (groundedness,
 * hedging compliance, provenance coverage, calibration honesty). Levels are
 * qualitative only — no fabricated precision.
 */
export function EvaluationSignals({ signals }: { signals: EvaluationSignal[] }) {
  return (
    <CockpitPanel
      label="Evaluation Signals · self-check"
      icon={Activity}
      accent="quant"
      status="qualitative"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {signals.map((s) => (
          <div
            key={s.name}
            className="space-y-3 rounded-xl border border-line/60 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-white">{s.name}</span>
              <LevelBadge label="" level={s.level} />
            </div>
            <LevelBar level={s.level} />
            <p className="text-xs leading-relaxed text-mute/90">{s.note}</p>
          </div>
        ))}
      </div>
    </CockpitPanel>
  );
}
