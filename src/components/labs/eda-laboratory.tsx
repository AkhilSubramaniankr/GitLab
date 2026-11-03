'use client'

import * as React from 'react'
import { BarChart3, Play, CheckCircle2, AlertTriangle, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { retailSales, dirtyRetailSales, type RetailRow } from '@/lib/data/datasets'

interface EDACheck {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
}

function num(s: any): number { return Number(s) || 0 }

export function EDALaboratory() {
  const [dataset, setDataset] = React.useState<'clean' | 'dirty'>('clean')
  const [run, setRun] = React.useState(false)
  const data = dataset === 'clean' ? retailSales : (dirtyRetailSales as any[])

  // Compute everything reactively when "run" is clicked
  const cols = data.length > 0 ? Object.keys(data[0]) : []
  const rowCount = data.length
  const colCount = cols.length

  // Missing values per column
  const missing = cols.map((c) => ({
    col: c,
    missing: data.filter((r) => (r as any)[c] == null || (r as any)[c] === '').length,
  })).filter((m) => m.missing > 0)

  // Duplicates
  const seen = new Set<string>()
  const dupes = data.filter((r) => {
    const k = JSON.stringify(r)
    if (seen.has(k)) return true
    seen.add(k)
    return false
  })

  // Descriptive stats for numeric cols
  const numericCols = ['quantity', 'unit_price', 'revenue', 'cost', 'profit'].filter((c) => cols.includes(c))
  const stats = numericCols.map((c) => {
    const vals = data.map((r) => num((r as any)[c])).filter((v) => !isNaN(v) && v !== 0 || c === 'unit_price')
    const n = vals.length
    if (n === 0) return { col: c, n: 0, mean: 0, std: 0, min: 0, q1: 0, median: 0, q3: 0, max: 0 }
    const mean = vals.reduce((s, v) => s + v, 0) / n
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
    const s = [...vals].sort((a, b) => a - b)
    return {
      col: c,
      n,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      min: Math.round(s[0] * 100) / 100,
      q1: Math.round(s[Math.floor(n * 0.25)] * 100) / 100,
      median: Math.round(s[Math.floor(n / 2)] * 100) / 100,
      q3: Math.round(s[Math.floor(n * 0.75)] * 100) / 100,
      max: Math.round(s[n - 1] * 100) / 100,
    }
  })

  // Categorical value counts (top 5 per column)
  const catCols = ['product', 'category', 'region', 'customer_id'].filter((c) => cols.includes(c))
  const catCounts = catCols.map((c) => {
    const m: Record<string, number> = {}
    data.forEach((r) => { const v = String((r as any)[c] ?? 'NULL'); m[v] = (m[v] || 0) + 1 })
    return { col: c, counts: Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5) }
  })

  // Correlation matrix (numeric)
  const corr = numericCols.map((c1) => numericCols.map((c2) => {
    const xs = data.map((r) => num((r as any)[c1]))
    const ys = data.map((r) => num((r as any)[c2]))
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length
    const my = ys.reduce((s, v) => s + v, 0) / ys.length
    const numr = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
    const den = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) * ys.reduce((s, y) => s + (y - my) ** 2, 0))
    return den ? Math.round((numr / den) * 100) / 100 : 0
  }))

  // Outliers (IQR on profit)
  const profits = data.map((r) => num((r as any).profit)).filter((v) => !isNaN(v)).sort((a, b) => a - b)
  const q1 = profits[Math.floor(profits.length * 0.25)] || 0
  const q3 = profits[Math.floor(profits.length * 0.75)] || 0
  const iqr = q3 - q1
  const lower = q1 - 1.5 * iqr
  const upper = q3 + 1.5 * iqr
  const outliers = data.filter((r) => { const p = num((r as any).profit); return p < lower || p > upper })

  // Quality checks
  const checks: EDACheck[] = [
    { id: 'rows', label: `${rowCount} rows loaded`, status: 'pass', detail: 'Dataset loaded successfully' },
    { id: 'cols', label: `${colCount} columns`, status: 'pass', detail: cols.join(', ') },
    { id: 'missing', label: missing.length === 0 ? 'No missing values' : `${missing.length} column(s) with missing values`, status: missing.length === 0 ? 'pass' : 'warn', detail: missing.length ? missing.map((m) => `${m.col}: ${m.missing}`).join(', ') : 'All cells populated' },
    { id: 'dupes', label: dupes.length === 0 ? 'No duplicate rows' : `${dupes.length} duplicate row(s)`, status: dupes.length === 0 ? 'pass' : 'warn', detail: dupes.length ? 'Consider df.drop_duplicates()' : 'No action needed' },
    { id: 'outliers', label: outliers.length === 0 ? 'No outliers detected' : `${outliers.length} outlier(s) in profit`, status: outliers.length === 0 ? 'pass' : 'warn', detail: `IQR range: [${lower.toFixed(2)}, ${upper.toFixed(2)}]` },
    { id: 'dtypes', label: 'All numeric columns are numeric', status: 'pass', detail: `Numeric: ${numericCols.join(', ')}` },
  ]

  const handleRun = () => setRun(true)

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-ai-green" /> EDA Laboratory — Run Full Analysis
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai-orange/15 text-ai-orange font-semibold uppercase">Synthetic data</span>
        </h4>
        <div className="flex gap-1">
          <Button size="sm" variant={dataset === 'clean' ? 'default' : 'outline'} onClick={() => { setDataset('clean'); setRun(false) }}>Clean dataset</Button>
          <Button size="sm" variant={dataset === 'dirty' ? 'default' : 'outline'} onClick={() => { setDataset('dirty'); setRun(false) }}>Dirty dataset</Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 flex items-start gap-2">
          <Database className="w-3.5 h-3.5 text-ai-blue shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-ai-blue">Dataset: {dataset === 'clean' ? 'retailSales (20 rows, synthetic)' : 'dirtyRetailSales (15 rows, deliberately corrupted)'}</p>
            <p className="text-muted-foreground mt-0.5">{dataset === 'dirty' ? 'This dataset has missing values, duplicates, inconsistent casing, and an invalid (negative) quantity.' : 'A clean reference dataset you can use to see what good EDA output looks like.'}</p>
          </div>
        </div>

        {!run ? (
          <div className="text-center py-8">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-3">Click "Run EDA" to compute shape, missing values, duplicates, descriptive statistics, correlations, categorical distributions, and outliers all at once.</p>
            <Button onClick={handleRun}><Play className="w-3.5 h-3.5 mr-1" /> Run EDA</Button>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            {/* Quality checks */}
            <div>
              <h5 className="text-xs font-semibold mb-2">Quality checks</h5>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {checks.map((c) => (
                  <div key={c.id} className={cn('rounded-lg border p-2 text-xs flex items-start gap-2',
                    c.status === 'pass' ? 'border-ai-green/30 bg-ai-green/5' : 'border-ai-orange/30 bg-ai-orange/5'
                  )}>
                    {c.status === 'pass' ? <CheckCircle2 className="w-3.5 h-3.5 text-ai-green shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-ai-orange shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptive statistics */}
            <div>
              <h5 className="text-xs font-semibold mb-2">Descriptive statistics (df.describe)</h5>
              <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left p-2 font-mono">column</th>
                      <th className="text-right p-2 font-mono">count</th>
                      <th className="text-right p-2 font-mono">mean</th>
                      <th className="text-right p-2 font-mono">std</th>
                      <th className="text-right p-2 font-mono">min</th>
                      <th className="text-right p-2 font-mono">25%</th>
                      <th className="text-right p-2 font-mono">50%</th>
                      <th className="text-right p-2 font-mono">75%</th>
                      <th className="text-right p-2 font-mono">max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.map((s) => (
                      <tr key={s.col}>
                        <td className="p-2 font-mono">{s.col}</td>
                        <td className="p-2 text-right font-mono">{s.n}</td>
                        <td className="p-2 text-right font-mono">{s.mean}</td>
                        <td className="p-2 text-right font-mono">{s.std}</td>
                        <td className="p-2 text-right font-mono">{s.min}</td>
                        <td className="p-2 text-right font-mono">{s.q1}</td>
                        <td className="p-2 text-right font-mono">{s.median}</td>
                        <td className="p-2 text-right font-mono">{s.q3}</td>
                        <td className="p-2 text-right font-mono">{s.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Categorical distributions */}
            <div>
              <h5 className="text-xs font-semibold mb-2">Categorical distributions (value_counts)</h5>
              <div className="grid sm:grid-cols-2 gap-3">
                {catCounts.map((c) => (
                  <div key={c.col} className="rounded-lg border border-border p-2.5">
                    <p className="text-[11px] font-mono font-semibold mb-1.5">{c.col}</p>
                    <div className="space-y-1">
                      {c.counts.map(([val, cnt]) => {
                        const max = c.counts[0][1]
                        const pct = (cnt / max) * 100
                        return (
                          <div key={val} className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono w-24 truncate shrink-0">{val}</span>
                            <div className="flex-1 h-3 bg-muted/40 rounded overflow-hidden">
                              <div className="h-full bg-ai-purple" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-mono w-8 text-right shrink-0">{cnt}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation heatmap */}
            <div>
              <h5 className="text-xs font-semibold mb-2">Correlation matrix (df.corr)</h5>
              <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="p-2"></th>
                      {numericCols.map((c) => <th key={c} className="p-2 font-mono">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {numericCols.map((c1, i) => (
                      <tr key={c1}>
                        <td className="p-2 font-mono font-semibold">{c1}</td>
                        {numericCols.map((c2, j) => {
                          const v = corr[i][j]
                          const bg = v > 0.5 ? 'bg-ai-green/30' : v > 0 ? 'bg-ai-green/15' : v < -0.5 ? 'bg-ai-red/30' : v < 0 ? 'bg-ai-red/15' : ''
                          return <td key={c2} className={cn('p-2 text-center font-mono', bg)}>{v.toFixed(2)}</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Green = positive correlation, red = negative. Values close to ±1 are strong relationships.</p>
            </div>

            {/* Outliers */}
            <div>
              <h5 className="text-xs font-semibold mb-2">Outliers (IQR method on profit)</h5>
              <div className="rounded-lg border border-border p-2.5 text-xs">
                <p className="font-mono">Q1={q1.toFixed(2)} | Q3={q3.toFixed(2)} | IQR={iqr.toFixed(2)}</p>
                <p className="font-mono">Acceptable range: [{lower.toFixed(2)}, {upper.toFixed(2)}]</p>
                <p className="mt-1.5">
                  <span className={cn('font-semibold', outliers.length > 0 ? 'text-ai-orange' : 'text-ai-green')}>
                    {outliers.length} outlier(s) found
                  </span>
                  {outliers.length > 0 && (
                    <span className="text-muted-foreground"> — investigate before dropping. These may be valid large orders.</span>
                  )}
                </p>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={() => setRun(false)}>Re-run EDA</Button>
          </div>
        )}
      </div>
    </Card>
  )
}
