import {
  ScrollText,
  BookOpen,
  HelpCircle,
  GitBranch,
  Compass,
  FlaskConical,
} from "lucide-react";
import type { ReasoningAuditTrail as AuditTrailType } from "@/lib/types";
import { CockpitPanel } from "@/components/ui/CockpitPanel";

/**
 * The replacement for raw chain-of-thought: a structured, judge-safe trail of
 * how this branch was reasoned about — why it exists, the evidence and
 * assumptions it leans on, what drives its uncertainty, what would change the
 * assessment, and the cheapest next test. Every field is a summary or list.
 */
export function ReasoningAuditTrail({ trail }: { trail: AuditTrailType }) {
  return (
    <CockpitPanel
      label="Reasoning Audit Trail"
      icon={ScrollText}
      accent="research"
      status="structured summary"
    >
      <div className="space-y-5">
        <div className="flex gap-3 rounded-xl border border-research/25 bg-research/[0.05] p-4">
          <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-research" />
          <div className="space-y-1">
            <div className="mono-label">Why this branch exists</div>
            <p className="text-sm leading-relaxed text-soft/90">
              {trail.whyThisBranchExists}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock icon={BookOpen} label="Evidence used" items={trail.evidenceUsed} />
          <ListBlock
            icon={ScrollText}
            label="Assumptions this depends on"
            items={trail.assumptionsUsed}
          />
          <ListBlock
            icon={HelpCircle}
            label="Uncertainty drivers"
            items={trail.uncertaintyDrivers}
          />
          <ListBlock
            icon={Compass}
            label="What would change this assessment"
            items={trail.whatWouldChangeThisAssessment}
          />
        </div>

        <div className="flex gap-3 rounded-xl border border-line/60 bg-white/[0.02] p-4">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
          <div className="space-y-1">
            <div className="mono-label">Next validation step</div>
            <p className="text-sm leading-relaxed text-white">{trail.nextValidationStep}</p>
          </div>
        </div>

        <p className="mono-label">
          Structured summary of the reasoning — not the model&apos;s raw chain-of-thought.
        </p>
      </div>
    </CockpitPanel>
  );
}

function ListBlock({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof BookOpen;
  label: string;
  items: string[];
}) {
  return (
    <div className="space-y-2.5 rounded-xl border border-line/60 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-mute" />
        <span className="mono-label">{label}</span>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-soft/85">
            <span className="mt-0.5 select-none text-research/70">›</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
