"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, AlertTriangle, EyeOff } from "lucide-react";
import type { FutureBranch } from "@/lib/types";
import { accentClasses, accentForBranch, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { Badge } from "@/components/ui/Badge";

/**
 * Full branch preview on the Future Map: thesis + calibration + the hidden
 * cost, main bottleneck, and the very first 7-day experiment step.
 */
export function BranchCard({ branch, index }: { branch: FutureBranch; index: number }) {
  const accentKey = accentForBranch(branch.id, index);
  const accent = accentClasses(accentKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card hover className={cn("h-full overflow-hidden", accent.glow)}>
        <div className={cn("h-1 w-full bg-gradient-to-r", accent.from, "to-transparent")} />
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <Badge tone={accentKey}>{branch.track}</Badge>
            <span className="text-[11px] uppercase tracking-wider text-mute">
              Reversibility · <span className="capitalize text-soft">{branch.reversibility}</span>
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">{branch.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-soft/85 line-clamp-4">
              {branch.thesis}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <LevelBadge label="Evidence" level={branch.calibration.evidenceStrength} />
            <LevelBadge label="Fit" level={branch.calibration.userFit} />
            <LevelBadge label="Constraint risk" level={branch.calibration.constraintRisk} />
            <LevelBadge label="Uncertainty" level={branch.calibration.uncertaintyLevel} />
          </div>

          <p className="mono-label">Not a prediction · a structured rehearsal</p>

          <div className="space-y-2.5 rounded-xl border border-line/60 bg-white/[0.02] p-3.5">
            <Row icon={EyeOff} label="Hidden cost" text={branch.hiddenTradeoffs[0]} />
            <Row icon={AlertTriangle} label="Main bottleneck" text={branch.bottlenecks[0]} />
            <Row
              icon={FlaskConical}
              label="First validation experiment"
              text={branch.sevenDayExperiment[0]?.action ?? ""}
              accent={accent.text}
            />
          </div>

          <Link
            href={`/branch/${branch.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:gap-2.5",
              accent.text,
            )}
          >
            Explore this future <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

function Row({
  icon: Icon,
  label,
  text,
  accent,
}: {
  icon: typeof EyeOff;
  label: string;
  text: string;
  accent?: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", accent ?? "text-mute")} />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-mute">{label}</div>
        <div className="text-sm leading-snug text-soft">{text}</div>
      </div>
    </div>
  );
}
