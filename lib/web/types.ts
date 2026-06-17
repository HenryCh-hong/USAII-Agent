/**
 * Web search provider abstraction. The whole live-search path is optional — the
 * app falls back to a curated mock provider when no search key is present, so the
 * demo is always stable. Providers return a normalized raw result shape; the
 * research layer enriches it with reliability/coverage/limitations.
 */

export type SearchProviderName = "mock" | "google" | "tavily";

/** A normalized raw web result (what a search engine returns). */
export interface RawSearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface SearchProvider {
  name: SearchProviderName;
  /** True when this provider has the credentials/config it needs to run live. */
  available(): boolean;
  /** Run a single query. Implementations must never throw secrets or log keys. */
  search(query: string, opts?: { limit?: number }): Promise<RawSearchResult[]>;
}

/** Extract a bare domain from a URL for provenance display. */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.split("/")[0] ?? url;
  }
}
