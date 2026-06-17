# Forked Futures — Final Award-Readiness Report

_USAII Global AI Hackathon 2026 · Undergraduate Track · Challenge Brief 3 — the "Second Brain" for real life._

Forked Futures is an agentic RAG life-decision cockpit with an **autonomous web
research agent**. The latest pass adds the accuracy + robustness layer that makes
it feel trustworthy, not just impressive: a **Claim Ledger** that makes every
claim traceable, a **5-scenario robustness eval** that proves it generalizes
beyond Alex, and a **live-verification guide**. Everything runs with **no keys**.

## Live verification + red-team pass (latest)

- **Live search / model:** keys absent in this environment → both remain
  **unverified** (provider-ready; user-run steps in `live-verification-guide.md`).
  Not claimed as verified.
- **Adversarial red-team (10 judge criticisms vs the actual repo):** 7 answered,
  3 partial — all fixed with smallest-safe changes:
  - *"Only scripted for Alex"* → honest **template notice** on `/map` + `/branch`
    when running the keyless adapted-template path, and the EvalSummary copy scoped
    to "the research dossier generalizes".
  - *"Sources don't support claims"* → a **claim↔source fidelity check** in
    `eval-rag-coverage` (token-overlap join of each branch card to its cited
    source-pack card) + an honest scope line on the Claim Ledger.
  - *"UI too dense"* → a lightweight **jump-nav** on the dense branch page.
- **Deployment readiness:** `deployment-checklist.md` added; verified no server-only
  search code leaks into client components; Playwright is dev-only (not a runtime
  dep); no required env vars.
- **In-app System Evaluation** updated to show all **6 evals (6/6 passing)**.

## 1. What changed (this pass)
- **Claim Ledger** (`lib/research/claimLedger.ts`, `components/research/ClaimLedger.tsx`):
  every important claim mapped to its support, reliability, what it affects
  (branch / archetype / assumption / experiment), supporting sources, and what it
  cannot tell us — labeled source-supported vs AI-inferred vs framework+inference.
  Added to `ResearchDossier` (optional) and the Zod schema; surfaced on `/research`
  (full), `/brief` (compact), and `/architecture` (compact, prerendered).
- **Robustness eval** (`scripts/eval-research-robustness.ts`): runs the research
  agent over 5 non-Alex scenarios (CS, pre-med, artist, policy, international) and
  asserts each dossier is well-formed, grounded, honest, and safe.
- **Live-verification guide** (`docs/submission/live-verification-guide.md`): exact
  safe commands to enable + verify live web search and live model generation, with
  success vs. fallback expectations.
- UX/discoverability: README judge guide now points to `/research`, the Claim
  Ledger, and the new guides; added a mobile Research screenshot; regenerated the
  contact sheet.

## 2. How the Claim Ledger improves accuracy
It is the visible answer to "how do I know this isn't just impressive-looking
claims?". Each claim carries provenance (source-supported / AI-inferred / mixed),
a qualitative reliability, the sources that back it (with links), and an explicit
caveat ("what it cannot tell us"). Source-supported claims must cite ≥1 source
(enforced by eval). No invented statistics, no fake citations, no exact
probabilities — accuracy is shown as traceability and honest limits, not precision.

## 3. How the robustness eval addresses arbitrary input
The single biggest prior weakness was "one Alex demo". The robustness eval runs
the agent over 5 deliberately different decisions and asserts, for each: a dossier
returns, ≥3 queries, ≥2 sources used, ≥1 trajectory anchor, limitations + validation
experiments present, a claim ledger present, and **no person-matching / deterministic
/ fake-probability language**. This demonstrates generalization without building a
second hand-authored persona (50 checks across 5 scenarios, all passing).

## 4. Live search status
**Implemented and provider-ready; not executed** (no `GOOGLE_SEARCH_API_KEY` /
`GOOGLE_CSE_ID` in this environment). `lib/web/googleSearch.ts` is a working
native-`fetch` client that activates only when keys are present; otherwise the
curated corpus is used and the dossier is labeled `mocked:true`. The
live-verification guide documents how to test it safely. Live model generation is
likewise optional and unverified.

## 5. Mock fallback status
**Intact.** All pages/APIs return 200 / mocked with no keys; `/api/research`
returns a full dossier (6 queries, 9 used, 3 rejected) with `mocked:true`.

## 6. Validation output
```
npm run validate   → exit 0  (tsc + 6 evals + next build)
next build         → all 15 routes (/research 7.27 kB; /api/research)
Pages (no key)     → all 9 → 200
eval-overclaim     PASS (93 user-facing files clean)
eval-rag-coverage  PASS (349)     eval-agent-output-schema PASS (33)
eval-demo-journey  PASS (covers /research + /api/research)
eval-research-quality    PASS (65 checks; incl claim ledger)
eval-research-robustness PASS (50 checks across 5 scenarios)
DOM scan           clean on /research, /brief, /architecture (Claim Ledger renders)
```

## 7. Remaining risks
1. Live search + live model both unverified (no keys here).
2. Mock corpus is curated (representative, but not live breadth).
3. No recorded demo video / no deployed URL.
4. One fully hand-authored *branch* journey (Alex) — the robustness eval mitigates
   the generalization concern but the rich branch authoring is still Alex-only.

## 8. Conservative rubric estimate
**~88–90 / 100; defensibly ~88–89** until live verification + a recorded video.
Per-category (conservative): Problem Understanding 18 · AI Reasoning 26 · Solution
Design 24 · Impact 13 · Responsible AI 9. The Claim Ledger + robustness eval lift
AI Reasoning, Solution Design, and Responsible AI; held below 90 because live paths
are unverified and there is no video/deploy.

## 9. Safe to push / deploy?
**Push:** safe (all local, validated, no secrets) — recommend after a live run +
video. **Deploy:** safe on Vercel (set search/model keys as env vars; works without
them via mock fallback) — only on explicit approval. Neither done here.

## 10. Recommended demo angle
Lead with the **autonomous research** story: open `/research`, narrate the agent
planning queries, retrieving and **rejecting** sources with reasons, then show the
**Claim Ledger** — "every claim here is traceable to its support and its limits".
Then the branch deep-dive (debate → evidence graph → audit trail → rejected
overclaims), the Decision Brief (Decision Delta + Trajectory Atlas + Claim Ledger),
and Judge Mode (Rubric Map + System Evaluation + research transparency). Close on
Responsible AI: aggregates not individuals, analogies not predictions, human in the
loop. If a key is available, show one live research run on camera.
