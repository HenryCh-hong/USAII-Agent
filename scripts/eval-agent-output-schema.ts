/**
 * Eval 3 — Agent output schema.
 *
 * Asserts the canonical 3-branch mock dataset satisfies the production Zod
 * contract and carries every v2 structured artifact a branch is expected to
 * have. Framework-free: tsx + node:assert. Imports only relative modules
 * (lib/schemas, lib/mock) so it needs no @/ path-alias resolution and never
 * touches the Anthropic SDK or an API key.
 */
import assert from "node:assert/strict";
import { branchesOnlySchema, simulationResultSchema } from "../lib/schemas";
import { DEMO_SIMULATION, DEMO_BRANCHES } from "../lib/mock/index";

let checks = 0;
function ok(cond: unknown, msg: string): void {
  assert.ok(cond, msg);
  checks++;
}

// The 3-branch generation contract (exactly 3, every field valid).
const parsed = branchesOnlySchema.safeParse({ branches: DEMO_BRANCHES });
ok(parsed.success, "DEMO_BRANCHES satisfies branchesOnlySchema (exactly 3, all fields valid)");

const simParsed = simulationResultSchema.safeParse(DEMO_SIMULATION);
ok(simParsed.success, "DEMO_SIMULATION satisfies simulationResultSchema");

ok(DEMO_BRANCHES.length === 3, "exactly 3 branches");

for (const b of DEMO_BRANCHES) {
  ok(b.calibration, `${b.id}: calibration present`);
  ok(Array.isArray(b.assumptions) && b.assumptions.length > 0, `${b.id}: assumption ledger present`);
  ok(b.agentReview && b.agentReview.branchId === b.id, `${b.id}: agentReview present and self-referential`);
  ok(b.reasoningAuditTrail && b.reasoningAuditTrail.branchId === b.id, `${b.id}: reasoningAuditTrail present`);
  ok(
    b.evidenceGraphSnapshot && b.evidenceGraphSnapshot.nodes.length > 0 && b.evidenceGraphSnapshot.edges.length > 0,
    `${b.id}: evidenceGraphSnapshot has nodes and edges`,
  );
  ok(Array.isArray(b.sevenDayExperiment) && b.sevenDayExperiment.length === 7, `${b.id}: 7-day experiment has 7 steps`);
  ok(Array.isArray(b.premortem) && b.premortem.length > 0, `${b.id}: premortem present`);
  ok(Array.isArray(b.rejectedOverclaims) && b.rejectedOverclaims.length > 0, `${b.id}: rejectedOverclaims present`);
  ok(Array.isArray(b.evaluationSignals) && b.evaluationSignals.length > 0, `${b.id}: evaluationSignals present`);
  ok(
    typeof b.calibration.calibrationRationale === "string" && b.calibration.calibrationRationale.length > 0,
    `${b.id}: calibrationRationale present`,
  );
}

console.log(`PASS  eval-agent-output-schema — ${checks} checks across ${DEMO_BRANCHES.length} branches`);
