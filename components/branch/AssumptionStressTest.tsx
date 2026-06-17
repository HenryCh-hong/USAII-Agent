import { Activity, FlaskConical } from "lucide-react";
import type { Assumption, Level } from "@/lib/types";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { ClaimTag } from "@/components/shared/ClaimTag";
import { LevelBadge } from "@/components/shared/LevelBadge";

/**
 * Assumption Stress Test — makes the branch feel like a live simulator, not a
 * static report: for each assumption, a qualitative sensitivity (how much the
 * branch's case leans on an unverified claim) and the cheapest way to firm it up.
 * Fully derived from existing assumption data (type + confidence + howToTest) —
 * no probabilities, no new data, no intelligence-layer change.
 */

/** Higher sensitivity = the case leans more on a shakier/unverified claim. */
function sensitivity(a: Assumption): Level {
  if (a.type === "user_provided") return "low";
  if (a.type === "source_supported") return a.confidence === "low" ? "medium" : "low";
  // ai_inferred — a flagged inference; load-bearing when confidence is low.
  return a.confidence === "low" ? "high" : "medium";
}

const RANK: Record<Level, number> = { high: 2, medium: 1, low: 0 };

const IF_WEAKENS: Record<Level, string> = {
  high: "This path leans on an unverified inference here — if it doesn't hold, the case for this branch weakens materially.",
  medium: "Worth confirming — if this softens, parts of the case for this branch get shakier.",
  low: "Comparatively stable (you told us, or a source backs it) — lower risk to the overall case.",
};

export function AssumptionStressTest({ assumptions }: { assumptions: Assumption[] }) {
  const ranked = [...assumptions].sort((a, b) => RANK[sensitivity(b)] - RANK[sensitivity(a)]);

  return (
    <CockpitPanel
      label="Assumption Stress Test"
      icon={Activity}
      accent="startup"
      status="what if it fails?"
    >
      <p className="mb-4 text-sm leading-relaxed text-soft/85">
        A branch is only as strong as the assumptions under it. This stresses each
        one qualitatively — how much the case depends on it, and the cheapest way
        to firm it up before you commit. No probabilities; sensitivity reflects
        provenance and confidence, not a forecast.
      </p>
      <ul className="space-y-3">
        {ranked.map((a, i) => {
          const s = sensitivity(a);
          return (
            <li key={i} className="space-y-2 rounded-xl border border-line/60 bg-white/[0.02] p-4">
              <p className="text-sm leading-relaxed text-white">{a.claim}</p>
              <div className="flex flex-wrap items-center gap-2">
                <ClaimTag type={a.type} />
                <LevelBadge label="Sensitivity" level={s} />
              </div>
              <p className="text-xs leading-relaxed text-mute/90">{IF_WEAKENS[s]}</p>
              <div className="flex items-start gap-2 rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2">
                <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow/70" />
                <p className="text-xs leading-relaxed text-soft">
                  <span className="not-italic font-semibold uppercase tracking-wider text-mute/70">
                    Firm it up ·{" "}
                  </span>
                  {a.howToTest}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </CockpitPanel>
  );
}
