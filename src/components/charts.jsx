import * as React from "react"
import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------- sparkline */
export function Sparkline({ data = [], className, stroke = "var(--chart-1)", height = 34 }) {
  const w = 120
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    height - ((v - min) / span) * (height - 6) - 3,
  ])
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")
  const area = `${d} L${w} ${height} L0 ${height} Z`
  const gid = React.useId()
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* -------------------------------------------------------------- line compare */
export function CompareLineChart({ data, keys, labels, colors, unit = "ms", height = 220 }) {
  const [hover, setHover] = React.useState(null)
  const w = 640
  const padL = 44
  const padB = 26
  const padT = 12
  const all = data.flatMap((d) => keys.map((k) => d[k]))
  const max = Math.max(...all) * 1.12
  const x = (i) => padL + (i / (data.length - 1)) * (w - padL - 12)
  const y = (v) => padT + (1 - v / max) * (height - padT - padB)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - 12} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">
              {t}
            </text>
          </g>
        ))}
        {keys.map((k, ki) => {
          const d = data.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(" ")
          return (
            <path
              key={k}
              d={d}
              fill="none"
              stroke={colors[ki]}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={ki === 0 ? "5 5" : undefined}
              opacity={ki === 0 ? 0.6 : 1}
            />
          )
        })}
        {data.map((p, i) => (
          <g key={p.t}>
            <rect
              x={x(i) - 16}
              y={0}
              width={32}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            {hover === i && (
              <line x1={x(i)} x2={x(i)} y1={padT} y2={height - padB} stroke="var(--ring)" strokeWidth="1" opacity="0.5" />
            )}
            {keys.map((k, ki) => (
              <circle
                key={k}
                cx={x(i)}
                cy={y(p[k])}
                r={hover === i ? 4 : 2.5}
                fill={colors[ki]}
                stroke="var(--card)"
                strokeWidth="1.5"
              />
            ))}
            <text x={x(i)} y={height - 8} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
              {p.t}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
        {labels.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: colors[i], opacity: i === 0 ? 0.6 : 1 }} />
            {l}
          </span>
        ))}
        {hover !== null && (
          <span className="ml-auto font-mono text-foreground">
            {data[hover].t} · {keys.map((k) => `${data[hover][k]}${unit}`).join(" → ")}
          </span>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- donut chart */
export function Donut({ data, size = 168, thickness = 22, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        {data.map((d) => {
          const len = (d.value / total) * c
          const el = (
            <circle
              key={d.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="min-w-0 flex-1 space-y-2">
        {centerValue && (
          <div className="mb-3">
            <div className="text-2xl font-semibold tracking-tight">{centerValue}</div>
            <div className="text-xs text-muted-foreground">{centerLabel}</div>
          </div>
        )}
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="truncate text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-mono text-foreground">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ funnel of bars */
export function FunnelBars({ data }) {
  const max = Math.max(...data.map((d) => d.tokens))
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-mono">
              {d.tokens.toLocaleString()}
              {i > 0 && (
                <span className="ml-2 text-[10px] text-emerald-400">
                  −{Math.round((1 - d.tokens / data[0].tokens) * 100)}%
                </span>
              )}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.tokens / max) * 100}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
