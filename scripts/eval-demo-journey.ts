/**
 * Eval 4 — Demo journey.
 *
 * Proves the keyless mock path is whole: the mock builders return mocked:true
 * with three branches that carry every v2 panel's data, questions/brief/chat all
 * work, and none of it depends on ANTHROPIC_API_KEY. If a dev/prod server is
 * reachable at BASE, it also smoke-tests that key pages render and key APIs
 * return 200 with mocked:true. Framework-free: tsx + node:assert.
 */
import assert from "node:assert/strict";
import {
  buildMockSimulation,
  buildMockQuestions,
  buildMockBrief,
  mockChatReply,
  DEMO_BRANCHES,
} from "../lib/mock/index";
import { DEMO_CONTEXT } from "../lib/mock/demoContext";

let checks = 0;
function ok(cond: unknown, msg: string): void {
  assert.ok(cond, msg);
  checks++;
}

/* --------------------- In-process mock path (no key) ---------------------- */

ok(!process.env.ANTHROPIC_API_KEY, "eval runs with ANTHROPIC_API_KEY unset (mock path)");

const sim = buildMockSimulation(DEMO_CONTEXT);
ok(sim.mocked === true, "buildMockSimulation returns mocked:true without a key");
ok(sim.branches.length === 3, "mock simulation returns exactly 3 branches");
for (const b of sim.branches) {
  ok(b.agentReview, `${b.id}: agentReview data available on mock path`);
  ok(b.reasoningAuditTrail, `${b.id}: reasoningAuditTrail data available on mock path`);
  ok(b.evidenceGraphSnapshot && b.evidenceGraphSnapshot.nodes.length > 0, `${b.id}: evidenceGraphSnapshot data available`);
  ok((b.rejectedOverclaims?.length ?? 0) > 0, `${b.id}: rejectedOverclaims data available`);
  ok((b.evaluationSignals?.length ?? 0) > 0, `${b.id}: evaluationSignals data available`);
}

const questions = buildMockQuestions(DEMO_CONTEXT);
ok(questions.length >= 3 && questions.length <= 5, `mock questions count in [3,5] (${questions.length})`);

const brief = buildMockBrief(DEMO_CONTEXT, DEMO_BRANCHES);
for (const f of [
  "decisionFrame",
  "strongestSignals",
  "biggestUncertainties",
  "whatAIWillNotDecide",
  "recommendedExperiments",
  "humanInLoopStatement",
  "responsibleAIStatement",
] as const) {
  ok(brief[f], `mock brief has ${f}`);
}
ok(brief.whatAIWillNotDecide.length > 0, "mock brief enumerates what the AI will not decide");

const reply = mockChatReply(DEMO_BRANCHES[0], "What would make this fail?", []);
ok(typeof reply === "string" && reply.length > 0, "mock Future Self reply is non-empty");
ok(/simulation|rehearsal|scenario|assumption/i.test(reply), "mock Future Self reply is framed as a simulation, not a forecast");

/* ------------------ Optional HTTP smoke (if server is up) ----------------- */

const BASE = process.env.BASE || "http://localhost:3000";

async function reachable(): Promise<boolean> {
  try {
    const r = await fetch(BASE + "/", { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  if (await reachable()) {
    const pages = ["/", "/intake", "/questions", "/map", "/brief", "/architecture", "/branch/quant-signal", "/chat/quant-signal"];
    for (const p of pages) {
      const r = await fetch(BASE + p);
      ok(r.status === 200, `GET ${p} -> 200`);
    }
    const post = (ep: string, body: unknown) =>
      fetch(BASE + ep, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

    for (const ep of ["/api/questions", "/api/decision-brief", "/api/future-self-chat"]) {
      const r = await post(ep, {});
      ok(r.status === 200, `POST ${ep} -> 200 (graceful)`);
    }
    const simRes = await post("/api/simulate", { context: DEMO_CONTEXT });
    ok(simRes.status === 200, "POST /api/simulate -> 200");
    const simJson = await simRes.json();
    ok(simJson.mocked === true, "POST /api/simulate returns mocked:true without a key");
    console.log(`PASS  eval-demo-journey — ${checks} checks (in-process mock + live HTTP smoke @ ${BASE})`);
  } else {
    console.log(`PASS  eval-demo-journey — ${checks} checks (in-process mock path; HTTP smoke skipped, no server at ${BASE})`);
  }
}

main().catch((e) => {
  console.error("FAIL  eval-demo-journey —", e?.message ?? e);
  process.exit(1);
});
