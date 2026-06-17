# Deployment Checklist

Forked Futures is a standard **Next.js 14 (App Router)** app and deploys cleanly to
Vercel. It runs with **zero required environment variables** — the live paths are
optional. Do not deploy without explicit approval; this is a readiness reference.

## Required environment variables
**None.** The app builds and runs the full demo on the mock path with no keys.

## Optional environment variables
| Variable | Enables | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Live model generation (questions / simulate / brief / chat) | curated mock branches/brief/chat |
| `ANTHROPIC_MODEL` | Override the model id (defaults to the latest Claude) | default model |
| `GOOGLE_SEARCH_API_KEY` + `GOOGLE_CSE_ID` | Live web research in `/api/research` | curated public-source corpus |

Set these in the host's env settings (Vercel → Project → Settings → Environment
Variables). **Never commit keys**; `.env` / `.env.local` are gitignored.

## No-key fallback behavior (default)
- Every page renders and every API returns `200` with `mocked: true`.
- `/api/research` returns a full dossier (queries, ranked sources, rejected sources
  with reasons, claim ledger) labeled `provider: "mock"`.
- `/api/simulate` returns exactly 3 enriched branches.
- The UI badges honestly show "Mock corpus (no key)" / "Demo synthesis".

## Build & compatibility checks
- `npm run build` → exit 0, 15 routes (`/research` + `/api/research` included).
- No runtime filesystem reads in app code; JSON is imported at build (bundled).
- Playwright is a **dev-only `--no-save`** tool used only by the screenshot script —
  **not** a runtime dependency and not required for build/deploy.
- The search provider (`lib/web/googleSearch.ts`) and research agent run **server-
  side only** (API route); client components import only types + pure helpers, so no
  server-only code is bundled into the client.
- `next.config.mjs` is minimal (no host-specific assumptions).

## Verify after deploy (or locally)
```bash
# Mock (always works):
curl -s -X POST "$URL/api/research" -H 'content-type: application/json' \
  -d '{"context":{"decision":"q","options":["quant","startup","research"],"major":"CS","skills":[],"values":[],"constraints":[],"fears":[],"background":"","timeHorizon":"12 months","urgency":"soon"}}' \
  | python3 -m json.tool | head -20      # expect "mocked": true (or false if keys set)

curl -s -X POST "$URL/api/simulate" -H 'content-type: application/json' \
  -d '{"context":{ ... same shape ... }}' | python3 -m json.tool | head -20   # expect 3 branches
```
With keys set, expect `"mocked": false` and live sources/branches; if a live call
fails, the route still returns `200` with the curated fallback.

## What to show in the demo
The keyless mock demo is fully representative. If keys are configured, show one live
`/research` run (badge: `Live · google`) and optionally one live `/api/simulate`.

## What NOT to claim
- Do not claim live web search or live model generation is "verified" unless you ran
  it that day (see `live-verification-guide.md`).
- Do not present any number as an exact probability; calibration is qualitative.
- Do not describe the trajectory/research features as person-matching — they use
  public role archetypes and aggregate/official sources as analogies.
