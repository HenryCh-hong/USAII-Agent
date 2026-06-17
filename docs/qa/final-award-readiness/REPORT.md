# Forked Futures — Final Award-Readiness Report

_USAII Global AI Hackathon 2026 · Undergraduate Track · Challenge Brief 3 — the "Second Brain" for real life._

Forked Futures is an agentic RAG life-decision cockpit. It now also includes an
**autonomous web research agent**: it plans safe public queries, retrieves and
ranks sources, rejects weak ones with reasons, extracts trajectory anchors, and
emits a transparent research dossier — live when a search key is configured, and
over a curated public-source corpus otherwise. The whole experience runs with **no
API key and no search key**.

## 1. Autonomous research features added
- **Search-provider abstraction** (`lib/web/*`) — `mockSearch` (curated, always
  available), `googleSearch` (live via native `fetch`, dormant without keys),
  `searchProvider` dispatcher; pluggable to Tavily / SerpAPI / Exa.
- **Research agent** (`lib/research/*`) — `queryPlanner` (safe public queries +
  person-lookup guard), `sourceRanker` (reliability tiers + rejection reasons),
  `trajectoryExtractor` (clusters + Atlas anchors), `researchAgent` (orchestrator),
  a curated `corpus`, and a `ResearchDossier` type + Zod schema.
- **`POST /api/research`** — returns a dossier with `mocked`, `provider`, query /
  source counts, and warnings; degrades to a curated Alex dossier on bad input.
- **Research Console `/research`** — Research Trace, Query Plan, Source Radar
  (reliability tiers), Sources Used / Rejected (with reasons), Evidence Clusters,
  Trajectory Anchors, Limitations / Survivorship / Confidence, Validation
  Experiments. Linked from the nav and the Future Map.
- **Judge-Mode research transparency** on `/architecture` — provider status,
  source-ranking logic, safety filters, and an explicit "why this is not
  person-matching" panel.
- **`eval-research-quality.ts`** — enforces dossier quality + safety; added to
  `npm run eval`. Overclaim scan extended to `lib/web` + `lib/research`.

## 2. Why they pass the rubric gate
Each feature supports Brief 3, lifts ≥1 rubric category, is judge-visible, works
with no keys, uses only public/institutional sources, never identifies a private
individual, and strengthens Responsible AI (rejection reasons, survivorship
warnings, analogy framing). The autonomous research loop is the single strongest
"this is a research-and-reasoning system, not a chatbot wrapper" signal — it
directly lifts AI Reasoning (30) and Solution Design (25).

## 3. Live search: implemented or provider-ready?
**Provider-ready and implemented behind the abstraction.** `googleSearch` is a
working native-`fetch` client for Google Programmable Search; it activates only
when `GOOGLE_SEARCH_API_KEY` + `GOOGLE_CSE_ID` are present. No search key was
available in this environment, so live search was **not executed**; the dossier
runs on the curated corpus and is labeled `mocked:true`.

## 4. Mock fallback
**Works.** `/api/research` returns `mocked:true` with a high-quality dossier and no
key (6 queries, 12 sources, 9 used, 3 rejected for the Alex demo). All pages/APIs
remain 200 with no key.

## 5. How it avoids person-matching
No facial recognition, no de-anonymization, no scraping of private data, no
identifying private people. Queries target roles, fields, programs, and frameworks
(a guard skips person-lookup patterns). Public references are **role archetypes and
career guidance used as analogies** — never "you resemble this person", never a
prediction. Enforced in code and asserted by `eval-research-quality`.

## 6. How source quality is evaluated
Reliability tiers (official/.gov/.edu/frameworks = high; cohort surveys + public
guidance = medium, flagged for survivorship; anecdotes/unverified/stale = low,
**rejected as evidence with a reason**). Every source carries a coverage level and
a "what it cannot tell us" limitation. `eval-research-quality` asserts these plus
the absence of person-identification / fake-probability language.

## 7. How this improves accuracy
Quality, not fake precision: official-source preference, explicit rejection of
weak/over-specific/stale pages, survivorship-bias flags on public references,
claim→coverage mapping, and honest limitations on every source. No invented
statistics; no exact probabilities.

## 8. How this improves UI/UX
A premium "autonomous agent cockpit": a Research Trace of real counts, a Source
Radar by reliability, accepted/rejected source cards with reasons, evidence
clusters, and analogy-labeled anchors — in the existing cockpit design language
(panels, mono labels, reduced-motion safe). It makes the agent's work legible.

## 9. Validation outputs
```
npm run validate   → exit 0  (tsc + 5 evals + next build)
tsc --noEmit       → 0 errors
next build         → all 15 routes (adds /research + /api/research)
Pages (no key)     → all 9 → 200 (incl /research)
APIs (no key)      → simulate/questions/brief/chat/research → mocked dossier/data
```

## 10. Eval outputs
```
eval-overclaim-safety    PASS (90 user-facing files clean; now incl lib/web, lib/research)
eval-rag-coverage        PASS (349 checks)
eval-agent-output-schema PASS (33 checks)
eval-demo-journey        PASS (45 with live server; covers /research + /api/research)
eval-research-quality    PASS (52 checks; mock dossier 9 used / 3 rejected; no person-matching)
```

## 11. Screenshots / contact sheet
`docs/qa/judge-readiness/screenshots/*.png` (now includes `research.png`) and
`docs/qa/judge-readiness/contact-sheet.png` — regenerated on the mock path.

## 12. Commit hashes
Prior: da121ea, 41aa349, 8f54fca, 01714fc, bbcc0a1, 8786d70. The research-agent
commit hash is reported in the chat at the end of this pass.

## 13. Final conservative rubric estimate
**~87–89 / 100 (midpoint ~88).** Per-category: Problem Understanding 18 · AI
Reasoning 26 · Solution Design 23 · Impact 13 · Responsible AI 9. Held below 90:
live search and the live model path are both unverified (no keys), there is still
one fully hand-authored journey, and no demo video / deployment yet.

## 14. Remaining weaknesses
1. Live search + live model both unverified (no keys in this environment).
2. One fully hand-authored journey (Alex); arbitrary input is thinner.
3. No recorded demo video / no deployed URL.

## 15. Next steps (live key / deploy / video)
1. Set `GOOGLE_SEARCH_API_KEY` + `GOOGLE_CSE_ID` (and/or `ANTHROPIC_API_KEY`) in
   your shell, run `npm run build && npm run start`, and confirm `/api/research`
   returns `mocked:false` with live sources and graceful fallback. (Or set keys in
   this session and I'll verify — never printing them.)
2. Record the demo video from `docs/submission/demo-video-script.md`, ideally
   showing one live research run and one live generation.
3. Push on approval (`git push origin main`); deploy to Vercel with the keys as env
   vars (works without them via mock fallback).
