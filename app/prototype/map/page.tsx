import Link from "next/link";
import { ArrowRight, Sparkles, FlaskConical, Swords } from "lucide-react";
import { PixelTraveler } from "@/components/shared/PixelTraveler";
import { buildUnlivedFuture } from "@/lib/decision/unlivedFuture";
import { DEMO_BRANCHES } from "@/lib/mock";

/**
 * PROTOTYPE — pure-white pixel-game direction, on ONE page only (not the live
 * theme). Self-contained: uses explicit light colors (NOT the dark Signal Horizon
 * tokens), so it stays white regardless of the global theme. Not linked in nav;
 * delete this folder to revert. For visual review before any global migration.
 */

const STAT = ["Signal", "Autonomy", "Depth"];
const BOSS = ["Interview + proof-of-skill", "Real customer demand", "Sustained uncertainty"];

// Light accent palette: cyan = signal/AI, orange = action/selected, green = safe test.
const ACCENT = [
  { name: "cyan", text: "text-cyan-700", chip: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  { name: "orange", text: "text-orange-700", chip: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  { name: "slate", text: "text-slate-700", chip: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-500" },
];

export default function PrototypeMapPage() {
  const branches = DEMO_BRANCHES;
  const enteredId = branches[0].id; // demo: route 0 is "entered"

  return (
    <main
      className="min-h-screen bg-[#fafaf7] text-neutral-900"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-bold tracking-tight">
            Forked<span className="text-cyan-600">Futures</span>
          </div>
          <span className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600 shadow-[2px_2px_0_0_#e5e5e5]">
            PROTOTYPE · pure-white pixel direction
          </span>
        </div>

        {/* Title + guide */}
        <div className="mt-10 flex items-start gap-4">
          <PixelTraveler size={40} accent="startup" bob={false} />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">
              Route select
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Choose a fork
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
              Your AI guide mapped three evidence-grounded futures. Enter one route —
              the others stay on the map as unlived futures you can still sample.
            </p>
          </div>
        </div>

        {/* You are here marker */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-orange-300 bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-700 shadow-[3px_3px_0_0_#fed7aa]">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> You are here · the decision fork
        </div>

        {/* Route cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {branches.map((b, i) => {
            const a = ACCENT[i % 3];
            const current = b.id === enteredId;
            const u = buildUnlivedFuture(b);
            return (
              <div
                key={b.id}
                className={`flex flex-col rounded-xl border-2 bg-white p-5 ${
                  current ? "border-orange-400 shadow-[5px_5px_0_0_#fdba74]" : "border-neutral-300 shadow-[4px_4px_0_0_#e5e5e5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${a.text}`}>
                    {b.track.replace(/\bTrack\b/, "Route")}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${a.chip}`}>
                    <Sparkles className="h-3 w-3" /> {STAT[i]}
                  </span>
                </div>

                {current ? (
                  <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-orange-300 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Current path
                  </span>
                ) : (
                  <span className="mt-2 inline-flex w-fit items-center rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
                    Unlived future · still explorable
                  </span>
                )}

                <h3 className="mt-3 text-lg font-bold leading-snug">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{b.thesis}</p>

                <div className="mt-3 flex items-start gap-2 text-sm text-neutral-700">
                  <Swords className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <span><span className="font-semibold">Boss fight:</span> {BOSS[i]}</span>
                </div>
                <div className="mt-2 flex items-start gap-2 text-sm text-neutral-700">
                  <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span><span className="font-semibold text-emerald-700">7-day test:</span> {u.sampleTest}</span>
                </div>

                <button
                  className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] transition-transform active:translate-x-[1px] active:translate-y-[1px] ${
                    current ? "bg-orange-500" : "bg-cyan-600"
                  }`}
                >
                  {current ? "You're on this route" : "Peek at this future"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 rounded-lg border border-neutral-300 bg-white/70 p-4 text-xs leading-relaxed text-neutral-600 shadow-[2px_2px_0_0_#e5e5e5]">
          This is a <span className="font-semibold text-neutral-800">visual prototype only</span> — the
          live app keeps the Signal Horizon dark theme. It previews the pure-white pixel-game
          direction (light canvas, pixel-offset cards, cyan = signal, orange = selected action,
          green = safe 7-day test). Future scripts are plausible trajectories, not deterministic
          predictions.{" "}
          <Link href="/map" className="font-semibold text-cyan-700 underline">
            ← back to the live map
          </Link>
        </div>
      </div>
    </main>
  );
}
