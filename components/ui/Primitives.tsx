import { cn, levelClasses, levelToFraction, type Level } from "@/lib/utils";

/** Small label/value stack. */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-[11px] uppercase tracking-wider text-mute">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
      {hint && <div className="text-xs text-mute/80">{hint}</div>}
    </div>
  );
}

/** Horizontal level bar (low/medium/high → fraction). */
export function LevelBar({
  level,
  className,
}: {
  level: Level;
  className?: string;
}) {
  const lc = levelClasses(level);
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-white/8 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full", lc.dot)}
        style={{ width: `${levelToFraction(level) * 100}%` }}
      />
    </div>
  );
}

export function Dot({ level }: { level: Level }) {
  return <span className={cn("h-2 w-2 rounded-full", levelClasses(level).dot)} />;
}

/** Bulleted list with a subtle marker; used everywhere for branch fields. */
export function BulletList({
  items,
  marker = "•",
  className,
  itemClassName,
}: {
  items: string[];
  marker?: string;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((it, i) => (
        <li key={i} className={cn("flex gap-3 text-sm leading-relaxed text-soft", itemClassName)}>
          <span className="mt-0.5 select-none text-brand-glow/70">{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line/60", className)} />;
}

/** Faint label chip used for tags/keywords. */
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-line/60 bg-white/[0.03] px-2.5 py-1 text-xs text-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}
