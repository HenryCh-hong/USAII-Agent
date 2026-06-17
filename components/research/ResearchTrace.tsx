import {
  ListChecks,
  Globe,
  CheckCircle2,
  ShieldX,
  Compass,
  AlertTriangle,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import type { ResearchDossier } from "@/lib/research/types";

/**
 * The autonomous research trace — what the agent did, as honest counts. Reads
 * directly from the dossier so the numbers are real (mock or live).
 */
export function ResearchTrace({ dossier }: { dossier: ResearchDossier }) {
  const steps: { icon: LucideIcon; n: number; label: string }[] = [
    { icon: ListChecks, n: dossier.generatedQueries.length, label: "queries generated" },
    { icon: Globe, n: dossier.sourcesFound.length, label: "public results retrieved" },
    { icon: CheckCircle2, n: dossier.sourcesUsed.length, label: "sources used" },
    { icon: ShieldX, n: dossier.sourcesRejected.length, label: "rejected (weak/over-specific)" },
    { icon: Compass, n: dossier.trajectoryAnchors.length, label: "trajectory anchors" },
    { icon: AlertTriangle, n: dossier.limitations.length, label: "limitations flagged" },
    { icon: FlaskConical, n: dossier.validationExperiments.length, label: "uncertainties → tests" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="rounded-xl border border-line/60 bg-white/[0.02] p-3 text-center">
            <Icon className="mx-auto h-4 w-4 text-brand-glow/80" />
            <div className="mt-1 text-xl font-semibold text-white">{s.n}</div>
            <div className="mono-label !tracking-normal mt-0.5 leading-tight">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
