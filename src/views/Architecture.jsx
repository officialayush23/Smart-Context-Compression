import * as React from "react"
import { Server, Database, Globe, Cpu, ArrowRight, Boxes, Scissors, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ENDPOINTS = [
  { m: "POST", p: "/api/query", d: "Route → retrieve → compress → generate" },
  { m: "POST", p: "/api/scrape", d: "Queue a crawl job for a domain" },
  { m: "GET", p: "/api/jobs", d: "Scrape / index job status" },
  { m: "GET", p: "/api/metrics", d: "Latency, token-savings, route mix" },
  { m: "WS", p: "/ws/stream", d: "Token stream + stage events" },
]

const LAYERS = [
  { icon: Cpu, title: "Query Classifier", body: "Small LLM scores complexity, entity specificity, freshness need and parametric confidence.", tag: "≈40 ms" },
  { icon: Boxes, title: "Adaptive Router", body: "Policy table picks the cheapest path clearing the groundedness bar. Escalates on stale TTL.", tag: "0 tokens" },
  { icon: Database, title: "Retrieval Layer", body: "pgvector dense search + BM25 lexical, RRF fusion, cross-encoder rerank on demand.", tag: "k=8–25" },
  { icon: Globe, title: "Smart Scraper", body: "Playwright crawl, boilerplate strip, semantic chunking with overlap, credibility gate.", tag: "async" },
  { icon: Scissors, title: "Context Compressor", body: "Near-duplicate dedupe, sentence-level pruning against the query, budget-aware packing.", tag: "−61% tok" },
  { icon: ShieldCheck, title: "Groundedness Check", body: "Claim↔source alignment; low scores trigger a single re-retrieval with a wider k.", tag: "0.95 avg" },
]

export default function Architecture() {
  return (
    <div className="space-y-5">
      <Card className="ar-grid-bg">
        <CardHeader>
          <CardTitle>System architecture</CardTitle>
          <CardDescription>React + Vite + Tailwind + shadcn dashboard · FastAPI service · fake data in this demo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {["React Dashboard", "FastAPI Gateway", "Adaptive RAG Core", "Vector + Web Sources"].map((n, i, arr) => (
              <React.Fragment key={n}>
                <div className="rounded-lg border border-border bg-card px-4 py-3 text-xs font-medium">
                  {n}
                </div>
                {i < arr.length - 1 && <ArrowRight className="text-muted-foreground size-4" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LAYERS.map((l, i) => {
          const I = l.icon
          return (
            <Card key={l.title} className="ar-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="py-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-primary/15 text-primary inline-flex size-8 items-center justify-center rounded-md">
                    <I className="size-4" />
                  </span>
                  <span className="text-sm font-medium">{l.title}</span>
                  <Badge variant="outline" className="ml-auto font-mono">{l.tag}</Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{l.body}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FastAPI surface</CardTitle>
          <CardDescription>Contract the dashboard is built against (mocked client-side for the demo)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ENDPOINTS.map((e) => (
            <div key={e.p} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2">
              <Badge
                variant={e.m === "GET" ? "info" : e.m === "WS" ? "violet" : "success"}
                className="w-12 shrink-0 justify-center font-mono"
              >
                {e.m}
              </Badge>
              <code className="text-xs">{e.p}</code>
              <span className="text-muted-foreground ml-auto hidden text-[11px] sm:block">{e.d}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
