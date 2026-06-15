/**
 * Knowledge retrieval — deliberately simple keyword matching over curated
 * JSON (per spec: no embeddings until the core app is stable). This is the
 * engine behind RetrievalAgent. Every retrieved item carries its source type,
 * coverage level, and a strength rating so the UI can show provenance.
 */
import computing from "@/knowledge/computing_careers.json";
import startup from "@/knowledge/startup_validation.json";
import grad from "@/knowledge/grad_school_research.json";
import decision from "@/knowledge/decision_science.json";
import labor from "@/knowledge/labor_market_sources.json";
import type { EvidenceCard, Level, SourceType } from "../types";

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  sourceType: SourceType;
  keywords: string[];
  coverageLevel: string;
  evidenceStrength: Level;
  citation: string;
  domain: string;
}

const FILES = [computing, startup, grad, decision, labor];

export const ALL_ITEMS: KnowledgeItem[] = FILES.flatMap((f) =>
  f.items.map((it) => ({ ...(it as Omit<KnowledgeItem, "domain">), domain: f.domain })),
);

const STOP = new Set([
  "the", "a", "an", "to", "of", "and", "or", "for", "in", "on", "is", "are",
  "i", "my", "me", "we", "should", "between", "with", "about", "vs", "versus",
  "be", "do", "this", "that", "it", "as", "at", "by", "from", "want", "into",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

/**
 * Score knowledge items against free-text query terms by keyword overlap.
 * Returns the top `limit` items, optionally restricted to certain domains.
 */
export function retrieve(
  query: string | string[],
  opts: { limit?: number; domains?: string[] } = {},
): KnowledgeItem[] {
  const { limit = 6, domains } = opts;
  const terms = Array.isArray(query)
    ? query.flatMap(tokenize)
    : tokenize(query);
  const termSet = new Set(terms);

  const pool = domains
    ? ALL_ITEMS.filter((it) => domains.includes(it.domain))
    : ALL_ITEMS;

  const scored = pool.map((item) => {
    let score = 0;
    for (const kw of item.keywords) {
      const kwTokens = tokenize(kw);
      // full keyword phrase appears in query terms
      if (kwTokens.every((t) => termSet.has(t)) && kwTokens.length > 0) {
        score += 2;
      } else if (kwTokens.some((t) => termSet.has(t))) {
        score += 1;
      }
    }
    // light boost for high-strength, broadly-applicable frameworks
    if (item.evidenceStrength === "high") score += 0.25;
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

/** Convert a knowledge item into the EvidenceCard shape used by branches. */
export function toEvidenceCard(item: KnowledgeItem, usedFor: string): EvidenceCard {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    content: item.content,
    sourceType: item.sourceType,
    usedFor,
    evidenceStrength: item.evidenceStrength,
  };
}

/** Domain hints used to bias retrieval toward each branch's track. */
export const DOMAIN_HINTS: Record<string, string[]> = {
  quant: ["computing_careers", "labor_market_sources", "decision_science"],
  startup: ["startup_validation", "decision_science", "labor_market_sources"],
  research: ["grad_school_research", "decision_science", "labor_market_sources"],
};
