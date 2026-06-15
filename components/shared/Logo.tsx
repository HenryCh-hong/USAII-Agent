import Link from "next/link";
import { cn } from "@/lib/utils";

/** Forked Futures wordmark with a small branching glyph. */
export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        className="shrink-0 drop-shadow-[0_0_8px_rgba(124,140,255,0.6)]"
        aria-hidden
      >
        <path
          d="M6 22V12c0-2 1-3 3-3h3"
          stroke="#7c8cff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M6 13c0-2 1-3 3-3h3" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M6 18c0-2 1-3 3-3h3"
          stroke="#c084fc"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="6" cy="22" r="2" fill="#7c8cff" />
        <circle cx="15" cy="9" r="2" fill="#5eead4" />
        <circle cx="15" cy="13" r="2" fill="#fca65a" />
        <circle cx="15" cy="18" r="2" fill="#c084fc" />
      </svg>
      {!compact && (
        <span className="font-semibold tracking-tight text-white">
          Forked<span className="text-brand-glow">Futures</span>
        </span>
      )}
    </Link>
  );
}
