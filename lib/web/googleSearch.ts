/**
 * Live search provider via Google Programmable Search (JSON API), using native
 * fetch — no SDK dependency. Entirely optional: it only activates when both
 * GOOGLE_SEARCH_API_KEY and GOOGLE_CSE_ID are set. Without them the app uses the
 * mock provider. Keys are read from the environment and never logged or returned.
 *
 * To add another provider (Tavily, SerpAPI, Exa), implement the same
 * SearchProvider interface and register it in searchProvider.ts.
 */
import type { RawSearchResult, SearchProvider } from "./types";
import { domainOf } from "./types";

function hasGoogle(): boolean {
  return Boolean(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_CSE_ID);
}

export const googleSearchProvider: SearchProvider = {
  name: "google",
  available() {
    return hasGoogle();
  },
  async search(query: string, opts) {
    const limit = Math.min(opts?.limit ?? 8, 10); // cap result count
    const key = process.env.GOOGLE_SEARCH_API_KEY as string;
    const cx = process.env.GOOGLE_CSE_ID as string;
    const url =
      "https://www.googleapis.com/customsearch/v1?key=" +
      encodeURIComponent(key) +
      "&cx=" +
      encodeURIComponent(cx) +
      "&num=" +
      String(limit) +
      "&safe=active&q=" +
      encodeURIComponent(query);

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`search provider returned ${res.status}`);
    const data = (await res.json()) as {
      items?: { title?: string; link?: string; snippet?: string }[];
    };
    return (data.items ?? [])
      .filter((it) => it.link)
      .slice(0, limit)
      .map<RawSearchResult>((it) => ({
        title: it.title ?? it.link ?? "",
        url: it.link as string,
        domain: domainOf(it.link as string),
        snippet: it.snippet ?? "",
      }));
  },
};
