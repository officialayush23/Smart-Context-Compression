// ---------------------------------------------------------------------------
// FAKE DATA — demo only. No backend is called anywhere in this app.
// ---------------------------------------------------------------------------

export const ROUTES = {
  direct: { key: "direct", label: "Direct Answer", color: "oklch(0.80 0.15 80)", desc: "Model knows it — skip retrieval" },
  vector: { key: "vector", label: "Vector Store", color: "oklch(0.72 0.17 300)", desc: "Semantic search over indexed chunks" },
  hybrid: { key: "hybrid", label: "Hybrid + Rerank", color: "oklch(0.75 0.13 225)", desc: "BM25 + dense, cross-encoder rerank" },
  web: { key: "web", label: "Live Web Scrape", color: "oklch(0.80 0.20 140)", desc: "Index is stale — scrape fresh sources" },
}

export const PIPELINE_STAGES = [
  { id: "classify", label: "Query Classifier", detail: "intent · complexity · freshness" },
  { id: "route", label: "Adaptive Router", detail: "picks cheapest sufficient path" },
  { id: "retrieve", label: "Retrieval", detail: "k-candidates from selected source" },
  { id: "compress", label: "Context Compressor", detail: "dedupe · prune · sentence-select" },
  { id: "generate", label: "Generation", detail: "grounded answer + citations" },
  { id: "verify", label: "Groundedness Check", detail: "claim ↔ source alignment" },
]

export const KPIS = [
  { id: "queries", label: "Queries / 24h", value: "12,847", delta: +18.2, spark: [21, 25, 23, 30, 34, 31, 42, 39, 46, 52, 49, 58] },
  { id: "tokens", label: "Tokens Saved", value: "61.4%", delta: +6.1, spark: [40, 43, 44, 48, 51, 53, 52, 56, 58, 59, 60, 61] },
  { id: "latency", label: "p95 Latency", value: "812 ms", delta: -23.4, spark: [1400, 1310, 1250, 1190, 1120, 1040, 980, 940, 900, 870, 840, 812] },
  { id: "cost", label: "Cost / 1k Queries", value: "$1.94", delta: -41.7, spark: [3.4, 3.3, 3.1, 2.9, 2.8, 2.6, 2.5, 2.3, 2.2, 2.1, 2.0, 1.94] },
  { id: "grounded", label: "Groundedness", value: "94.6%", delta: +2.8, spark: [88, 89, 90, 90, 91, 92, 92, 93, 93, 94, 94, 94.6] },
]

export const ROUTE_MIX = [
  { key: "direct", label: "Direct Answer", value: 22, color: "oklch(0.80 0.15 80)" },
  { key: "vector", label: "Vector Store", value: 41, color: "oklch(0.72 0.17 300)" },
  { key: "hybrid", label: "Hybrid + Rerank", value: 26, color: "oklch(0.75 0.13 225)" },
  { key: "web", label: "Live Web Scrape", value: 11, color: "oklch(0.80 0.20 140)" },
]

export const LATENCY_SERIES = [
  { t: "00:00", baseline: 1420, adaptive: 720 },
  { t: "03:00", baseline: 1380, adaptive: 690 },
  { t: "06:00", baseline: 1510, adaptive: 760 },
  { t: "09:00", baseline: 1720, adaptive: 880 },
  { t: "12:00", baseline: 1810, adaptive: 940 },
  { t: "15:00", baseline: 1660, adaptive: 830 },
  { t: "18:00", baseline: 1540, adaptive: 780 },
  { t: "21:00", baseline: 1450, adaptive: 705 },
]

export const COMPRESSION_BARS = [
  { label: "Raw retrieved", tokens: 18420, color: "var(--muted-foreground)" },
  { label: "After dedupe", tokens: 11960, color: "var(--chart-2)" },
  { label: "After pruning", tokens: 8340, color: "var(--chart-1)" },
  { label: "Sent to LLM", tokens: 7110, color: "var(--chart-5)" },
]

export const SAMPLE_QUERIES = [
  {
    id: "q1",
    text: "What is the capital of Maharashtra?",
    route: "direct",
    reason: "Low complexity · high model confidence (0.97) · no freshness need → retrieval skipped entirely.",
    confidence: 0.97,
    tokensRaw: 0,
    tokensSent: 96,
    latency: 240,
    cost: 0.0004,
    chunks: [],
    answer:
      "Mumbai is the capital of Maharashtra. The router classified this as a low-complexity factual lookup with high parametric confidence, so no retrieval was performed — saving ~4,200 context tokens.",
    citations: [],
  },
  {
    id: "q2",
    text: "How does our adaptive router decide between vector search and web scraping?",
    route: "vector",
    reason: "Domain-specific question · entities match indexed namespace `docs/architecture` → dense retrieval, k=8.",
    confidence: 0.88,
    tokensRaw: 6240,
    tokensSent: 2180,
    latency: 690,
    cost: 0.0021,
    chunks: [
      { id: "c1", src: "docs/architecture/router.md", score: 0.94, kept: true, tokens: 412, text: "The router scores each query on four axes — complexity, entity specificity, freshness sensitivity and parametric confidence — then selects the cheapest strategy whose expected groundedness exceeds the 0.9 threshold." },
      { id: "c2", src: "docs/architecture/router.md", score: 0.91, kept: true, tokens: 388, text: "If freshness sensitivity > 0.6 and the index age for the matched namespace exceeds its TTL, the router escalates to the live web scraper instead of serving stale vectors." },
      { id: "c3", src: "docs/retrieval/hybrid.md", score: 0.82, kept: true, tokens: 356, text: "Hybrid mode fuses BM25 lexical scores with dense cosine similarity using reciprocal rank fusion, then reranks the top 25 with a cross-encoder." },
      { id: "c4", src: "docs/retrieval/hybrid.md", score: 0.61, kept: false, tokens: 402, text: "Legacy fusion weights were tuned manually in v0.3 and are retained only for backwards compatibility with the 2024 evaluation harness." },
      { id: "c5", src: "CHANGELOG.md", score: 0.44, kept: false, tokens: 290, text: "v0.9.1 — bumped tokenizer, fixed off-by-one in chunk overlap window." },
    ],
    answer:
      "The router scores every query on four axes — complexity, entity specificity, freshness sensitivity and parametric confidence — and then picks the cheapest strategy that still clears a 0.9 expected-groundedness bar [1]. Vector search is chosen when entities match an indexed namespace and the index is within TTL. If freshness sensitivity exceeds 0.6 and the namespace is stale, it escalates to the live web scraper instead [2]. Hybrid mode is reserved for multi-hop or ambiguous queries, where BM25 and dense scores are fused and reranked by a cross-encoder [3].",
    citations: [
      { n: 1, src: "docs/architecture/router.md" },
      { n: 2, src: "docs/architecture/router.md" },
      { n: 3, src: "docs/retrieval/hybrid.md" },
    ],
  },
  {
    id: "q3",
    text: "Compare the last two quarterly revenue filings and explain the margin swing.",
    route: "hybrid",
    reason: "Multi-hop comparison · 2 entities · numeric reasoning → BM25 + dense fusion, cross-encoder rerank top-25.",
    confidence: 0.79,
    tokensRaw: 18420,
    tokensSent: 7110,
    latency: 1180,
    cost: 0.0068,
    chunks: [
      { id: "c1", src: "filings/Q1-2026.pdf#p12", score: 0.96, kept: true, tokens: 520, text: "Gross margin for Q1 2026 stood at 61.2%, up 340 bps year over year, driven primarily by a shift toward higher-margin subscription revenue." },
      { id: "c2", src: "filings/Q4-2025.pdf#p9", score: 0.93, kept: true, tokens: 498, text: "Q4 2025 gross margin was 57.8%, compressed by one-time hardware fulfilment costs of $14.2M recognised in December." },
      { id: "c3", src: "filings/Q1-2026.pdf#p31", score: 0.87, kept: true, tokens: 466, text: "Subscription revenue reached 68% of total revenue, versus 59% in the prior quarter." },
      { id: "c4", src: "analyst/notes-mar.md", score: 0.72, kept: true, tokens: 380, text: "Analysts had modelled 59.5% gross margin for Q1, so the print represented a 170 bps beat." },
      { id: "c5", src: "filings/Q4-2025.pdf#p44", score: 0.58, kept: false, tokens: 610, text: "Deferred tax assets and the related valuation allowance rollforward are presented in Note 14." },
      { id: "c6", src: "filings/Q1-2026.pdf#p52", score: 0.51, kept: false, tokens: 540, text: "Forward-looking statements disclaimer under the Private Securities Litigation Reform Act of 1995." },
    ],
    answer:
      "Gross margin expanded from 57.8% in Q4 2025 to 61.2% in Q1 2026 — a 340 bps swing [1][2]. Two drivers explain it: Q4 absorbed $14.2M of one-time hardware fulfilment cost that did not recur [2], and the revenue mix moved sharply toward subscriptions, which rose from 59% to 68% of total revenue [3]. Against a consensus model of 59.5%, the quarter was a 170 bps beat [4].",
    citations: [
      { n: 1, src: "filings/Q1-2026.pdf#p12" },
      { n: 2, src: "filings/Q4-2025.pdf#p9" },
      { n: 3, src: "filings/Q1-2026.pdf#p31" },
      { n: 4, src: "analyst/notes-mar.md" },
    ],
  },
  {
    id: "q4",
    text: "What did the RBI announce about repo rates this week?",
    route: "web",
    reason: "Freshness sensitivity 0.94 · matched namespace `policy/rbi` is 41 days stale (TTL 7d) → live scrape.",
    confidence: 0.71,
    tokensRaw: 12760,
    tokensSent: 3240,
    latency: 2140,
    cost: 0.0049,
    chunks: [
      { id: "c1", src: "rbi.org.in/press/2026-08-18", score: 0.95, kept: true, tokens: 470, text: "The Monetary Policy Committee voted 5-1 to hold the policy repo rate unchanged, citing balanced inflation risks and resilient domestic demand." },
      { id: "c2", src: "livemint.com/…/mpc-decision", score: 0.89, kept: true, tokens: 430, text: "Economists had been split, with a minority expecting a 25 bps cut following the softer July CPI print." },
      { id: "c3", src: "rbi.org.in/press/2026-08-18", score: 0.84, kept: true, tokens: 410, text: "The stance was retained as 'neutral', with the Governor flagging monsoon distribution as the key variable for the next review." },
      { id: "c4", src: "reddit.com/r/india/…", score: 0.39, kept: false, tokens: 320, text: "Speculative user commentary — filtered out by the source-credibility gate." },
    ],
    answer:
      "The MPC held the policy repo rate unchanged in an 5-1 vote, citing balanced inflation risks and resilient domestic demand [1]. The stance stays 'neutral', with monsoon distribution flagged as the swing factor for the next review [3]. A minority of economists had expected a 25 bps cut after the softer July CPI print [2]. Three low-credibility sources were dropped by the source gate before compression.",
    citations: [
      { n: 1, src: "rbi.org.in/press/2026-08-18" },
      { n: 2, src: "livemint.com/…/mpc-decision" },
      { n: 3, src: "rbi.org.in/press/2026-08-18" },
    ],
  },
]

export const SCRAPER_JOBS = [
  { id: "job_8f21", domain: "docs.company.internal", pages: 1284, status: "indexed", freshness: "4 m ago", chunks: 9120, health: 98, trigger: "schedule" },
  { id: "job_7c04", domain: "rbi.org.in/press", pages: 96, status: "running", freshness: "live", chunks: 612, health: 74, trigger: "router escalation" },
  { id: "job_6b93", domain: "arxiv.org/list/cs.IR", pages: 540, status: "indexed", freshness: "2 h ago", chunks: 4380, health: 95, trigger: "schedule" },
  { id: "job_5a17", domain: "investor.acme.com/filings", pages: 212, status: "indexed", freshness: "1 d ago", chunks: 3110, health: 91, trigger: "manual" },
  { id: "job_4e55", domain: "news.ycombinator.com", pages: 78, status: "stale", freshness: "12 d ago", chunks: 940, health: 46, trigger: "schedule" },
  { id: "job_3d21", domain: "support.company.com", pages: 430, status: "failed", freshness: "—", chunks: 0, health: 0, trigger: "schedule" },
]

export const RECENT_QUERIES = [
  { q: "Explain the reranking threshold", route: "vector", ms: 640, saved: 62, grounded: 0.96 },
  { q: "Latest repo rate decision", route: "web", ms: 2140, saved: 74, grounded: 0.93 },
  { q: "Who wrote the chunking module?", route: "direct", ms: 210, saved: 100, grounded: 0.99 },
  { q: "Q1 vs Q4 margin bridge", route: "hybrid", ms: 1180, saved: 61, grounded: 0.94 },
  { q: "Summarise the eval harness", route: "vector", ms: 710, saved: 58, grounded: 0.95 },
  { q: "Is the arxiv index stale?", route: "direct", ms: 190, saved: 100, grounded: 0.98 },
  { q: "Cross-encoder model in use", route: "vector", ms: 580, saved: 66, grounded: 0.97 },
]

export const ROUTE_META = {
  direct: { label: "Direct", variant: "warning" },
  vector: { label: "Vector", variant: "violet" },
  hybrid: { label: "Hybrid", variant: "info" },
  web: { label: "Web", variant: "success" },
}

export const ALERTS = [
  { level: "warn", title: "Index drift on news.ycombinator.com", body: "Freshness 12 d exceeds 7 d TTL — 940 chunks may be stale.", time: "8 m ago" },
  { level: "error", title: "Scrape job job_3d21 failed", body: "robots.txt disallow on /support/* — 0 pages ingested after 3 retries.", time: "26 m ago" },
  { level: "info", title: "Compression ratio improved", body: "Sentence-level pruning v2 rolled out to 100% of traffic (+4.1% saved).", time: "1 h ago" },
]
