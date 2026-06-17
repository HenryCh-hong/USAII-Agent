import { Target } from "lucide-react";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { Badge } from "@/components/ui/Badge";

/**
 * Judge-facing rubric map: where each scoring category is demonstrated in the
 * product, so a judge can orient in seconds. Static, honest copy.
 */
const ROWS: { cat: string; weight: string; where: string; how: string }[] = [
  {
    cat: "Problem Understanding",
    weight: "20",
    where: "Intake · Clarifying Questions · Landing",
    how: "Captures the decision, values, constraints and fears in the user's own words; clarifying questions target the binding constraint and untested assumptions; the landing makes the 'why AI, not a rules engine' case explicit.",
  },
  {
    cat: "AI Reasoning",
    weight: "30",
    where: "Branch Detail · Judge Mode",
    how: "Agentic RAG (retrieval + a local evidence graph), a 9-role debate with an explicit Optimist vs Skeptic pass, Agent Review, Reasoning Audit Trail, qualitative calibration, and the Trajectory Atlas of reference futures.",
  },
  {
    cat: "Solution Design",
    weight: "25",
    where: "Whole flow · Judge Mode",
    how: "A coherent input → reasoning → output → action pipeline; the cockpit UI; a Zod-enforced data contract with mock-first stability; and a reproducible evaluation harness.",
  },
  {
    cat: "Impact & Insight",
    weight: "15",
    where: "Decision Brief · Branch Detail",
    how: "Decision Delta (before/after), per-assumption stress tests, 7-day validation experiments, and a final mission brief that moves the user from uncertainty to a testable next step.",
  },
  {
    cat: "Responsible AI",
    weight: "10",
    where: "Everywhere",
    how: "Qualitative-only calibration, provenance-tagged claims, a safety scrubber with surfaced rejected overclaims, no fabricated probabilities, human-in-the-loop ('what the AI will not decide'), and the evals that guard it.",
  },
];

export function RubricMap() {
  return (
    <CockpitPanel label="Rubric Map · where to look" icon={Target} accent="brand" status="judge guide">
      <ul className="space-y-2.5">
        {ROWS.map((r) => (
          <li key={r.cat} className="rounded-lg border border-line/60 bg-white/[0.02] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">{r.cat}</span>
              <Badge tone="brand">{r.weight} pts</Badge>
            </div>
            <div className="mono-label mt-1">{r.where}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-soft/85">{r.how}</p>
          </li>
        ))}
      </ul>
    </CockpitPanel>
  );
}
