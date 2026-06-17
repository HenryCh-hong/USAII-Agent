# Forked Futures — AI Future Simulator for Real Life

> **Forked Futures does not use AI to choose your future. It uses AI to help you understand the futures you're choosing between.**

An evidence-grounded, uncertainty-aware **multi-agent future simulator** that helps students and early professionals compare possible life and career paths, see hidden tradeoffs, and turn uncertainty into a first real-world experiment.

Built for the **USAII Global AI Hackathon 2026** — Undergraduate Track, *Challenge Brief 3: Build the "Second Brain" for Real Life* (spirit of Direction A — Life Decision Simulator, with execution-planning elements of Direction B).

---

## Submission / Judge Guide

Start here if you're evaluating this project:

- **Live transparency dashboard** — run the app, then open **`/architecture`** (Judge Mode): the 9-role pipeline, official-source RAG pack, local evidence graph, autonomous-research transparency, Claim Ledger, safety scrubber, and a live, end-to-end **Alex decision trace**.
- **Autonomous Research Console** — open **`/research`**: the agent plans queries, retrieves & ranks public sources, rejects weak ones with reasons, and maps every claim to its support (no key required; live web search when configured).
- **Contact sheet (every screen, mock path)** — [`docs/qa/judge-readiness/contact-sheet.png`](docs/qa/judge-readiness/contact-sheet.png)
- **Write-ups** (`docs/submission/`):
  - [Project description](docs/submission/project-description.md)
  - [AI architecture](docs/submission/ai-architecture.md)
  - [Responsible AI](docs/submission/responsible-ai.md)
  - [Human-in-the-loop](docs/submission/human-in-loop.md)
  - [Tools & data](docs/submission/tools-and-data.md)
  - [Demo script](docs/submission/demo-script.md)
  - [Demo video script](docs/submission/demo-video-script.md)
  - [Live verification guide](docs/submission/live-verification-guide.md)

**Verify in one command:** `npm run validate` — typecheck + 4 evaluation scripts + production build. The full demo runs with **no `ANTHROPIC_API_KEY`**; the live model path is optional and falls back to a curated mock dataset.

> The original pipeline is described below. The current **v2** system (9-role debate, official-source evidence pack, local evidence graph, reasoning audit trail, and evaluation harness) is documented in `docs/submission/` and shown live on `/architecture`.

---

## The 60-second story (for judges)

1. **Who / what** — Alex, a CS sophomore, is choosing between quant recruiting, building a startup, and a research / grad-school path.
2. **Why AI** — This isn't a lookup. It requires reasoning over messy, personal, novel context; surfacing *non-obvious* tradeoffs and assumptions; and expressing calibrated uncertainty — things a fixed rules engine cannot encode.
3. **How it reasons** — A lightweight multi-agent pipeline: **Context → Retrieval → Scenario → Tradeoff → Critic (pre-mortem) → Calibration → Safety → Synthesis**.
4. **What the output means** — Exactly **3 plausible future branches**, each with evidence, an assumption ledger (tagged by provenance), hidden tradeoffs, a pre-mortem, a regret radar, qualitative calibration, and a **7-day experiment**.
5. **What you do next** — Run the cheapest decisive experiment this week; read the Decision Brief; talk to each branch's **Future Self**.
6. **Why it's responsible** — Plausible *scenarios*, never predictions. Uncertainty is shown, not hidden. The AI **never makes the final decision**.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

**No API key required.** The app ships mock-first: the full journey works entirely on a curated demo dataset. To enable the live multi-agent pipeline, copy `.env.example` to `.env.local` and add:

```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-8   # optional override
```

When a key is present, the API routes generate branches live, validate every generation against Zod, retry once on failure, and **fall back to the mock dataset if anything goes wrong** — so the demo can never hard-fail.

---

## The journey

`Landing → Intake → Clarifying Questions → Future Map → Branch Detail → Future Self Chat → Decision Brief → Architecture`

- **Landing** — the pitch + entry. "See the Alex demo" seeds the full journey instantly.
- **Intake** — decision calibration (decision, options, skills, values, constraints, fears, horizon, urgency).
- **Clarifying Questions** — 3–5 AI questions that target value-weightings, the binding constraint, and untested assumptions.
- **Future Map** — the wow moment: one decision forking into three glowing branches.
- **Branch Detail** — 12-month trajectory, hidden tradeoffs, opportunity costs, **assumption ledger**, evidence cards, pre-mortem, regret radar, **7-day experiment**, kill criteria, calibration panel.
- **Future Self Chat** — talk to a branch-scoped "Future Self," grounded strictly in that scenario's assumptions.
- **Decision Brief** — what you're *really* deciding, strongest signals, biggest uncertainties, and **what the AI will not decide**.
- **Architecture** — judge-facing explanation of the pipeline, evidence layer, and responsible-AI design.

---

## Architecture

```
Input            Reasoning (multi-agent)                         Output                 Action
─────            ───────────────────────                         ──────                 ──────
Intake context   ContextAgent → RetrievalAgent → ScenarioAgent   3 evidence-grounded    7-day experiments
+ clarifying     → TradeoffAgent → CriticAgent → CalibrationAgent branches + calibration + Decision Brief
answers          → SafetyAgent → SynthesisAgent                  + Future Self           + Future Self chat
```

- **ContextAgent** — structures the intake.
- **RetrievalAgent** — keyword retrieval over the local `/knowledge` JSON (no embeddings; deliberate).
- **ScenarioAgent** — builds exactly 3 branches, one per option.
- **TradeoffAgent** — hidden tradeoffs, opportunity costs, reversibility, skill compounding, emotional load, bottlenecks.
- **CriticAgent** — pre-mortem ("imagine it failed 12 months out — why?") and kill criteria.
- **CalibrationAgent** — qualitative evidence strength / fit / constraint risk / uncertainty. **No fabricated probabilities.**
- **SafetyAgent** — strips deterministic language; enforces scenario framing.
- **SynthesisAgent** — Future Map, Branch Detail, Future Self, Decision Brief.

### Why an LLM and not a rules engine
Open-ended, messy, personal context; novel combinations of options; non-obvious tradeoffs and *implicit* assumptions; natural-language reasoning and calibrated uncertainty. A rules table can encode none of these without collapsing into generic advice.

---

## Responsible AI (structural, not decorative)

- **Scenarios, not predictions.** Hedged language only ("may", "could", "tends to", "based on current assumptions"), enforced by the SafetyAgent + a deterministic language scrub.
- **Claim provenance is a first-class type.** Every assumption is tagged `user_provided` · `source_supported` · `ai_inferred`.
- **Honest coverage levels.** Labor-market and outcome claims stay at occupation/field/framework level — we never personalize an aggregate statistic into a fake individual probability.
- **Uncertainty is shown,** with an explicit `dataCoverageNote` on every branch.
- **Human-in-the-loop.** The system explicitly states *what it will not decide* — values, risk tolerance, family context, identity, lived experience — and leaves the choice to the user.
- **Fails safe.** Zod-validated structured outputs, retry-once, and mock fallback on every route.

---

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand (localStorage, no DB) · Zod-validated structured outputs · custom SVG branch visualization · local JSON knowledge base · Anthropic SDK (optional). No auth, no payments, no accounts — stability over feature count.

```
app/            pages + API routes (questions, simulate, future-self-chat, decision-brief)
components/      ui/ (primitives) · shared/ (responsible-AI layer, nav) · map/ branch/ chat/ architecture/
lib/             types.ts · schemas.ts (Zod) · store.ts · ai/ (client, prompts, pipeline) · knowledge/ · mock/
knowledge/       5 curated JSON evidence files (qualitative, no fabricated statistics)
```
