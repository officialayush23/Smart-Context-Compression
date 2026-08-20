import * as React from "react"
import {
  LayoutDashboard, Sparkles, Globe, ChartNoAxesColumn, Network,
  Search, Bell, Code, Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Overview from "@/views/Overview"
import Playground from "@/views/Playground"
import Scraper from "@/views/Scraper"
import Analytics from "@/views/Analytics"
import Architecture from "@/views/Architecture"

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, sub: "KPIs & health" },
  { id: "playground", label: "Query Playground", icon: Sparkles, sub: "live routing demo" },
  { id: "scraper", label: "Scraper & Index", icon: Globe, sub: "crawl jobs" },
  { id: "analytics", label: "Analytics", icon: ChartNoAxesColumn, sub: "evals & cost" },
  { id: "architecture", label: "Architecture", icon: Network, sub: "how it works" },
]

const TITLES = {
  overview: ["Overview", "Adaptive retrieval performance at a glance"],
  playground: ["Query Playground", "Watch the router pick a path, compress context and answer"],
  scraper: ["Scraper & Index", "Crawl jobs, chunk counts and index freshness"],
  analytics: ["Analytics", "Latency, cost and retrieval quality evaluations"],
  architecture: ["Architecture", "Components, data flow and the FastAPI contract"],
}

export default function App() {
  const [view, setView] = React.useState("overview")
  const [title, subtitle] = TITLES[view]

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* ------------------------------------------------------- sidebar */}
        <aside className="border-border bg-card/40 sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r lg:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">AdaptiveRAG</div>
              <div className="text-muted-foreground truncate text-[10px]">Smart Context Compression</div>
            </div>
          </div>
          <Separator />
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((n) => {
              const I = n.icon
              const active = view === n.id
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition",
                    active
                      ? "bg-primary/12 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <I className={cn("size-4 shrink-0", active && "text-primary")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{n.label}</span>
                    <span className="block truncate text-[10px] opacity-70">{n.sub}</span>
                  </span>
                  {active && <span className="bg-primary size-1.5 rounded-full" />}
                </button>
              )
            })}
          </nav>
          <div className="p-3">
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-2 text-[11px]">
                <Circle className="size-2 fill-emerald-400 text-emerald-400" />
                <span className="text-muted-foreground">Demo mode — mock data</span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-[10px] leading-relaxed">
                No backend calls. Every number is generated client-side.
              </p>
            </div>
          </div>
        </aside>

        {/* --------------------------------------------------------- main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
                <p className="text-muted-foreground truncate text-[11px]">{subtitle}</p>
              </div>
              <div className="relative hidden md:block">
                <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
                <Input placeholder="Search sources…" className="h-8 w-56 pl-8 text-xs" />
              </div>
              <Badge variant="violet" className="hidden sm:inline-flex">VCET Hackathon</Badge>
              <Button variant="ghost" size="icon" className="relative size-8">
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-400" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Code className="size-3.5" /> Repo
              </Button>
            </div>
            {/* mobile nav */}
            <div className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] transition",
                    view === n.id ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                  )}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </header>

          <main className="flex-1 p-5">
            {view === "overview" && <Overview onOpenPlayground={() => setView("playground")} />}
            {view === "playground" && <Playground />}
            {view === "scraper" && <Scraper />}
            {view === "analytics" && <Analytics />}
            {view === "architecture" && <Architecture />}
          </main>
        </div>
      </div>
    </div>
  )
}
