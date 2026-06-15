"use client";

import { Database } from "lucide-react";
import type { CalibrationResult } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { LevelBar } from "@/components/ui/Primitives";
import { LevelBadge } from "@/components/shared/LevelBadge";

/**
 * A 4-up qualitative calibration readout. Deliberately no fake precise
 * probabilities — just honest levels for evidence strength, fit, constraint
 * risk, and overall uncertainty, with a prominent note that none of this is an
 * individual-level prediction.
 */
export function CalibrationPanel({ calibration }: { calibration: CalibrationResult }) {
  const dials: { label: string; level: CalibrationResult["evidenceStrength"]; hint: string }[] = [
    {
      label: "Evidence strength",
      level: calibration.evidenceStrength,
      hint: "How well-supported this branch is by curated evidence.",
    },
    {
      label: "Fit with you",
      level: calibration.userFit,
      hint: "How well this path aligns with what you told us.",
    },
    {
      label: "Constraint risk",
      level: calibration.constraintRisk,
      hint: "Higher means your stated constraints could press harder here.",
    },
    {
      label: "Overall uncertainty",
      level: calibration.uncertaintyLevel,
      hint: "Higher means more is unknown — treat conclusions as provisional.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dials.map((d) => (
          <Card key={d.label}>
            <CardBody className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                {d.label}
              </div>
              <LevelBadge label="Level" level={d.level} />
              <LevelBar level={d.level} />
              <p className="text-xs leading-relaxed text-mute/90">{d.hint}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/[0.06] px-4 py-3">
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
        <p className="text-xs leading-relaxed text-soft/90">
          <span className="font-medium text-white">No individual-level prediction.</span>{" "}
          {calibration.dataCoverageNote}
        </p>
      </div>
    </div>
  );
}
