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
          <>These are futures to <span className="text-white">rehearse, not prophecies</span>. Forked Futures helps you explore the paths you&apos;re choosing between — the decision stays yours.</>
        ) : (
          <>
            Everything here is a <span className="text-white font-medium">future to rehearse — built from your context, evidence, and explicit assumptions</span>. Treat it as a map to test this week, not an answer to obey: claims are tagged by where they came from, uncertainty is shown rather than hidden, and the choice stays with you.
          </>
        )}
      </p>
    </div>
  );
}
