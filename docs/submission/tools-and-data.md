# Tools & Data

## Stack

- **Next.js 14 (App Router)** + **React 18** + **TypeScript** (strict).
- **Tailwind CSS** for the cinematic cockpit design system; **framer-motion** for
  motion (gated behind `prefers-reduced-motion`); **lucide-react** for icons.
- **Zustand** (+ localStorage persist) for cross-page state — no backend, no
  accounts.
- **Zod** for runtime validation of every API request and every model generation.
- **@anthropic-ai/sdk** for the optional live path (latest Claude model;
  `ANTHROPIC_MODEL` configurable).
- **tsx** (dev-only) to run the framework-free evaluation scripts.

No graph database, no vector database, no analytics, no auth, no payments. The
evidence graph and retrieval are plain, deterministic TypeScript.

## Data layers

### Curated knowledge base (`knowledge/*.json`)
Domain cards for computing/quant careers, startup validation, grad-school research,
decision science, and labor-market source pointers. Each card carries a source
type, coverage level, and evidence strength.

### Official-source evidence pack (`knowledge/sources/*.json`)
Curated cards describing what high-reliability public sources cover, with full
provenance (publisher, source URL, coverage level, reliability level) and explicit
limitations. **No fabricated exact statistics** — coverage is always aggregate.

| Source | Publisher | Used for (coverage) |
|---|---|---|
| College Scorecard | U.S. Department of Education | program/school-level cost, completion, earnings context |
| Occupational Outlook Handbook | U.S. Bureau of Labor Statistics | occupation-level role, wage framing, outlook, requirements |
| O*NET OnLine | U.S. Department of Labor (O*NET) | occupation-level skills, tasks, work activities, tools |
| First-Destination Survey | NACE | cohort-level graduate outcome categories, continuing education |
| Baccalaureate and Beyond (B&B) | NCES | cohort-level post-bachelor earnings, debt, employment, enrollment |
| ACS PUMS | U.S. Census Bureau | population-level field-of-degree → occupation, income distributions |
| Decision-science frameworks | Curated research (e.g. Klein, HBR) | framing, alternatives, values, pre-mortem, smallest decisive test |

Each card is used only at its honest coverage level and never for individual
prediction.

### Local evidence graph (`lib/knowledge/graph.ts`)
A dependency-free node/edge model (29 nodes, 28 edges). Node types: source,
career_path, skill, constraint, decision_framework, risk, experiment. Edge
relations: supports, requires, creates_risk, can_be_tested_by, informs, limits.
Each branch carries the subgraph that explains why it exists.

## How data flows

`RetrievalAgent` (in code) selects curated cards + official-source cards per option
and traverses the graph; the model grounds each branch in that evidence, copying
provenance into the evidence cards and keeping every claim at its coverage level.
The keyless mock dataset (`lib/mock/*`) hand-authors the same shapes so the demo is
fully representative offline.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000 — works with no API key
npm run validate       # typecheck + 4 evals + production build
npm run eval           # the four evaluation scripts only
```

Set `ANTHROPIC_API_KEY` to enable the optional live path; without it, everything
runs on the curated mock dataset.
