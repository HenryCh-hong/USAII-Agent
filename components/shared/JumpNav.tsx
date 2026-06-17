import { cn } from "@/lib/utils";

/**
 * Lightweight in-page anchor bar for dense pages. Pure anchor links (native
 * smooth scroll via the global scroll-behavior); no JS. Targets must set a
 * matching `id` on their <Section> (Section adds scroll-mt for the sticky nav).
 */
export function JumpNav({
  items,
  className,
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-line/60 bg-panel/50 px-4 py-3 backdrop-blur-xl",
        className,
      )}
      aria-label="On this page"
    >
      <span className="mono-label">Jump to</span>
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className="rounded-lg border border-line/60 bg-white/[0.03] px-2.5 py-1 text-xs text-soft transition-colors hover:border-brand/40 hover:text-white"
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
