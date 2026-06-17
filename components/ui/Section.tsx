import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-glow/80",
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-brand-glow animate-pulse-glow" />
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      {subtitle && <p className="text-soft/80 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8 scroll-mt-20", className)}
      {...props}
    >
      {children}
    </section>
  );
}
