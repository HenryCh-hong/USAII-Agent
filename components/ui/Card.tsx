import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  glow,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean; hover?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-line/70 bg-panel/60 backdrop-blur-xl shadow-panel",
        glow && "shadow-glow",
        hover &&
          "transition-all duration-300 hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-glow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}

export function CardTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-white tracking-tight", className)}>
      {children}
    </h3>
  );
}
