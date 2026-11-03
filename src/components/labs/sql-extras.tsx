'use client'

import * as React from 'react'
import { Database, Wand2, Bug, BarChart3, Play, RotateCcw, CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'
import { SQLLab, executeSQL, type Table } from '@/components/labs/sql-lab'

// ============ SQL Query Builder ============
interface QueryBuilderProps { tables: Record<string, Table> }

export function SQLQueryBuilder({ tables }: QueryBuilderProps) {
  const [tableName, setTableName] = React.useState(Object.keys(tables)[0])
  const [columns, setColumns] = React.useState<string[]>(['*'])
  const [whereCol, setWhereCol] = React.useState('')
  const [whereOp, setWhereOp] = React.useState('=')
  const [whereVal, setWhereVal] = React.useState('')
  const [aggCol, setAggCol] = React.useState('')
  const [aggFn, setAggFn] = React.useState('')
  const [groupBy, setGroupBy] = React.useState('')
  const [orderBy, setOrderBy] = React.useState('')
  const [orderDir, setOrderDir] = React.useState('ASC')
  const [limit, setLimit] = React.useState('')

  const table = tables[tableName]
  const colNames = table?.columns.map((c) => c.name) || []

  const toggleCol = (c: string) => {
    if (c === '*') { setColumns(['*']); return }
    setColumns((prev) => {
      if (prev.includes('*')) return [c]
      if (prev.includes(c)) return prev.filter((x) => x !== c)
      return [...prev, c]
    })
  }

  const buildQuery = () => {
    let selectParts: string[]
    if (columns.includes('*')) selectParts = ['*']
    else if (aggFn && aggCol) selectParts = [...columns, `${aggFn}(${aggCol}) AS ${aggFn.toLowerCase()}_${aggCol}`]
    else selectParts = columns

    let q = `SELECT ${selectParts.join(', ')}\nFROM ${tableName}`

    if (whereCol && whereOp && whereVal) {
      const v = isNaN(Number(whereVal)) ? `'${whereVal}'` : whereVal
      q += `\nWHERE ${whereCol} ${whereOp} ${v}`
    }
    if (groupBy) q += `\nGROUP BY ${groupBy}`
    if (aggFn && whereCol && !groupBy) {
      // HAVING if aggregation is used without GROUP BY it's a scalar — skip
    }
    if (orderBy) q += `\nORDER BY ${orderBy} ${orderDir}`
    if (limit) q += `\nLIMIT ${limit}`
    q += ';'
    return q
  }

  const query = buildQuery()

  const reset = () => {
    setColumns(['*']); setWhereCol(''); setWhereOp('='); setWhereVal('')
    setAggCol(''); setAggFn(''); setGroupBy(''); setOrderBy(''); setOrderDir('ASC'); setLimit('')
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-ai-purple" /> Interactive SQL Query Builder
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Compose a query with dropdowns. The generated SQL appears below — run it in the SQL Execution Lab.</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Table */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Table</label>
          <select value={tableName} onChange={(e) => { setTableName(e.target.value); setColumns(['*']); setWhereCol(''); setGroupBy(''); setOrderBy('') }} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
            {Object.keys(tables).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Columns */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Columns (multi-select)</label>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => toggleCol('*')} className={cn('text-[11px] px-2 py-0.5 rounded-full border font-mono', columns.includes('*') ? 'bg-primary text-primary-foreground border-primary' : 'border-border')}>*</button>
            {colNames.map((c) => (
              <button key={c} onClick={() => toggleCol(c)} className={cn('text-[11px] px-2 py-0.5 rounded-full border font-mono', columns.includes(c) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40')}>{c}</button>
            ))}
          </div>
        </div>

        {/* Aggregates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Aggregate (optional)</label>
            <select value={aggFn} onChange={(e) => setAggFn(e.target.value)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
              <option value="">(none)</option>
              <option value="COUNT">COUNT</option>
              <option value="SUM">SUM</option>
              <option value="AVG">AVG</option>
              <option value="MIN">MIN</option>
              <option value="MAX">MAX</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Aggregate column</label>
            <select value={aggCol} onChange={(e) => setAggCol(e.target.value)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
              <option value="">(none)</option>
              {colNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* WHERE */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">WHERE col</label>
            <select value={whereCol} onChange={(e) => setWhereCol(e.target.value)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
              <option value="">(none)</option>
              {colNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Op</label>
            <select value={whereOp} onChange={(e) => setWhereOp(e.target.value)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
              <option>=</option><option>!=</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>LIKE</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Value</label>
            <input value={whereVal} onChange={(e) => setWhereVal(e.target.value)} placeholder="West or 100" className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono" />
          </div>
        </div>

        {/* GROUP BY / ORDER BY / LIMIT */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">GROUP BY</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
              <option value="">(none)</option>
              {colNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">ORDER BY</label>
            <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono">
              <option value="">(none)</option>
              {colNames.map((c) => <option key={c} value={c}>{c}</option>)}
              {aggFn && aggCol && <option value={`${aggFn.toLowerCase()}_${aggCol}`}>{aggFn.toLowerCase()}_${aggCol}</option>}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">LIMIT</label>
            <input value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5" className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 font-mono" />
          </div>
        </div>

        {/* Generated query */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Generated query</p>
            <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-3 h-3 mr-1" />Reset</Button>
          </div>
          <CodeBlock code={query} language="sql" title="generated.sql" maxHeight="160px" />
        </div>

        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 flex gap-2 items-start">
          <Lightbulb className="w-3.5 h-3.5 text-ai-blue shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/80 leading-relaxed">Copy this query and paste it into the SQL Execution Lab above to run it against live data. The builder demonstrates how a visual query composer translates UI choices into SQL syntax.</p>
        </div>
      </div>
    </Card>
  )
}

// ============ SQL Debugging Challenge ============
interface SQLDebugExercise {
  id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  buggySQL: string
  symptom: string
  fixes: { sql: string; correct: boolean; explanation: string }[]
  explanation: string
}

const SQL_DEBUG_EXERCISES: SQLDebugExercise[] = [
  {
    id: 'sql-debug-1',
    title: 'Wrong date format in WHERE',
    level: 'beginner',
    buggySQL: "SELECT * FROM sales WHERE order_date BETWEEN '01-01-2024' AND '03-31-2024'",
    symptom: 'Query returns 0 rows even though Q1 sales exist in the table.',
    fixes: [
      { sql: "SELECT * FROM sales WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'", correct: true, explanation: 'SQLite compares dates as strings in YYYY-MM-DD format. MM-DD-YYYY sorts incorrectly and matches nothing.' },
      { sql: "SELECT * FROM sales WHERE order_date LIKE '%2024%'", correct: false, explanation: 'LIKE would match any 2024 date including Q2/Q3 — too broad. Use BETWEEN with correct format.' },
      { sql: "SELECT * FROM sales WHERE YEAR(order_date) = 2024 AND MONTH(order_date) <= 3", correct: false, explanation: 'SQLite does not have YEAR() or MONTH() functions. Use strftime() or date comparisons.' },
    ],
    explanation: 'SQLite stores dates as text. ISO 8601 (YYYY-MM-DD) is the only format that sorts and compares correctly. Other databases (PostgreSQL, MySQL) have native DATE types and accept more formats.',
  },
  {
    id: 'sql-debug-2',
    title: 'Cartesian product (missing ON clause)',
    level: 'intermediate',
    buggySQL: 'SELECT s.product, c.name FROM sales s, customers c WHERE c.tier = "Gold"',
    symptom: 'Query returns 10x more rows than expected — every sales row paired with every Gold customer.',
    fixes: [
      { sql: 'SELECT s.product, c.name FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.tier = \'Gold\'', correct: true, explanation: 'The comma-join with WHERE on tier only filters customers, not the join. Add an explicit JOIN ON to pair rows correctly.' },
      { sql: 'SELECT s.product, c.name FROM sales s, customers c WHERE c.tier = \'Gold\' AND s.customer_id = c.customer_id', correct: false, explanation: 'This is technically correct (old-style join syntax) but is discouraged. Use explicit JOIN ON for readability and to avoid accidental cartesian products.' },
      { sql: 'SELECT s.product, c.name FROM sales s JOIN customers c WHERE c.tier = \'Gold\'', correct: false, explanation: 'JOIN without ON produces a cartesian product in some dialects (MySQL) or errors in others. Always specify ON.' },
    ],
    explanation: 'Comma-joins (FROM a, b) without a join condition in WHERE produce cartesian products (N×M rows). Always use explicit JOIN ... ON ... syntax — it is clearer and forces you to specify the join condition.',
  },
  {
    id: 'sql-debug-3',
    title: 'GROUP BY with non-aggregated column',
    level: 'intermediate',
    buggySQL: 'SELECT region, product, SUM(revenue) FROM sales GROUP BY region',
    symptom: 'Error: "column \'product\' is not in GROUP BY or aggregate" (in strict SQL mode).',
    fixes: [
      { sql: 'SELECT region, SUM(revenue) FROM sales GROUP BY region', correct: true, explanation: 'Either remove product from SELECT (you cannot show one product per region when grouping by region), or add product to GROUP BY.' },
      { sql: 'SELECT region, product, SUM(revenue) FROM sales GROUP BY region, product', correct: false, explanation: 'This is valid SQL but changes the result — you get one row per region-product combination, not per region. The question likely asked for total per region.' },
      { sql: 'SELECT region, product, SUM(revenue) FROM sales GROUP BY region', correct: false, explanation: 'This is the original buggy query. SQLite allows it (returns an arbitrary product per region) but strict databases reject it.' },
    ],
    explanation: 'Every column in SELECT must either be in GROUP BY or wrapped in an aggregate function. SQLite is permissive (picks an arbitrary value); PostgreSQL/MySQL strict mode reject it. Always group by all non-aggregated columns.',
  },
]

export function SQLDebuggingChallenge() {
  const [exIdx, setExIdx] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const ex = SQL_DEBUG_EXERCISES[exIdx]

  const reset = () => { setSelected(null); setSubmitted(false) }
  const next = () => { setExIdx((i) => (i + 1) % SQL_DEBUG_EXERCISES.length); reset() }
  const prev = () => { setExIdx((i) => (i - 1 + SQL_DEBUG_EXERCISES.length) % SQL_DEBUG_EXERCISES.length); reset() }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Bug className="w-4 h-4 text-ai-red" /> SQL Debugging Challenge
        </h4>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={prev}>Previous</Button>
          <span className="text-xs text-muted-foreground self-center">{exIdx + 1} / {SQL_DEBUG_EXERCISES.length}</span>
          <Button size="sm" variant="ghost" onClick={next}>Next</Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-sm">{ex.title}</h5>
            <span className={cn('text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold', ex.level === 'beginner' ? 'bg-ai-green/15 text-ai-green' : ex.level === 'intermediate' ? 'bg-ai-orange/15 text-ai-orange' : 'bg-ai-red/15 text-ai-red')}>{ex.level}</span>
          </div>
          <div className="rounded-lg bg-ai-red/5 border border-ai-red/30 p-2.5">
            <p className="text-[10px] font-semibold text-ai-red mb-0.5">Symptom</p>
            <p className="text-xs text-foreground/90">{ex.symptom}</p>
          </div>
        </div>

        <CodeBlock code={ex.buggySQL} language="sql" title="buggy.sql" />

        <div>
          <p className="text-xs font-semibold mb-2">Select the correct fix:</p>
          <div className="space-y-2">
            {ex.fixes.map((f, i) => {
              const showResult = submitted
              const isCorrect = f.correct
              const isSelected = selected === i
              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    !showResult && isSelected && 'border-primary bg-primary/5',
                    !showResult && !isSelected && 'border-border hover:bg-muted/40',
                    showResult && isCorrect && 'border-ai-green bg-ai-green/10',
                    showResult && isSelected && !isCorrect && 'border-ai-red bg-ai-red/10',
                    showResult && !isSelected && !isCorrect && 'border-border opacity-60',
                  )}
                >
                  <div className="flex items-start gap-2">
                  <span className={cn('shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold',
                      !showResult && isSelected && 'border-primary bg-primary text-primary-foreground',
                      !showResult && !isSelected && 'border-muted-foreground/40',
                      showResult && isCorrect && 'border-ai-green bg-ai-green text-white',
                      showResult && isSelected && !isCorrect && 'border-ai-red bg-ai-red text-white',
                    )}>
                      {showResult && isCorrect ? <CheckCircle2 className="w-3 h-3" /> : showResult && isSelected && !isCorrect ? <XCircle className="w-3 h-3" /> : String.fromCharCode(65 + i)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <pre className="text-[11px] font-mono bg-[#0d1117] text-[#e6edf3] p-2 rounded overflow-auto">{f.sql}</pre>
                      {(showResult || isSelected) && (
                        <p className={cn('text-xs mt-1.5', isCorrect ? 'text-ai-green' : 'text-muted-foreground')}>{f.explanation}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {!submitted ? (
          <Button onClick={() => setSubmitted(true)} disabled={selected === null} size="sm">
            <Play className="w-3.5 h-3.5 mr-1" /> Submit fix
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 flex gap-2 items-start">
              <Lightbulb className="w-4 h-4 text-ai-blue shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-ai-blue mb-0.5">Explanation</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{ex.explanation}</p>
              </div>
            </div>
            <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Try again</Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// ============ SQL Result Visualizer ============
interface ResultVisualizerProps { tables: Record<string, Table> }

const VIZ_SCENARIOS = [
  {
    id: 'top-products',
    businessQ: 'Which 5 products generate the most revenue?',
    sql: 'SELECT product, SUM(revenue) AS total FROM sales GROUP BY product ORDER BY total DESC LIMIT 5',
    validation: 'Sum of the 5 products\' revenue should be ≤ total revenue. Verify: SELECT SUM(revenue) FROM sales.',
    insight: 'The top product (Office Chair) drives ~30% of total revenue. Consider inventory and pricing review for this SKU.',
    chart: 'bar' as const,
  },
  {
    id: 'revenue-by-region',
    businessQ: 'How is revenue distributed across regions?',
    sql: 'SELECT region, SUM(revenue) AS total FROM sales GROUP BY region ORDER BY total DESC',
    validation: 'Sum of regional revenue must equal total revenue. Compare: SELECT SUM(revenue) FROM sales.',
    insight: 'East region leads revenue. The West region underperforms — investigate product mix and marketing spend there.',
    chart: 'bar' as const,
  },
  {
    id: 'customer-tier',
    businessQ: 'Which customer tiers generate the most revenue?',
    sql: 'SELECT c.tier, SUM(s.revenue) AS revenue FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.tier ORDER BY revenue DESC',
    validation: 'Sum of tier revenue must equal total sales revenue. Verify with: SELECT SUM(revenue) FROM sales.',
    insight: 'Gold-tier customers drive the majority of revenue. Retention efforts should prioritize this segment.',
    chart: 'pie' as const,
  },
]

export function SQLResultVisualizer({ tables }: ResultVisualizerProps) {
  const [scenarioId, setScenarioId] = React.useState(VIZ_SCENARIOS[0].id)
  const scenario = VIZ_SCENARIOS.find((s) => s.id === scenarioId)!
  const [validationResult, setValidationResult] = React.useState<string | null>(null)

  // Execute the scenario query and the validation query
  const result = React.useMemo(() => executeSQL(scenario.sql, tables), [scenario, tables])

  const runValidation = () => {
    const totalResult = executeSQL('SELECT SUM(revenue) AS t FROM sales', tables)
    if (totalResult.error || result.error) {
      setValidationResult('Validation error: ' + (totalResult.error || result.error))
      return
    }
    const groupSum = result.rows.reduce((s: number, r: any) => s + Number(r.total || r.revenue || 0), 0)
    const total = Number(totalResult.rows[0]?.t || 0)
    const hasLimit = /\bLIMIT\b/i.test(scenario.sql)
    if (hasLimit && groupSum < total) {
      setValidationResult(`Group sum: $${groupSum.toFixed(2)} | Total revenue: $${total.toFixed(2)} | ✓ OK — LIMIT applied (showing subset of total). Group sums are internally consistent.`)
    } else {
      const match = Math.abs(groupSum - total) < 0.01
      setValidationResult(`Group sum: $${groupSum.toFixed(2)} | Total revenue: $${total.toFixed(2)} | ${match ? '✓ MATCH — aggregation is correct' : '✗ MISMATCH — investigate'}`)
    }
  }

  // Simple chart: bar or pie rendered as divs
  const maxVal = Math.max(...(result.rows || []).map((r: any) => Number(r.total || r.revenue || 0)), 1)

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-ai-cyan" /> SQL Result Visualizer
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Business question → SQL → result → validation → insight.</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Scenario picker */}
        <div className="flex flex-wrap gap-1.5">
          {VIZ_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setScenarioId(s.id); setValidationResult(null) }}
              className={cn('text-[11px] px-2 py-1 rounded-full border text-left', scenarioId === s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40')}
            >
              {s.businessQ.length > 50 ? s.businessQ.slice(0, 48) + '…' : s.businessQ}
            </button>
          ))}
        </div>

        {/* Flow: Business Q → SQL → Result → Validation → Insight */}
        <div className="rounded-lg bg-ai-orange/5 border border-ai-orange/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ai-orange mb-1">Business question</p>
          <p className="text-sm text-foreground/90">{scenario.businessQ}</p>
        </div>

        <CodeBlock code={scenario.sql} language="sql" title="query.sql" />

        {/* Result table */}
        {result.error ? (
          <div className="rounded-lg bg-ai-red/5 border border-ai-red/30 p-3 text-xs text-ai-red">Error: {result.error}</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-1.5 bg-ai-green/10 text-[11px] text-ai-green font-semibold border-b border-border flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> {result.rows.length} row(s) returned
            </div>
            <div className="overflow-x-auto custom-scrollbar max-h-48">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>{result.columns.map((c: string) => <th key={c} className="text-left px-3 py-1.5 font-mono font-semibold border-b border-border">{c}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.rows.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20">
                      {result.columns.map((c: string) => <td key={c} className="px-3 py-1.5 font-mono">{typeof r[c] === 'number' ? Number(r[c]).toFixed(2) : r[c]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mini chart */}
        {!result.error && result.rows.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Visual result</p>
            <div className="space-y-1.5">
              {result.rows.map((r: any, i: number) => {
                const label = r.product || r.region || r.tier || Object.values(r)[0]
                const val = Number(r.total || r.revenue || 0)
                const pct = (val / maxVal) * 100
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono w-28 truncate shrink-0">{String(label)}</span>
                    <div className="flex-1 h-5 bg-muted/40 rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-ai-purple to-ai-blue flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                        <span className="text-[10px] text-white font-mono">${val.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Validation */}
        <div>
          <Button size="sm" variant="outline" onClick={runValidation}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Validate result</Button>
          {validationResult && (
            <div className="mt-2 rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-2.5 fade-in">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-0.5">Validation</p>
              <p className="text-xs font-mono text-foreground/90">{validationResult}</p>
            </div>
          )}
        </div>

        {/* Insight */}
        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-0.5">Business insight</p>
          <p className="text-xs text-foreground/90 leading-relaxed">{scenario.insight}</p>
        </div>
      </div>
    </Card>
  )
}
