import { Share2, ArrowRight } from "lucide-react";
import type {
  EvidenceGraphSnapshot,
  EvidenceNodeType,
  EvidenceRelation,
} from "@/lib/types";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { cn } from "@/lib/utils";

const NODE_META: Record<EvidenceNodeType, { label: string; cls: string }> = {
  source: { label: "Source", cls: "border-brand/40 bg-brand/10 text-brand-glow" },
  career_path: { label: "Path", cls: "border-research/40 bg-research/10 text-research" },
  skill: { label: "Skill", cls: "border-quant/40 bg-quant/10 text-quant" },
  constraint: { label: "Constraint", cls: "border-medium/40 bg-medium/10 text-medium" },
  decision_framework: { label: "Framework", cls: "border-brand/40 bg-brand/10 text-brand-glow" },
  risk: { label: "Risk", cls: "border-high/40 bg-high/10 text-high" },
  experiment: { label: "Experiment", cls: "border-startup/40 bg-startup/10 text-startup" },
};

const RELATION_LABEL: Record<EvidenceRelation, string> = {
  supports: "supports",
  requires: "requires",
  creates_risk: "creates risk for",
  can_be_tested_by: "tested by",
  informs: "informs",
  limits: "limits",
};

const NODE_ORDER: EvidenceNodeType[] = [
  "career_path",
  "skill",
  "source",
  "decision_framework",
  "constraint",
  "risk",
  "experiment",
];

/**
 * "Why this branch exists" — a clean node/edge view of the local evidence graph
 * for this branch. Not a force-directed visualization; a legible structured panel
 * that shows how sources, skills, constraints, risks and frameworks connect to
 * the path and its 7-day experiment.
 */
export function EvidenceGraph({ snapshot }: { snapshot: EvidenceGraphSnapshot }) {
  const labelById = new Map(snapshot.nodes.map((n) => [n.id, n.label]));
  const grouped = NODE_ORDER.map((type) => ({
    type,
    nodes: snapshot.nodes.filter((n) => n.nodeType === type),
  })).filter((g) => g.nodes.length > 0);

  return (
    <CockpitPanel
      label="Evidence Graph Snapshot · why this branch exists"
      icon={Share2}
      accent="quant"
      status={`${snapshot.nodes.length} nodes · ${snapshot.edges.length} links`}
    >
      {/* Nodes grouped by type */}
      <div className="space-y-3">
        {grouped.map((g) => (
          <div key={g.type} className="flex flex-wrap items-center gap-2">
            <span className="mono-label w-24 shrink-0">{NODE_META[g.type].label}</span>
            <div className="flex flex-wrap gap-2">
              {g.nodes.map((n) => (
                <span
                  key={n.id}
                  className={cn(
                    "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs",
                    NODE_META[g.type].cls,
                  )}
                >
                  {n.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edges */}
      <div className="mt-5 space-y-2">
        <div className="mono-label">Connections</div>
        <ul className="space-y-2">
          {snapshot.edges.map((e, i) => (
            <li
              key={i}
              className="rounded-lg border border-line/60 bg-white/[0.02] px-3 py-2 text-sm leading-relaxed text-soft/85"
            >
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-white">{labelById.get(e.from) ?? e.from}</span>
                <ArrowRight className="h-3 w-3 text-mute" />
                <span className="mono-label !tracking-wider">{RELATION_LABEL[e.relation]}</span>
                <ArrowRight className="h-3 w-3 text-mute" />
                <span className="font-medium text-white">{labelById.get(e.to) ?? e.to}</span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-mute">{e.explanation}</span>
            </li>
          ))}
        </ul>
      </div>
    </CockpitPanel>
  );
}
