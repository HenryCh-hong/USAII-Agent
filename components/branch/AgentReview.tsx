import {
  Layers,
  Search,
  BookOpen,
  Gauge,
  ShieldCheck,
  Network,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { AgentReview as AgentReviewType } from "@/lib/types";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { cn } from "@/lib/utils";

/**
 * Structured, judge-safe summary of what each agent in the pipeline contributed
 * to this branch. This is NOT raw chain-of-thought — every line is a one-sentence
 * record of a contribution. The Optimist vs Skeptic pair is shown as a debate.
 */
export function AgentReview({ review }: { review: AgentReviewType }) {
  const agents: { label: string; icon: LucideIcon; text: string }[] = [
    { label: "Context Agent", icon: Layers, text: review.contextAgentSummary },
    { label: "Retrieval Agent", icon: Search, text: review.retrievalAgentSummary },
    { label: "Evidence Agent", icon: BookOpen, text: review.evidenceAgentSummary },
    { label: "Calibration Agent", icon: Gauge, text: review.calibrationSummary },
    { label: "Safety Agent", icon: ShieldCheck, text: review.safetySummary },
    { label: "Synthesis Agent", icon: Network, text: review.synthesisSummary },
  ];

  return (
    <CockpitPanel
      label="Agent Review · multi-agent debate"
      icon={Network}
      accent="brand"
      status="9-role pipeline"
    >
      <p className="mb-4 text-sm leading-relaxed text-soft/85">
        A structured record of what each agent contributed — a judge-safe summary,
        not the model&apos;s raw reasoning. The Optimist and Skeptic argue the
        branch from both sides before it is calibrated.
      </p>

      {/* The debate */}
      <div className="grid gap-4 md:grid-cols-2">
        <DebateCard
          tone="quant"
          icon={TrendingUp}
          label="Optimist Agent"
          text={review.optimistView}
        />
        <DebateCard
          tone="startup"
          icon={TriangleAlert}
          label="Skeptic Agent"
          text={review.skepticView}
        />
      </div>

      {/* The rest of the chain */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {agents.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.label}
              className="flex gap-3 rounded-xl border border-line/60 bg-white/[0.02] p-3.5"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow/80" />
              <div className="space-y-1">
                <div className="mono-label">{a.label}</div>
                <p className="text-sm leading-relaxed text-soft/85">{a.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </CockpitPanel>
  );
}

function DebateCard({
  tone,
  icon: Icon,
  label,
  text,
}: {
  tone: "quant" | "startup";
  icon: LucideIcon;
  label: string;
  text: string;
}) {
  const box =
    tone === "quant"
      ? "border-quant/30 bg-quant/[0.05]"
      : "border-startup/30 bg-startup/[0.05]";
  const iconColor = tone === "quant" ? "text-quant" : "text-startup";
  return (
    <div className={cn("rounded-xl border p-4", box)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="mono-label">{label}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-soft/90">{text}</p>
    </div>
  );
}
