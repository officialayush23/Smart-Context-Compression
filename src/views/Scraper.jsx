import * as React from "react"
import { RefreshCw, Globe, Play, CircleCheck, Loader2, TriangleAlert, CircleAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkline } from "@/components/charts"
import { SCRAPER_JOBS } from "@/data/mock"
import { cn } from "@/lib/utils"

const STATUS = {
  indexed: { variant: "success", icon: CircleCheck, label: "Indexed" },
  running: { variant: "info", icon: Loader2, label: "Running" },
  stale: { variant: "warning", icon: TriangleAlert, label: "Stale" },
  failed: { variant: "destructive", icon: CircleAlert, label: "Failed" },
}

export default function Scraper() {
  const totals = SCRAPER_JOBS.reduce(
    (a, j) => ({ pages: a.pages + j.pages, chunks: a.chunks + j.chunks }),
    { pages: 0, chunks: 0 }
  )
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        <Tile label="Sources" value={SCRAPER_JOBS.length} sub="crawl targets" />
        <Tile label="Pages crawled" value={totals.pages.toLocaleString()} sub="last 7 days" />
        <Tile label="Chunks indexed" value={totals.chunks.toLocaleString()} sub="768-dim vectors" />
        <Tile label="Avg index health" value="76%" sub="freshness × coverage" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scrape &amp; index jobs</CardTitle>
          <CardDescription>The router escalates to a live scrape when a namespace goes past TTL</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm">
              <RefreshCw /> Re-crawl stale
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pages</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead>Freshness</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead className="w-40">Index health</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCRAPER_JOBS.map((j) => {
                const s = STATUS[j.status]
                const I = s.icon
                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{j.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-xs">
                        <Globe className="text-muted-foreground size-3.5" />
                        {j.domain}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.variant} className="gap-1">
                        <I className={cn("size-3", j.status === "running" && "animate-spin")} />
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{j.pages.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{j.chunks.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{j.freshness}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{j.trigger}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={j.health}
                          className="h-1.5"
                          indicatorClassName={
                            j.health > 85 ? "bg-emerald-500" : j.health > 60 ? "bg-amber-500" : "bg-rose-500"
                          }
                        />
                        <span className="w-8 shrink-0 font-mono text-[10px] text-muted-foreground">{j.health}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-7">
                        <Play className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crawl throughput</CardTitle>
            <CardDescription>Pages ingested per hour · last 12 h</CardDescription>
          </CardHeader>
          <CardContent>
            <Sparkline data={[42, 68, 55, 91, 120, 104, 88, 132, 155, 141, 168, 190]} height={90} stroke="var(--chart-2)" />
            <div className="text-muted-foreground mt-2 flex justify-between font-mono text-[10px]">
              <span>12 h ago</span><span>now · 190 pages/h</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chunk size distribution</CardTitle>
            <CardDescription>After semantic chunking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { l: "0–256 tok", v: 18 },
              { l: "256–512 tok", v: 47 },
              { l: "512–768 tok", v: 26 },
              { l: "768+ tok", v: 9 },
            ].map((b) => (
              <div key={b.l} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{b.l}</span>
                  <span className="font-mono">{b.v}%</span>
                </div>
                <Progress value={b.v * 2} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Tile({ label, value, sub }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-muted-foreground text-[11px] uppercase tracking-wide">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        <div className="text-muted-foreground mt-0.5 text-[11px]">{sub}</div>
      </CardContent>
    </Card>
  )
}
