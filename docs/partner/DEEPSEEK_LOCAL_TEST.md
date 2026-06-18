# DeepSeek Local Test Guide

## Purpose

This guide explains how a teammate would test Forked Futures locally with a live
model provider before adding any key to Vercel. The project must always still work
**without keys** through its mock fallback.

---

## ⚠️ Read this first — provider status (honest)

**DeepSeek is NOT currently wired into this app.** As of this commit:

- There is **no** DeepSeek code, no `DEEPSEEK_API_KEY` usage, and **no**
  `AI_PROVIDER` selection variable anywhere in the repo (verified by search).
- The only live model provider that is actually implemented is **Anthropic**.
  The AI layer (`lib/ai/client.ts`) instantiates the Anthropic SDK and reads
  `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_MODEL`, default `claude-opus-4-8`).
- The autonomous web-research path uses **Google Programmable Search**
  (`GOOGLE_SEARCH_API_KEY` + `GOOGLE_CSE_ID`) — also optional.
- With **zero environment variables**, the entire app runs on a curated **mock
  fallback** that mirrors the full structured pipeline. This is the supported,
  submission-safe default.

**Consequence:** if you add `DEEPSEEK_API_KEY` / `AI_PROVIDER=deepseek` to
`.env.local` or Vercel, **nothing will happen** — the current code never reads
those variables. The app will simply keep running on mock (or on Anthropic, if an
`ANTHROPIC_API_KEY` is present). Do **not** expect DeepSeek to work until a
provider integration is actually built (see the last section).

> For the hackathon, the safe plan is: **deploy mock fallback first (zero env
> vars).** Live providers are optional and can be added later.

---

## Safety Rules

- Never commit `.env.local` (it is already gitignored — keep it that way).
- Never paste API keys into GitHub, README, screenshots, Discord, or Devpost.
- Do not add any key to Vercel until local testing passes.
- If a live provider fails or is unverified, keep the **zero-env mock deployment**
  for submission safety.

---

## Local Setup

```bash
git clone https://github.com/HenryCh-hong/USAII-Agent.git
cd USAII-Agent
npm install
```

### Environment variables

Create a `.env.local` file in the project root. **Only include variables the code
actually reads:**

```bash
# Optional — live model generation (Anthropic is the implemented provider).
# Without it, the app uses the curated mock fallback.
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-opus-4-8          # optional override

# Optional — live web research (Google Programmable Search).
# Without these, the research agent uses a curated public-source corpus.
GOOGLE_SEARCH_API_KEY=your_key_here
GOOGLE_CSE_ID=your_search_engine_id
```

#### ❌ Not yet supported (do not rely on these)

```bash
# These variables are NOT read by the current code. Documented here only as the
# PROPOSED format for a future optional DeepSeek integration that does not exist
# yet. Adding them today has no effect.
DEEPSEEK_API_KEY=...
AI_PROVIDER=deepseek
```

---

## Local Validation

```bash
npm run validate     # typecheck + 7 eval scripts + production build (must exit 0)
npm run dev          # http://localhost:3000
```

Open `http://localhost:3000` and walk the flow:

```text
/                       landing — "One decision → three evidence-traced futures → one 7-day test → you decide"
/intake
/questions
/map                    route-select cue + path cards
/branch/quant-signal    the deepest reasoning surface (9-role debate, evidence graph, audit trail)
/chat/quant-signal
/brief                  "Future Run Complete" + Decision DNA + Next Quest
/research               exploration / evidence trail
/architecture           Judge Mode
```

Also exercise the APIs:

```bash
curl -s -X POST http://localhost:3000/api/research  -H 'content-type: application/json' \
  -d '{"context":{"decision":"q","options":["quant","startup","research"],"skills":[],"values":[],"constraints":[],"fears":[],"background":"","timeHorizon":"12mo","urgency":"soon"}}'
curl -s -X POST http://localhost:3000/api/simulate -H 'content-type: application/json' \
  -d '{"context":{"decision":"q","options":["quant","startup","research"],"skills":[],"values":[],"constraints":[],"fears":[],"background":"","timeHorizon":"12mo","urgency":"soon"}}'
```

---

## Expected Result

- **No keys present (default):** every page returns 200; `/api/research` reports
  `"mocked": true` / `"provider": "mock"`; `/api/simulate` returns `"mocked": true`
  with **3 branches**. This is the curated mock fallback and is the submission-safe
  state.
- **`ANTHROPIC_API_KEY` present:** the model routes (`/api/simulate`,
  `/api/questions`, `/api/decision-brief`, `/api/future-self-chat`) attempt live
  generation, validate the output against Zod, retry once, and **fall back to mock
  on any error** — so it never hard-fails. (Note: the live model path is
  provider-ready but **not benchmarked**; verify quality yourself.)
- **`GOOGLE_SEARCH_API_KEY` + `GOOGLE_CSE_ID` present:** `/api/research` performs
  live web search and reports a non-mock provider; otherwise it uses the curated
  corpus and reports `mocked: true`.
- **DeepSeek variables present:** **no effect** — not implemented.

---

## Vercel Environment Variables

Only after a local test passes, and only with **supported** variables:

1. Open the Vercel project.
2. Settings → Environment Variables.
3. Add only the variables the code reads (`ANTHROPIC_API_KEY`, optionally
   `ANTHROPIC_MODEL`, `GOOGLE_SEARCH_API_KEY`, `GOOGLE_CSE_ID`). **Do not** add
   `DEEPSEEK_API_KEY` / `AI_PROVIDER` — they do nothing today.
4. Redeploy.
5. Verify the live pages and APIs exactly as in "Expected Result" above.

---

## Rollback

If a live provider misbehaves:

- Remove the provider's env vars in Vercel (e.g. delete `ANTHROPIC_API_KEY`).
- Redeploy — the app returns to the curated **mock fallback** automatically.
- Submit the stable mock version. The mock path is fully representative.

---

## Troubleshooting

- **"My DeepSeek key does nothing."** Expected — DeepSeek is not integrated. Use
  the mock fallback, or set `ANTHROPIC_API_KEY` for a live model.
- **`/api/*` returns `mocked: true` even with a key.** The route fell back: the key
  may be invalid/rate-limited, or the live output failed Zod validation. Check the
  server logs; the UI still works on mock.
- **Build fails locally.** Run `npm run validate` and read the first error; the
  build requires **no** env vars, so a failure is a code/typecheck issue, not a
  missing key.
- **Never commit `.env.local`.** If you accidentally staged it, `git restore
  --staged .env.local` and confirm it is not in `git status`.

---

## If you want DeepSeek later (not done yet)

DeepSeek exposes an OpenAI-compatible chat-completions API, so a future **optional**
integration would be small but is **not** part of this submission. It would require:

1. A provider abstraction in `lib/ai/` selected by an explicit `AI_PROVIDER` env var
   (default = current behavior), so zero-env still uses mock/Anthropic.
2. A `fetch`-based client against DeepSeek's OpenAI-compatible endpoint, with the
   same Zod validation + mock fallback the Anthropic path uses.
3. No change to eval behavior (evals must not depend on a live provider).
4. An honest `.env.example` + docs update once it actually works.

Until that exists, **deploy mock-first and treat DeepSeek as a future enhancement.**
