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
    // Resolve cell: try exact key, then alias.col, then unqualified col
    let cell = row[col]
    if (cell === undefined && col.includes('.')) {
      cell = row[col] ?? row[col.split('.')[1]]
      // also try any qualified key ending with .colName
      if (cell === undefined) {
        const colName = col.split('.')[1]
        for (const rk of Object.keys(row)) {
          if (rk.endsWith('.' + colName)) { cell = row[rk]; break }
        }
      }
    } else if (cell === undefined) {
      // unqualified — try as-is (already done); leave undefined
    }
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
  fromAlias?: string
  joins?: { type: string; table: string; alias?: string; onLeft: string; onRight: string }[]
  where?: string
  groupBy?: string[]
  having?: string
  orderBy?: { col: string; dir: 'ASC' | 'DESC' }[]
  limit?: number
}

// Split a clause string on top-level WHERE/GROUP BY/HAVING/ORDER BY/LIMIT
// (case-insensitive, word-boundary aware) so we don't accidentally split on
// those words inside column names or string literals.
function splitClauses(rest: string): string[] {
  const keywords = ['WHERE', 'GROUP\\s+BY', 'HAVING', 'ORDER\\s+BY', 'LIMIT']
  const re = new RegExp(`\\s+(${keywords.join('|')})\\s+`, 'i')
  // Walk the string and split only when the keyword is not inside a quote.
  const parts: string[] = []
  let buf = ''
  let i = 0
  let inStr: string | null = null
  while (i < rest.length) {
    const c = rest[i]
    if (inStr) {
      buf += c
      if (c === inStr && rest[i - 1] !== '\\') inStr = null
      i++
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = c
      buf += c
      i++
      continue
    }
    // Try to match a keyword at this position
    const remaining = rest.slice(i)
    const m = re.exec(remaining)
    if (m && m.index === 0) {
      parts.push(buf)
      parts.push(m[1].toUpperCase().replace(/\s+/g, ' '))
      i += m[0].length
      buf = ''
      continue
    }
    buf += c
    i++
  }
  parts.push(buf)
  return parts
}

// Parse a "table alias" or "table AS alias" or "table" segment.
// Returns { table, alias }.
function parseTableRef(s: string): { table: string; alias?: string } {
  const t = s.trim().replace(/;$/, '')
  // Match: tablename [AS] alias  OR  tablename
  const m = t.match(/^(\w+)(?:\s+(?:AS\s+)?(\w+))?$/i)
  if (!m) return { table: t }
  return { table: m[1], alias: m[2] }
}

function parseSelect(sql: string): ParsedQuery {
  const upper = sql.toUpperCase()
  if (!upper.startsWith('SELECT')) throw new Error('Only SELECT statements are supported.')
  // Detect unsupported features early with a clear error
  if (/\bOVER\s*\(/i.test(sql)) {
    throw new Error('Window functions (OVER clause) are not supported in this lab. The lab supports SELECT, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, JOIN, and aggregates (COUNT/SUM/AVG/MIN/MAX).')
  }
  if (/\bUNION\b/i.test(upper)) {
    throw new Error('UNION is not supported in this lab.')
  }
  const colEnd = upper.indexOf(' FROM ')
  if (colEnd < 0) throw new Error('Missing FROM clause.')
  const colPart = sql.slice(6, colEnd).trim()
  const rest = sql.slice(colEnd + 6).trim()

  // Split into FROM ... [JOIN ...]* [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...] [LIMIT ...]
  const segments = splitClauses(rest)
  const fromPart = segments[0].trim()
  const q: ParsedQuery = { columns: [], from: '' }

  // Parse FROM and any JOINs from the first segment.
  // A FROM clause looks like: table [alias] [JOIN table [alias] ON cond [JOIN ...]]
  // We tokenize on JOIN keywords (case-insensitive, word boundary).
  const joinTokens = fromPart.split(/\s+(INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+|OUTER\s+|CROSS\s+)?JOIN\s+/i)
  // joinTokens[0] = base table clause; subsequent pairs are [type, table+on]
  const baseRef = parseTableRef(joinTokens[0])
  q.from = baseRef.table
  q.fromAlias = baseRef.alias

  if (joinTokens.length > 1) {
    q.joins = []
    for (let i = 1; i < joinTokens.length; i += 2) {
      const joinTypeRaw = (joinTokens[i] || 'INNER').trim().toUpperCase().replace(/\s+/g, ' ')
      const joinType = joinTypeRaw === 'OUTER' ? 'FULL OUTER' : (joinTypeRaw || 'INNER')
      const rest2 = joinTokens[i + 1]
      // rest2 = table [alias] ON condition
      // Split on the ON keyword (case-insensitive, word boundary, not in quotes)
      const onMatch = rest2.match(/^(.+?)\s+ON\s+(.+)$/i)
      if (!onMatch) throw new Error(`JOIN missing ON clause: ${rest2}`)
      const tableRef = parseTableRef(onMatch[1].trim())
      const onCond = onMatch[2].trim()
      // Parse ON "left = right" (only equality supported)
      const onParts = onCond.split(/\s*=\s*/)
      if (onParts.length !== 2) throw new Error(`Only simple equality JOIN ON conditions are supported. Got: ${onCond}`)
      q.joins.push({
        type: joinType,
        table: tableRef.table,
        alias: tableRef.alias,
        onLeft: onParts[0].trim(),
        onRight: onParts[1].trim(),
      })
    }
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

// Resolve a possibly-qualified column reference against a joined row.
// "s.customer_id" → looks up "s.customer_id" first, then "customer_id".
// Also handles unqualified "customer_id".
function resolveCol(row: Row, col: string, aliasMap: Record<string, string>): any {
  if (col in row) return row[col]
  if (col.includes('.')) {
    const [alias, colName] = col.split('.')
    // Try "alias.colName" key (set during JOIN)
    const qualified = `${alias}.${colName}`
    if (qualified in row) return row[qualified]
    // If alias maps to a table, the unqualified colName from that table may be present
    // only if no other table has the same column name. Fall back to colName.
    if (colName in row) return row[colName]
  }
  return undefined
}

function executeSelect(sql: string, tables: Record<string, Table>): { columns: string[]; rows: Row[] } {
  const q = parseSelect(sql)
  const base = tables[q.from]
  if (!base) throw new Error(`Table "${q.from}" not found.`)

  // Build alias map: alias → table name (for resolving qualified refs)
  const aliasMap: Record<string, string> = {}
  if (q.fromAlias) aliasMap[q.fromAlias] = q.from
  q.joins?.forEach((j) => { if (j.alias) aliasMap[j.alias] = j.table })

  let rows: Row[] = base.rows.map((r) => ({ ...r }))

  // JOIN
  if (q.joins) {
    for (const j of q.joins) {
      const right = tables[j.table]
      if (!right) throw new Error(`Table "${j.table}" not found.`)
      const joined: Row[] = []
      for (const lr of rows) {
        let matched = false
        for (const rr of right.rows) {
          // Evaluate ON condition: left.col = right.col
          const lv = resolveCol(lr, j.onLeft, aliasMap)
          const rv = resolveCol(rr, j.onRight, aliasMap)
          if (lv === rv && lv !== undefined) {
            // Merge: keep left keys, add right keys qualified by alias and unqualified (if no collision)
            const merged: Row = { ...lr }
            for (const [k, v] of Object.entries(rr)) {
              const qualifiedKey = `${j.alias || j.table}.${k}`
              merged[qualifiedKey] = v
              // Only set unqualified key if not already present (left wins)
              if (!(k in merged)) merged[k] = v
            }
            joined.push(merged)
            matched = true
          }
        }
        if (!matched && (j.type === 'LEFT' || j.type === 'LEFT OUTER')) joined.push(lr)
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
      const k = keys.map((kk) => resolveCol(r, kk, aliasMap)).join('||')
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(r)
    }
    const out: Row[] = []
    for (const [k, group] of groups) {
      const row: Row = {}
      keys.forEach((kk, i) => {
        // Strip alias prefix for output column name: "c.tier" → "tier"
        const outKey = kk.includes('.') ? kk.split('.')[1] : kk
        row[outKey] = k.split('||')[i]
      })
      q.agg?.forEach((a) => {
        const col = a.col === '*' ? '*' : a.col
        const vals = group.map((g) => col === '*' ? Object.values(g)[0] : resolveCol(g, col, aliasMap)).filter((v) => v != null && v !== '')
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
    outCols = [...(keys.map((k) => k.includes('.') ? k.split('.')[1] : k)), ...(q.agg?.map((a) => a.alias || `${a.fn.toLowerCase()}_${a.col}`.replace(/[^a-z_]/gi, '')) || [])]
  } else if (q.columns[0] === '*') {
    outCols = base.columns.map((c) => c.name)
  } else {
    outCols = q.columns.map((c) => c.includes('.') ? c.split('.')[1] : c)
  }

  // HAVING
  if (q.having) rows = rows.filter((r) => evalCondition(r, q.having!))

  // ORDER BY
  if (q.orderBy) {
    rows.sort((a, b) => {
      for (const o of q.orderBy!) {
        const av = resolveCol(a, o.col, aliasMap)
        const bv = resolveCol(b, o.col, aliasMap)
        if (av === bv) continue
        if (av == null) return 1
        if (bv == null) return -1
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
      outCols.forEach((c) => {
        // Try direct key, then resolve qualified
        if (c in r) proj[c] = r[c]
        else {
          // Find any qualified key that ends with .c
          for (const rk of Object.keys(r)) {
            if (rk.endsWith('.' + c)) { proj[c] = r[rk]; break }
          }
        }
      })
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
        <span className="text-[10px] px-2 py-0.5 rounded bg-ai-orange/15 text-ai-orange font-semibold uppercase">Synthetic data</span>
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
