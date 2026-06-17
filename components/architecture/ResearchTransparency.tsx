import { Telescope, ShieldCheck, Layers, Ban } from "lucide-react";
import { CockpitPanel } from "@/components/ui/CockpitPanel";
import { Pill } from "@/components/ui/Primitives";

/**
 * Judge-facing transparency for the autonomous research agent: provider status,
 * source-ranking logic, safety filters, and an explicit statement of why this is
 * NOT person-matching. Static and honest — the live dossier lives on /research.
 */
export function ResearchTransparency() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CockpitPanel label="Search provider" icon={Telescope} accent="brand" status="live-optional">
        <p className="text-sm leading-relaxed text-soft/85">
          A provider abstraction (<span className="font-mono text-xs text-soft">lib/web</span>) runs
          live web search when a key is configured — Google Programmable Search by
          default, and pluggable to Tavily / SerpAPI / Exa — and otherwise falls
          back to a curated public-source corpus. The demo runs on the{" "}
          <span className="text-white">mock corpus with no key</span>; keys are read
          from the environment and never logged or exposed.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill>Google Programmable Search</Pill>
          <Pill>Tavily / SerpAPI / Exa-ready</Pill>
          <Pill>Mock fallback (no key)</Pill>
        </div>
      </CockpitPanel>

      <CockpitPanel label="Source ranking" icon={Layers} accent="quant" status="quality > precision">
        <ul className="space-y-2 text-sm leading-relaxed text-soft/85">
          <li className="flex gap-2"><span className="text-quant">High</span> — official / statistical (.gov, .edu) and established frameworks.</li>
          <li className="flex gap-2"><span className="text-medium">Medium</span> — cohort surveys and public career guidance, used as analogies and flagged for survivorship bias.</li>
          <li className="flex gap-2"><span className="text-high">Low</span> — anecdotes, unverified, or stale pages — kept as leads, rejected as evidence with a stated reason.</li>
        </ul>
      </CockpitPanel>

      <CockpitPanel label="Why this is not person-matching" icon={Ban} accent="research" status="responsible">
        <ul className="space-y-2 text-sm leading-relaxed text-soft/85">
          <li className="flex gap-2"><Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-research" /> No face-based identification, no identifying private people, no de-anonymization.</li>
          <li className="flex gap-2"><Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-research" /> Queries are about roles, fields, programs, and frameworks — never person lookups.</li>
          <li className="flex gap-2"><Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-research" /> Public references are role archetypes and guidance used as analogies — never &quot;you resemble this person&quot;.</li>
        </ul>
      </CockpitPanel>

      <CockpitPanel label="Safety filters" icon={ShieldCheck} accent="brand" status="enforced">
        <ul className="space-y-2 text-sm leading-relaxed text-soft/85">
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow" /> A query guard skips person-lookup patterns; result counts are capped.</li>
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow" /> Every source carries coverage level + limitations; aggregates are never personalized.</li>
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow" /> An eval (<span className="font-mono text-xs">eval-research-quality</span>) enforces these properties.</li>
        </ul>
      </CockpitPanel>
    </div>
  );
}
