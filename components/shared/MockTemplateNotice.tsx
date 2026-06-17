import { Info } from "lucide-react";
import type { SimulationResult } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Honest notice shown only on the keyless *adapted-template* path — i.e. when the
 * user ran their own decision without an API key, so the branch detail is the
 * curated template adapted to their options rather than fully generated. Hidden
 * for the rich Alex demo and for live generation. Prevents the system from
 * appearing to pass off the demo's specifics as the user's own.
 */
export function MockTemplateNotice({
  simulation,
  className,
}: {
  simulation: SimulationResult;
  className?: string;
}) {
  if (!simulation.mocked) return null;
  if (!/template/i.test(simulation.generatedNote)) return null; // rich demo note has no "template"
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-medium/30 bg-medium/[0.06] px-4 py-3",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-medium" />
      <p className="text-xs leading-relaxed text-soft/90">
        <span className="font-medium text-white">Illustrative template — no API key.</span>{" "}
        The branch detail here is an evidence-grounded template adapted to your
        options; the deep specifics (12-month trajectory, pre-mortem, 7-day
        experiment) are illustrative until you run with a live key. The autonomous
        research, evidence graph, calibration, and responsible-AI framing still
        apply to your decision.
      </p>
    </div>
  );
}
