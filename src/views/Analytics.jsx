import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CompareLineChart, Donut, FunnelBars, Sparkline } from "@/components/charts"
import { LATENCY_SERIES, ROUTE_MIX, COMPRESSION_BARS, KPIS } from "@/data/mock"

const ROUTE_PERF = [
  { route: "Direct Answer", share: 22, latency: 230, cost: 0.0004, grounded: 0.98, color: "oklch(0.80 0.15 80)" },
  { route: "Vector Store", share: 41, latency: 680, cost: 0.0021, grounded: 0.96, color: "oklch(0.72 0.17 300)" },
  { route: "Hybrid + Rerank", share: 26, latency: 1180, cost: 0.0068, grounded: 0.94, color: "oklch(0.75 0.13 225)" },
  { route: "Live Web Scrape", share: 11, latency: 2140, cost: 0.0049, grounded: 0.91, color: "oklch(0.80 0.20 140)" },
]

const EVAL = [
  { metric: "Answer relevance", adaptive: 0.94, baseline: 0.91 },
  { metric: "Context precision", adaptive: 0.89, baseline: 0.62 },
  { metric: "Context recall", adaptive: 0.87, baseline: 0.88 },
  { metric: "Faithfulness", adaptive: 0.95, baseline: 0.9 },
  { metric: "Hallucination rate", adaptive: 0.04, baseline: 0.11, lowerBetter: true },
]

export default function Analytics() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latency distribution over the day</CardTitle>
            <CardDescription>Adaptive routing keeps p95 under 1s through peak load</CardDescription>
          </CardHeader>
          <CardContent>
            <CompareLineChart
              data={LATENCY_SERIES}
              keys={["baseline", "adaptive"]}
              labels={["Baseline", "Adaptive"]}
              colors={["var(--muted-foreground)", "var(--chart-2)"]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Where queries go</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={ROUTE_MIX} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Per-route economics</CardTitle>
            <CardDescription>Cheapest sufficient path wins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ROUTE_PERF.map((r) => (
              <div key={r.route} className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-sm" style={{ background: r.color }} />
                  <span>{r.route}</span>
                  <span className="text-muted-foreground ml-auto font-mono">{r.share}%</span>
                </div>
                <Progress value={r.share * 2.4} indicatorClassName="opacity-90" />
                <div className="text-muted-foreground grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <span>{r.latency} ms</span>
                  <span>${r.cost.toFixed(4)}</span>
                  <span>grounded {r.grounded}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RAGAS-style evaluation</CardTitle>
            <CardDescription>500-question golden set</CardDescription>
            <CardAction>
              <Badge variant="violet">+27 pts context precision</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {EVAL.map((e) => {
              const better = e.lowerBetter ? e.adaptive < e.baseline : e.adaptive > e.baseline
              return (
                <div key={e.metric} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span>{e.metric}</span>
                    <span className="font-mono">
                      <span className="text-muted-foreground">{e.baseline.toFixed(2)}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className={better ? "text-emerald-400" : "text-rose-400"}>{e.adaptive.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/50"
                      style={{ width: `${e.baseline * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${e.adaptive * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Compression funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelBars data={COMPRESSION_BARS} />
          </CardContent>
        </Card>
        {KPIS.slice(0, 2).map((k) => (
          <Card key={k.id}>
            <CardHeader>
              <CardTitle>{k.label}</CardTitle>
              <CardDescription>12-hour trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-semibold tracking-tight">{k.value}</div>
              <Sparkline data={k.spark} height={64} stroke="var(--chart-1)" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
