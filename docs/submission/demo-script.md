# Demo Script (60–90 seconds)

The whole demo runs on the **mock path with no API key**, so it never depends on
the network. Persona: **Alex**, a CS sophomore choosing between quant recruiting,
building a startup, and preparing for research / grad school.

## Fast path (recommended)

1. **Landing (0:00–0:10).** "Forked Futures is a decision-intelligence cockpit for
   students facing a major fork. It does not predict your future and it does not
   choose for you — it runs the decision through evidence, a multi-agent debate,
   calibration and a safety layer." Click **See the Alex demo**.

2. **Future Map (0:10–0:25).** "Three futures as branching timelines, not a card
   list. Each node shows evidence strength, fit, constraint risk and uncertainty —
   qualitative, never a fake probability — plus a first validation experiment.
   Nothing here is a prediction." Open the **Quant Signal Track**.

3. **Branch Detail — the cockpit (0:25–0:55).** Scroll the panels:
   - **Agent Review** — the 9-role debate, including Optimist vs Skeptic, as a
     judge-safe summary (not raw chain-of-thought).
   - **Evidence Console** — curated *and* official-source cards (BLS, O*NET, …) with
     publisher, coverage level and limitations.
   - **Evidence Graph Snapshot** — "why this branch exists", as connected nodes.
   - **Calibration Cockpit** — qualitative levels + the rationale.
   - **Reasoning Audit Trail** — why it exists, evidence used, assumptions, what
     would change the assessment, next test.
   - **Rejected Overclaims** — what the safety layer rewrote.

4. **Decision Brief (0:55–1:10).** "A final mission brief: what you're really
   deciding, strongest signals, biggest uncertainties, **what the AI will not
   decide**, what would change the assessment, the evidence-coverage note, and the
   next experiments. The **Decision Delta** panel makes the impact concrete — vague
   options before, evidenced and testable branches after. The choice stays with Alex."

5. **Judge Mode / Architecture (1:10–1:30).** "Why this is not a chatbot wrapper:
   the official-source RAG pack, the local evidence graph, the 9-role pipeline, the
   safety scrubber, and a **live sample trace of the Alex decision end-to-end** —
   pulled from the running data, not a screenshot."

## Talking points (if asked)

- **Why AI, not a rules engine?** A lookup table can't reason about a life decision
  under uncertainty; the model reasons over messy context and surfaces hidden
  assumptions, while retrieval, the graph, the safety scrubber and schema
  validation stay deterministic.
- **How is it responsible?** Qualitative calibration, provenance tags, honest
  coverage levels, a safety scrubber, no fabricated probabilities, and an explicit
  "what the AI will not decide" — all guarded by an evaluation harness.
- **Does it work offline?** Yes — `npm run dev` with no key runs the full journey on
  the curated mock dataset; the live model path is optional.

## Reset between runs

Use **Restart** in the top nav (clears the local session) before showing the demo
again from a clean state.

## One-command proof for judges

```bash
npm install && npm run validate
```

Runs typecheck, the four evaluation scripts, and the production build.
