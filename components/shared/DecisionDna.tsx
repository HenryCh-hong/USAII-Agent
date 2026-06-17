import { Dna, Compass, Scale, HelpCircle, Wand2, AlertTriangle, FlaskConical } from "lucide-react";
import type { DecisionDna, BranchBottleneck } from "@/lib/decision/decisionDna";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { Pill } from "@/components/ui/Primitives";

/**
 * Decision DNA — a sharp, hypothesis-framed diagnosis of what the decision is
 * really about. Not a dense wall of text: a lead diagnosis + the underlying
 * tension, the hidden question, value conflict, missing evidence, and the cheapest
 * thing that would make the decision easier.
 */
export function DecisionDnaPanel({ dna, compact = false }: { dna: DecisionDna; compact?: boolean }) {
  return (
    <CockpitPanel label="Decision DNA · what this is really about" icon={Dna} accent="research" status="a hypothesis to test">
      <div className="rounded-xl border border-research/25 bg-research/[0.06] p-4">
        <div className="mono-label text-research/80">Diagnosis</div>
        <p className="mt-1 text-base leading-relaxed text-white">{dna.diagnosis}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Block icon={Scale} label="Core tension" text={dna.coreTension} />
        <Block icon={Compass} label="The decision underneath" text={dna.hiddenDecision} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="mono-label">Value conflict</div>
        <div className="flex flex-wrap gap-2">
          {dna.valueConflict.map((v) => (
            <Pill key={v} className="border-research/30 bg-research/[0.06] text-research">{v}</Pill>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 rounded-xl border border-line/60 bg-white/[0.02] p-4">
            <div className="mono-label flex items-center gap-1.5"><HelpCircle className="h-3 w-3" /> What evidence is missing</div>
            <ul className="space-y-1.5">
              {dna.missingEvidence.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-soft/85">
                  <span className="mt-0.5 text-startup/70">›</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5 rounded-xl border border-line/60 bg-white/[0.02] p-4">
            <div className="mono-label flex items-center gap-1.5"><Wand2 className="h-3 w-3" /> What would make it easier</div>
            <p className="text-sm leading-relaxed text-soft/90">{dna.whatWouldMakeEasier}</p>
          </div>
        </div>
      )}
    </CockpitPanel>
  );
}

function Block({ icon: Icon, label, text }: { icon: typeof Scale; label: string; text: string }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-line/60 bg-white/[0.02] p-4">
      <div className="mono-label flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</div>
      <p className="text-sm leading-relaxed text-soft/90">{text}</p>
    </div>
  );
}

/** One branch's bottleneck card — the specific crux + concrete next test. */
export function BranchBottleneckCard({ b }: { b: BranchBottleneck }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-line/60 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-startup" />
        <span className="mono-label">{b.track} · bottleneck</span>
      </div>
      <p className="text-sm font-medium leading-snug text-white">{b.bottleneck}</p>
      <p className="text-xs leading-relaxed text-mute/90">{b.whyItMatters}</p>
      <div className="grid gap-1.5">
        <p className="text-xs leading-relaxed text-soft/85"><span className="text-quant">Strengthens if · </span>{b.strengthensIf}</p>
        <p className="text-xs leading-relaxed text-soft/85"><span className="text-high">Weakens if · </span>{b.weakensIf}</p>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-brand/20 bg-brand/[0.05] px-3 py-2">
        <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow" />
        <p className="text-xs leading-relaxed text-white">
          <span className="not-italic font-semibold uppercase tracking-wider text-mute/70">Test this week · </span>
          {b.sevenDayTest}
        </p>
      </div>
    </div>
  );
}

export function BranchBottlenecks({ items }: { items: BranchBottleneck[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((b) => (
        <BranchBottleneckCard key={b.branchId} b={b} />
      ))}
    </div>
  );
}
