# Forked Futures — Judge-Readiness QA Report

**Date:** 2026-06-15 · **Mode:** Finalist-polish QA pass (no major features, no architecture changes)
**Build:** Next.js 14.2.5 · TypeScript · Tailwind · mock-first (runs with **no `ANTHROPIC_API_KEY`**)

---

## 1. Executive summary

Forked Futures is **submission-ready**. The full Alex demo runs end-to-end on the mock path with no API key, the production build is clean, and the responsible-AI layer is structural and visible on every surface. A browser-based QA pass captured 11 screenshots (desktop + mobile) and a contact sheet; all 8 pages and all 4 API routes were smoke-tested at 200.

The product already reads as a **scenario reasoning engine**, not a chatbot or pros/cons list: the Future Map renders the core "one decision → three glowing futures" metaphor; branch detail exposes evidence, a provenance-tagged assumption ledger, a pre-mortem, regret radar, calibration, and a 7-day experiment; the Decision Brief closes with an explicit *"what this AI will not decide for you."*

**Only three low-risk polish edits were made** (one copy change, two code-comment cleanups). The most important QA finding was a **capture-script artifact** (not an app bug): the landing page's framer-motion `whileInView` cards render only after scroll, so the first screenshot looked sparse — corrected, and the page is dense and polished.

**No P0 blockers.** Verdict: **finalist-ready (~85/100 honest estimate).** The single biggest lever left is optional: run the live AI path (with a key) for the demo video to show the reasoning generating in real time — the mock remains the safety net.

---

## 2. Screenshot inventory

Folder: `docs/qa/judge-readiness/screenshots/`

| File | Surface | Notes |
|------|---------|-------|
| `landing.png` | Landing | Hero + branch-map preview + "why AI" cards + pipeline strip + responsible-AI panel |
| `intake.png` | Intake | **Populated** with the Alex demo (button reads "Loaded") |
| `questions.png` | Clarifying Questions | 4 questions, answers filled, "why this matters" + probes |
| `future-map.png` | Future Map (`/map`) | The wow moment — glowing SVG forks into 3 accent tracks + full branch cards |
| `branch-detail.png` | Branch Detail (`/branch/quant-signal`) | All 10 reasoning sections |
| `future-self-chat.png` | Future Self Chat (`/chat/quant-signal`) | Live mock Q&A captured ("What did you underestimate?") |
| `decision-brief.png` | Decision Brief (`/brief`) | Decision frame + signals/uncertainties/experiments + "what AI won't decide" |
| `architecture.png` | Architecture | Pipeline diagram + 8-agent grid + LLM-vs-rules + evidence/provenance + responsible AI |
| `mobile-landing.png` | Landing (390px) | Stacks cleanly; new persona copy visible |
| `mobile-future-map.png` | Future Map (390px) | Branch map + cards stack full-width |
| `mobile-decision-brief.png` | Decision Brief (390px) | Stacks cleanly |
| `../contact-sheet.png` | Contact sheet | Desktop flow (8) + mobile flow (3), scannable |

Capture tooling: `docs/qa/judge-readiness/capture.mjs` (Playwright via **system Chrome** — no browser download, no project dependency added).

---

## 3. Visual QA findings

| # | Area | Finding | Action |
|---|------|---------|--------|
| 1 | Spacing | Landing looked sparse in first capture | **Root cause = capture artifact** (`whileInView` cards need scroll). Fixed capture; page is dense. No source change needed. |
| 2 | Typography hierarchy | Clear and consistent — eyebrow → H1/H2 → body → mute. Gradient headline reads well. | ✅ keep |
| 3 | Mobile responsiveness | All three mobile views stack correctly; nav + stepper collapse gracefully | ✅ keep; branch-map nodes slightly cramped at 390px (P2) |
| 4 | CTA clarity | "Start a Future Simulation" + "See the Alex demo" are unambiguous; every results page has a forward CTA | ✅ keep |
| 5 | Branch map cinematic? | **Yes** — glowing curved forks, origin pulse, accent-colored destination pods, draw-in animation | ✅ standout |
| 6 | Results feel trustworthy? | Strong — calibration badges, source types, coverage levels, "used for" lines make it feel evidenced, not generic | ✅ keep |
| 7 | Evidence / assumption / uncertainty / action separated? | **Yes, explicitly** — distinct sections + the ClaimTag provenance system + the 7-day experiment as the "action" anchor | ✅ keep |
| 8 | Architecture page judge-friendly? | Excellent — pipeline diagram, 8-agent grid, LLM-vs-rules comparison, evidence layer, responsible-AI panel | ✅ keep |
| 9 | Chat memorable, not overclaiming? | Good balance — "Simulated · not a forecast" badge, "speaks from this simulation's assumptions," "will not tell you what to choose" | ✅ keep |
| 10 | Decision Brief a strong payoff? | Yes — reframes the real decision, surfaces signals/uncertainties, and the "what AI won't decide" panel lands the responsible-AI thesis | ✅ keep |
| 11 | Landing 10-second comprehension | Hero was abstract about *who/what decision* | **Fixed** — subtext now names "students and early-career decisions — quant recruiting vs. a startup vs. grad school" |

---

## 4. Judge narrative QA findings

1. **Understand the product in 10s?** Yes — hero now names audience + concrete decision; the branch-map preview shows the metaphor immediately.
2. **See that it's AI reasoning, not a chatbot wrapper?** Yes — the Architecture page's "Eight specialists, one handoff chain" + "Why an LLM, not a rules engine" make the case; branch outputs show reasoned tradeoffs, not generic advice.
3. **See the responsible-AI layer without reading source?** Yes — uncertainty/calibration badges, the assumption ledger with provenance tags, the "what AI won't decide" panel, and a responsible-AI banner on every results surface.
4. **Architecture page explains the 8-agent pipeline clearly?** Yes — all 8 agents with one-line roles, plus the input→reasoning→output→action diagram.
5. **Future Map communicates the core metaphor?** Yes — strongest single visual; "one decision forks into three futures."
6. **Decision Brief shows before/after impact?** Partially — it reframes the decision and routes to action (experiments), but it doesn't draw an explicit "before vs after" panel. Acceptable; could be a P2 enhancement.
7. **Ends with action, not just advice?** Yes — every branch ends in a concrete 7-day experiment with kill criteria; the brief recommends a cheapest-decisive-test per branch.
8. **Emotionally memorable?** Yes — "Future Self" chat + "rehearse your future before you commit" is a memorable hook; regret radar + pre-mortem add emotional texture.
9. **Aligned with Challenge Brief 3?** Yes — Direction A (life-decision simulator) with Direction B execution elements (the experiment plan / brief); explicitly *not* a pros/cons list.
10. **What might a tired judge still misunderstand?** That the no-key demo is **mock** data — they could assume it's live generation. Mitigated by the "Demo simulation" badge on the map and the mock-first explanation on the Architecture page. (See P1.)

---

## 5. Responsible AI audit

Searched the codebase for: `you will`, `guaranteed`, `best choice`, `you should choose`, `will become`, `certainly`, `100%`, `probability of success`, `success rate`, `predicts your future`, `definitely`.

| Check | Result |
|-------|--------|
| No deterministic future claims | ✅ none in user-facing copy |
| No fake exact probabilities | ✅ calibration is qualitative (low/med/high) + `dataCoverageNote` |
| No "best choice" framing | ✅ none (and SafetyAgent scrubs it from any live output) |
| No "guaranteed" language | ✅ the 2 matches were **code comments** — softened to "always-available" |
| AI never makes the final decision | ✅ stated on brief, chat, architecture, landing |
| Clear uncertainty framing | ✅ UncertaintyBadge + CalibrationBadges everywhere |
| Provenance / assumption / calibration language | ✅ ClaimTag (`user_provided`/`source_supported`/`ai_inferred`) + ClaimLegend |
| Clear limitations | ✅ base-rate signals show coverage level + `limitations`; labor data kept aggregate |
| "AI does not decide for you" | ✅ dedicated panels on brief + architecture |
| Human-in-the-loop explanation | ✅ `humanInLoopStatement` + architecture section |

**Defense-in-depth:** responsible framing is enforced at three layers — (a) the prompts' RESPONSIBLE-AI rules, (b) the SafetyAgent deterministic-language scrub on every live generation, and (c) Zod validation + retry + mock fallback. **Result: clean.**

---

## 6. Ranked punch list

### P0 — must fix before submission
- **None.** Build is clean, demo works with no key, responsible-AI is clean, no runtime errors.

### P1 — should fix if time allows
- **Record the demo video with a live API key** (mock stays as the safety net). The strongest impression of "AI Reasoning" (30% of score) is the pipeline generating live; the no-key demo shows curated output. Add `ANTHROPIC_API_KEY` to `.env.local` for the recording; if anything fails on stage, it silently falls back to mock.
- **Initialize version control.** The project is **not a git repo** — run `git init`, commit, and push to a private remote before submission (backup + Devpost repo link).
- **Make "demo vs live" unmistakable in the recording.** The "Demo simulation" badge exists; verbally state "running on curated mock data; add a key for live generation" so no judge feels misled.

### P2 — nice-to-have polish
- Mobile branch-map destination pods are slightly cramped at 390px — could enlarge or stack on `<400px`.
- Decision Brief could add an explicit "before → after" framing panel (you arrived overwhelmed → you leave with 3 framed futures + 1 test).
- Add an Open Graph / social preview image for the Devpost/landing link.
- Optional: a one-click "Export brief as PDF / shareable link."
- Optional: slightly tighten landing section vertical rhythm (`pt-24` → `pt-20`) — purely taste.

---

## 7. Exact files touched

**Source edits (3, all low-risk):**
- `app/page.tsx` — hero subtext now names audience + concrete decision (10-second comprehension).
- `lib/mock/index.ts` — code comment "guaranteed demo path" → "always-available demo path".
- `lib/mock/demoContext.ts` — code comment "guaranteed-to-work seed" → "always-available seed".

**New QA artifacts (additive, no app impact):**
- `docs/qa/judge-readiness/capture.mjs`
- `docs/qa/judge-readiness/screenshots/*.png` (11)
- `docs/qa/judge-readiness/contact-sheet.png` (+ `_contact-sheet.html` helper)
- `docs/qa/judge-readiness/REPORT.md` (this file)

**Tooling:** `playwright` installed into `node_modules` via `--no-save` — **`package.json` and the app's dependencies are unchanged**. The app itself gained no new runtime dependency.

**Not touched:** data model, schemas, API contracts, AI pipeline logic, mock fallback, store, all components except the landing copy line.

---

## 8. Validation results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ PASS (exit 0) |
| `next build` | ✅ PASS — 13 routes compiled, static + dynamic |
| Pages 200 (`/`, `/intake`, `/questions`, `/map`, `/branch/[id]`, `/chat/[id]`, `/brief`, `/architecture`) | ✅ all 200 |
| APIs 200 + `mocked:true` (`/api/questions`, `/api/simulate`, `/api/future-self-chat`, `/api/decision-brief`) | ✅ all 200 |
| No-key mock path | ✅ `ANTHROPIC_API_KEY` unset, no `.env` — full demo works |
| Runtime errors in server log | ✅ none |

---

## 9. Final readiness judgment

**Ready to submit.** Forked Futures is a coherent, polished, responsible-AI-forward decision-rehearsal product that clearly answers "why AI, not a rules engine" and ends in action. No blockers. Address P1 items (especially a live-key demo recording + `git init`) to maximize the score, but the project stands on its own without them.

---

## 60–90 Second Live Demo Script

> **[0:00–0:12 — Problem & user]**
> "Every student faces a fork they can't un-walk. Alex is a CS sophomore deciding between quant recruiting, building a startup, and a research path. The usual tools — a pros/cons list, a chatbot — give generic advice. Alex doesn't need advice. Alex needs to *understand the tradeoffs* before committing."

> **[0:12–0:25 — Input]**
> "So Forked Futures starts with Alex's real context — decision, skills, values, constraints, fears — then asks a few clarifying questions that target the things that actually change the analysis: which value comes first, the binding constraint, and an *untested* assumption."

> **[0:25–0:45 — Reasoning → Future Map (the wow)]**
> "From there, a multi-agent pipeline — retrieval, scenario, tradeoff, critic, calibration — opens **three futures**, side by side. This isn't a list; each branch is reasoned. Notice the calibration: evidence strength, fit, constraint risk, uncertainty — qualitative, never a fake percentage."

> **[0:45–1:05 — Output → Branch detail + Future Self]**
> "Open the quant branch: a 12-month trajectory, hidden tradeoffs, and the responsible core — an **assumption ledger** that tags every claim as *something Alex told us*, *source-supported*, or *AI-inferred*, each with a way to test it. Alex can even talk to a branch-specific **Future Self** — grounded in the scenario, and it explicitly won't tell Alex what to choose."

> **[1:05–1:20 — Responsible AI + Action]**
> "It ends where decisions should: the brief reframes what Alex is *really* deciding, states plainly **what the AI will not decide** — values, risk, family, identity — and hands over a **7-day experiment** to replace the biggest assumption with real signal."

> **[1:20–1:30 — Close]**
> "Forked Futures doesn't use AI to choose your future. It uses AI to help you understand the futures you're choosing between. And it runs fully offline — no API key required."

---

## Devpost-Ready Project Description

**Forked Futures — AI Future Simulator for Real Life**

**The problem.** Students and early-career people face high-stakes, irreversible decisions — which career to chase, whether to build, whether to commit years to research — with tools that don't fit the problem. A pros/cons list flattens tradeoffs. A generic chatbot gives advice that ignores *your* messy context. Neither helps you *reason*.

**Who it helps.** Undergraduates and early professionals at a fork in the road — our demo follows Alex, a CS sophomore choosing between quant recruiting, a startup, and grad school.

**What it does.** Forked Futures turns one overwhelming decision into **three plausible future branches**, rendered as a cinematic branching map. Each branch exposes the evidence behind it, the assumptions it depends on, hidden tradeoffs, likely failure modes (a pre-mortem), a regret radar, qualitative uncertainty — and a concrete **7-day experiment** you can run this week. You can open any branch and talk to a branch-specific **"Future Self,"** then read a **Decision Brief** that reframes what you're really deciding.

**How the AI works.** A lightweight multi-agent pipeline: **Context → Retrieval → Scenario → Tradeoff → Critic (pre-mortem) → Calibration → Safety → Synthesis.** Evidence is retrieved from a curated local knowledge base; every generation is validated against a Zod schema, retried on failure, and falls back to curated mock data so the demo can never hard-fail.

**Why it's not a chatbot.** It has a coherent input → reasoning → output → action spine. It reasons over *unstructured personal context* a rules engine can't encode, surfaces non-obvious assumptions and tradeoffs, and produces structured, calibrated, evidence-grounded scenarios — not a chat transcript.

**Responsible AI, by construction.** Claim provenance is a first-class type (`user_provided` / `source_supported` / `ai_inferred`). Confidence is qualitative — we never fabricate individual probabilities, and we keep labor-market claims at occupation/field level. Deterministic language is banned by a SafetyAgent and a scrub pass. The system **explicitly states what it will not decide** — values, risk tolerance, family context, identity, lived experience.

**Human-in-the-loop.** Forked Futures never chooses. It opens the futures you're choosing between so *you* can choose, with eyes open and a first experiment in hand.

**Built with.** Next.js 14 · TypeScript · Tailwind · Framer Motion · Zod · a local JSON knowledge base · Anthropic (optional). Mock-first — runs with no API key.

> *Forked Futures does not use AI to choose your future. It uses AI to help you understand the futures you're choosing between.*

---

## Final Rubric Scoring Estimate (honest, judge-like)

> Estimates assume a judge who runs the no-key demo and reads the Architecture page. Total: **~85 / 100.**

### Problem Understanding — **17 / 20**
*Evidence:* Clear, specific persona and a genuinely hard, irreversible decision; the Decision Brief reframes "what you're really deciding" (values under a binding constraint + an untested assumption); clarifying questions probe value-weighting, the binding constraint, and untested beliefs. *Why not higher:* single domain (student career), one demo persona; problem framing is excellent but not yet shown generalizing across very different user types in the demo.

### AI Reasoning — **25 / 30**
*Evidence:* A real multi-agent decomposition (8 roles), evidence-grounded branches, an assumption ledger with provenance, a pre-mortem, qualitative calibration, regret radar, and kill criteria — this is structured *reasoning about tradeoffs*, not generic advice. The Architecture page makes the "LLM > rules engine" case concretely. *Why not higher:* the headline demo runs on **curated mock data** unless a key is added — the live pipeline exists and is well-built, but a skeptical judge wants to see it generate. **This is the #1 score lever (see P1).**

### Solution Design — **22 / 25**
*Evidence:* Clean input→reasoning→output→action pipeline; resilient mock-first design with Zod validation, retry, and fallback; responsible-AI integrated *structurally* (types + UI), not bolted on; full 8-page journey; polished cinematic UI with a custom branch-map visualization; clear separation of evidence / assumptions / uncertainty / action. *Why not higher:* no persistence/accounts (by design), and the live path's robustness isn't demonstrated on stage.

### Impact & Insight — **12 / 15**
*Evidence:* Turns insight into action (7-day experiment + kill criteria + cheapest-decisive-test per branch); the regret radar and "what AI won't decide" deliver genuine insight; the brief is a strong, decision-useful payoff. *Why not higher:* impact is asserted, not yet evidenced by user testing; no explicit before/after impact panel.

### Responsible AI — **9 / 10**
*Evidence:* Best-in-class for a hackathon — provenance typing, qualitative-only calibration, banned deterministic language enforced at three layers, explicit human-in-the-loop and "what AI won't decide," uncertainty shown not hidden, aggregate data kept aggregate. *Why not 10:* self-asserted; no external red-team or bias audit documented.

**Honest takeaway:** a strong finalist. The cheapest points to gain are in **AI Reasoning** — demo the live pipeline — and small **Impact** framing (an explicit before/after). Everything else is already finalist-grade.
