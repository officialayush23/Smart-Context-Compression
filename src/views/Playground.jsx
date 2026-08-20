import * as React from "react"
import {
  Play, RotateCcw, Sparkles, Database, Globe, Layers, Zap, Check,
  FileText, Scissors, ShieldCheck, ChevronRight, Quote, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SAMPLE_QUERIES, PIPELINE_STAGES, ROUTES, ROUTE_META } from "@/data/mock"

const ROUTE_ICON = { direct: Zap, vector: Database, hybrid: Layers, web: Globe }
const STAGE_ICON = {
  classify: Sparkles, route: ChevronRight, retrieve: FileText,
  compress: Scissors, generate: Quote, verify: ShieldCheck,
}
const STAGE_MS = 620

function pickQuery(text) {
  const t = text.toLowerCase()
  if (/latest|today|this week|news|current|rbi|price/.test(t)) return { ...SAMPLE_QUERIES[3], text }
  if (/compare|versus| vs |why|explain the .* swing|margin/.test(t)) return { ...SAMPLE_QUERIES[2], text }
  if (/capital|who|when was|define|what is the [a-z]+ of/.test(t) && t.length < 60)
    return { ...SAMPLE_QUERIES[0], text }
  return { ...SAMPLE_QUERIES[1], text }
}

export default function Playground() {
  const [input, setInput] = React.useState(SAMPLE_QUERIES[1].text)
  const [active, setActive] = React.useState(SAMPLE_QUERIES[1])
  const [stage, setStage] = React.useState(-1)
  const [running, setRunning] = React.useState(false)
  const [streamed, setStreamed] = React.useState("")
  const timers = React.useRef([])

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  React.useEffect(() => clear, [])

  function run(q) {
    clear()
    setActive(q)
    setInput(q.text)
    setStreamed("")
    setRunning(true)
    setStage(0)
    PIPELINE_STAGES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), i * STAGE_MS))
    })
    const genStart = 4 * STAGE_MS
    const words = q.answer.split(" ")
    words.forEach((w, i) => {
      timers.current.push(
        setTimeout(() => setStreamed((s) => (s ? s + " " : "") + w), genStart + i * 22)
      )
    })
    timers.current.push(
      setTimeout(() => {
        setStage(PIPELINE_STAGES.length)
        setRunning(false)
      }, genStart + words.length * 22 + 500)
    )
  }

  const reset = () => { clear(); setStage(-1); setRunning(false); setStreamed("") }

  const route = ROUTES[active.route]
  const RIcon = ROUTE_ICON[active.route]
  const started = stage >= 0
  const saved = active.tokensRaw ? Math.round((1 - active.tokensSent / active.tokensRaw) * 100) : 100
  const keptChunks = active.chunks.filter((c) => c.kept)

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------------------- ask bar */}
      <Card className="overflow-hidden">
        <CardContent className="py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Sparkles className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run(pickQuery(input))}
                placeholder="Ask anything — the router picks the cheapest sufficient path…"
                className="h-11 pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => run(pickQuery(input))} disabled={running} className="h-11 px-5">
                {running ? <Loader2 className="animate-spin" /> : <Play />}
                {running ? "Running" : "Run query"}
              </Button>
              <Button variant="outline" size="icon" onClick={reset} className="h-11 w-11">
                <RotateCcw />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[11px]">Try:</span>
            {SAMPLE_QUERIES.map((q) => {
              const I = ROUTE_ICON[q.route]
              return (
                <button
                  key={q.id}
                  onClick={() => run(q)}
                  className="text-muted-foreground hover:text-foreground hover:border-ring/60 inline-flex max-w-[260px] items-center gap-1.5 truncate rounded-full border border-border px-3 py-1 text-[11px] transition"
                >
                  <I className="size-3 shrink-0" />
                  <span className="truncate">{q.text}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- pipeline */}
      <Card className="ar-grid-bg">
        <CardHeader>
          <CardTitle>Adaptive pipeline</CardTitle>
          <CardDescription>Every stage is skippable — the router only pays for what the query needs.</CardDescription>
          <CardAction>
            {started && (
              <Badge variant={ROUTE_META[active.route].variant} className="gap-1.5 px-2.5 py-1">
                <RIcon className="size-3" /> {route.label}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch gap-1.5 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((s, i) => {
              const SIcon = STAGE_ICON[s.id]
              const isDone = stage > i
              const isNow = stage === i
              const skipped = started && active.route === "direct" && ["retrieve", "compress"].includes(s.id)
              return (
                <React.Fragment key={s.id}>
                  {i > 0 && (
                    <div className="flex min-w-6 flex-1 items-center">
                      <svg viewBox="0 0 40 8" className="w-full" preserveAspectRatio="none">
                        <line
                          x1="0" y1="4" x2="40" y2="4"
                          stroke={isDone || isNow ? "var(--primary)" : "var(--border)"}
                          strokeWidth="2"
                          className={isNow ? "ar-flow" : undefined}
                          opacity={isDone || isNow ? 1 : 0.7}
                        />
                      </svg>
                    </div>
                  )}
                  <div
                    className={cn(
                      "relative min-w-[132px] flex-1 rounded-lg border p-3 transition-all duration-300",
                      isNow && "border-primary/70 bg-primary/10",
                      isDone && "border-border bg-card",
                      !isDone && !isNow && "border-dashed border-border bg-card/40 opacity-60",
                      skipped && isDone && "opacity-45"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 inline-flex size-7 items-center justify-center rounded-md",
                        isNow ? "bg-primary text-primary-foreground ar-ping" : isDone ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {isDone && !isNow ? <Check className="size-3.5" /> : <SIcon className="size-3.5" />}
                    </div>
                    <div className="truncate text-xs font-medium">{s.label}</div>
                    <div className="text-muted-foreground truncate text-[10px]">
                      {skipped && isDone ? "skipped · 0 tokens" : s.detail}
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>

          {started && (
            <div className="ar-rise mt-4 rounded-lg border border-border bg-card/70 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="text-primary mt-0.5 size-3.5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  <span className="text-muted-foreground">Router decision — </span>
                  {active.reason}
                </p>
                <Badge variant="outline" className="ml-auto shrink-0 font-mono">
                  conf {active.confidence.toFixed(2)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------- retrieval + answer */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Retrieved context</CardTitle>
            <CardDescription>
              {started
                ? active.chunks.length
                  ? `${active.chunks.length} candidates · ${keptChunks.length} survived compression`
                  : "Retrieval skipped by the router"
                : "Run a query to populate"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {!started && <EmptyHint label="No retrieval yet" />}
            {started && active.chunks.length === 0 && stage >= 2 && (
              <div className="ar-rise rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-center">
                <Zap className="mx-auto mb-2 size-5 text-amber-400" />
                <p className="text-xs">
                  Model confidence {active.confidence.toFixed(2)} cleared the threshold — <br />
                  <span className="text-amber-400 font-medium">0 chunks retrieved, ~4,200 tokens avoided.</span>
                </p>
              </div>
            )}
            {active.chunks.map((c, i) => {
              const visible = stage >= 2
              const pruned = stage >= 3 && !c.kept
              if (!visible) return null
              return (
                <div
                  key={c.id}
                  className={cn(
                    "ar-rise rounded-lg border border-border bg-card p-3 transition-all duration-500",
                    pruned && "border-dashed opacity-35 grayscale"
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText className="text-muted-foreground size-3 shrink-0" />
                    <span className="truncate font-mono text-[10px] text-muted-foreground">{c.src}</span>
                    <Badge
                      variant={c.score > 0.85 ? "success" : c.score > 0.65 ? "info" : "secondary"}
                      className="ml-auto shrink-0 font-mono"
                    >
                      {c.score.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">{c.text}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="font-mono text-muted-foreground">{c.tokens} tok</span>
                    {pruned ? (
                      <Badge variant="destructive" className="ml-auto">
                        <Scissors className="mr-0.5" /> pruned
                      </Badge>
                    ) : stage >= 3 ? (
                      <Badge variant="success" className="ml-auto">
                        <Check className="mr-0.5" /> kept
                      </Badge>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Grounded answer</CardTitle>
              <CardDescription>Streamed with inline citations</CardDescription>
              <CardAction>
                {stage >= PIPELINE_STAGES.length && (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="size-3" /> groundedness 0.96
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardContent>
              {!started ? (
                <EmptyHint label="Answer will stream here" />
              ) : stage < 4 ? (
                <div className="space-y-2">
                  <div className="bg-secondary h-3 w-full animate-pulse rounded" />
                  <div className="bg-secondary h-3 w-[88%] animate-pulse rounded" />
                  <div className="bg-secondary h-3 w-[70%] animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <p className="text-sm leading-7">
                    {streamed}
                    {running && <span className="bg-primary ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle" />}
                  </p>
                  {stage >= PIPELINE_STAGES.length && active.citations.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-1.5">
                        {active.citations.map((c) => (
                          <div key={c.n} className="flex items-center gap-2 text-[11px]">
                            <span className="bg-secondary text-muted-foreground flex size-4 shrink-0 items-center justify-center rounded font-mono text-[9px]">
                              {c.n}
                            </span>
                            <span className="truncate font-mono text-muted-foreground">{c.src}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Context compression</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-emerald-400">
                    {started ? saved : 0}%
                  </span>
                  <span className="text-muted-foreground text-xs">tokens saved</span>
                </div>
                <Progress
                  value={started ? saved : 0}
                  indicatorClassName="bg-emerald-500"
                  className="mb-3"
                />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Stat label="Retrieved" value={started ? active.tokensRaw.toLocaleString() : "—"} />
                  <Stat label="Sent to LLM" value={started ? active.tokensSent.toLocaleString() : "—"} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Run metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 pt-0 text-xs">
                <Stat label="Latency" value={started ? `${active.latency} ms` : "—"} />
                <Stat label="Cost" value={started ? `$${active.cost.toFixed(4)}` : "—"} />
                <Stat label="Route" value={started ? ROUTE_META[active.route].label : "—"} />
                <Stat label="Chunks used" value={started ? `${keptChunks.length}/${active.chunks.length}` : "—"} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
      <div className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 font-mono text-sm">{value}</div>
    </div>
  )
}

function EmptyHint({ label }) {
  return (
    <div className="text-muted-foreground flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-xs">
      {label}
    </div>
  )
}
