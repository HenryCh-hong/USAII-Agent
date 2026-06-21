"use client";

/**
 * RouteUniverse — the "Possible Futures Library".
 *
 * Renders the 6–10 route candidates as a rich-but-not-overwhelming library with
 * progressive disclosure: each card shows a first layer (archetype, title, core
 * idea, risk / reversibility / time-horizon chips, evidence-fit score with the
 * "Not a prediction" label, a 7-day test preview, and a primary marker), and
 * opens into a second layer — the full 18-field micro-review grouped into five
 * accordions (Why this route exists · Tradeoffs · Action plan · Risks & friction
 * · Evidence & uncertainty). The user picks which three become the primary
 * comparison set for deep simulation; an honest "Why these three?" panel explains
 * the auto-selection until they override it.
 *
 * Every score here is a transparent MATCH score, never a probability of success.
 */
import { useState } from "react";
import {
  Activity,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Compass,
  FlaskConical,
  Gauge,
  GitBranch,
  Layers,
  ListChecks,
  Lock,
  Plus,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Telescope,
  TriangleAlert,
  User2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PrimarySelection,
  RouteCandidate,
  RouteLevel,
  RouteScoreBreakdown,
} from "@/lib/journey/types";

const MAX_PRIMARY = 3;

export interface RouteUniverseProps {
  universe: RouteCandidate[];
  primaryIds: string[];
  onTogglePrimary: (id: string) => void;
  selection: PrimarySelection;
  /** True while the current primaryIds still match the auto-selected set. */
  isAuto: boolean;
}

export function RouteUniverse({ universe, primaryIds, onTogglePrimary, selection, isAuto }: RouteUniverseProps) {
  const isPrimary = (id: string) => primaryIds.includes(id);
  const primary = primaryIds
    .map((id) => universe.find((c) => c.id === id))
    .filter((c): c is RouteCandidate => !!c);
  const others = universe
    .filter((c) => !isPrimary(c.id))
    .sort((a, b) => b.evidenceFitScore - a.evidenceFitScore);

  const roleFor = (id: string) => selection.roleNotes.find((r) => r.id === id);
  const archetypeCount = new Set(universe.map((c) => c.archetype)).size;
  const primaryCount = primaryIds.length;

  return (
    <div className="space-y-6">
      {/* Universe summary header */}
      <div className="overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/[0.08] via-panel/30 to-transparent p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[22px] font-semibold leading-tight text-white sm:text-[26px]">
              <span className="text-brand-glow">{universe.length} possible futures</span> surfaced
            </div>
            <div className="mt-0.5 text-sm text-soft/85">
              {primaryCount} selected for deep simulation — the rest stay in the library to explore.
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-glow">
            <Telescope className="h-3.5 w-3.5" /> Possible Futures Library
          </span>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Stat icon={Layers} value={`${universe.length} route candidates`} />
          <Dot />
          <Stat icon={Shuffle} value={`${archetypeCount} archetypes`} />
          <Dot />
          <Stat icon={Lock} value={`${primaryCount} primary routes`} />
          <Dot />
          <Stat icon={FlaskConical} value="1 next test each" />
        </div>
      </div>

      {/* Why these three? */}
      <div className="rounded-2xl border border-brand/25 bg-brand/[0.04] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="h-4 w-4 text-brand-glow" />
            {isAuto ? "Why these three?" : "Your three primary routes"}
          </div>
          <span className="text-[11px] uppercase tracking-wider text-mute">
            {primaryIds.length}/{MAX_PRIMARY} primary · {universe.length} in library
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-soft/85">
          {isAuto
            ? "Chosen for contrast and decision value — not at random, and not only by score. The set deliberately spans one steadier / safer route, one ambitious / high-upside route, and one hybrid or reversible route, so comparing them shows you what you're really trading off. They're routes to test side by side, not a ranking."
            : "Your chosen comparison set. The map opens these three for deep simulation; every other route stays in the library below for you to explore. Swap any of them before you open the map."}
        </p>
        {isAuto && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {primary.map((c) => {
              const role = roleFor(c.id);
              const meta = roleMeta(role?.role ?? c.archetype);
              return (
                <div key={c.id} className="rounded-xl border border-line/60 bg-void/30 p-3">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-glow/85">
                    <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-white">{c.title}</div>
                  <div className="mt-1 text-[11px] leading-snug text-mute">{role?.why}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Primary routes */}
      <div>
        <SectionHeading
          icon={Sparkles}
          title="Primary routes for deep simulation"
          sub="These three are routed into the full /map · /branch · /brief simulation."
        />
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
          {primary.map((c, i) => (
            <RouteCard
              key={c.id}
              c={c}
              primary
              featured={i === 0}
              canAddPrimary={primaryIds.length < MAX_PRIMARY}
              onTogglePrimary={() => onTogglePrimary(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Other routes */}
      {others.length > 0 && (
        <div>
          <SectionHeading
            icon={Compass}
            title="Other routes worth sampling"
            sub="The rest of the universe — distinct strategies you can still inspect or promote to primary."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <RouteCard
                key={c.id}
                c={c}
                primary={false}
                canAddPrimary={primaryIds.length < MAX_PRIMARY}
                onTogglePrimary={() => onTogglePrimary(c.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- card ----------------------------------- */

function RouteCard({
  c,
  primary,
  featured = false,
  canAddPrimary,
  onTogglePrimary,
}: {
  c: RouteCandidate;
  primary: boolean;
  featured?: boolean;
  canAddPrimary: boolean;
  onTogglePrimary: () => void;
}) {
  // The featured (first primary) route opens its review by default so the depth
  // is visible at a glance; every other card stays collapsed (progressive disclosure).
  const [open, setOpen] = useState(featured);
  const addDisabled = !primary && !canAddPrimary;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-panel/40 backdrop-blur-sm transition-colors",
        primary ? "border-brand/45 shadow-glow-sm" : "border-line/60 hover:border-line",
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-line/50 bg-white/[0.02] px-3.5 py-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-glow/80">
          <CircleDot className="h-3 w-3" /> {c.archetype}
        </span>
        {primary ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/45 bg-brand/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-glow">
            <Lock className="h-2.5 w-2.5" /> Primary
          </span>
        ) : (
          <span className="text-[10px] text-mute/70">in library</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div>
          <h3 className="text-[15px] font-semibold leading-snug text-white">{c.title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-soft/85">{c.coreIdea}</p>
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-1.5">
          <AxisChip label="Risk" level={c.risk} kind="risk" />
          <AxisChip label="Reversibility" level={c.reversibility} kind="rev" />
          <HorizonChip horizon={c.timeHorizon} />
        </div>

        {/* evidence-fit score */}
        <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
          <div className="flex items-center gap-3">
            <MiniRing score={c.evidenceFitScore} />
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-soft">
                Evidence-fit · <span className="text-brand-glow">{c.scoreBand}</span> — not a prediction
              </div>
              <div className="text-[10.5px] leading-snug text-mute">
                A <span className="text-soft">match score, not a success probability</span> — how strongly this route
                matches your answers and reference support.
              </div>
            </div>
          </div>
          <MiniBreakdown b={c.scoreBreakdown} />
        </div>

        {/* 7-day test preview */}
        <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-glow/80">
            <FlaskConical className="h-3 w-3" /> Low-cost test first
          </div>
          <p className="mt-1 line-clamp-3 text-[11.5px] leading-relaxed text-soft/85">{c.lowCostExperiment}</p>
        </div>

        {/* controls */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-glow/90 transition-colors hover:text-brand-glow"
          >
            {open ? "Hide full review" : "Open full review"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
          <button
            type="button"
            onClick={onTogglePrimary}
            disabled={addDisabled}
            title={addDisabled ? "Unmark a primary route first (3 max)" : undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all",
              primary
                ? "border-brand/50 bg-brand/15 text-brand-glow hover:bg-brand/25"
                : addDisabled
                  ? "border-line/50 text-mute/50"
                  : "border-line/60 text-soft hover:border-brand/45 hover:text-white",
            )}
          >
            {primary ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Primary
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Make primary
              </>
            )}
          </button>
        </div>

        {/* second layer — micro-review */}
        {open && <MicroReview c={c} featured={featured} />}
      </div>
    </div>
  );
}

/* ------------------------------ micro-review ------------------------------ */

function MicroReview({ c, featured = false }: { c: RouteCandidate; featured?: boolean }) {
  // For the featured route, the three highest-value groups open by default so the
  // concrete bullets (gains / gives up / hidden tradeoff / 7-30-90 plan) are visible
  // at a glance; Risks and Evidence stay collapsed (still progressive disclosure).
  return (
    <div className="mt-1 space-y-2 border-t border-line/50 pt-3">
      <Group icon={Compass} title="Why this route exists" defaultOpen>
        <Field label="Core idea" body={c.coreIdea} />
        <Field label="Why it makes sense" body={c.whyItMakesSense} />
        <Field label="Best fit" body={c.bestFitUser} />
        <Bullets label="Main assumptions" items={c.assumptions} />
      </Group>

      <Group icon={Activity} title="Tradeoffs" defaultOpen={featured}>
        <Bullets label="What you gain" items={c.gains} tone="pos" />
        <Bullets label="What you give up" items={c.givesUp} tone="neg" />
        <Bullets label="Hidden tradeoffs" items={c.hiddenTradeoffs} tone="neg" />
        <Field label="Opportunity cost" body={c.opportunityCost} />
      </Group>

      <Group icon={ListChecks} title="Action plan" defaultOpen={featured}>
        <Bullets label="First 7 days" items={c.sevenDayActionPlan} ordered />
        <Bullets label="First 30 days" items={c.thirtyDayActionPlan} ordered />
        <Field label="90-day direction" body={c.ninetyDayDirection} />
        <Field label="One low-cost experiment first" body={c.lowCostExperiment} icon={FlaskConical} />
      </Group>

      <Group icon={ShieldAlert} title="Risks & friction">
        <Bullets label="Key risks" items={c.keyRisks} tone="neg" />
        <Bullets label="Early warning signs" items={c.earlyWarningSigns} tone="neg" />
        <Bullets label="Resources needed" items={c.resourcesNeeded} />
        <Field label="Emotional friction" body={c.emotionalFriction} />
      </Group>

      <Group icon={Gauge} title="Evidence & uncertainty">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-mute">Confidence:</span>
          <span className="rounded border border-line/60 px-1.5 py-0.5 font-medium text-soft">{c.confidenceLevel}</span>
          <span className="text-mute">·</span>
          <span className="text-mute">Evidence-fit:</span>
          <span className="font-semibold text-brand-glow">{c.evidenceFitScore}/100</span>
          <span className="text-soft">({c.scoreBand})</span>
        </div>
        <Field label="Biggest uncertainty" body={c.uncertainty} icon={TriangleAlert} tone="warn" />
        <Provenance icon={User2} label="What you told us" items={c.evidenceSupport.userInputs} />
        <Provenance icon={BookOpen} label="Curated references" items={c.evidenceSupport.curatedReferences} />
        <Provenance icon={Brain} label="AI-inferred assumptions" items={c.evidenceSupport.aiInferredAssumptions} muted />
        <ScoreBreakdownBars b={c.scoreBreakdown} />
        <p className="text-[10px] leading-snug text-mute/80">
          The evidence-fit score is a transparent match score, not a probability of success. AI-inferred items are
          assumptions to confirm — never shown as a citation.
        </p>
      </Group>
    </div>
  );
}

/* ------------------------------- primitives ------------------------------- */

function Stat({ icon: Icon, value }: { icon: typeof Sparkles; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-soft/90">
      <Icon className="h-3.5 w-3.5 text-brand-glow/80" />
      {value}
    </span>
  );
}

function Dot() {
  return <span className="text-mute/45">·</span>;
}

/** Map an auto-selected role string to an icon + a clear contrast label. */
function roleMeta(role: string): { icon: typeof Sparkles; label: string } {
  const r = role.toLowerCase();
  if (/stead|anchor|safe|conservative|fallback|optimi/.test(r)) return { icon: ShieldCheck, label: "Steadier / safer" };
  if (/upside|ambiti|bold|high|aggress|sprint|transform/.test(r)) return { icon: Rocket, label: "Ambitious / high-upside" };
  if (/hybrid|reversible|middle|bridge|experiment|balanc/.test(r)) return { icon: Shuffle, label: "Hybrid or reversible" };
  return { icon: GitBranch, label: role };
}

/** Compact 4-part score breakdown shown on the card (user / constraint / curated / uncertainty). */
function MiniBreakdown({ b }: { b: RouteScoreBreakdown }) {
  const items: { label: string; v: number; negative?: boolean }[] = [
    { label: "User signal", v: b.valueMatch },
    { label: "Constraint fit", v: b.constraintFit },
    { label: "Curated support", v: b.curatedEvidenceSupport },
    { label: "Uncertainty", v: b.uncertaintyPenalty, negative: true },
  ];
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line/40 pt-2">
      {items.map(({ label, v, negative }) => (
        <div key={label}>
          <div className="text-[9px] uppercase tracking-wider text-mute">{label}</div>
          <span className="mt-0.5 block h-1 overflow-hidden rounded-full bg-white/5">
            <span
              className={cn("block h-full rounded-full", negative ? "bg-high/70" : "bg-brand/70")}
              style={{ width: `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, sub }: { icon: typeof Sparkles; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-brand/10">
        <Icon className="h-3.5 w-3.5 text-brand-glow" />
      </span>
      <div>
        <div className="text-[15px] font-semibold text-white">{title}</div>
        <div className="text-[12px] text-mute">{sub}</div>
      </div>
    </div>
  );
}

function Group({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: typeof Sparkles;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-line/50 bg-void/25 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[11.5px] font-semibold text-soft">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-brand-glow/80" /> {title}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-mute transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
}

function Field({
  label,
  body,
  icon: Icon,
  tone,
}: {
  label: string;
  body: string;
  icon?: typeof Sparkles;
  tone?: "warn";
}) {
  return (
    <div className="text-[11.5px] leading-relaxed">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-mute">
        {Icon && <Icon className={cn("h-3 w-3", tone === "warn" ? "text-startup/80" : "text-brand-glow/70")} />}
        {label}
      </span>
      <p className={cn("mt-0.5", tone === "warn" ? "text-startup/90" : "text-soft/85")}>{body}</p>
    </div>
  );
}

function Bullets({
  label,
  items,
  tone,
  ordered,
}: {
  label: string;
  items: string[];
  tone?: "pos" | "neg";
  ordered?: boolean;
}) {
  if (!items?.length) return null;
  const dot = tone === "pos" ? "text-brand-glow" : tone === "neg" ? "text-startup/80" : "text-mute";
  return (
    <div className="text-[11.5px] leading-relaxed">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mute">{label}</div>
      <ul className="mt-1 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5 text-soft/85">
            <span className={cn("shrink-0 font-semibold", dot)}>{ordered ? `${i + 1}.` : "·"}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Provenance({
  icon: Icon,
  label,
  items,
  muted,
}: {
  icon: typeof Sparkles;
  label: string;
  items: string[];
  muted?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <div className="text-[11px] leading-relaxed">
      <div className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider", muted ? "text-mute/80" : "text-brand-glow/70")}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <ul className="mt-0.5 space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className={cn("flex gap-1.5", muted ? "text-mute" : "text-soft/85")}>
            <span className="shrink-0">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const LEVEL_TONE: Record<RouteLevel, string> = {
  Low: "bg-brand",
  Medium: "bg-medium",
  High: "bg-high",
};

function AxisChip({ label, level, kind }: { label: string; level: RouteLevel; kind: "risk" | "rev" }) {
  // For reversibility, High is the "good/safe" end — tint it brand regardless.
  const dot = kind === "rev" ? (level === "High" ? "bg-brand" : level === "Medium" ? "bg-medium" : "bg-high") : LEVEL_TONE[level];
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line/60 bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-soft/85">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label} <span className="text-mute">·</span> {level}
    </span>
  );
}

function HorizonChip({ horizon }: { horizon: RouteCandidate["timeHorizon"] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line/60 bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-soft/85">
      <span className="h-1.5 w-1.5 rounded-full bg-research" />
      Horizon <span className="text-mute">·</span> {horizon}
    </span>
  );
}

function MiniRing({ score }: { score: number }) {
  const r = 19;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const off = c * (1 - clamped / 100);
  const tone = score >= 66 ? "#5eead4" : score >= 45 ? "#c084fc" : "#fca65a";
  return (
    <div className="relative h-[50px] w-[50px] shrink-0">
      <svg width="50" height="50" viewBox="0 0 50 50" className="-rotate-90">
        <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4.5" />
        <circle
          cx="25"
          cy="25"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-bold leading-none text-white">{score}</span>
        <span className="text-[7px] text-mute">/100</span>
      </div>
    </div>
  );
}

const BREAKDOWN_LABELS: { key: keyof RouteScoreBreakdown; label: string; negative?: boolean }[] = [
  { key: "valueMatch", label: "Value match" },
  { key: "constraintFit", label: "Constraint fit" },
  { key: "routeArchetypeFit", label: "Archetype fit" },
  { key: "curatedEvidenceSupport", label: "Curated support" },
  { key: "uncertaintyPenalty", label: "Uncertainty penalty", negative: true },
  { key: "inferencePenalty", label: "Inference penalty", negative: true },
];

function ScoreBreakdownBars({ b }: { b: RouteScoreBreakdown }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mute">Score breakdown</div>
      {BREAKDOWN_LABELS.map(({ key, label, negative }) => {
        const v = Math.max(0, Math.min(1, b[key]));
        return (
          <div key={key} className="flex items-center gap-2 text-[10px]">
            <span className="w-[120px] shrink-0 text-mute">{label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <span
                className={cn("block h-full rounded-full", negative ? "bg-high/70" : "bg-brand/70")}
                style={{ width: `${Math.round(v * 100)}%` }}
              />
            </span>
            <span className="w-7 shrink-0 text-right tabular-nums text-soft/70">{v.toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
}
