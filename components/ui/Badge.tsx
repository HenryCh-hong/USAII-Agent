import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "low" | "medium" | "high" | "quant" | "startup" | "research";

const tones: Record<Tone, string> = {
  neutral: "border-line/70 bg-white/5 text-mute",
  brand: "border-brand/40 bg-brand/10 text-brand-glow",
  low: "border-low/40 bg-low/10 text-low",
  medium: "border-medium/40 bg-medium/10 text-medium",
  high: "border-high/40 bg-high/10 text-high",
  quant: "border-quant/40 bg-quant/10 text-quant",
  startup: "border-startup/40 bg-startup/10 text-startup",
  research: "border-research/40 bg-research/10 text-research",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
