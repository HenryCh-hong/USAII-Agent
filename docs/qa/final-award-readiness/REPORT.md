# Forked Futures — Final Award-Readiness Report

_USAII Global AI Hackathon 2026 · Undergraduate Track · Challenge Brief 3 — the "Second Brain" for real life._

## 1. Executive summary

Forked Futures is an agentic RAG life-decision cockpit: it runs a major life/career
decision through evidence retrieval, a local evidence graph, a 9-role structured
debate, qualitative calibration, a safety scrubber, and an auditable reasoning
trail — and returns three plausible future branches the user can compare, stress-
test, and turn into a 7-day experiment. The entire experience runs **without an
API key** (mock-first); the live model path is optional and degrades to a curated
dataset on any failure.

This autonomous pass added three rubric-targeted surfaces — a **Trajectory Atlas**
(reference futures as analogies), an **Assumption Stress Test**, and a **Judge-Mode
Rubric Map** — all additive, all judge-visible, none touching the intelligence
layer. The build, typecheck, four eval scripts, and no-key smoke tests all pass.

## 2. What changed (this pass)

- **Trajectory Atlas** (`lib/trajectory/archetypes.ts` + `archetypes.data.json`,
  `components/shared/TrajectoryAtlas.tsx`): a deterministic matcher maps the user's
  anchors (field, skill, motivation, constraint, risk) to 8 curated **role**
  archetypes and labels each with a qualitative resonance (strong / partial / weak /
  missing). Each resonant archetype shows what rhymes, what does not transfer,
  hidden tradeoffs, a **survivorship-bias warning**, honest evidence coverage,
  stronger/weaker-if conditions, and a 7-day test. Shown on the Decision Brief
  (full) and Judge Mode (compact, Alex demo).
- **Assumption Stress Test** (`components/branch/AssumptionStressTest.tsx`): per
  assumption, a qualitative sensitivity (how much the branch leans on an unverified
  claim, derived from provenance + confidence) and the cheapest way to firm it up.
  Added to Branch Detail.
- **Judge-Mode Rubric Map** (`components/architecture/RubricMap.tsx`): maps each
  rubric category to where it is demonstrated in the product. Added near the top of
  Judge Mode.
- **Eval coverage**: `lib/trajectory` added to the overclaim scan (phrase + percent),
  so the archetype copy is held to the same no-overclaim standard (passes).
- Regenerated judge-readiness screenshots + contact sheet.

## 3. Why each new feature passed the rubric gate

| Feature | Brief 3 fit | Rubric lift | Judge-visible | Responsible-AI | No-key safe |
|---|---|---|---|---|---|
| Trajectory Atlas | Helps process complexity via reference futures | AI Reasoning, Problem Understanding, Impact | Yes (Brief + Judge Mode) | Strengthens it (analogy-not-prediction, survivorship warnings, no people, no %) | Yes (local data) |
| Assumption Stress Test | "Understand tradeoffs" → live simulator feel | AI Reasoning, Impact | Yes (Branch Detail) | Neutral-positive (no probabilities) | Yes (derived) |
| Rubric Map | Makes alignment legible | Solution Design + legibility of all | Yes (Judge Mode) | Neutral | Yes (static) |

All three also strengthen the "this is reasoning, not a chatbot wrapper" argument:
the Atlas reasons about the user's specific anchors (and works for arbitrary input,
not just Alex), and the Stress Test reasons about the fragility of each assumption.

## 4. Rubric score: before → after (conservative)

| Category | Weight | Before | After | Why |
|---|---|---|---|---|
| Problem Understanding | 20 | 17 | 18 | Anchor extraction + generic archetype matching show breadth beyond one persona |
| AI Reasoning | 30 | 24 | 25 | Atlas + stress test add genuine, user-specific reasoning surfaces; still capped by unverified live path |
| Solution Design | 25 | 22 | 23 | Rubric Map + more coherent reasoning surfaces |
| Impact & Insight | 15 | 12 | 13 | Stress test + atlas experiments + Decision Delta sharpen "uncertainty → action" |
| Responsible AI | 10 | 9 | 9 | Survivorship warnings + analogy framing + expanded eval scope hold the line |
| **Total** | **100** | **~84** | **~88** | Honest range **86–88**, midpoint ~87 |

Not claiming ≥89: live path is unverified, there is still one fully hand-authored
journey (Alex), and no demo video is recorded yet.

## 5. Evidence per rubric category

- **Problem Understanding** — Intake captures values/constraints/fears; clarifying
  questions target the binding constraint and untested assumptions; the Atlas
  extracts anchors and matches archetypes for any context.
- **AI Reasoning** — Agentic RAG + evidence graph; 9-role debate (Optimist vs
  Skeptic); Agent Review; Reasoning Audit Trail; calibration; Trajectory Atlas;
  Assumption Stress Test.
- **Solution Design** — input → reasoning → output → action pipeline; cockpit UI;
  Zod contract; mock-first; eval harness; Judge Mode + Rubric Map.
- **Impact & Insight** — Decision Delta, Assumption Stress Test, 7-day experiments,
  10-section mission brief.
- **Responsible AI** — qualitative-only calibration, provenance tags, safety
  scrubber + surfaced rejected overclaims, no fabricated probabilities, human-in-
  the-loop ("what the AI will not decide"), and the eval harness that guards it.

## 6. Why this is not a chatbot wrapper

Deterministic retrieval + a local evidence graph; a Zod-enforced 3-branch contract;
provenance-tagged claims at honest coverage levels; a safety scrubber that rewrites
overconfident language **and shows what it rejected**; a structured agent review and
reasoning audit trail (not a chat log, not raw chain-of-thought); a Trajectory Atlas
that reasons about the user's anchors as analogies (with survivorship warnings); and
an evaluation harness enforcing all of it. The system returns options, evidence,
assumptions, and uncertainty — and leaves the decision to the human.

## 7. What still might lose points

1. Live model path unverified (no key in environment) — the heaviest category's
   ceiling.
2. One fully hand-authored journey (Alex); arbitrary inputs are thinner than the
   curated path (the Atlas/stress test mitigate this but do not eliminate it).
3. No recorded demo video yet; no deployed URL.

## 8. Live-path status

**Not verified** — no `ANTHROPIC_API_KEY` available in this environment. The path is
structurally optional and Zod-guarded with mock fallback. Safe local verification:
`ANTHROPIC_API_KEY=… npm run build && ANTHROPIC_API_KEY=… npm run start`, then POST
the four API routes; expect `mocked:false`, valid Zod output, 3 branches, and graceful
fallback on any failure. Do not commit the key.

## 9. Mock fallback status

**Intact.** All pages render and all APIs return `mocked:true` with no key; new
surfaces derive from existing data and require no key.

## 10. Validation output (latest)

```
npm run validate            → exit 0  (tsc + 4 evals + next build)
  eval-overclaim-safety     → PASS (72 user-facing files clean; now incl. lib/trajectory)
  eval-rag-coverage         → PASS (349 checks)
  eval-agent-output-schema  → PASS (33 checks)
  eval-demo-journey         → PASS (29 mock / 42 with live server)
Pages (no key)              → all 8 → 200
APIs (no key)               → mocked:true; simulate = 3 branches
/architecture (prerendered) → Rubric Map, Trajectory Atlas (matched), Decision Delta,
                              System Evaluation present; banned-phrase scan clean
DOM (/brief, /branch)       → Decision Delta, Trajectory Atlas, Assumption Stress Test
                              render; banned-phrase scan clean
```

## 11. Commit hashes created
See the session commit at the end of this pass (recorded in the final report).
Prior: 41aa349, 8f54fca, 01714fc, bbcc0a1, 8786d70.

## 12. Safe to push?
Yes, technically (all local, validated, no secrets) — but **hold** until a live-path
verification + demo video are done, then push intentionally after confirming the
remote.

## 13. Safe to deploy?
Yes — Next.js 14 on Vercel; set `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`) as
env vars for the live path; the deploy works without them via mock fallback. Deploy
only on explicit approval.

## 14. Final demo-video recommendation
Follow `docs/submission/demo-video-script.md` (3–5 min + 60s). Lead with the Future
Map, go deep on one branch (Agent Review → Evidence Graph → Reasoning Audit Trail →
Rejected Overclaims), then the Decision Brief (Decision Delta + Trajectory Atlas),
then Judge Mode (Rubric Map + System Evaluation + Alex trace). If a key is available,
show one live generation on camera and say so.

## 15. Top 3 remaining weaknesses
1. Live path unverified (record a keyed run).
2. Single fully-authored persona (a second full journey would further prove generalization).
3. No demo video / no deployed URL yet.
