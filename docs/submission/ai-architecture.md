# AI Architecture

Forked Futures is an **agentic RAG pipeline**, not a single prompt. The model does
the reasoning; deterministic code does retrieval, graph traversal, the safety
scrubber, and schema validation so the model stays grounded and constrained.

## End-to-end flow

```
Input → context extraction → evidence retrieval → evidence graph
      → scenario generation → multi-agent debate → calibration
      → safety review → reasoning audit trail → Decision Brief
```

1. **Context** — the user's decision, options, skills, values, constraints, fears,
   background, time horizon, and urgency are captured on intake and refined by
   AI-generated clarifying questions.
2. **Retrieval (RAG)** — keyword retrieval over a curated local knowledge base,
   plus an official-source evidence pack (`knowledge/sources/*.json`), biased per
   option toward the relevant domain.
3. **Evidence graph** — a local, dependency-free node/edge model (no graph
   database; 29 nodes, 28 edges) connects the CS foundation to each path, the
   skills it requires, the constraints and risks that bound it, the decision
   frameworks that inform it, the official sources that support it, and the 7-day
   experiment that can test it. Retrieval traverses it to widen evidence beyond a
   single keyword hit.
4. **Scenario generation** — exactly three plausible branches, one per option.
5. **Multi-agent debate (9 roles)** — Context, Retrieval, Scenario, Evidence,
   Optimist, Skeptic, Calibration, Safety, Synthesis. The Optimist and Skeptic
   argue each branch from both sides before it is calibrated.
6. **Calibration** — qualitative levels only (low / medium / high) for evidence
   strength, fit, constraint risk, and uncertainty, plus a data-coverage note. No
   fabricated probabilities.
7. **Safety review** — a deterministic scrubber rewrites overconfident language and
   records the categories of overclaim it rejected (shown as "rejected
   overclaims", never the raw phrase).
8. **Reasoning audit trail** — a structured, judge-safe record of why a branch
   exists, the evidence and assumptions it leans on, its uncertainty drivers, what
   would change the assessment, and the next validation step.
9. **Synthesis** — assembles the Future Map, Branch Detail, Future Self chat, and
   the 10-section Decision Brief.

## Single-call structured debate (live path)

For demo stability the live path runs the nine roles in **one validated model
call** that emits the debate, agent review, and audit trail inside a single JSON
object. This preserves the route's time budget and the one-validation→fallback
contract. If the live output fails Zod validation, the system retries once, then
falls back to the curated mock dataset. The mock fallback emits the **same
structured 9-role pipeline**, so the product is identical with or without a key.

## Why a structured pipeline, not a chatbot

Separating retrieval, scenario-building, the optimist/skeptic debate, calibration
and safety into named roles is what lets the system show *how* it reasoned and stay
honest about what it does and does not know. A chatbot returns one confident answer;
this returns three branches, their evidence, their assumptions, and their
uncertainty — and leaves the decision to the human.

## Data contract

Types live in `lib/types.ts` and are mirrored at runtime by Zod schemas in
`lib/schemas.ts`. Every v2 field (agent review, reasoning audit trail, evidence
graph snapshot, rejected overclaims, evaluation signals, source provenance on
evidence cards) is **optional and additive**, so live output that omits a field
still validates and the mock dataset stays backward-compatible.

## Models

The live path defaults to the latest Claude model via `@anthropic-ai/sdk`
(configurable with `ANTHROPIC_MODEL`). Live generation quality has **not been
benchmarked**; the submission demo runs on the curated mock path, which is fully
representative of the structured output.
