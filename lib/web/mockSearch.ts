/**
 * Curated mock search provider — always available, no key required. Projects the
 * curated public-source corpus into normalized raw results, ranked by overlap
 * between the query and each source's tags. Keeps the no-key demo stable and
 * fully representative of the live search shape.
 */
import type { RawSearchResult, SearchProvider } from "./types";
import { CURATED_SOURCES } from "../research/corpus";

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2);
}

export const mockSearchProvider: SearchProvider = {
  name: "mock",
  available() {
    return true;
  },
  async search(query: string, opts) {
    const limit = opts?.limit ?? 8;
    const terms = new Set(tokenize(query));
    const scored = CURATED_SOURCES.map((s) => {
      let score = 0;
      for (const tag of s.tags) if (terms.has(tag)) score += 2;
      // light boost so a query always surfaces some official anchors
      if (s.reliabilityTier === "high") score += 0.25;
      return { s, score };
    });
    return scored
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map<RawSearchResult>((x) => ({
        title: x.s.title,
        url: x.s.url,
        domain: x.s.domain,
        snippet: x.s.snippet,
      }));
  },
};
