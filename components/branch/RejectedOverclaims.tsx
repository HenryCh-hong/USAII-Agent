import { ShieldX } from "lucide-react";
import { CockpitPanel } from "@/components/ui/CockpitPanel";

/**
 * What the Safety agent removed. Each item describes the category of overclaim
 * that was rejected and how it was rephrased — never the raw banned phrase — so
 * the panel itself stays responsible while showing the safety layer at work.
 */
export function RejectedOverclaims({ items }: { items: string[] }) {
  return (
    <CockpitPanel
      label="Rejected Overclaims · safety scrubber"
      icon={ShieldX}
      accent="brand"
      status={`${items.length} rewritten`}
    >
      <p className="mb-4 text-sm leading-relaxed text-soft/85">
        Before this branch reached you, the Safety agent rewrote language that
        would have overclaimed. These are the categories it removed — kept honest,
        so you can see what the system refuses to say.
      </p>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-xl border border-line/60 bg-white/[0.02] px-3.5 py-2.5"
          >
            <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow/80" />
            <span className="text-sm leading-relaxed text-soft/90">{it}</span>
          </li>
        ))}
      </ul>
    </CockpitPanel>
  );
}
