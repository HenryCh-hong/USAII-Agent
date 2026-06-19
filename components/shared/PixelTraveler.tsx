import { cn } from "@/lib/utils";

/**
 * A tiny pixel "explorer" token — a purely presentational wayfinding flourish
 * for the Future Run. Built from an inline SVG pixel grid (no image assets, no
 * external deps), accent-tinted, with a soft glow so it sits inside the
 * cockpit/starfield look rather than reading as a flat retro sprite. The gentle
 * bob is CSS-only (`.traveler-bob` in globals.css) and is auto-disabled under
 * `prefers-reduced-motion`. It is decorative (aria-hidden).
 *
 * Safe to remove: delete this file, the `.traveler-bob` rule in globals.css, and
 * the <PixelTraveler/> usage in FutureRunTimeline — nothing else depends on it.
 */

const ACCENT_HEX = {
  brand: "#6ff0e2",
  quant: "#38e0d0",
  startup: "#ff9b50",
  research: "#7c93b8",
} as const;

export type TravelerAccent = keyof typeof ACCENT_HEX;

// 8 cols x 11 rows. "1" = a filled pixel. Reads as a small space-explorer
// silhouette (helmet with a visor gap, compact body, legs, boots) — abstract,
// deliberately faceless so it stays a "token", never a cartoon mascot.
const FIGURE = [
  "00111100",
  "01111110",
  "01100110",
  "01111110",
  "00111100",
  "01111110",
  "01111110",
  "01111110",
  "00111100",
  "00100100",
  "01100110",
];

export function PixelTraveler({
  accent = "brand",
  size = 22,
  bob = true,
  className,
}: {
  accent?: TravelerAccent;
  size?: number;
  bob?: boolean;
  className?: string;
}) {
  const cols = FIGURE[0].length;
  const rows = FIGURE.length;
  const hex = ACCENT_HEX[accent];
  const width = Math.round((size * cols) / rows);

  return (
    <span
      aria-hidden="true"
      className={cn("inline-block leading-none", bob && "traveler-bob", className)}
      style={{ filter: `drop-shadow(0 0 4px ${hex}aa)` }}
    >
      <svg
        width={width}
        height={size}
        viewBox={`0 0 ${cols} ${rows}`}
        shapeRendering="crispEdges"
        focusable="false"
      >
        {FIGURE.flatMap((line, y) =>
          line.split("").map((c, x) =>
            c === "1" ? (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={hex} />
            ) : null,
          ),
        )}
      </svg>
    </span>
  );
}
