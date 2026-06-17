import { ExternalLink, ShieldX, AlertTriangle } from "lucide-react";
import type { ResearchSource } from "@/lib/research/types";
import type { ResearchSourceType, ReliabilityTier } from "@/lib/research/corpus";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<ResearchSourceType, string> = {
  official_data: "Official data",
  education_outcomes: "Education outcomes",
  labor_market: "Labor market",
  decision_framework: "Decision framework",
  public_reference: "Public reference",
  anecdotal: "Anecdotal",
};

const TIER_STYLE: Record<ReliabilityTier, string> = {
  high: "border-quant/40 bg-quant/10 text-quant",
  medium: "border-medium/40 bg-medium/10 text-medium",
  low: "border-high/40 bg-high/10 text-high",
};

export function SourceCard({ source, rejected = false }: { source: ResearchSource; rejected?: boolean }) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border bg-white/[0.02] p-3.5",
        rejected ? "border-line/50 opacity-90" : "border-line/60",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", TIER_STYLE[source.reliabilityTier])}>
          {source.reliabilityTier} reliability
        </span>
        <span className="mono-label">{TYPE_LABEL[source.sourceType]}</span>
        {source.isPublicTrajectory && <span className="mono-label text-research/80">analogy</span>}
      </div>

      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-snug text-white">{source.title}</span>
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] text-brand-glow hover:underline"
        >
          {source.domain} <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <p className="text-xs leading-relaxed text-mute/90">
        <span className="font-semibold uppercase tracking-wider text-mute/70">Used for · </span>
        {source.usedFor} <span className="text-mute/60">({source.coverageLevel})</span>
      </p>

      <p className="text-[11px] italic leading-relaxed text-mute/90">
        <span className="not-italic font-semibold uppercase tracking-wider text-mute/70">Limits · </span>
        {source.limitation}
      </p>

      {source.survivorshipNote && (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-soft/85">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-startup" />
          {source.survivorshipNote}
        </p>
      )}

      {rejected && source.rejectionReason && (
        <p className="flex items-start gap-1.5 rounded-lg border border-line/50 bg-white/[0.02] px-2.5 py-1.5 text-[11px] leading-relaxed text-soft/85">
          <ShieldX className="mt-0.5 h-3 w-3 shrink-0 text-brand-glow/80" />
          <span>
            <span className="font-semibold uppercase tracking-wider text-mute/70">Rejected · </span>
            {source.rejectionReason}
          </span>
        </p>
      )}
    </div>
  );
}
