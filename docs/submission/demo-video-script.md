# Demo Video Script

Two scripts: a 3–5 minute judge walkthrough and a 60-second emergency cut. The
whole demo runs on the **mock path with no API key**, so it never depends on the
network. Persona: **Alex**, a CS sophomore choosing between quant recruiting,
building a startup, and preparing for research / grad school.

> Honesty note for narration: the live model path is **optional and not yet
> benchmarked**. The demo runs on the curated mock dataset, which emits the same
> structured pipeline. Do not claim live performance unless you have run and shown
> it on the day.

---

## 3–5 minute script

**0:00 — Hook (spoken over the landing page).**
"Every student hits a fork they can't un-pick — and the usual help is either a
pros/cons list or a confident chatbot answer. A confident answer is exactly the
wrong tool when the future is uncertain. Forked Futures is a decision-intelligence
cockpit: it does not forecast your future and it does not choose for you — it helps
you understand the futures you're choosing between." *(Point to the microcopy: "Not
a prediction · not a recommendation · a structured future rehearsal.")*

**0:25 — The problem & why AI (landing "why this needs AI" section).**
"This isn't a lookup. A rules table needs every input pre-categorised and can only
return tradeoffs someone hard-coded. The hard part is weighing *your* messy
context — values, fears, the one binding constraint — and surfacing the tradeoffs
and assumptions hiding inside a choice. That's reasoning, and it needs a model."
Click **See the Alex demo**.

**0:50 — Future Map (the branching timelines).**
"Three futures as branching timelines, not a card list. Each node carries
qualitative calibration — evidence, fit, constraint-risk, uncertainty — never a
fabricated probability — plus the first experiment to run. Nothing here is a
prediction." Open the **Quant Signal Track**.

**1:20 — Branch Detail, part 1: the reasoning is shown, not hidden.**
"Open a branch and the cockpit shows *how the system reasoned* — a nine-role
debate, including an explicit Optimist versus Skeptic, as a judge-safe summary. To
be clear: this is a structured record of each agent's contribution, **not raw
chain-of-thought**." Scroll the **Agent Review**.

**1:50 — Branch Detail, part 2: grounding.**
"Every branch is grounded. The **Evidence Console** cites curated *and* official
sources — BLS, O*NET, College Scorecard, NCES, ACS — each with its publisher,
coverage level and limitations, and no invented statistics. The **Evidence Graph**
shows *why this branch exists*: sources, skills, constraints, risks and frameworks
connected to the path and the experiment that can test it. This is grounded
retrieval, not source-dropping." *(Scroll Evidence Console → Evidence Graph.)*

**2:30 — Branch Detail, part 3: honesty as a feature.**
"Calibration is qualitative with a rationale. The **Reasoning Audit Trail** lists
what the branch rests on, what's uncertain, and what would change the assessment.
And the **Rejected Overclaims** panel shows what the safety layer rewrote — a
chatbot wouldn't self-censor *and show its work*." *(Scroll Calibration →
Evaluation Signals → Audit Trail → Rejected Overclaims.)*

**3:10 — Decision Brief + Decision Delta.**
"The brief is a final mission brief: what Alex is really deciding, strongest
signals, biggest uncertainties, **what the AI will not decide**, what would change
the assessment, the evidence-coverage note, and the next experiments. The
**Decision Delta** makes the impact concrete — before: vague options and untested
assumptions; after: three evidenced branches, a tagged assumption ledger, surfaced
uncertainty, and experiments to run this week. The choice stays with Alex."

**3:50 — Judge Mode / Architecture.**
"Why this is not a chatbot wrapper, in one screen: the official-source RAG pack,
the local evidence graph, the nine-role pipeline, the safety scrubber, a live
sample trace of Alex's decision end-to-end, and a **System Evaluation** panel —
four eval scripts, reproducible with `npm run eval`. The safeguards are tested, not
asserted."

**4:30 — Responsible-AI close.**
"Qualitative calibration, provenance on every claim, no fabricated probabilities,
a safety scrubber, and an explicit boundary on what the AI will not decide — all
enforced in code and guarded by evals. Forked Futures takes a student from
uncertainty to a testable next step, and keeps the decision human. Final line: it
doesn't tell you which future to pick — it lets you rehearse them first."

---

## 60-second emergency cut

1. **0:00** "Forked Futures is a decision-intelligence cockpit for students facing
   a major fork. It does not forecast your future and it does not choose for you."
   *(Landing → See the Alex demo.)*
2. **0:12** "Three futures as branching timelines — qualitative calibration, no fake
   probabilities, a first experiment on each." *(Future Map → open a branch.)*
3. **0:28** "It shows *how* it reasoned: a nine-role debate with Optimist vs
   Skeptic, official-source evidence with provenance, an evidence graph, and the
   overclaims the safety layer rejected — a structured summary, never raw
   chain-of-thought." *(Scroll Agent Review → Evidence → Rejected Overclaims.)*
4. **0:45** "The brief shows the Decision Delta — from vague options to evidenced,
   testable branches — and states what the AI will not decide." *(Brief → Decision
   Delta.)*
5. **0:55** "Grounded, honest, human-in-the-loop, and validated by an eval harness —
   not a chatbot wrapper." *(Architecture → System Evaluation.)*

---

## Capture checklist

- Run on the mock path (no key) for stability, or set `ANTHROPIC_API_KEY` and show
  one live generation if you want to demonstrate the live path (state that it is
  the live path on camera).
- Use **Restart** in the top nav between takes for a clean state.
- Record at 1440×900 for desktop; the contact sheet
  (`docs/qa/judge-readiness/contact-sheet.png`) doubles as a thumbnail source.
