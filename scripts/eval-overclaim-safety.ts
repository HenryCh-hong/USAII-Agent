/**
 * Eval 1 — Overclaim safety.
 *
 * Scans user-facing source, mock outputs, knowledge cards, and submission docs
 * for deterministic / overconfident / fake-probability language. Uses
 * word-boundary patterns with negation-aware context handling so honest safe
 * phrases ("not a prediction", "guarantees nothing", "does not predict your
 * future") are not falsely flagged.
 *
 * Scope notes:
 *  - lib/ai/* (the SafetyAgent patterns + prompt rules that legitimately name
 *    the banned phrases) and scripts/* (this list) are intentionally NOT scanned.
 *  - The exact-percentage check runs only over data/docs (mock, knowledge, docs)
 *    so legitimate CSS percentages in app/components are not false positives.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

// Phrase patterns (mirror the SafetyAgent's intent). Word-boundary anchored.
const PHRASE_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\byou will\b/i, label: "you will" },
  { re: /\byou'll\b/i, label: "you'll" },
  { re: /\bguaranteed\b/i, label: "guaranteed" },
  { re: /\bbest choice\b/i, label: "best choice" },
  { re: /\byou should (?:choose|pick)\b/i, label: "you should choose/pick" },
  { re: /\bcertainly\b/i, label: "certainly" },
  { re: /\bsuccess probability\b/i, label: "success probability" },
  { re: /\bprobability of success\b/i, label: "probability of success" },
  { re: /\bsuccess rate\b/i, label: "success rate" },
  { re: /\bpredicts? your future\b/i, label: "predicts your future" },
];
const PERCENT_RE = /\b\d{1,3}(?:\.\d+)?\s?%/;
const NEGATION_RE =
  /\b(?:not|never|no|without|nor|nothing|neither|don'?t|doesn'?t|isn'?t|won'?t|cannot|can'?t)\b/i;

// Roots scanned for banned phrases (user-facing surfaces + docs + data).
const PHRASE_ROOTS = ["lib/mock", "knowledge", "components", "app", "docs/submission"];
// Roots scanned for fabricated exact percentages (data/docs only).
const PERCENT_ROOTS = ["lib/mock", "knowledge", "docs/submission"];
const EXTS = [".ts", ".tsx", ".json", ".md"];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".git")) continue;
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (EXTS.some((e) => full.endsWith(e))) out.push(full);
  }
  return out;
}

function filesFor(roots: string[]): string[] {
  const set = new Set<string>();
  for (const r of roots) for (const f of walk(join(ROOT, r))) set.add(f);
  return [...set];
}

type Violation = { file: string; line: number; label: string; text: string };
const violations: Violation[] = [];

// Phrase scan with same-line negation context.
for (const file of filesFor(PHRASE_ROOTS)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { re, label } of PHRASE_PATTERNS) {
      const m = line.match(re);
      if (!m || m.index === undefined) continue;
      const before = line.slice(Math.max(0, m.index - 40), m.index);
      if (NEGATION_RE.test(before)) continue; // safe negation
      violations.push({ file: relative(ROOT, file), line: i + 1, label, text: line.trim().slice(0, 160) });
    }
  });
}

// Exact-percentage scan over data/docs only.
for (const file of filesFor(PERCENT_ROOTS)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = line.match(PERCENT_RE);
    if (m) violations.push({ file: relative(ROOT, file), line: i + 1, label: "exact %", text: line.trim().slice(0, 160) });
  });
}

if (violations.length) {
  console.error(`FAIL  eval-overclaim-safety — ${violations.length} violation(s):`);
  for (const v of violations) console.error(`  ${v.file}:${v.line} [${v.label}] ${v.text}`);
  process.exit(1);
}

const scanned = filesFor(PHRASE_ROOTS).length;
console.log(`PASS  eval-overclaim-safety — no overclaim/probability language in ${scanned} user-facing files`);
