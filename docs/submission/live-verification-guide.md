# Live Verification Guide

Forked Futures runs fully on the **mock path with no keys**. This guide shows how to
verify the **optional** live paths (web search and live model generation) locally,
safely, and what success vs. fallback looks like. Never commit keys; never paste a
key into a chat or screenshot.

## What's optional

| Capability | Env vars | Without keys |
|---|---|---|
| Live web research | `GOOGLE_SEARCH_API_KEY` + `GOOGLE_CSE_ID` | curated mock corpus (`mocked:true`) |
| Live model generation | `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`) | curated mock branches/brief/chat |

Keys are read from the environment only and are never logged, returned, or
committed (`.env`/`.env.local` are gitignored).

## 1. Get a Google Programmable Search key (web research)

1. Create an API key in Google Cloud and enable the **Custom Search API**.
2. Create a Programmable Search Engine and copy its **Search engine ID** (`cx`).
3. Set them in your shell (do not write them into a tracked file):

```bash
export GOOGLE_SEARCH_API_KEY=your-api-key-here
export GOOGLE_CSE_ID=your-search-engine-id-here
```

(A gitignored `.env.local` also works: copy `.env.example` and fill it in.)

## 2. Run the app with the keys

```bash
npm run build
npm run start            # http://localhost:3000
```

## 3. Verify live web research

```bash
curl -s -X POST http://localhost:3000/api/research \
  -H 'content-type: application/json' \
  -d '{"context":{"decision":"quant vs startup vs research","options":["quant","startup","research"],"major":"CS","skills":[],"values":[],"constraints":[],"fears":[],"background":"","timeHorizon":"12 months","urgency":"soon"}}' \
  | python3 -m json.tool | head -40
```

**Success looks like:**
- `"mocked": false` and `"provider": "google"`.
- `sourcesUsed` with **real URLs and domains** from the live web.
- `sourcesRejected` carrying explicit `rejectionReason`s (low-reliability domains).
- `claims` and `trajectoryAnchors` still present, framed as analogies.

**Fallback looks like:** if the provider errors or a query fails, the route still
returns `200` with `"mocked": true` and the curated dossier — the demo never
hard-fails. (You can confirm by unsetting the keys and re-running.)

## 4. Verify live model generation (optional)

```bash
export ANTHROPIC_API_KEY=your-anthropic-key-here
npm run build && npm run start
# then POST /api/simulate, /api/questions, /api/decision-brief, /api/future-self-chat
```

**Success:** responses return `"mocked": false`, validate against the Zod schema,
emit exactly 3 branches with the v2 fields, and use hedged, non-deterministic
language. **Fallback:** any validation failure retries once, then returns the
curated mock — so the UI is never fed an unvalidated claim.

## 5. What to record for Devpost / the demo

- One `/research` run in **live** mode (badge shows `Live · google`), scrolling the
  Research Trace → Source Radar → Sources Rejected → Claim Ledger.
- One `/api/simulate` live generation (optional), noting the live badge.
- Say on camera which mode is live; do not show the key.

## Safety notes

- Result counts are capped; queries are about roles/fields/frameworks (a guard
  skips person-lookup patterns).
- No facial recognition, no de-anonymization, no scraping of private data, no
  identifying or comparing to private individuals.
- If you have no keys, that is fine — the submission demo runs entirely on the mock
  path and is fully representative of the structured output.
