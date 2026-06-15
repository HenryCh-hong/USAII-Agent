"use client";

import { useEffect, useState } from "react";
import { useForkedStore } from "./store";
import { DEMO_CONTEXT, DEMO_QUESTIONS, DEMO_SIMULATION } from "./mock";

/**
 * Ensures there's always a simulation to render. If the user lands on a results
 * page directly (e.g. a judge opening /map), we seed the Alex demo so the
 * journey is never empty. Returns whether hydration was needed.
 */
export function useEnsureSimulation(): { ready: boolean; seeded: boolean } {
  const simulation = useForkedStore((s) => s.simulation);
  const hydrateDemo = useForkedStore((s) => s.hydrateDemo);
  const [ready, setReady] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!simulation) {
      hydrateDemo(DEMO_CONTEXT, DEMO_QUESTIONS, DEMO_SIMULATION);
      setSeeded(true);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ready, seeded };
}

/** Avoids hydration mismatch for store-driven client pages. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
