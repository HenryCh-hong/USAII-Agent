/**
 * Eval 7 — Specificity (anti-genericity).
 *
 * Asserts the product reads as a tailored diagnosis of THIS decision, not generic
 * advice. Checks the Decision DNA structure (core tension, per-branch bottlenecks,
 * concrete 7-day tests, a one-line diagnosis) and scans user-facing copy for
 * generic advice phrases. Framework-free: tsx + node:assert, relative imports.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { buildDecisionDna } from "../lib/decision/decisionDna";
import { DEMO_CONTEXT } from "../lib/mock/demoContext";
import { DEMO_BRANCHES } from "../lib/mock/index";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

let checks = 0;
function ok(cond: unknown, msg: string): void {
  assert.ok(cond, msg);
  checks++;
}

/* ----------------------------- Decision DNA ------------------------------- */

const dna = buildDecisionDna(DEMO_CONTEXT, DEMO_BRANCHES);
ok(dna.coreTension.length > 40, "Decision DNA: core tension present and specific");
ok(dna.hiddenDecision.length > 20, "Decision DNA: hidden decision present");
ok(dna.diagnosis.length > 20 && dna.diagnosis.length < 400, "Decision DNA: a concise one-line diagnosis present");
ok(/hypothesis|diagnosis/i.test(dna.diagnosis), "diagnosis is framed as a hypothesis, not a verdict");
ok(dna.valueConflict.length >= 2, "Decision DNA: value conflict named");
ok(dna.branchBottlenecks.length === DEMO_BRANCHES.length, "each branch has a bottleneck");

const GENERIC = [
  "follow your passion",
  "weigh the pros and cons",
  "consider your options",
  "do more research",
  "think carefully",
  "choose what aligns with your goals",
  "there is no right answer",
  "it depends",
];

for (const b of dna.branchBottlenecks) {
  ok(b.bottleneck.length > 15, `${b.track}: bottleneck is named`);
  ok(b.strengthensIf.length > 0 && b.weakensIf.length > 0, `${b.track}: strengthens/weakens present`);
  ok(b.sevenDayTest.length > 30, `${b.track}: a specific 7-day test present`);
  for (const g of GENERIC) {
    ok(!b.sevenDayTest.toLowerCase().includes(g), `${b.track}: 7-day test is concrete, not generic ("${g}")`);
  }
}

// Names the actual decision tension (not a generic "career choice").
const tl = dna.coreTension.toLowerCase();
ok(
  /compound|signal|upside|depth/.test(tl) || dna.valueConflict.some((v) => tl.includes(v.toLowerCase())),
  "core tension names the actual decision tension",
);

/* ----------------------- Generic-advice copy scan ------------------------- */

const ROOTS = ["lib/decision", "lib/mock", "lib/research", "components", "app", "docs/submission"];
const EXTS = [".ts", ".tsx", ".md", ".json"];

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

const violations: string[] = [];
for (const root of ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    const lower = readFileSync(file, "utf8").toLowerCase();
    for (const g of GENERIC) {
      if (lower.includes(g)) violations.push(`${relative(ROOT, file)} :: "${g}"`);
    }
  }
}

if (violations.length) {
  console.error(`FAIL  eval-specificity — generic-advice language in user-facing copy:`);
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log(`PASS  eval-specificity — ${checks} checks; Decision DNA is specific; no generic-advice language`);
