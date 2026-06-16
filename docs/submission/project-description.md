# Forked Futures — Decision Intelligence Cockpit

**One-line pitch:** Forked Futures is an agentic RAG decision cockpit that helps
students rehearse possible futures before committing to a major life or career
decision.

## What it is

Forked Futures is **not a chatbot wrapper and not a prediction engine.** It runs a
major life/career decision through a structured pipeline — evidence retrieval, a
local evidence graph, scenario generation, an adversarial multi-agent debate,
qualitative calibration, a safety review, and an auditable reasoning trail — and
returns three plausible future branches the user can compare and stress-test.

For each branch it shows:

- possible 12-month trajectories with their uncertainty surfaced,
- the curated and official-source evidence behind them, with provenance,
- the assumptions they depend on, tagged by where each claim came from,
- hidden tradeoffs, opportunity costs, and likely failure modes (a pre-mortem),
- qualitative calibration (evidence strength, fit, constraint risk, uncertainty),
- what the system refused to overclaim,
- a structured reasoning audit trail (a judge-safe summary, never raw chain-of-thought),
- and a 7-day experiment the user can run this week to replace an assumption with real signal.

## The problem

Students and early-career people face high-stakes forks — quant recruiting vs.
building a startup vs. preparing for research — under genuine uncertainty. The
usual tools are a pros/cons list or a confident chatbot answer. Neither helps a
person reason about tradeoffs honestly, and a confident answer is actively
harmful when the future is uncertain. The hard part is not fetching a fact; it is
weighing *your* specific tradeoffs under uncertainty — which is reasoning, not a
lookup.

## Why this needs AI (and is not a rules engine)

A fixed rules table needs every input pre-categorised and can only return
tradeoffs someone wrote down in advance. A language model can reason over messy,
unstructured human context — values, fears, constraints in the user's own words —
surface non-obvious tradeoffs and unstated assumptions, and explain its reasoning
in a form a person can push back on. Forked Futures uses a model for the reasoning
and keeps everything else (retrieval, graph traversal, the safety scrubber, schema
validation) as deterministic code, so the model is grounded and constrained.

## What makes it credible

- **Official-source local evidence pack** — curated cards describing what public
  sources (College Scorecard, BLS OOH, O*NET, NACE, NCES B&B, ACS PUMS) and
  decision-science frameworks actually cover, with publisher, coverage level and
  limitations, and **no fabricated exact statistics**.
- **Local evidence graph** — a dependency-free node/edge model that connects
  sources, skills, constraints, risks and frameworks to each path and the
  experiment that can test it.
- **9-role structured debate** — Context, Retrieval, Scenario, Evidence, Optimist,
  Skeptic, Calibration, Safety, Synthesis — including an explicit Optimist vs
  Skeptic pass before calibration.
- **Reasoning audit trail + evaluation signals** — structured, judge-safe.
- **Safety scrubber** — rewrites deterministic/overconfident language and records
  the categories it rejected.
- **Evaluation harness** — four framework-free eval scripts (overclaim safety, RAG
  coverage, output schema, demo journey).
- **Decision Delta** — a before/after impact surface showing the move from vague
  options to evidenced, testable branches (counts derived from real output).
- **Mock-first fallback** — the entire experience runs with **no API key**; the
  live model path is optional and degrades to a curated mock dataset on any error.

## Responsible by design

Forked Futures does not forecast outcomes, does not output fabricated
probabilities, and **never makes the final decision**. Values, risk tolerance,
family context and identity are out of scope for the model by design — the Decision
Brief states this explicitly, and the choice stays with the human.

Built for the USAII Global AI Hackathon 2026 — Undergraduate Track, Challenge
Brief 3: the "Second Brain" for real life.
