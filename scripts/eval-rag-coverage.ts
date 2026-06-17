/**
 * Eval 2 — RAG coverage.
 *
 * Verifies the evidence layer is real and honest: every branch carries enough
 * provenance-bearing evidence, distinguishes source-supported claims from
 * AI-inferred assumptions, and the official-source pack JSON is fully populated
 * with no fabricated exact statistics. Reads the source pack from disk (fs) so
 * it needs no @/ alias resolution.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DEMO_BRANCHES } from "../lib/mock/index";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SOURCES_DIR = join(ROOT, "knowledge", "sources");

let checks = 0;
function ok(cond: unknown, msg: string): void {
  assert.ok(cond, msg);
  checks++;
}

/* ---------------------------- Branch coverage ----------------------------- */

for (const b of DEMO_BRANCHES) {
  ok(b.evidenceCards.length >= 2, `${b.id}: has at least 2 evidence cards (${b.evidenceCards.length})`);

  const sourced = b.evidenceCards.filter(
    (c) => c.sourceName && c.sourceUrl && c.coverageLevel && c.claim && c.limitations,
  );
  ok(sourced.length >= 1, `${b.id}: has at least 1 evidence card with full provenance (sourceName/sourceUrl/coverageLevel/claim/limitations)`);

  ok(
    typeof b.calibration.dataCoverageNote === "string" && b.calibration.dataCoverageNote.length > 20,
    `${b.id}: has a dataCoverageNote`,
  );

  const hasLimitations =
    b.baseRateSignals.some((s) => s.limitations && s.limitations.length > 0) ||
    b.evidenceCards.some((c) => c.limitations && c.limitations.length > 0);
  ok(hasLimitations, `${b.id}: states limitations / source-coverage language somewhere`);

  // Distinguishes source-supported claims from AI-inferred assumptions.
  const hasInferred = b.assumptions.some((a) => a.type === "ai_inferred");
  const hasSupported =
    b.assumptions.some((a) => a.type === "source_supported") || sourced.length >= 1;
  ok(hasInferred, `${b.id}: flags at least one ai_inferred assumption`);
  ok(hasSupported, `${b.id}: carries at least one source-supported claim`);
}

/* ------------------------- Official-source pack JSON ---------------------- */

const PERCENT_RE = /\d{1,3}(?:\.\d+)?\s?%/; // no fabricated exact statistics
const REQUIRED = [
  "id",
  "title",
  "sourceName",
  "publisher",
  "sourceUrl",
  "sourceType",
  "category",
  "coverageLevel",
  "claim",
  "limitations",
  "usedFor",
  "reliabilityLevel",
  "lastReviewed",
] as const;

const sourceFiles = readdirSync(SOURCES_DIR).filter((f) => f.endsWith(".json"));
ok(sourceFiles.length >= 7, `official-source pack has >= 7 files (${sourceFiles.length})`);

let cardCount = 0;
const sourceById = new Map<string, { claim: string; title: string }>();
for (const file of sourceFiles) {
  const data = JSON.parse(readFileSync(join(SOURCES_DIR, file), "utf8"));
  ok(Array.isArray(data.items) && data.items.length >= 1, `${file}: has items`);
  for (const card of data.items) {
    cardCount++;
    sourceById.set(card.id, { claim: String(card.claim ?? ""), title: String(card.title ?? "") });
    for (const field of REQUIRED) {
      ok(card[field] !== undefined && card[field] !== "", `${file} · ${card.id}: has "${field}"`);
    }
    ok(Array.isArray(card.usedFor) && card.usedFor.length >= 1, `${file} · ${card.id}: usedFor is a non-empty array`);
    ok(["medium", "high"].includes(card.reliabilityLevel), `${file} · ${card.id}: reliabilityLevel is medium|high`);
    ok(!PERCENT_RE.test(card.claim), `${file} · ${card.id}: claim contains no fabricated exact percentage`);
    ok(!PERCENT_RE.test(card.limitations), `${file} · ${card.id}: limitations contains no fabricated exact percentage`);
  }
}

/* ------------------- Claim-to-source fidelity (entailment proxy) ----------- */
// Each branch evidence card that cites a source-pack card by id must share
// non-trivial token overlap with that source's own framing — turning "a citation
// exists" into "the citation's framing matches the claim", catching mismatched pairs.
function toks(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 4),
  );
}
let fidelityChecked = 0;
for (const b of DEMO_BRANCHES) {
  for (const card of b.evidenceCards) {
    if (!card.sourceCardId) continue;
    const src = sourceById.get(card.sourceCardId);
    ok(src, `${b.id} · ${card.id}: sourceCardId "${card.sourceCardId}" resolves to a source-pack card`);
    if (!src) continue;
    const claimToks = toks(card.claim ?? card.content ?? "");
    const srcToks = toks(`${src.claim} ${src.title}`);
    let overlap = 0;
    for (const t of claimToks) if (srcToks.has(t)) overlap++;
    ok(overlap >= 2, `${b.id} · ${card.id}: claim shares >=2 meaningful tokens with cited source (${overlap})`);
    fidelityChecked++;
  }
}
ok(fidelityChecked >= 3, `claim-to-source fidelity checked on >=3 sourced cards (${fidelityChecked})`);

console.log(
  `PASS  eval-rag-coverage — ${checks} checks (${DEMO_BRANCHES.length} branches, ${sourceFiles.length} source files, ${cardCount} cards, ${fidelityChecked} fidelity)`,
);
