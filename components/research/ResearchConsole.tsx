import {
  Search,
  CheckCircle2,
  ShieldX,
  Share2,
  Compass,
  AlertTriangle,
  FlaskConical,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import type { ResearchDossier } from "@/lib/research/types";
import type { Resonance } from "@/lib/trajectory/archetypes";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { ResearchTrace } from "./ResearchTrace";
import { SourceRadar } from "./SourceRadar";
import { SourceCard } from "./SourceCard";
import { cn } from "@/lib/utils";

const RES_STYLE: Record<Resonance, string> = {
  strong: "border-quant/40 bg-quant/10 text-quant",
  partial: "border-brand/40 bg-brand/10 text-brand-glow",
  weak: "border-line/70 bg-white/5 text-soft",
  missing: "border-line/70 bg-white/[0.02] text-mute",
};

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-soft/85">
          <span className="mt-0.5 select-none text-brand-glow/70">›</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function ResearchConsole({ dossier }: { dossier: ResearchDossier }) {
  return (
    <div className="space-y-8">
      <CockpitPanel label="Research Trace · what the agent did" icon={ListChecks} accent="brand" status={dossier.mocked ? "mock corpus" : `live · ${dossier.provider}`}>
        <ResearchTrace dossier={dossier} />
        <p className="mt-4 text-xs leading-relaxed text-mute">{dossier.generatedNote}</p>
      </CockpitPanel>

      <CockpitPanel label="Query Plan · autonomous" icon={Search} accent="brand" status={`${dossier.generatedQueries.length} queries`}>
        <ul className="space-y-2.5">
          {dossier.generatedQueries.map((q, i) => (
            <li key={i} className="rounded-lg border border-line/60 bg-white/[0.02] px-3.5 py-2.5">
              <div className="font-mono text-xs text-soft">{q.q}</div>
              <div className="mt-1 text-xs leading-relaxed text-mute">{q.intent}</div>
            </li>
          ))}
        </ul>
      </CockpitPanel>

      <SourceRadar sources={dossier.sourcesFound} />

      <CockpitPanel label="Sources Used" icon={CheckCircle2} accent="quant" status={`${dossier.sourcesUsed.length} accepted`}>
        <div className="grid gap-3 md:grid-cols-2">
          {dossier.sourcesUsed.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      </CockpitPanel>

      {dossier.sourcesRejected.length > 0 && (
        <CockpitPanel label="Sources Rejected · with reasons" icon={ShieldX} accent="startup" status={`${dossier.sourcesRejected.length} filtered`}>
          <div className="grid gap-3 md:grid-cols-2">
            {dossier.sourcesRejected.map((s) => (
              <SourceCard key={s.id} source={s} rejected />
            ))}
          </div>
        </CockpitPanel>
      )}

      {dossier.evidenceClusters.length > 0 && (
        <CockpitPanel label="Evidence Clusters" icon={Share2} accent="quant" status={`${dossier.evidenceClusters.length} clusters`}>
          <div className="grid gap-3 md:grid-cols-3">
            {dossier.evidenceClusters.map((c) => (
              <div key={c.id} className="rounded-xl border border-line/60 bg-white/[0.02] p-3.5">
                <div className="text-sm font-semibold text-white">{c.label}</div>
                <div className="mono-label mt-0.5">{c.sourceIds.length} sources · {c.coverageLevel}</div>
                <p className="mt-2 text-xs leading-relaxed text-soft/85">{c.summary}</p>
              </div>
            ))}
          </div>
        </CockpitPanel>
      )}

      {dossier.trajectoryAnchors.length > 0 && (
        <CockpitPanel label="Trajectory Anchors · analogies" icon={Compass} accent="research" status="not predictions">
          <div className="flex flex-wrap gap-2">
            {dossier.trajectoryAnchors.map((a) => (
              <span key={a.archetypeId} className={cn("inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs", RES_STYLE[a.resonance])}>
                {a.label}
                <span className="mono-label !tracking-normal">{a.resonance}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-mute">
            Anchors are analogies that rhyme with your stated context — never a claim
            that you resemble any specific real person, and never a prediction.
          </p>
        </CockpitPanel>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <CockpitPanel label="Limitations" icon={AlertTriangle} accent="startup" status="honest">
          <List items={dossier.limitations} />
        </CockpitPanel>
        <CockpitPanel label="Survivorship warnings" icon={AlertTriangle} accent="startup" status="bias check">
          <List items={dossier.survivorshipBiasWarnings} />
        </CockpitPanel>
        <CockpitPanel label="Confidence notes" icon={ShieldX} accent="brand" status="coverage">
          <List items={dossier.confidenceNotes} />
        </CockpitPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CockpitPanel label="What would change the assessment" icon={RefreshCw} accent="research" status="provisional">
          <List items={dossier.whatWouldChangeAssessment} />
        </CockpitPanel>
        <CockpitPanel label="Validation experiments · this week" icon={FlaskConical} accent="quant" status="action">
          <List items={dossier.validationExperiments} />
        </CockpitPanel>
      </div>
    </div>
  );
}
