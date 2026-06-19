# DeepSeek-compatible & MOA-inspired Prompt Style Guide

Internal guide for how Forked Futures writes model prompts so they stay robust for
a **DeepSeek-style** model (literal, structured, JSON-strict) *later*, and so our
reasoning scaffold is described **honestly**.

> Scope note: this is prompt-quality guidance only. It does **not** add DeepSeek
> API support, env vars, or any provider. The app's only implemented live model
> provider is Anthropic (`lib/ai/client.ts`); with no key it runs on the mock
> fallback. See [`DEEPSEEK_LOCAL_TEST.md`](DEEPSEEK_LOCAL_TEST.md).

---

## Where the prompts live

| Prompt | File | Route | Live/mock |
|---|---|---|---|
| `QUESTIONS_SYSTEM` + `buildQuestionsUser` | `lib/ai/prompts.ts` | `/api/questions` | live; mock fallback |
| `SIMULATE_SYSTEM` + `buildSimulateUser` | `lib/ai/prompts.ts` | `/api/simulate` | live; mock fallback |
| `BRIEF_SYSTEM` + `buildBriefUser` | `lib/ai/prompts.ts` | `/api/decision-brief` | live; mock fallback |
| `buildChatSystem` | `lib/ai/prompts.ts` | `/api/future-self-chat` | live; mock fallback |
| `RESPONSIBLE_AI_RULES` | `lib/ai/prompts.ts` | shared by all of the above | — |

The **research path** (`lib/research/*`, `/api/research`) is **deterministic TypeScript**
(query planning, source ranking, trajectory extraction, claim ledger) — there is
**no research model-prompt** today. If an LLM planner is added later, apply this
guide to it.

The **SafetyAgent** is a deterministic regex scrub (`DETERMINISTIC_REPLACEMENTS`
in `lib/ai/pipeline.ts`), not a prompt. JSON parsing/fence-stripping/one-retry
live in `lib/ai/client.ts` (`extractJSON`, `generateJSON`).

---

## Principles (DeepSeek-style)

1. **Task before tone.** Open with the job, not product poetry.
2. **Separate context, constraints, and the output contract** into distinct blocks.
3. **Numbered requirements** beat prose paragraphs for a literal model.
4. **Explicit output contract.** State the exact JSON shape and field enums.
5. **No vague "be helpful" language.** Every instruction must be checkable.
6. **Never request raw chain-of-thought.** Ask for compact, structured *summaries*
   of conclusions only.
7. **Force evidence labeling.** Every claim tagged `user_provided` /
   `source_supported` / `ai_inferred`.
8. **Force uncertainty labeling.** Qualitative levels (low/medium/high), never
   invented probabilities or exact percentages.
9. **Force a next action.** Every output ends in a concrete, testable next step.
10. **Reject generic advice.** Each item must earn its place by reducing a real
    ambiguity for *this* decision.
11. **Fallback when evidence is weak** (see FAILURE MODE) — say what is missing and
    return a safer partial answer rather than a confident guess.
12. **Keep human decision authority explicit.** The model never makes the call.
13. **Assume a literal reader.** If a weaker model could misread it, tighten it.

## MOA-inspired principles

"MOA" = *Mixture of Agents*: specialized roles whose outputs are compared,
critiqued, and synthesized by an aggregator.

- Use a specialized role only when it has a **distinct** job.
- Each role emits a **compact summary**, never hidden chain-of-thought.
- Include a **Skeptic/Critic** role that can reject overclaims.
- Include an **Evidence** role that separates source-supported claims from
  inference.
- Include a **Safety/Calibration** role.
- Include an **Aggregator/Synthesizer** that resolves disagreement; the final
  output should surface **consensus, unresolved disagreement, rejected claims,
  uncertainty, and one next validation test**.
- **Honesty rule (important):** only call it *true MOA* if there are actually
  multiple independent model calls/agents. Forked Futures runs all roles in **one
  structured model call**, so the honest description is:
  > **"MOA-inspired structured role debate inside a single model call"**
  (equivalently, a *single-call multi-role reasoning scaffold*). Do **not** claim
  it is a true multi-model MOA system. The `/architecture` page and prompts
  already state the roles "run in one pass," which is consistent with this.

---

## Reusable prompt template

```
SYSTEM:
You are Forked Futures' decision-simulation reasoner.

TASK:
<one explicit sentence: what to produce, and the hard count/shape, e.g.
"Produce EXACTLY 3 plausible future branches, one per user option, in order.">

INPUT:
<context block: decision, options, skills, values, constraints, fears, horizon;
then clarifying answers; then retrieved evidence with provenance — clearly
separated from the instructions above.>

ROLES (run as ONE structured pass — MOA-inspired, not separate model calls):
1. Context Extractor   — restate what you are reasoning from.
2. Evidence Mapper     — which provided evidence applies, and its coverage level.
3. Scenario Builder    — a coherent, hedged 12-month scenario.
4. Optimist            — strongest HEDGED case it could work.
5. Skeptic             — strongest HEDGED case it could fail.
6. Calibration Judge   — qualitative levels only; no fake probabilities.
7. Safety Reviewer     — remove deterministic/overconfident language.
8. Next-Quest Designer — one concrete, testable 7-day experiment.
9. Synthesizer/Aggregator — reconcile the roles into the final output.

REASONING RULES:
- Think privately. Do NOT reveal raw chain-of-thought.
- Surface only compact, structured role summaries (one sentence per role).

EVIDENCE RULES:
- Tag every claim: user_provided | source_supported | ai_inferred.
- Keep each claim at its true coverage level; never invent exact statistics.
- When a claim cites an official source, copy its provenance verbatim.

SAFETY RULES:
- Plausible scenarios, never predictions. No "best choice"/"you should choose".
- No fake probabilities, no deterministic claims, no invented sources.
- No private-person matching. The human makes the final decision.

OUTPUT:
Return ONLY one valid JSON object matching this shape (no prose, no fences):
<exact field list + enums>

AGGREGATOR RULE:
The final answer must SYNTHESIZE role outputs (not average them): explicitly name
unresolved Optimist/Skeptic disagreement, drop claims the Skeptic or Safety role
could not support (never keep them silently), and end with one testable next quest.

FAILURE MODE:
If required evidence is missing or thin, do not fabricate. Lower confidence, mark
the claim ai_inferred, raise the uncertainty level, state what is missing, and
return a safer partial output instead of a confident guess.
```

---

## How the current prompts already meet this

The four live prompts already: define explicit roles; enforce an exact JSON
contract with field enums; separate context from instructions; ban raw
chain-of-thought (summaries only); force provenance + qualitative calibration +
a 7-day next step; reject generic/deterministic/probabilistic language via the
shared `RESPONSIBLE_AI_RULES`; and keep the decision with the human. The two
additions this pass make explicit what was implicit: a consolidated **FAILURE
MODE** and an explicit **AGGREGATOR RULE**.

## What would be needed later (not done now)

- **Real DeepSeek provider:** a provider abstraction selected by an explicit
  `AI_PROVIDER` env var (default = current behavior), a `fetch` client against
  DeepSeek's OpenAI-compatible endpoint, reusing the same Zod-validate + retry +
  mock-fallback contract. Zero-env must still run mock.
- **True (multi-call) MOA:** separate model calls per role (or a few grouped
  calls) with an aggregator call — higher latency/cost. Only worth it if it
  measurably beats the single-call scaffold; keep the mock fallback and the
  single-call path as the default.
