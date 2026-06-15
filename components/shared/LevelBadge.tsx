import { Badge } from "@/components/ui/Badge";
import { Dot } from "@/components/ui/Primitives";
import type { CalibrationResult, Level } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_TONE: Record<Level, "low" | "medium" | "high"> = {
  low: "low",
  medium: "medium",
  high: "high",
};

/**
 * A labeled qualitative level. Note the inversion semantics: for "risk" and
 * "uncertainty" higher is worse, which we express purely through the label, not
 * by faking a number.
 */
export function LevelBadge({
  label,
  level,
  className,
}: {
  label: string;
  level: Level;
  className?: string;
}) {
  return (
    <Badge tone={LEVEL_TONE[level]} className={cn(className)}>
      <Dot level={level} />
      <span className="text-mute">{label}</span>
      <span className="font-semibold capitalize text-white/90">{level}</span>
    </Badge>
  );
}

export function UncertaintyBadge({ level }: { level: Level }) {
  return <LevelBadge label="Uncertainty" level={level} />;
}

/** The four-up calibration readout used on cards and the calibration panel. */
export function CalibrationBadges({
  calibration,
  className,
}: {
  calibration: CalibrationResult;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <LevelBadge label="Evidence" level={calibration.evidenceStrength} />
      <LevelBadge label="Fit" level={calibration.userFit} />
      <LevelBadge label="Constraint risk" level={calibration.constraintRisk} />
      <LevelBadge label="Uncertainty" level={calibration.uncertaintyLevel} />
    </div>
  );
}
