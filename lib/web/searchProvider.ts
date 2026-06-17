/**
 * Search provider dispatcher. Returns the first available LIVE provider, or the
 * always-available mock provider. The app therefore works with no search keys,
 * and transparently upgrades to live search when keys are present.
 */
import type { SearchProvider } from "./types";
import { mockSearchProvider } from "./mockSearch";
import { googleSearchProvider } from "./googleSearch";

const LIVE_PROVIDERS: SearchProvider[] = [googleSearchProvider];

/** The active provider — a live one if configured, else the mock provider. */
export function getSearchProvider(): SearchProvider {
  for (const p of LIVE_PROVIDERS) {
    if (p.available()) return p;
  }
  return mockSearchProvider;
}

/** True if any live search provider is configured (no secrets exposed). */
export function liveSearchAvailable(): boolean {
  return LIVE_PROVIDERS.some((p) => p.available());
}
