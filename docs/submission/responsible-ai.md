# Responsible AI

Responsible framing in Forked Futures is **structural** — enforced at several
layers of code and data, not left to a single careful prompt.

## What the system will not do

- **It does not forecast your future.** Every branch is framed as a plausible
  scenario, a rehearsal — not a prediction.
- **It does not output fabricated probabilities.** Calibration is qualitative only
  (low / medium / high). There are no invented percentages anywhere in the
  user-facing output, and the eval harness scans for them.
- **It does not make the final decision.** Values, risk tolerance, family context,
  identity and lived experience are out of scope for the model by design. The
  Decision Brief enumerates exactly what the AI will not decide.
- **It does not expose raw chain-of-thought.** The Agent Review and Reasoning Audit
  Trail are structured, summarised artifacts — never the model's verbatim
  deliberation.

## How it is enforced

1. **Safety scrubber** — a deterministic pass rewrites deterministic and
   over-confident language and records the *categories* of overclaim it rejected.
   The rejected-overclaims list never contains the raw banned phrase.
2. **Qualitative-only calibration** — the data model has no field for a precise
   probability; levels are an enum.
3. **Honest coverage levels** — every evidence claim is kept at its true coverage
   level (program, occupation, cohort, population, framework). Aggregate data is
   never dressed up as an individual forecast.
4. **Provenance tagging** — every claim is tagged `user_provided`,
   `source_supported`, or `ai_inferred`, so the user can weigh it accordingly.
   AI-inferred claims carry a confidence level and a concrete way to test them.
5. **No fabricated statistics in the evidence pack** — the official-source cards
   describe what each source covers and its limitations; they contain no invented
   exact figures.
6. **Schema validation + retry + mock fallback** — malformed or off-contract model
   output is rejected by Zod; the system retries once, then falls back to the
   curated mock dataset, so the UI is never fed an unvalidated claim.
7. **Uncertainty is first-class** — shown on every branch and surfaced in the brief,
   never buried.

## Evaluation harness

Four framework-free eval scripts (`npm run eval`) guard these properties:

- **eval-overclaim-safety** — scans user-facing source, mock data, knowledge cards
  and these submission docs for banned/risky language, with word-boundary and
  negation-aware handling so safe negations (e.g. "not a guarantee", "guarantees
  nothing") are not flagged.
- **eval-rag-coverage** — every branch has provenance-bearing evidence and a data
  coverage note; every official-source card carries publisher, source URL,
  reliability level, and limitations; no fabricated percentages.
- **eval-agent-output-schema** — all three branches satisfy the Zod contract and
  carry calibration, assumptions, agent review, audit trail, evidence graph,
  pre-mortem, rejected overclaims, evaluation signals, and a 7-day experiment.
- **eval-demo-journey** — the keyless mock path returns `mocked:true` with the v2
  data present, and (when a server is up) key pages and APIs return 200.

## Limits we are honest about

Live model generation has not been benchmarked; the demo runs on the curated mock
path. The system can frame a decision and stress-test it, but the choice — and the
weighing of what matters against what — stays entirely with the person.
