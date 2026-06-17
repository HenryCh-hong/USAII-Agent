import {
  Compass,
  Sparkles,
  AlertTriangle,
  FlaskConical,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { UserContext } from "@/lib/types";
import {
  matchArchetypes,
  anchorChips,
  type AnchoredArchetype,
  type Resonance,
} from "@/lib/trajectory/archetypes";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { Pill } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

const RES_LABEL: Record<Resonance, string> = {
  strong: "Strong resonance",
  partial: "Partial resonance",
  weak: "Weak resonance",
  missing: "Missing signal",
};
const RES_STYLE: Record<Resonance, string> = {
  strong: "border-quant/40 bg-quant/10 text-quant",
  partial: "border-brand/40 bg-brand/10 text-brand-glow",
  weak: "border-line/70 bg-white/5 text-soft",
  missing: "border-line/70 bg-white/[0.02] text-mute",
};

function ResonancePill({ r }: { r: Resonance }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", RES_STYLE[r])}>
      {RES_LABEL[r]}
    </span>
  );
}

/**
 * Trajectory Atlas — maps the user's stated anchors to curated ROLE archetypes
 * as analogies (never predictions, never named people, never percentages). Each
 * resonant archetype shows what rhymes, what does not transfer, a
 * survivorship-bias warning, and a 7-day test to firm up the analogy.
 */
export function TrajectoryAtlas({
  context,
  compact = false,
}: {
  context: UserContext;
  compact?: boolean;
}) {
  const all = matchArchetypes(context);
  if (all.length === 0) return null;

  const featured = all.filter((a) => a.resonance === "strong" || a.resonance === "partial");
  const lower = all.filter((a) => a.resonance === "weak" || a.resonance === "missing");
  const shown = featured.length ? featured : all.slice(0, 2);

  return (
    <CockpitPanel
      label="Trajectory Atlas · reference futures"
      icon={Compass}
      accent="research"
      status="analogies · not predictions"
    >
      {/* Anchors */}
      <div className="mb-4 space-y-2">
        <div className="mono-label">Your anchors</div>
        <div className="flex flex-wrap gap-2">
          {anchorChips(context).map((c) => (
            <Pill key={c.label} className="text-[11px]">
              <span className="text-mute/70">{c.label}:</span>&nbsp;{c.value}
            </Pill>
          ))}
        </div>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-soft/85">
        These curated role trajectories <span className="text-white">rhyme</span> with
        your anchors — they are analogies to learn from, not forecasts. Resonance
        reflects overlap with what you told us; it does not predict your outcome,
        and you are not being matched to any real person.
      </p>

      <div className={cn("grid gap-4", !compact && featured.length > 1 && "lg:grid-cols-2")}>
        {shown.map((a) => (
          <ArchetypeCard key={a.archetype.id} item={a} compact={compact} />
        ))}
      </div>

      {/* Lower-resonance spectrum (honest: show what doesn't match) */}
      {lower.length > 0 && (
        <div className="mt-5 space-y-2">
          <div className="mono-label">Lower resonance — shown for honesty</div>
          <div className="flex flex-wrap gap-2">
            {lower.map((a) => (
              <span
                key={a.archetype.id}
                className="inline-flex items-center gap-2 rounded-lg border border-line/60 bg-white/[0.02] px-2.5 py-1 text-xs text-mute"
                title={a.archetype.whatDoesNotTransfer}
              >
                {a.archetype.label}
                <ResonancePill r={a.resonance} />
              </span>
            ))}
          </div>
        </div>
      )}
    </CockpitPanel>
  );
}

function ArchetypeCard({ item, compact }: { item: AnchoredArchetype; compact: boolean }) {
  const a = item.archetype;
  return (
    <div className="space-y-3 rounded-xl border border-line/60 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">{a.label}</span>
        <ResonancePill r={item.resonance} />
      </div>
      <p className="text-xs leading-relaxed text-mute">{a.blurb}</p>

      <Field icon={Sparkles} label="Why it rhymes" tone="text-quant" text={a.whatRhymes} />

      {!compact && (
        <>
          <Field label="What doesn't transfer" text={a.whatDoesNotTransfer} />
          {a.hiddenTradeoffs.length > 0 && (
            <div className="space-y-1">
              <div className="mono-label">Hidden tradeoffs</div>
              <ul className="space-y-1">
                {a.hiddenTradeoffs.map((t, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-soft/85">
                    <span className="mt-0.5 text-research/70">›</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Field icon={ArrowUpRight} label="Stronger if" tone="text-quant" text={a.strongerIf} small />
            <Field icon={ArrowDownRight} label="Weaker if" tone="text-startup" text={a.weakerIf} small />
          </div>
          <p className="mono-label">{a.evidenceCoverage}</p>
        </>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-startup/20 bg-startup/[0.04] px-3 py-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-startup" />
        <p className="text-xs leading-relaxed text-soft/85">
          <span className="not-italic font-semibold uppercase tracking-wider text-mute/70">
            Survivorship ·{" "}
          </span>
          {a.survivorshipWarning}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2">
        <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow/70" />
        <p className="text-xs leading-relaxed text-soft">
          <span className="not-italic font-semibold uppercase tracking-wider text-mute/70">
            7-day test ·{" "}
          </span>
          {a.sevenDayTest}
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  text,
  tone,
  small,
}: {
  icon?: typeof Sparkles;
  label: string;
  text: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className={cn("mono-label flex items-center gap-1.5", tone)}>
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <p className={cn("leading-relaxed text-soft/85", small ? "text-xs" : "text-sm")}>{text}</p>
    </div>
  );
}
