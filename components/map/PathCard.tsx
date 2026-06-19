"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, AlertTriangle, Swords, Target, FlaskConical } from "lucide-react";
import type { FutureBranch } from "@/lib/types";
import type { BranchBottleneck } from "@/lib/decision/decisionDna";
import { accentClasses, accentForBranch, cn, type BranchAccent } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LevelBadge } from "@/components/shared/LevelBadge";

const MAIN_STAT: Record<BranchAccent, string> = {
  quant: "Signal",
  startup: "Autonomy",
  research: "Depth",
};
const BOSS_FIGHT: Record<BranchAccent, string> = {
  quant: "Interview + proof-of-skill",
  startup: "Real customer demand",
  research: "Sustained uncertainty",
};

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

/**
 * A future branch rendered as a playable "path card": main stat, buff, risk,
 * boss fight, bottleneck, and one concrete next quest (reused from Decision DNA,
 * so it stays specific — never generic). Playful but premium; still a rehearsal,
 * not a prediction.
 */
export function PathCard({
  branch,
  index,
  bottleneck,
}: {
  branch: FutureBranch;
  index: number;
  bottleneck?: BranchBottleneck;
}) {
  const accentKey = accentForBranch(branch.id, index);
  const accent = accentClasses(accentKey);
  const pathName = branch.track.replace(/\bTrack\b/, "Path");
  const buff = truncate(branch.skillCompounding, 90);
  const risk = truncate(branch.regretRadar[0]?.description ?? branch.hiddenTradeoffs[0] ?? "", 90);
  const crux = bottleneck?.bottleneck ?? branch.bottlenecks[0] ?? "";
  const nextQuest = bottleneck?.sevenDayTest ?? branch.sevenDayExperiment[0]?.action ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card hover className={cn("h-full overflow-hidden", accent.glow)}>
        <div className={cn("h-1 w-full bg-gradient-to-r", accent.from, "to-transparent")} />
        <div className="space-y-3.5 p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={accentKey}>{pathName}</Badge>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium", accent.border, accent.bg, accent.text)}>
              <Sparkles className="h-3 w-3" /> {MAIN_STAT[accentKey]}
            </span>
          </div>

          <h3 className="text-lg font-semibold leading-snug text-white">{branch.title}</h3>

          <div className="grid gap-2">
            <Stat icon={Sparkles} tone="text-quant" label="Buff" text={buff} />
            <Stat icon={AlertTriangle} tone="text-startup" label="Risk" text={risk} />
            <Stat icon={Swords} tone={accent.text} label="Boss fight" text={BOSS_FIGHT[accentKey]} />
            <Stat icon={Target} tone="text-mute" label="Bottleneck" text={crux} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <LevelBadge label="Evidence" level={branch.calibration.evidenceStrength} />
            <LevelBadge label="Fit" level={branch.calibration.userFit} />
            <LevelBadge label="Uncertainty" level={branch.calibration.uncertaintyLevel} />
          </div>

          <div className={cn("rounded-xl border bg-white/[0.02] p-3", accent.border)}>
            <div className="mono-label flex items-center gap-1.5">
              <FlaskConical className={cn("h-3 w-3", accent.text)} /> Next quest
            </div>
            <p className="mt-1 text-sm leading-snug text-soft">{nextQuest}</p>
          </div>

          <Link
            href={`/branch/${branch.id}`}
            className={cn("inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:gap-2.5", accent.text)}
          >
            Enter this path <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

function Stat({ icon: Icon, tone, label, text }: { icon: typeof Sparkles; tone: string; label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="flex gap-2.5">
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", tone)} />
      <div className="min-w-0">
        <span className="mono-label">{label}</span>
        <p className="text-sm leading-snug text-soft/90">{text}</p>
      </div>
    </div>
  );
}
