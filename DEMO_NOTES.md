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

## After the shadcn preset init (done)

The preset overwrote `src/components/ui/*` with the Radix versions and swapped the theme to
the lime palette. Three follow-up patches were applied so the dashboard still works:

- `progress.jsx` — re-added the `indicatorClassName` prop (shadcn's Progress drops it, which
  killed the red/amber/green index-health bars and the emerald compression bar).
- `badge.jsx` — re-added the `success` / `warning` / `info` / `violet` variants used for the
  route chips and alert badges.
- `data/mock.js` + `Analytics.jsx` — route categories now use four distinct hues matching the
  badge colours; the preset's `--chart-1…5` are five shades of the same lime, so the route
  donut was unreadable.

Custom animation classes (`ar-rise`, `ar-flow`, `ar-ping`, `ar-grid-bg`) survived at the
bottom of `src/index.css` — keep them if you re-run init again.

## Deploy (Vercel)

`vercel.json` is included with an SPA rewrite so refreshing on any route works:

```json
"rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
```

Build command `npm run build`, output `dist`. Immutable caching on `/assets/*`.

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
