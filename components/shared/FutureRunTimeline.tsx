import { cn } from "@/lib/utils";
import { PixelTraveler } from "./PixelTraveler";

/**
 * A guided "future run" progression — frames the experience as exploring a run,
 * not reading a static dashboard. Purely visual (numbered, with an "unlocked"
 * highlight for the current step). No fake scores, no XP.
 *
 * A tiny pixel "explorer" token hovers over the active step as a "you are here"
 * marker. It is purely decorative and removable — pass `traveler={false}` to
 * hide it, or delete PixelTraveler entirely (see that file's header).
 */
const STEPS = [
  "Name the decision",
  "Reveal Decision DNA",
  "Unlock 3 paths",
  "Inspect the evidence trail",
  "Pressure-test assumptions",
  "Choose the next quest",
];

export function FutureRunTimeline({
  current,
  className,
  traveler = true,
}: {
  current?: string;
  className?: string;
  traveler?: boolean;
}) {
  const currentIdx = current ? STEPS.findIndex((s) => s.toLowerCase().includes(current.toLowerCase())) : -1;
  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center gap-x-2 gap-y-6 rounded-2xl border border-line/60 bg-panel/40 px-4 pb-3 pt-7 backdrop-blur-xl",
        className,
      )}
      aria-label="Future run progress"
    >
      <span className="mono-label mr-1">Future run</span>
      {STEPS.map((step, i) => {
        const done = currentIdx >= 0 && i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center gap-2">
            <span className="relative flex">
              {active && traveler && (
                <PixelTraveler
                  size={20}
                  className="pointer-events-none absolute -top-[19px] left-1/2 -translate-x-1/2"
                />
              )}
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  active
                    ? "border-brand bg-brand/20 text-white shadow-glow-sm"
                    : done
                      ? "border-brand/40 bg-brand/10 text-brand-glow"
                      : "border-line/70 text-mute/70",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
            </span>
            <span className={cn("text-xs", active ? "text-white" : done ? "text-soft" : "text-mute/70")}>
              {step}
            </span>
            {i < STEPS.length - 1 && <span className="hidden h-px w-4 bg-line/60 sm:inline-block" />}
          </div>
        );
      })}
    </div>
  );
}
