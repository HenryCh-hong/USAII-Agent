import { BookOpen, Sparkles, Layers, ExternalLink, type LucideIcon } from "lucide-react";
import type { ClaimLedgerEntry, ClaimProvenance } from "@/lib/research/types";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { cn } from "@/lib/utils";

const PROV: Record<ClaimProvenance, { label: string; cls: string; icon: LucideIcon }> = {
  source_supported: { label: "Source-supported", cls: "border-brand/40 bg-brand/10 text-brand-glow", icon: BookOpen },
  ai_inferred: { label: "AI-inferred", cls: "border-startup/40 bg-startup/10 text-startup", icon: Sparkles },
  mixed: { label: "Framework + inference", cls: "border-research/40 bg-research/10 text-research", icon: Layers },
};

const AFFECTS_LABEL: Record<ClaimLedgerEntry["affects"], string> = {
  branch: "Branch",
  archetype: "Archetype",
  assumption: "Assumption",
  experiment: "Experiment",
};

/**
 * Claim-to-source ledger: every important claim with its provenance, reliability,
 * what it affects, supporting sources, and what it cannot tell us. The visible
 * answer to "how do I know this isn't just impressive-looking claims?".
 */
export function ClaimLedger({ claims, compact = false }: { claims: ClaimLedgerEntry[]; compact?: boolean }) {
  const shown = compact ? claims.slice(0, 4) : claims;
  return (
    <div className="space-y-3">
      {shown.map((c) => {
        const p = PROV[c.provenance];
        const Icon = p.icon;
        return (
          <div key={c.id} className="space-y-2 rounded-xl border border-line/60 bg-white/[0.02] p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium", p.cls)}>
                <Icon className="h-3 w-3" />
                {p.label}
              </span>
              <LevelBadge label="Reliability" level={c.reliability} />
              <span className="mono-label">
                affects {AFFECTS_LABEL[c.affects]}
                {c.affectsLabel ? ` · ${c.affectsLabel}` : ""}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-white">{c.claim}</p>

            {c.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="mono-label">support</span>
                {c.sources.map((s, i) =>
                  s.url ? (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs text-brand-glow hover:underline"
                    >
                      {s.title} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span key={i} className="text-xs text-soft/85">{s.title}</span>
                  ),
                )}
              </div>
            )}

            {!compact && (
              <p className="text-[11px] italic leading-relaxed text-mute/90">
                <span className="not-italic font-semibold uppercase tracking-wider text-mute/70">Caveat · </span>
                {c.limitation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
