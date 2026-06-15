import { User, BookOpen, Sparkles } from "lucide-react";
import type { ClaimType } from "@/lib/types";
import { CLAIM_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<
  ClaimType,
  { tone: string; icon: typeof User; blurb: string }
> = {
  user_provided: {
    tone: "border-quant/40 bg-quant/10 text-quant",
    icon: User,
    blurb: "Something you told us directly.",
  },
  source_supported: {
    tone: "border-brand/40 bg-brand/10 text-brand-glow",
    icon: BookOpen,
    blurb: "Backed by a curated source, kept at its true coverage level.",
  },
  ai_inferred: {
    tone: "border-startup/40 bg-startup/10 text-startup",
    icon: Sparkles,
    blurb: "A reasonable AI inference — flagged, and meant to be tested.",
  },
};

/** Provenance chip — the responsible-AI heart of the assumption ledger. */
export function ClaimTag({
  type,
  className,
  withIcon = true,
}: {
  type: ClaimType;
  className?: string;
  withIcon?: boolean;
}) {
  const s = STYLES[type];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        s.tone,
        className,
      )}
    >
      {withIcon && <Icon className="h-3 w-3" />}
      {CLAIM_LABELS[type]}
    </span>
  );
}

/** Legend explaining the three provenance types — used on detail/architecture. */
export function ClaimLegend({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-3", className)}>
      {(Object.keys(STYLES) as ClaimType[]).map((t) => (
        <div
          key={t}
          className="flex items-start gap-2 rounded-xl border border-line/60 bg-white/[0.02] p-3"
        >
          <ClaimTag type={t} />
          <p className="text-xs leading-relaxed text-mute">{STYLES[t].blurb}</p>
        </div>
      ))}
    </div>
  );
}
