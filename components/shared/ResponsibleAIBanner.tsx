import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Slim, reusable responsible-AI reminder. Appears on every results surface so
 * "scenario, not prediction" is structural, not a footnote.
 */
export function ResponsibleAIBanner({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "compact";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/[0.06] px-4 py-3",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
      <p className="text-xs leading-relaxed text-soft/90">
        {variant === "compact" ? (
          <>These are <span className="text-white">plausible scenarios, not predictions.</span> Forked Futures does not choose your future — it helps you understand the futures you're choosing between.</>
        ) : (
          <>
            Everything here is a <span className="text-white font-medium">plausible scenario built from your context, curated evidence, and explicit assumptions</span> — not a prediction or a recommendation. Claims are tagged by where they came from, uncertainty is shown rather than hidden, and the final decision stays with you.
          </>
        )}
      </p>
    </div>
  );
}
