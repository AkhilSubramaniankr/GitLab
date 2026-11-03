'use client'

import * as React from 'react'
import { Play, Database, Table2, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Lightweight in-memory SQL engine — supports SELECT with WHERE, ORDER BY, GROUP BY,
// basic JOIN, aggregates COUNT/SUM/AVG/MIN/MAX, LIMIT, and HAVING.
// Safe: read-only, no DDL/DML.

export type Row = Record<string, any>
export interface Table { name: string; columns: { name: string; type: string }[]; rows: Row[] }

function tokenize(sql: string): string[] {
  // Split into tokens keeping string literals and operators
  const tokens: string[] = []
  let i = 0
  while (i < sql.length) {
    const c = sql[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === "'") {
      let j = i + 1
      while (j < sql.length && sql[j] !== "'") j++
      tokens.push(sql.slice(i, j + 1))
      i = j + 1
      continue
    }
    if (c === '"' || c === '`') {
      let j = i + 1
      while (j < sql.length && sql[j] !== c) j++
      tokens.push(sql.slice(i + 1, j))
      i = j + 1
      continue
    }
    if ('<>!='.includes(c) && sql[i + 1] === '=') {
      tokens.push(sql.slice(i, i + 2))
      i += 2
      continue
    }
    if ('(),;*'.includes(c)) {
      tokens.push(c)
      i++
      continue
    }
    let j = i
    while (j < sql.length && !/[\s(),;'"`<>!=]/.test(sql[j])) j++
    tokens.push(sql.slice(i, j))
    i = j
  }
  return tokens
}

function evalCondition(row: Row, expr: string): boolean {
  // Parse simple conditions: col OP value [AND|OR col OP value]...
  const tokens = expr.split(/\s+(AND|OR)\s+/i)
  let result: boolean | null = null
  let op: 'AND' | 'OR' = 'AND'
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k]
    if (t.toUpperCase() === 'AND' || t.toUpperCase() === 'OR') {
      op = t.toUpperCase() as any
      continue
    }
    const m = t.match(/^(\w+(?:\.\w+)?)\s*(>=|<=|!=|<>|=|>|<|LIKE|IS\s+NOT\s+NULL|IS\s+NULL)\s*(.+)$/i)
    if (!m) continue
    let [, col, operator, val] = m
    col = col.trim()
    operator = operator.toUpperCase()
    val = val.trim().replace(/^'|'$/g, '')
    const cell = row[col] ?? row[col.split('.')[1]]
    let cond = false
    if (operator === 'IS NULL') cond = cell == null
    else if (operator === 'IS NOT NULL') cond = cell != null
    else if (operator === 'LIKE') {
      const re = new RegExp('^' + val.replace(/%/g, '.*').replace(/_/g, '.') + '$')
      cond = re.test(String(cell))
    } else {
      const n = Number(val)
      const cv = !isNaN(n) && val !== '' ? n : cell
      if (operator === '=') cond = String(cell) === String(val) || cell == n
      else if (operator === '!=' || operator === '<>') cond = cell != val && cell != n
      else if (operator === '>') cond = Number(cell) > n
      else if (operator === '<') cond = Number(cell) < n
      else if (operator === '>=') cond = Number(cell) >= n
      else if (operator === '<=') cond = Number(cell) <= n
    }
    if (result === null) result = cond
    else if (op === 'AND') result = result && cond
    else result = result || cond
  }
  return result ?? true
}

interface ParsedQuery {
  columns: string[]
  agg?: { fn: string; col: string; alias?: string }[]
  from: string
  joins?: { type: string; table: string; on: string }[]
  where?: string
  groupBy?: string[]
  having?: string
  orderBy?: { col: string; dir: 'ASC' | 'DESC' }[]
  limit?: number
}

function parseSelect(sql: string): ParsedQuery {
  const upper = sql.toUpperCase()
  if (!upper.startsWith('SELECT')) throw new Error('Only SELECT statements are supported.')
  const colEnd = upper.indexOf(' FROM ')
  if (colEnd < 0) throw new Error('Missing FROM clause.')
  const colPart = sql.slice(6, colEnd).trim()
  const rest = sql.slice(colEnd + 6).trim()

  // Parse FROM/JOIN/WHERE/GROUP BY/HAVING/ORDER BY/LIMIT
  const segments = rest.split(/\s+(WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT)\s+/i)
  const from = segments[0].trim().replace(/;$/, '')
  const q: ParsedQuery = { columns: [], from }

  // Parse joins embedded in FROM
  const joinMatch = from.match(/^(.+?)\s+(INNER|LEFT|RIGHT|FULL)?\s*JOIN\s+(\w+)\s+ON\s+(.+)$/i)
  if (joinMatch) {
    q.from = joinMatch[1].trim()
    q.joins = [{ type: (joinMatch[2] || 'INNER').toUpperCase(), table: joinMatch[3], on: joinMatch[4] }]
  }

  // Aggregates
  const aggMatch = colPart.match(/(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([^)]+?)\s*\)(?:\s+AS\s+(\w+))?/gi)
  q.agg = aggMatch?.map((a) => {
    const m = a.match(/(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([^)]+?)\s*\)(?:\s+AS\s+(\w+))?/i)!
    return { fn: m[1].toUpperCase(), col: m[2].trim(), alias: m[3] }
  })
  if (colPart === '*') q.columns = ['*']
  else q.columns = colPart.split(',').map((c) => c.trim().replace(/\s+AS\s+\w+/i, '').replace(/^"|"$/g, ''))

  for (let i = 1; i < segments.length; i += 2) {
    const kw = segments[i].toUpperCase().replace(/\s+/g, ' ')
    const val = segments[i + 1]?.trim().replace(/;$/, '') || ''
    if (kw === 'WHERE') q.where = val
    else if (kw === 'GROUP BY') q.groupBy = val.split(',').map((c) => c.trim())
    else if (kw === 'HAVING') q.having = val
    else if (kw === 'ORDER BY') {
      q.orderBy = val.split(',').map((c) => {
        const parts = c.trim().split(/\s+/)
        return { col: parts[0], dir: (parts[1] || 'ASC').toUpperCase() as 'ASC' | 'DESC' }
      })
    } else if (kw === 'LIMIT') q.limit = parseInt(val, 10)
  }
  return q
}

function executeSelect(sql: string, tables: Record<string, Table>): { columns: string[]; rows: Row[] } {
  const q = parseSelect(sql)
  const base = tables[q.from]
  if (!base) throw new Error(`Table "${q.from}" not found.`)

  let rows: Row[] = [...base.rows]

  // JOIN
  if (q.joins) {
    for (const j of q.joins) {
      const right = tables[j.table]
      if (!right) throw new Error(`Table "${j.table}" not found.`)
      const [lcol, rcol] = j.on.split(/\s*=\s*/)
      const leftKey = lcol.split('.')[1] || lcol
      const rightKey = rcol.split('.')[1] || rcol
      const joined: Row[] = []
      for (const lr of rows) {
        let matched = false
        for (const rr of right.rows) {
          if (lr[leftKey] === rr[rightKey]) {
            joined.push({ ...lr, ...Object.fromEntries(Object.entries(rr).map(([k, v]) => [`${j.table}.${k}`, v])) })
            matched = true
          }
        }
        if (!matched && j.type === 'LEFT') joined.push(lr)
      }
      rows = joined
    }
  }

  // WHERE
  if (q.where) rows = rows.filter((r) => evalCondition(r, q.where!))

  // GROUP BY + aggregates
  let outCols: string[]
  if (q.groupBy || q.agg) {
    const groups = new Map<string, Row[]>()
    const keys = q.groupBy || []
    for (const r of rows) {
      const k = keys.map((kk) => r[kk] ?? r[kk.split('.')[1]]).join('||')
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(r)
    }
    const out: Row[] = []
    for (const [k, group] of groups) {
      const row: Row = {}
      keys.forEach((kk, i) => {
        const key = kk.split('.')[1] || kk
        row[key] = k.split('||')[i]
      })
      q.agg?.forEach((a) => {
        const vals = group.map((g) => g[a.col === '*' ? Object.keys(g)[0] : (a.col.split('.')[1] || a.col)]).filter((v) => v != null && v !== '')
        const alias = a.alias || `${a.fn.toLowerCase()}_${a.col}`.replace(/[^a-z_]/gi, '')
        if (a.fn === 'COUNT') row[alias] = vals.length
        else if (a.fn === 'SUM') row[alias] = vals.reduce((s, v) => s + Number(v), 0)
        else if (a.fn === 'AVG') row[alias] = vals.length ? vals.reduce((s, v) => s + Number(v), 0) / vals.length : 0
        else if (a.fn === 'MIN') row[alias] = vals.length ? Math.min(...vals.map(Number)) : null
        else if (a.fn === 'MAX') row[alias] = vals.length ? Math.max(...vals.map(Number)) : null
      })
      out.push(row)
    }
    rows = out
    outCols = [...(keys.map((k) => k.split('.')[1] || k)), ...(q.agg?.map((a) => a.alias || `${a.fn.toLowerCase()}_${a.col}`.replace(/[^a-z_]/gi, '')) || [])]
  } else if (q.columns[0] === '*') {
    outCols = base.columns.map((c) => c.name)
  } else {
    outCols = q.columns.map((c) => c.split('.')[1] || c)
  }

  // HAVING
  if (q.having) rows = rows.filter((r) => evalCondition(r, q.having!))

  // ORDER BY
  if (q.orderBy) {
    rows.sort((a, b) => {
      for (const o of q.orderBy!) {
        const av = a[o.col] ?? a[o.col.split('.')[1]]
        const bv = b[o.col] ?? b[o.col.split('.')[1]]
        if (av === bv) continue
        const cmp = av > bv ? 1 : -1
        return o.dir === 'DESC' ? -cmp : cmp
      }
      return 0
    })
  }

  // LIMIT
  if (q.limit != null) rows = rows.slice(0, q.limit)

  // Project columns
  if (outCols && outCols.length > 0 && q.columns[0] !== '*') {
    rows = rows.map((r) => {
      const proj: Row = {}
      outCols.forEach((c) => proj[c] = r[c])
      return proj
    })
  }
  return { columns: outCols, rows }
}

export function executeSQL(sql: string, tables: Record<string, Table>): { columns: string[]; rows: Row[]; error?: string } {
  try {
    const trimmed = sql.trim().replace(/;$/, '')
    if (!/^SELECT/i.test(trimmed)) return { columns: [], rows: [], error: 'Only read-only SELECT queries are supported in this lab.' }
    const result = executeSelect(trimmed, tables)
    return result
  } catch (e: any) {
    return { columns: [], rows: [], error: e.message }
  }
}

interface SQLLabProps {
  tables: Record<string, Table>
  initialQuery?: string
  sampleQueries?: { label: string; query: string; insight?: string }[]
  title?: string
}

export function SQLLab({ tables, initialQuery, sampleQueries = [], title = 'SQL Execution Lab' }: SQLLabProps) {
  const [query, setQuery] = React.useState(initialQuery || sampleQueries[0]?.query || `SELECT * FROM ${Object.keys(tables)[0]} LIMIT 5;`)
  const [result, setResult] = React.useState<{ columns: string[]; rows: Row[]; error?: string } | null>(null)
  const [activeTable, setActiveTable] = React.useState(Object.keys(tables)[0])

  const run = () => setResult(executeSQL(query, tables))

  React.useEffect(() => {
    if (!result) run()
  }, [])

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
        <Database className="w-4 h-4 text-ai-cyan" />
        <h4 className="font-semibold text-sm">{title}</h4>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-ai-green/15 text-ai-green font-semibold uppercase">Read-only · Live</span>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] divide-x divide-border">
        {/* Schema */}
        <div className="p-3 max-h-[200px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Schema</p>
          <div className="space-y-2">
            {Object.entries(tables).map(([name, t]) => (
              <div key={name}>
                <button
                  onClick={() => setActiveTable(name)}
                  className={cn(
                    'w-full flex items-center gap-1.5 text-xs font-mono font-semibold px-2 py-1 rounded',
                    activeTable === name ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40'
                  )}
                >
                  <Table2 className="w-3 h-3" /> {name}
                </button>
                {activeTable === name && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {t.columns.map((c) => (
                      <div key={c.name} className="text-[10px] font-mono text-muted-foreground flex justify-between">
                        <span>{c.name}</span>
                        <span className="text-ai-cyan">{c.type}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground italic mt-1">{t.rows.length} rows</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor + Result */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Query</p>
              <Button size="sm" onClick={run}><Play className="w-3 h-3 mr-1" /> Run</Button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run()
              }}
              className="w-full h-24 rounded-md bg-[#0d1117] text-[#e6edf3] font-mono text-xs p-3 border border-border resize-y custom-scrollbar"
              placeholder="SELECT * FROM ... LIMIT 10;"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Press Ctrl/Cmd+Enter to run</p>
          </div>

          {sampleQueries.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Sample queries</p>
              <div className="flex flex-wrap gap-1.5">
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(sq.query); }}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted/40 transition-colors"
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="fade-in">
              {result.error ? (
                <div className="rounded-lg bg-ai-red/5 border border-ai-red/30 p-3 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-ai-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-ai-red mb-0.5">Query error</p>
                    <p className="text-xs font-mono text-foreground/80">{result.error}</p>
                  </div>
                </div>
              ) : result.rows.length === 0 ? (
                <div className="rounded-lg bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                  Query executed successfully — 0 rows returned.
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-1.5 bg-ai-green/10 text-[11px] text-ai-green font-semibold border-b border-border flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> {result.rows.length} row(s) returned
                  </div>
                  <div className="overflow-x-auto custom-scrollbar max-h-72">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 sticky top-0">
                        <tr>
                          {result.columns.map((c) => (
                            <th key={c} className="text-left px-3 py-1.5 font-mono font-semibold border-b border-border">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {result.rows.map((r, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            {result.columns.map((c) => (
                              <td key={c} className="px-3 py-1.5 font-mono">{r[c] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insight for active sample */}
          {sampleQueries.find((sq) => sq.query.trim() === query.trim())?.insight && (
            <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 flex gap-2 items-start">
              <Lightbulb className="w-4 h-4 text-ai-blue shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-ai-blue mb-0.5">Business insight</p>
                <p className="text-xs text-foreground/80">{sampleQueries.find((sq) => sq.query.trim() === query.trim())!.insight}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
