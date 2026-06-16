import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "brand" | "quant" | "startup" | "research" | "neutral";

const ACCENT: Record<Accent, { text: string; border: string; dot: string }> = {
  brand: { text: "text-brand-glow", border: "border-brand/40", dot: "bg-brand-glow" },
  quant: { text: "text-quant", border: "border-quant/40", dot: "bg-quant" },
  startup: { text: "text-startup", border: "border-startup/40", dot: "bg-startup" },
  research: { text: "text-research", border: "border-research/40", dot: "bg-research" },
  neutral: { text: "text-soft", border: "border-line/70", dot: "bg-mute" },
};

/** Small L-bracket corner marks that give panels an instrument-readout feel. */
function Corners({ className }: { className?: string }) {
  const base = "absolute h-2.5 w-2.5 border-current opacity-50";
  return (
    <span aria-hidden className={cn("pointer-events-none text-line", className)}>
      <span className={cn(base, "left-2 top-2 border-l border-t")} />
      <span className={cn(base, "right-2 top-2 border-r border-t")} />
      <span className={cn(base, "bottom-2 left-2 border-b border-l")} />
      <span className={cn(base, "bottom-2 right-2 border-b border-r")} />
    </span>
  );
}

/**
 * The reusable cockpit panel shell: a glassy card with corner brackets, a mono
 * instrument label, an optional status LED, and an optional icon/title. Wrap any
 * content in it to give a surface the "decision-intelligence cockpit" feel.
 */
export function CockpitPanel({
  label,
  title,
  icon: Icon,
  accent = "brand",
  status,
  className,
  bodyClassName,
  corners = true,
  children,
}: {
  label: string;
  title?: React.ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
  status?: string;
  className?: string;
  bodyClassName?: string;
  corners?: boolean;
  children: React.ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <section className={cn("cockpit overflow-hidden", className)}>
      {corners && <Corners />}
      <header
        className={cn(
          "flex items-center justify-between gap-3 border-b border-line/50 bg-white/[0.015] px-5 py-3",
        )}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={cn("h-4 w-4", a.text)} />}
          <span className="mono-label">{label}</span>
        </div>
        {status && (
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full animate-led", a.dot)} />
            <span className="mono-label">{status}</span>
          </span>
        )}
      </header>
      {title && (
        <div className="px-5 pt-4">
          <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
        </div>
      )}
      <div className={cn("px-5 py-5", bodyClassName)}>{children}</div>
    </section>
  );
}
