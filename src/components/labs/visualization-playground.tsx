'use client'

import * as React from 'react'
import { LineChart as LLine, BarChart3, BarChart2, Grid3x3, ScatterChart as LScatter, PieChart as LPie, Box } from 'lucide-react'
import {
  LineChart as RLine, BarChart as RBar,
  ScatterChart as RScatter, PieChart as RPie, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell, Scatter, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { retailSales } from '@/lib/data/datasets'

type ChartType = 'line' | 'bar' | 'histogram' | 'box' | 'scatter' | 'pie'
type XColumn = 'order_date' | 'product' | 'category' | 'region'
type YColumn = 'revenue' | 'profit' | 'quantity' | 'unit_price' | 'cost'

const CHART_TYPES: { id: ChartType; label: string; icon: any; desc: string }[] = [
  { id: 'bar', label: 'Bar Chart', icon: BarChart3, desc: 'Compare values across categories. Best for discrete groups.' },
  { id: 'line', label: 'Line Chart', icon: LLine, desc: 'Show trends over time or an ordered axis.' },
  { id: 'histogram', label: 'Histogram', icon: BarChart2, desc: 'Distribution of a single numeric variable.' },
  { id: 'box', label: 'Box Plot', icon: Box, desc: 'Distribution, median, quartiles and outliers per group.' },
  { id: 'scatter', label: 'Scatter Plot', icon: LScatter, desc: 'Relationship between two numeric variables.' },
  { id: 'pie', label: 'Pie Chart', icon: LPie, desc: 'Proportions of a whole. Use sparingly (≤5 slices).' },
]

const COLORS = ['#0ea5e9', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

function aggregateBy(data: typeof retailSales, key: string, value: string) {
  const m: Record<string, number> = {}
  data.forEach((r) => {
    const k = (r as any)[key]
    m[k] = (m[k] || 0) + Number((r as any)[value])
  })
  return Object.entries(m).map(([k, v]) => ({ name: k, value: Number(v.toFixed(2)) }))
}

function histogram(data: typeof retailSales, col: string, bins = 8) {
  const vals = data.map((r) => Number((r as any)[col])).filter((v) => !isNaN(v))
  const min = Math.min(...vals), max = Math.max(...vals)
  const w = (max - min) / bins || 1
  const buckets = Array.from({ length: bins }, (_, i) => ({ name: `${(min + i * w).toFixed(0)}–${(min + (i + 1) * w).toFixed(0)}`, value: 0 }))
  vals.forEach((v) => {
    let idx = Math.floor((v - min) / w)
    if (idx >= bins) idx = bins - 1
    if (idx < 0) idx = 0
    buckets[idx].value++
  })
  return buckets
}

function boxPlotByCategory(data: typeof retailSales, cat: string, val: string) {
  const groups: Record<string, number[]> = {}
  data.forEach((r) => {
    const c = (r as any)[cat]
    ;(groups[c] ||= []).push(Number((r as any)[val]))
  })
  return Object.entries(groups).map(([name, vals]) => {
    const s = vals.sort((a, b) => a - b)
    const q1 = s[Math.floor(s.length * 0.25)]
    const med = s[Math.floor(s.length * 0.5)]
    const q3 = s[Math.floor(s.length * 0.75)]
    const iqr = q3 - q1
    const min = Math.max(s[0], q1 - 1.5 * iqr)
    const max = Math.min(s[s.length - 1], q3 + 1.5 * iqr)
    return { name, min, q1, median: med, q3, max }
  })
}

export function VisualizationPlayground() {
  const [chart, setChart] = React.useState<ChartType>('bar')
  const [xCol, setXCol] = React.useState<XColumn>('category')
  const [yCol, setYCol] = React.useState<YColumn>('revenue')

  const data = retailSales

  let chartEl: React.ReactNode = null
  let explanation = ''

  if (chart === 'bar') {
    const d = aggregateBy(data, xCol, yCol)
    chartEl = (
      <ResponsiveContainer width="100%" height={300}>
        <RBar data={d}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </RBar>
      </ResponsiveContainer>
    )
    explanation = `Total ${yCol} grouped by ${xCol}. Each bar represents the sum of ${yCol} for that ${xCol} value.`
  } else if (chart === 'line') {
    const byMonth: Record<string, number> = {}
    data.forEach((r) => {
      const m = r.order_date.slice(0, 7)
      byMonth[m] = (byMonth[m] || 0) + Number((r as any)[yCol])
    })
    const d = Object.entries(byMonth).map(([k, v]) => ({ name: k, value: Number(v.toFixed(2)) }))
    chartEl = (
      <ResponsiveContainer width="100%" height={300}>
        <RLine data={d}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
        </RLine>
      </ResponsiveContainer>
    )
    explanation = `Monthly trend of ${yCol}. The line shows how the metric changes month-over-month.`
  } else if (chart === 'histogram') {
    const d = histogram(data, yCol)
    chartEl = (
      <ResponsiveContainer width="100%" height={300}>
        <RBar data={d}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#06b6d4" />
        </RBar>
      </ResponsiveContainer>
    )
    explanation = `Distribution of ${yCol} across 8 equal-width bins. Helps spot skew, peaks, and gaps.`
  } else if (chart === 'box') {
    const d = boxPlotByCategory(data, xCol, yCol)
    chartEl = (
      <div className="space-y-2">
        {d.map((b, i) => (
          <div key={b.name} className="text-xs">
            <p className="font-mono mb-1">{b.name}</p>
            <div className="relative h-8 bg-muted/30 rounded">
              <div className="absolute h-full bg-ai-purple/30 border-x-2 border-ai-purple" style={{ left: `${((b.q1 - d[0].min) / (d[0].max - d[0].min)) * 100}%`, width: `${((b.q3 - b.q1) / (d[0].max - d[0].min)) * 100}%` }} />
              <div className="absolute h-full w-0.5 bg-ai-red" style={{ left: `${((b.median - d[0].min) / (d[0].max - d[0].min)) * 100}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">min={b.min.toFixed(0)} Q1={b.q1.toFixed(0)} med={b.median.toFixed(0)} Q3={b.q3.toFixed(0)} max={b.max.toFixed(0)}</p>
          </div>
        ))}
      </div>
    )
    explanation = `Box plot of ${yCol} grouped by ${xCol}. The box shows Q1–Q3, the line is the median, whiskers extend to 1.5×IQR.`
  } else if (chart === 'scatter') {
    const d = data.map((r) => ({ x: Number(r.quantity), y: Number(r.revenue), product: r.product }))
    chartEl = (
      <ResponsiveContainer width="100%" height={300}>
        <RScatter>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="x" name="quantity" tick={{ fontSize: 11 }} label={{ value: 'quantity', position: 'bottom', fontSize: 11 }} />
          <YAxis dataKey="y" name="revenue" tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={d} fill="#10b981" />
        </RScatter>
      </ResponsiveContainer>
    )
    explanation = 'Each dot is one order. X-axis = quantity, Y-axis = revenue. A positive trend suggests higher-quantity orders generate more revenue.'
  } else if (chart === 'pie') {
    const d = aggregateBy(data, xCol, yCol).slice(0, 6)
    chartEl = (
      <ResponsiveContainer width="100%" height={300}>
        <RPie>
          <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e) => e.name}>
            {d.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RPie>
      </ResponsiveContainer>
    )
    explanation = `Proportion of total ${yCol} attributable to each ${xCol}. Keep pie slices ≤5–6 for readability.`
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-ai-cyan" /> Visualization Playground
        </h4>
      </div>
      <div className="p-4 space-y-4">
        {/* Chart type selector */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Chart type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {CHART_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setChart(c.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] font-medium transition-all',
                  chart === c.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/40'
                )}
              >
                <c.icon className="w-4 h-4" />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Group by (X / category)</label>
            <select value={xCol} onChange={(e) => setXCol(e.target.value as XColumn)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5">
              <option value="order_date">order_date</option>
              <option value="product">product</option>
              <option value="category">category</option>
              <option value="region">region</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Value (Y)</label>
            <select value={yCol} onChange={(e) => setYCol(e.target.value as YColumn)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5">
              <option value="revenue">revenue</option>
              <option value="profit">profit</option>
              <option value="quantity">quantity</option>
              <option value="unit_price">unit_price</option>
              <option value="cost">cost</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-lg border border-border p-4 bg-background">
          {chartEl}
        </div>

        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3">
          <p className="text-xs font-semibold text-ai-blue mb-0.5">When to use this chart</p>
          <p className="text-xs text-foreground/80">{CHART_TYPES.find((c) => c.id === chart)?.desc}</p>
          <p className="text-xs text-foreground/80 mt-1.5">{explanation}</p>
        </div>
      </div>
    </Card>
  )
}
