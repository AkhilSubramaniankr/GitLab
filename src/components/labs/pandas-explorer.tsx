'use client'

import * as React from 'react'
import { Table2, Filter, Group, Sigma, BarChart3, Sparkles, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'
import { retailSales, dirtyRetailSales } from '@/lib/data/datasets'

type Op = 'head' | 'shape' | 'describe' | 'missing' | 'duplicates' | 'drop_duplicates' | 'fill_missing' | 'normalize_category' | 'fix_date' | 'filter_revenue' | 'groupby_category' | 'groupby_region' | 'top_products' | 'sort_profit' | 'correlation' | 'outliers'

const OPS: { id: Op; label: string; icon: any; cat: 'inspect' | 'clean' | 'transform' | 'analyze'; desc: string }[] = [
  { id: 'head', label: 'df.head()', icon: Table2, cat: 'inspect', desc: 'Preview the first 5 rows of the dataset' },
  { id: 'shape', label: 'df.shape', icon: Table2, cat: 'inspect', desc: 'Show number of rows and columns' },
  { id: 'describe', label: 'df.describe()', icon: Sigma, cat: 'inspect', desc: 'Descriptive statistics for numeric columns' },
  { id: 'missing', label: 'df.isnull().sum()', icon: AlertTriangle, cat: 'inspect', desc: 'Count missing values per column' },
  { id: 'duplicates', label: 'df.duplicated().sum()', icon: AlertTriangle, cat: 'inspect', desc: 'Count duplicate rows' },
  { id: 'drop_duplicates', label: 'df.drop_duplicates()', icon: Filter, cat: 'clean', desc: 'Remove duplicate rows from the dataset' },
  { id: 'fill_missing', label: 'df.fillna(...)', icon: Filter, cat: 'clean', desc: 'Fill missing values (numeric with median, categorical with mode)' },
  { id: 'normalize_category', label: 'str.lower().str.title()', icon: Filter, cat: 'clean', desc: 'Normalize category text casing (Electronics, ELECTRONICS → Electronics)' },
  { id: 'fix_date', label: 'pd.to_datetime()', icon: Filter, cat: 'clean', desc: 'Convert mixed date formats to standard YYYY-MM-DD' },
  { id: 'filter_revenue', label: 'df[df.revenue > 100]', icon: Filter, cat: 'transform', desc: 'Filter rows where revenue exceeds $100' },
  { id: 'groupby_category', label: 'groupby + sum', icon: Group, cat: 'transform', desc: 'Total revenue and profit by product category' },
  { id: 'groupby_region', label: 'groupby region', icon: Group, cat: 'transform', desc: 'Order count and revenue by region' },
  { id: 'top_products', label: 'top 5 products', icon: BarChart3, cat: 'analyze', desc: 'Top 5 products by total revenue' },
  { id: 'sort_profit', label: 'sort by profit', icon: BarChart3, cat: 'analyze', desc: 'Orders sorted by profit (descending)' },
  { id: 'correlation', label: 'df.corr(numeric_only)', icon: Sigma, cat: 'analyze', desc: 'Correlation matrix between numeric columns' },
  { id: 'outliers', label: 'profit outliers', icon: AlertTriangle, cat: 'analyze', desc: 'Detect outliers using the IQR method on profit' },
]

function num(s: any): number { return Number(s) || 0 }

function executeOp(op: Op, dataset: 'clean' | 'dirty'): { code: string; result: string; table?: { columns: string[]; rows: any[][] } } {
  const data = dataset === 'clean' ? retailSales : dirtyRetailSales
  switch (op) {
    case 'head': {
      const rows = data.slice(0, 5)
      return {
        code: 'df.head()',
        result: `Showing first 5 of ${data.length} rows.`,
        table: { columns: Object.keys(rows[0]), rows: rows.map((r) => Object.values(r)) },
      }
    }
    case 'shape':
      return { code: 'df.shape', result: `(${data.length}, ${Object.keys(data[0]).length})  — ${data.length} rows × ${Object.keys(data[0]).length} columns` }
    case 'describe': {
      const numericCols = ['quantity', 'unit_price', 'revenue', 'cost', 'profit']
      const stats = numericCols.map((c) => {
        const vals = data.map((r) => num((r as any)[c])).filter((v) => !isNaN(v))
        const n = vals.length
        const mean = vals.reduce((s, v) => s + v, 0) / n
        const sorted = [...vals].sort((a, b) => a - b)
        const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
        return [c, n, mean, std, sorted[0], sorted[Math.floor(n / 2)], sorted[n - 1]]
      })
      return {
        code: 'df.describe()',
        result: 'Descriptive statistics for numeric columns.',
        table: { columns: ['column', 'count', 'mean', 'std', 'min', '50%', 'max'], rows: stats.map((r) => r.map((v) => typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v)) },
      }
    }
    case 'missing': {
      const cols = Object.keys(data[0])
      const missing = cols.map((c) => [c, data.filter((r) => (r as any)[c] == null || (r as any)[c] === '').length])
      return {
        code: 'df.isnull().sum()',
        result: `Total cells: ${data.length * cols.length}. Missing: ${missing.reduce((s, [, m]) => s + (m as number), 0)}.`,
        table: { columns: ['column', 'missing_count'], rows: missing.filter(([, m]) => (m as number) > 0).length ? missing : [['(none)', 0]] },
      }
    }
    case 'duplicates': {
      const seen = new Set<string>()
      const dupes = data.filter((r) => {
        const k = JSON.stringify(r)
        if (seen.has(k)) return true
        seen.add(k)
        return false
      })
      return { code: 'df.duplicated().sum()', result: `${dupes.length} duplicate row(s) found.` }
    }
    case 'drop_duplicates': {
      const seen = new Set<string>()
      const unique = data.filter((r) => {
        const k = JSON.stringify(r)
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      return { code: 'df = df.drop_duplicates()\nprint(df.shape)', result: `Removed ${data.length - unique.length} duplicate(s). New shape: (${unique.length}, ${Object.keys(data[0]).length})` }
    }
    case 'fill_missing': {
      const filled = data.map((r) => {
        const nr = { ...r }
        for (const c of Object.keys(r)) {
          if ((r as any)[c] == null || (r as any)[c] === '') {
            if (['quantity', 'unit_price', 'revenue', 'cost', 'profit'].includes(c)) {
              const vals = data.map((x) => num((x as any)[c])).filter((v) => !isNaN(v) && v > 0)
              const median = vals.sort((a, b) => a - b)[Math.floor(vals.length / 2)]
              ;(nr as any)[c] = median
            } else {
              const vals = data.map((x) => (x as any)[c]).filter((v) => v != null && v !== '')
              const counts: Record<string, number> = {}
              vals.forEach((v) => counts[v] = (counts[v] || 0) + 1)
              ;(nr as any)[c] = Object.entries(counts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'Unknown'
            }
          }
        }
        return nr
      })
      return { code: "df = df.fillna({'numeric': 'median', 'categorical': 'mode'})", result: `Filled ${filled.length - data.length === 0 ? 'all missing values' : ''}. ${filled.length} rows after fill. Run isnull().sum() again to verify.` }
    }
    case 'normalize_category': {
      const normalized = data.map((r) => ({ ...r, category: (r.category || '').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), region: (r.region || '').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) }))
      const cats = [...new Set(normalized.map((r) => r.category))]
      return { code: "df['category'] = df['category'].str.lower().str.title()\ndf['region'] = df['region'].str.lower().str.title()", result: `Normalized. Unique categories: ${cats.join(', ')}.` }
    }
    case 'fix_date': {
      return { code: "df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce').dt.strftime('%Y-%m-%d')", result: 'Parsed all date formats. Rows with unparseable dates would become NaT (none in this sample after coercion).' }
    }
    case 'filter_revenue': {
      const filtered = data.filter((r) => num(r.revenue) > 100)
      return {
        code: 'high_value = df[df["revenue"] > 100]\nprint(high_value.shape)',
        result: `${filtered.length} row(s) where revenue > $100.`,
        table: filtered.length ? { columns: ['order_id', 'product', 'region', 'revenue'], rows: filtered.map((r) => [r.order_id, r.product, r.region, num(r.revenue).toFixed(2)]) } : undefined,
      }
    }
    case 'groupby_category': {
      const groups: Record<string, any[]> = {}
      data.forEach((r) => { (groups[r.category || 'Unknown'] ||= []).push(r) })
      const rows = Object.entries(groups).map(([cat, items]) => [
        cat,
        items.length,
        items.reduce((s, r) => s + num(r.revenue), 0).toFixed(2),
        items.reduce((s, r) => s + num(r.profit), 0).toFixed(2),
      ]).sort((a, b) => num(b[2]) - num(a[2]))
      return {
        code: 'df.groupby("category").agg(order_count=("order_id","count"), total_revenue=("revenue","sum"), total_profit=("profit","sum"))',
        result: 'Aggregated by category.',
        table: { columns: ['category', 'order_count', 'total_revenue', 'total_profit'], rows },
      }
    }
    case 'groupby_region': {
      const groups: Record<string, any[]> = {}
      data.forEach((r) => { (groups[r.region || 'Unknown'] ||= []).push(r) })
      const rows = Object.entries(groups).map(([region, items]) => [
        region,
        items.length,
        items.reduce((s, r) => s + num(r.revenue), 0).toFixed(2),
        (items.reduce((s, r) => s + num(r.revenue), 0) / items.length).toFixed(2),
      ]).sort((a, b) => num(b[2]) - num(a[2]))
      return {
        code: 'df.groupby("region").agg(orders=("order_id","count"), revenue=("revenue","sum")).assign(avg_order_value=lambda d: d.revenue/d.orders)',
        result: 'Aggregated by region.',
        table: { columns: ['region', 'orders', 'total_revenue', 'avg_order_value'], rows },
      }
    }
    case 'top_products': {
      const groups: Record<string, any[]> = {}
      data.forEach((r) => { (groups[r.product || 'Unknown'] ||= []).push(r) })
      const rows = Object.entries(groups).map(([p, items]) => [p, items.length, items.reduce((s, r) => s + num(r.revenue), 0).toFixed(2)]).sort((a, b) => num(b[2]) - num(a[2])).slice(0, 5)
      return {
        code: 'df.groupby("product")["revenue"].sum().nlargest(5)',
        result: 'Top 5 products by total revenue.',
        table: { columns: ['product', 'order_count', 'total_revenue'], rows },
      }
    }
    case 'sort_profit': {
      const sorted = [...data].sort((a, b) => num(b.profit) - num(a.profit)).slice(0, 8)
      return {
        code: 'df.sort_values("profit", ascending=False).head(8)',
        result: 'Top 8 most profitable orders.',
        table: { columns: ['order_id', 'product', 'region', 'profit'], rows: sorted.map((r) => [r.order_id, r.product, r.region, num(r.profit).toFixed(2)]) },
      }
    }
    case 'correlation': {
      const cols = ['quantity', 'unit_price', 'revenue', 'cost', 'profit']
      const matrix = cols.map((c1) => cols.map((c2) => {
        const xs = data.map((r) => num((r as any)[c1]))
        const ys = data.map((r) => num((r as any)[c2]))
        const mx = xs.reduce((s, v) => s + v, 0) / xs.length
        const my = ys.reduce((s, v) => s + v, 0) / ys.length
        const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
        const den = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) * ys.reduce((s, y) => s + (y - my) ** 2, 0))
        return den ? (num / den).toFixed(2) : '0.00'
      }))
      return {
        code: 'df[["quantity","unit_price","revenue","cost","profit"]].corr(numeric_only=True)',
        result: 'Correlation matrix — values close to 1 mean strong positive relationship.',
        table: { columns: ['', ...cols], rows: cols.map((c, i) => [c, ...matrix[i]]) },
      }
    }
    case 'outliers': {
      const profits = data.map((r) => num(r.profit)).sort((a, b) => a - b)
      const q1 = profits[Math.floor(profits.length * 0.25)]
      const q3 = profits[Math.floor(profits.length * 0.75)]
      const iqr = q3 - q1
      const lower = q1 - 1.5 * iqr
      const upper = q3 + 1.5 * iqr
      const out = data.filter((r) => num(r.profit) < lower || num(r.profit) > upper)
      return {
        code: 'q1, q3 = df["profit"].quantile([0.25, 0.75])\niqr = q3 - q1\noutliers = df[(df["profit"] < q1 - 1.5*iqr) | (df["profit"] > q3 + 1.5*iqr)]',
        result: `Q1=${q1.toFixed(2)}, Q3=${q3.toFixed(2)}, IQR=${iqr.toFixed(2)}. Acceptable range: [${lower.toFixed(2)}, ${upper.toFixed(2)}]. Found ${out.length} outlier(s).`,
        table: out.length ? { columns: ['order_id', 'product', 'profit'], rows: out.map((r) => [r.order_id, r.product, num(r.profit).toFixed(2)]) } : undefined,
      }
    }
  }
}

export function PandasOperationExplorer() {
  const [dataset, setDataset] = React.useState<'clean' | 'dirty'>('clean')
  const [op, setOp] = React.useState<Op>('head')
  const [result, setResult] = React.useState(() => executeOp('head', 'clean'))

  const run = (o: Op, d: 'clean' | 'dirty') => {
    setOp(o)
    setResult(executeOp(o, d))
  }

  const cats = [
    { id: 'inspect', label: 'Inspect', color: 'text-ai-blue' },
    { id: 'clean', label: 'Clean', color: 'text-ai-orange' },
    { id: 'transform', label: 'Transform', color: 'text-ai-cyan' },
    { id: 'analyze', label: 'Analyze', color: 'text-ai-green' },
  ] as const

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between gap-2 flex-wrap">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-purple" /> Pandas Operation Explorer
        </h4>
        <div className="flex gap-1">
          <Button size="sm" variant={dataset === 'clean' ? 'default' : 'outline'} onClick={() => { setDataset('clean'); run(op, 'clean') }}>Clean dataset</Button>
          <Button size="sm" variant={dataset === 'dirty' ? 'default' : 'outline'} onClick={() => { setDataset('dirty'); run(op, 'dirty') }}>Dirty dataset</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] divide-x divide-border">
        {/* Op list */}
        <div className="p-3 max-h-[200px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
          {cats.map((cat) => (
            <div key={cat.id} className="mb-3">
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-1.5', cat.color)}>{cat.label}</p>
              <div className="space-y-0.5">
                {OPS.filter((o) => o.cat === cat.id).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => run(o.id, dataset)}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors',
                      op === o.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{OPS.find((o) => o.id === op)?.desc}</p>
          </div>
          <CodeBlock code={result.code} language="python" title="pandas" maxHeight="200px" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Output</p>
            <div className="rounded-lg bg-ai-green/5 border border-ai-green/20 p-3">
              <pre className="text-xs font-mono text-foreground/90 whitespace-pre-wrap">{result.result}</pre>
            </div>
          </div>
          {result.table && (
            <div className="rounded-lg border border-border overflow-hidden overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    {result.table.columns.map((c) => (
                      <th key={c} className="text-left px-3 py-1.5 font-mono font-semibold border-b border-border whitespace-nowrap">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.table.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      {r.map((c, j) => (
                        <td key={j} className="px-3 py-1.5 font-mono whitespace-nowrap">{String(c ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
