# AdaptiveRAG — VCET Hackathon demo (frontend only)

React 19 + Vite + Tailwind v4 + shadcn-style components. **No backend.** Every number
is mock data from `src/data/mock.js`.

## Run

```bash
npm run dev
```

## What was fixed

| File | Problem | Fix |
|---|---|---|
| `jsconfig.json` | pointed at non-existent `tsconfig.app.json` / `tsconfig.node.json`, no `paths` → shadcn init failed with *"Could not find valid path aliases"* | proper `baseUrl` + `"@/*": ["./src/*"]` |
| `vite.config.js` | `tailwindcss()` was passed as a **babel preset** instead of a vite plugin | moved to `plugins: [react(), tailwindcss(), babel(...)]` |
| `index.html` | — | added `class="dark"` + title |
| `components.json` | missing | added (new-york, jsx, lucide, `@/` aliases) |

## Optional: run the shadcn preset now

The alias error is gone, so this works:

```bash
npx shadcn@latest init --preset b3QvsRiOO --base radix --template vite --pointer
```

Back up `src/index.css` first — init rewrites the theme tokens with the preset's palette.
Do **not** re-add components that already exist in `src/components/ui/` unless you want
the Radix versions; the local ones have the same API and need zero extra dependencies.

## Structure

```
src/
  App.jsx                 shell: sidebar + topbar + view switch
  data/mock.js            ALL fake data (queries, chunks, jobs, metrics)
  components/charts.jsx   dependency-free SVG charts (sparkline, line, donut, funnel)
  components/ui/          button card badge tabs table progress input separator skeleton tooltip
  views/
    Overview.jsx          KPI row, latency baseline-vs-adaptive, route mix, alerts
    Playground.jsx        ⭐ the demo — animated 6-stage pipeline, chunk pruning, streamed answer
    Scraper.jsx           crawl/index jobs, freshness, chunk distribution
    Analytics.jsx         per-route economics, RAGAS-style eval, compression funnel
    Architecture.jsx      system layers + FastAPI contract
```

## 3-minute demo script

1. **Overview** — "12.8k queries, p95 down 48%, 61% of context tokens never sent to the LLM."
2. **Playground** → click *"What is the capital of Maharashtra?"* → retrieval stages grey out:
   **the router answered with zero retrieval**.
3. Run *"How does our adaptive router decide…"* → vector route, 5 chunks retrieved,
   2 pruned live, answer streams with citations, 65% tokens saved.
4. Run the RBI query → index is 41 d stale past TTL → **escalates to a live web scrape**.
5. **Scraper & Index** — the stale/failed jobs that drove that decision.
6. **Architecture** — the FastAPI endpoints the dashboard is written against.

## Wiring a real backend later

Replace the mock lookup in `Playground.jsx` (`pickQuery`) with `POST /api/query`, and swap the
timer-driven `stage` state for stage events off `WS /ws/stream`. Nothing else changes.
