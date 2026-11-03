// Standalone test for the SQL engine (JOIN fix verification).
// Inlines the parser+executor from src/components/labs/sql-lab.tsx and runs
// a series of known-answer tests against the sample tables.

const retailSales = [
  { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product: 'Wireless Mouse', category: 'Electronics', region: 'West', quantity: 2, unit_price: 25.99, revenue: 51.98, cost: 30.00, profit: 21.98 },
  { order_id: 1002, order_date: '2024-01-07', customer_id: 'C002', product: 'Office Chair', category: 'Furniture', region: 'East', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { order_id: 1003, order_date: '2024-01-08', customer_id: 'C003', product: 'Notebook', category: 'Stationery', region: 'North', quantity: 5, unit_price: 4.50, revenue: 22.50, cost: 12.00, profit: 10.50 },
  { order_id: 1004, order_date: '2024-01-12', customer_id: 'C001', product: 'USB-C Cable', category: 'Electronics', region: 'West', quantity: 3, unit_price: 9.99, revenue: 29.97, cost: 15.00, profit: 14.97 },
  { order_id: 1005, order_date: '2024-01-15', customer_id: 'C004', product: 'Desk Lamp', category: 'Furniture', region: 'South', quantity: 2, unit_price: 32.00, revenue: 64.00, cost: 38.00, profit: 26.00 },
  { order_id: 1006, order_date: '2024-01-18', customer_id: 'C002', product: 'Wireless Mouse', category: 'Electronics', region: 'East', quantity: 1, unit_price: 25.99, revenue: 25.99, cost: 15.00, profit: 10.99 },
  { order_id: 1007, order_date: '2024-01-22', customer_id: 'C005', product: 'Coffee Mug', category: 'Kitchen', region: 'West', quantity: 4, unit_price: 8.50, revenue: 34.00, cost: 18.00, profit: 16.00 },
  { order_id: 1008, order_date: '2024-01-25', customer_id: 'C003', product: 'Office Chair', category: 'Furniture', region: 'North', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { order_id: 1009, order_date: '2024-02-02', customer_id: 'C006', product: 'Notebook', category: 'Stationery', region: 'East', quantity: 10, unit_price: 4.50, revenue: 45.00, cost: 24.00, profit: 21.00 },
  { order_id: 1010, order_date: '2024-02-05', customer_id: 'C001', product: 'USB-C Cable', category: 'Electronics', region: 'West', quantity: 2, unit_price: 9.99, revenue: 19.98, cost: 10.00, profit: 9.98 },
]
const customers = [
  { customer_id: 'C001', name: 'Acme Corp', tier: 'Gold', signup_date: '2023-05-12' },
  { customer_id: 'C002', name: 'Beta LLC', tier: 'Silver', signup_date: '2023-08-01' },
  { customer_id: 'C003', name: 'Gamma Inc', tier: 'Silver', signup_date: '2023-09-22' },
  { customer_id: 'C004', name: 'Delta Co', tier: 'Gold', signup_date: '2023-11-15' },
  { customer_id: 'C005', name: 'Epsilon Ltd', tier: 'Bronze', signup_date: '2024-01-03' },
  { customer_id: 'C006', name: 'Zeta GmbH', tier: 'Gold', signup_date: '2024-02-10' },
]

const tables = {
  sales: { name: 'sales', columns: [], rows: retailSales },
  customers: { name: 'customers', columns: [], rows: customers },
}

// --- inlined engine (copied from src/components/labs/sql-lab.tsx) ---

function evalCondition(row, expr) {
  const tokens = expr.split(/\s+(AND|OR)\s+/i)
  let result = null
  let op = 'AND'
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k]
    if (t.toUpperCase() === 'AND' || t.toUpperCase() === 'OR') { op = t.toUpperCase(); continue }
    const m = t.match(/^(\w+(?:\.\w+)?)\s*(>=|<=|!=|<>|=|>|<|LIKE|IS\s+NOT\s+NULL|IS\s+NULL)\s*(.+)$/i)
    if (!m) continue
    let [, col, operator, val] = m
    col = col.trim(); operator = operator.toUpperCase()
    val = val.trim().replace(/^'|'$/g, '')
    let cell = row[col]
    if (cell === undefined && col.includes('.')) {
      cell = row[col] ?? row[col.split('.')[1]]
      if (cell === undefined) {
        const colName = col.split('.')[1]
        for (const rk of Object.keys(row)) { if (rk.endsWith('.' + colName)) { cell = row[rk]; break } }
      }
    }
    let cond = false
    if (operator === 'IS NULL') cond = cell == null
    else if (operator === 'IS NOT NULL') cond = cell != null
    else if (operator === 'LIKE') { const re = new RegExp('^' + val.replace(/%/g, '.*').replace(/_/g, '.') + '$'); cond = re.test(String(cell)) }
    else {
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

function splitClauses(rest) {
  const keywords = ['WHERE', 'GROUP\\s+BY', 'HAVING', 'ORDER\\s+BY', 'LIMIT']
  const re = new RegExp(`\\s+(${keywords.join('|')})\\s+`, 'i')
  const parts = []; let buf = ''; let i = 0; let inStr = null
  while (i < rest.length) {
    const c = rest[i]
    if (inStr) { buf += c; if (c === inStr && rest[i - 1] !== '\\') inStr = null; i++; continue }
    if (c === "'" || c === '"' || c === '`') { inStr = c; buf += c; i++; continue }
    const remaining = rest.slice(i)
    const m = re.exec(remaining)
    if (m && m.index === 0) { parts.push(buf); parts.push(m[1].toUpperCase().replace(/\s+/g, ' ')); i += m[0].length; buf = ''; continue }
    buf += c; i++
  }
  parts.push(buf)
  return parts
}

function parseTableRef(s) {
  const t = s.trim().replace(/;$/, '')
  const m = t.match(/^(\w+)(?:\s+(?:AS\s+)?(\w+))?$/i)
  if (!m) return { table: t }
  return { table: m[1], alias: m[2] }
}

function parseSelect(sql) {
  const upper = sql.toUpperCase()
  if (!upper.startsWith('SELECT')) throw new Error('Only SELECT statements are supported.')
  if (/\bOVER\s*\(/i.test(sql)) throw new Error('Window functions (OVER clause) are not supported in this lab.')
  if (/\bUNION\b/i.test(upper)) throw new Error('UNION is not supported in this lab.')
  const colEnd = upper.indexOf(' FROM ')
  if (colEnd < 0) throw new Error('Missing FROM clause.')
  const colPart = sql.slice(6, colEnd).trim()
  const rest = sql.slice(colEnd + 6).trim()
  const segments = splitClauses(rest)
  const fromPart = segments[0].trim()
  const q = { columns: [], from: '', fromAlias: undefined, joins: undefined, where: undefined, groupBy: undefined, having: undefined, orderBy: undefined, limit: undefined }
  const joinTokens = fromPart.split(/\s+(INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+|OUTER\s+|CROSS\s+)?JOIN\s+/i)
  const baseRef = parseTableRef(joinTokens[0])
  q.from = baseRef.table; q.fromAlias = baseRef.alias
  if (joinTokens.length > 1) {
    q.joins = []
    for (let i = 1; i < joinTokens.length; i += 2) {
      const joinTypeRaw = (joinTokens[i] || 'INNER').trim().toUpperCase().replace(/\s+/g, ' ')
      const joinType = joinTypeRaw === 'OUTER' ? 'FULL OUTER' : (joinTypeRaw || 'INNER')
      const rest2 = joinTokens[i + 1]
      const onMatch = rest2.match(/^(.+?)\s+ON\s+(.+)$/i)
      if (!onMatch) throw new Error(`JOIN missing ON clause: ${rest2}`)
      const tableRef = parseTableRef(onMatch[1].trim())
      const onCond = onMatch[2].trim()
      const onParts = onCond.split(/\s*=\s*/)
      if (onParts.length !== 2) throw new Error(`Only simple equality JOIN ON conditions are supported. Got: ${onCond}`)
      q.joins.push({ type: joinType, table: tableRef.table, alias: tableRef.alias, onLeft: onParts[0].trim(), onRight: onParts[1].trim() })
    }
  }
  const aggMatch = colPart.match(/(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([^)]+?)\s*\)(?:\s+AS\s+(\w+))?/gi)
  q.agg = aggMatch?.map((a) => { const m = a.match(/(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([^)]+?)\s*\)(?:\s+AS\s+(\w+))?/i); return { fn: m[1].toUpperCase(), col: m[2].trim(), alias: m[3] } })
  if (colPart === '*') q.columns = ['*']
  else q.columns = colPart.split(',').map((c) => c.trim().replace(/\s+AS\s+\w+/i, '').replace(/^"|"$/g, ''))
  for (let i = 1; i < segments.length; i += 2) {
    const kw = segments[i].toUpperCase().replace(/\s+/g, ' ')
    const val = segments[i + 1]?.trim().replace(/;$/, '') || ''
    if (kw === 'WHERE') q.where = val
    else if (kw === 'GROUP BY') q.groupBy = val.split(',').map((c) => c.trim())
    else if (kw === 'HAVING') q.having = val
    else if (kw === 'ORDER BY') { q.orderBy = val.split(',').map((c) => { const p = c.trim().split(/\s+/); return { col: p[0], dir: (p[1] || 'ASC').toUpperCase() } }) }
    else if (kw === 'LIMIT') q.limit = parseInt(val, 10)
  }
  return q
}

function resolveCol(row, col, aliasMap) {
  if (col in row) return row[col]
  if (col.includes('.')) {
    const [, colName] = col.split('.')
    const qualified = `${col.split('.')[0]}.${colName}`
    if (qualified in row) return row[qualified]
    if (colName in row) return row[colName]
  }
  return undefined
}

function executeSelect(sql, tables) {
  const q = parseSelect(sql)
  const base = tables[q.from]
  if (!base) throw new Error(`Table "${q.from}" not found.`)
  const aliasMap = {}
  if (q.fromAlias) aliasMap[q.fromAlias] = q.from
  q.joins?.forEach((j) => { if (j.alias) aliasMap[j.alias] = j.table })
  let rows = base.rows.map((r) => ({ ...r }))
  if (q.joins) {
    for (const j of q.joins) {
      const right = tables[j.table]
      if (!right) throw new Error(`Table "${j.table}" not found.`)
      const joined = []
      for (const lr of rows) {
        let matched = false
        for (const rr of right.rows) {
          const lv = resolveCol(lr, j.onLeft, aliasMap)
          const rv = resolveCol(rr, j.onRight, aliasMap)
          if (lv === rv && lv !== undefined) {
            const merged = { ...lr }
            for (const [k, v] of Object.entries(rr)) {
              const qk = `${j.alias || j.table}.${k}`
              merged[qk] = v
              if (!(k in merged)) merged[k] = v
            }
            joined.push(merged); matched = true
          }
        }
        if (!matched && (j.type === 'LEFT' || j.type === 'LEFT OUTER')) joined.push(lr)
      }
      rows = joined
    }
  }
  if (q.where) rows = rows.filter((r) => evalCondition(r, q.where))
  let outCols
  if (q.groupBy || q.agg) {
    const groups = new Map()
    const keys = q.groupBy || []
    for (const r of rows) {
      const k = keys.map((kk) => resolveCol(r, kk, aliasMap)).join('||')
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k).push(r)
    }
    const out = []
    for (const [k, group] of groups) {
      const row = {}
      keys.forEach((kk, i) => { const ok = kk.includes('.') ? kk.split('.')[1] : kk; row[ok] = k.split('||')[i] })
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
  if (q.having) rows = rows.filter((r) => evalCondition(r, q.having))
  if (q.orderBy) {
    rows.sort((a, b) => {
      for (const o of q.orderBy) {
        const av = resolveCol(a, o.col, aliasMap); const bv = resolveCol(b, o.col, aliasMap)
        if (av === bv) continue
        if (av == null) return 1; if (bv == null) return -1
        const cmp = av > bv ? 1 : -1
        return o.dir === 'DESC' ? -cmp : cmp
      }
      return 0
    })
  }
  if (q.limit != null) rows = rows.slice(0, q.limit)
  if (outCols && outCols.length > 0 && q.columns[0] !== '*') {
    rows = rows.map((r) => {
      const proj = {}
      outCols.forEach((c) => {
        if (c in r) proj[c] = r[c]
        else { for (const rk of Object.keys(r)) { if (rk.endsWith('.' + c)) { proj[c] = r[rk]; break } } }
      })
      return proj
    })
  }
  return { columns: outCols, rows }
}

function executeSQL(sql, tables) {
  try {
    const trimmed = sql.trim().replace(/;$/, '')
    if (!/^SELECT/i.test(trimmed)) return { columns: [], rows: [], error: 'Only read-only SELECT' }
    return executeSelect(trimmed, tables)
  } catch (e) { return { columns: [], rows: [], error: e.message } }
}

// --- tests ---

let passed = 0, failed = 0
function check(name, sql, expected) {
  const r = executeSQL(sql, tables)
  if (r.error) { console.error(`FAIL: ${name} — error: ${r.error}`); failed++; return }
  const actual = JSON.stringify(r.rows)
  const exp = JSON.stringify(expected)
  if (actual !== exp) {
    console.error(`FAIL: ${name}`)
    console.error(`  expected: ${exp}`)
    console.error(`  actual:   ${actual}`)
    failed++
  } else { console.log(`PASS: ${name}`); passed++ }
}
// Like check() but rounds numeric values to 2 decimals before comparing
function checkRounded(name, sql, expected) {
  const r = executeSQL(sql, tables)
  if (r.error) { console.error(`FAIL: ${name} — error: ${r.error}`); failed++; return }
  const round = (rows) => rows.map((row) => {
    const out = {}
    for (const [k, v] of Object.entries(row)) out[k] = typeof v === 'number' ? Math.round(v * 100) / 100 : v
    return out
  })
  const actual = JSON.stringify(round(r.rows))
  const exp = JSON.stringify(round(expected))
  if (actual !== exp) {
    console.error(`FAIL: ${name}`)
    console.error(`  expected: ${exp}`)
    console.error(`  actual:   ${actual}`)
    failed++
  } else { console.log(`PASS: ${name}`); passed++ }
}
function checkError(name, sql) {
  const r = executeSQL(sql, tables)
  if (r.error) { console.log(`PASS: ${name} (errored as expected: ${r.error.slice(0, 60)})`); passed++ }
  else { console.error(`FAIL: ${name} — expected error but got rows: ${JSON.stringify(r.rows).slice(0, 100)}`); failed++ }
}
function checkRuns(name, sql) {
  const r = executeSQL(sql, tables)
  if (r.error) { console.error(`FAIL: ${name} — error: ${r.error}`); failed++ }
  else { console.log(`PASS: ${name} (${r.rows.length} rows)`); passed++ }
}
function round2(v) { return Math.round(v * 100) / 100 }

// 1. Simple SELECT with LIMIT
check('select-all-limit3', 'SELECT order_id, product FROM sales LIMIT 3',
  [{ order_id: 1001, product: 'Wireless Mouse' }, { order_id: 1002, product: 'Office Chair' }, { order_id: 1003, product: 'Notebook' }])

// 2. WHERE + ORDER BY
check('where-revenue', "SELECT product, revenue FROM sales WHERE revenue > 100 ORDER BY revenue DESC",
  [{ product: 'Office Chair', revenue: 149.99 }, { product: 'Office Chair', revenue: 149.99 }])

// 3. GROUP BY no join — verify with rounded values
check('groupby-region', 'SELECT region, SUM(revenue) AS total FROM sales GROUP BY region ORDER BY total DESC',
  [
    { region: 'East', total: 149.99 + 25.99 + 45.00 },        // 220.98
    { region: 'North', total: 22.50 + 149.99 },               // 172.49
    { region: 'West', total: 51.98 + 29.97 + 34.00 + 19.98 }, // 135.93
    { region: 'South', total: 64.00 },
  ])

// 4. INNER JOIN with aliases (the bug case) — use rounded comparison for float
checkRounded('join-alias', 'SELECT c.tier, SUM(s.revenue) AS rev FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.tier ORDER BY rev DESC',
  [
    { tier: 'Silver', rev: (149.99 + 25.99) + (22.50 + 149.99) }, // C002+C003 = 348.47
    { tier: 'Gold', rev: (51.98 + 29.97 + 19.98) + 64.00 + 45.00 }, // C001+C004+C006 = 210.93
    { tier: 'Bronze', rev: 34.00 },                                // C005
  ])

// 5. JOIN without aliases
check('join-no-alias', 'SELECT customers.name, sales.revenue FROM sales JOIN customers ON sales.customer_id = customers.customer_id WHERE sales.revenue > 100 ORDER BY sales.revenue DESC',
  [
    { name: 'Beta LLC', revenue: 149.99 },
    { name: 'Gamma Inc', revenue: 149.99 },
  ])

// 6. JOIN with AS keyword, single-quoted string
check('join-as', "SELECT c.name FROM sales AS s JOIN customers AS c ON s.customer_id = c.customer_id WHERE s.product = 'Wireless Mouse'",
  [{ name: 'Acme Corp' }, { name: 'Beta LLC' }])

// 7. JOIN with COUNT(*)
check('join-count', 'SELECT COUNT(*) AS cnt FROM sales s JOIN customers c ON s.customer_id = c.customer_id',
  [{ cnt: 10 }])

// 8. LEFT JOIN
check('left-join', 'SELECT COUNT(*) AS cnt FROM sales s LEFT JOIN customers c ON s.customer_id = c.customer_id',
  [{ cnt: 10 }])

// 9. Non-existent table should error
checkError('bad-table', 'SELECT * FROM nonexistent')

// 10. GROUP BY with multiple aggs runs without error
checkRuns('multi-agg', 'SELECT region, COUNT(*) AS orders, AVG(revenue) AS avg_rev FROM sales GROUP BY region')

// 11. Top 3 products by revenue
checkRounded('top3', 'SELECT product, SUM(revenue) AS total FROM sales GROUP BY product ORDER BY total DESC LIMIT 3',
  [
    { product: 'Office Chair', total: 299.98 },
    { product: 'Wireless Mouse', total: 77.97 },
    { product: 'Notebook', total: 67.50 },
  ])

// 12. HAVING
checkRuns('having', 'SELECT region, COUNT(*) AS cnt FROM sales GROUP BY region HAVING cnt > 2')

// 13. Window function (ROW_NUMBER) — should error gracefully (not supported)
checkError('window-fn', 'SELECT ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rnk FROM sales')

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
