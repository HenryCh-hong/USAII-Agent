import { CheckCircle2, TerminalSquare } from "lucide-react";
import { CockpitPanel } from "@/components/ui/CockpitPanel";

/**
 * In-app evaluation summary for Judge Mode. Shows the most recent *local* eval
 * run (reproducible with `npm run eval`). These are deterministic checks over
 * the code, data and docs — not live-model results, and they do not claim the
 * live path is verified. Numbers mirror the committed eval scripts' output.
 */
const RESULTS: { name: string; detail: string }[] = [
  { name: "Overclaim safety", detail: "no banned / probability language across 64 user-facing files" },
  { name: "RAG coverage", detail: "349 checks · 3 branches · 7 official sources · 19 cards" },
  { name: "Agent output schema", detail: "33 checks · all 3 branches satisfy the Zod contract + carry every v2 artifact" },
  { name: "Demo journey", detail: "29 mock-path checks (42 with a live server) · keyless fallback intact" },
];

export function EvalSummary({ lastRun }: { lastRun?: string }) {
  return (
    <CockpitPanel
      label="System Evaluation · last local run"
      icon={CheckCircle2}
      accent="quant"
      status="4 / 4 passing"
    >
      <ul className="space-y-2.5">
        {RESULTS.map((r) => (
          <li
            key={r.name}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line/60 bg-white/[0.02] px-3.5 py-2.5"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-low/40 bg-low/10 px-2 py-0.5 text-[11px] font-semibold text-low">
              <CheckCircle2 className="h-3 w-3" /> PASS
            </span>
            <span className="text-sm font-medium text-white">{r.name}</span>
            <span className="w-full text-xs leading-relaxed text-mute sm:w-auto sm:flex-1">
              {r.detail}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-line/60 bg-white/[0.02] px-3.5 py-2.5">
        <TerminalSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow/80" />
        <p className="text-xs leading-relaxed text-mute">
          Reproduce locally with{" "}
          <span className="font-mono text-soft">npm run eval</span> (or{" "}
          <span className="font-mono text-soft">npm run validate</span> for
          typecheck + evals + build). These are deterministic checks over the code,
          data and docs — not live-model results. The live model path is optional
          and not yet benchmarked.
          {lastRun ? ` Last local run: ${lastRun}.` : ""}
        </p>
      </div>
    </CockpitPanel>
  );
}
