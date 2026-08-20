import * as React from "react"
import { TrendingUp, TrendingDown, TriangleAlert, Info, CircleAlert, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkline, CompareLineChart, Donut, FunnelBars } from "@/components/charts"
import { cn } from "@/lib/utils"
import { KPIS, ROUTE_MIX, LATENCY_SERIES, COMPRESSION_BARS, RECENT_QUERIES, ROUTE_META, ALERTS } from "@/data/mock"

const SPARK_COLORS = {
  queries: "var(--chart-1)",
  tokens: "var(--chart-5)",
  latency: "var(--chart-2)",
  cost: "var(--chart-3)",
  grounded: "var(--chart-4)",
}

export default function Overview({ onOpenPlayground }) {
  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {KPIS.map((k, i) => {
          const good = k.id === "latency" || k.id === "cost" ? k.delta < 0 : k.delta > 0
          const Arrow = k.delta > 0 ? TrendingUp : TrendingDown
          return (
            <Card key={k.id} className="ar-rise overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="py-4">
                <div className="text-muted-foreground text-[11px] uppercase tracking-wide">{k.label}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight">{k.value}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[11px] font-medium",
                      good ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    <Arrow className="size-3" />
                    {Math.abs(k.delta)}%
                  </span>
                </div>
                <div className="mt-2 -mb-1">
                  <Sparkline data={k.spark} stroke={SPARK_COLORS[k.id]} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latency — baseline RAG vs adaptive</CardTitle>
            <CardDescription>Same 12.8k queries replayed through both pipelines</CardDescription>
            <CardAction>
              <Badge variant="success">−48% p95</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CompareLineChart
              data={LATENCY_SERIES}
              keys={["baseline", "adaptive"]}
              labels={["Baseline (always retrieve)", "Adaptive router"]}
              colors={["var(--muted-foreground)", "var(--chart-1)"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route mix</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Donut data={ROUTE_MIX} centerValue="12,847" centerLabel="routed queries" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Context compression funnel</CardTitle>
            <CardDescription>Average tokens per query</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelBars data={COMPRESSION_BARS} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent queries</CardTitle>
            <CardDescription>Live stream · fake data</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" onClick={onOpenPlayground}>
                Open playground <ArrowUpRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0">
            {RECENT_QUERIES.map((r, i) => (
              <div
                key={i}
                className="hover:bg-secondary/50 flex items-center gap-3 rounded-lg px-2 py-2 text-xs transition"
              >
                <Badge variant={ROUTE_META[r.route].variant} className="w-16 shrink-0 justify-center">
                  {ROUTE_META[r.route].label}
                </Badge>
                <span className="min-w-0 flex-1 truncate">{r.q}</span>
                <span className="text-muted-foreground hidden font-mono sm:inline">{r.ms} ms</span>
                <span className="font-mono text-emerald-400">−{r.saved}%</span>
                <span className="text-muted-foreground hidden font-mono md:inline">g {r.grounded}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Index freshness &amp; job health</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {ALERTS.map((a, i) => {
            const I = a.level === "error" ? CircleAlert : a.level === "warn" ? TriangleAlert : Info
            const tone =
              a.level === "error" ? "text-rose-400 border-rose-500/30 bg-rose-500/5"
              : a.level === "warn" ? "text-amber-400 border-amber-500/30 bg-amber-500/5"
              : "text-sky-400 border-sky-500/30 bg-sky-500/5"
            return (
              <div key={i} className={cn("rounded-lg border p-3", tone)}>
                <div className="flex items-center gap-2">
                  <I className="size-3.5 shrink-0" />
                  <span className="truncate text-xs font-medium">{a.title}</span>
                </div>
                <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">{a.body}</p>
                <p className="text-muted-foreground mt-2 text-[10px]">{a.time}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
