'use client'

import * as React from 'react'
import { Database, ArrowRight, ArrowLeft, Table2, GitBranch, Bug } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { SQLLab } from '@/components/labs/sql-lab'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'
import { sqlTables, SAMPLE_SQL_QUERIES } from '@/lib/data/datasets'

const day = CURRICULUM[6]

export function Day7View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<Database className="w-7 h-7 text-ai-cyan" />}
      />

      <LessonSection id="d7-copilot-sql" title="1. GitHub Copilot for SQL — Natural Language → SQL">
        <ConceptExplorer
          title="Copilot for SQL"
          icon={<Database className="w-4 h-4 text-ai-cyan" />}
          blocks={{
            what: 'Copilot can write SQL from natural-language questions, explain existing queries, debug them, and suggest optimizations — when given the schema as context.',
            why: 'Writing complex JOINs and window functions by hand is error-prone. Copilot accelerates the draft; you verify.',
            when: 'Any time you need to query a database: exploratory analysis, dashboard data prep, ad-hoc questions.',
            how: 'In Copilot Chat, paste the schema (CREATE TABLE statements) and ask your question in plain English. Or write a SQL comment "# Find top 5 products by revenue" and let inline completion draft the query.',
            syntax: '-- Schema: sales(order_id, product, region, revenue, order_date)\n-- Find top 5 products by revenue in Q1 2024\nSELECT product, SUM(revenue) AS total_revenue\nFROM sales\nWHERE order_date BETWEEN \'2024-01-01\' AND \'2024-03-31\'\nGROUP BY product\nORDER BY total_revenue DESC\nLIMIT 5;',
            application: 'A Data Analyst asks Copilot Chat: "Which customers placed the most orders last quarter?" — Copilot drafts a JOIN + GROUP BY + COUNT query against the schema you provided.',
            commonMistakes: ['Not providing the schema — Copilot guesses wrong column names.', 'Trusting JOIN ON clauses — verify they match the foreign key.', 'Forgetting that Copilot cannot run the query — you must execute and validate.'],
            bestPractices: ['Always include the schema in the prompt.', 'Specify the SQL dialect (PostgreSQL, MySQL, SQLite, BigQuery).', 'Run the query on a small LIMIT 10 first to sanity-check.', 'Verify aggregations against a known subset.'],
            limitations: ['Cannot execute SQL — output is a draft, not a result.', 'May pick the wrong JOIN type for the question.', 'Performance optimizations may not match your database\'s actual indexes.'],
            interview: { q: 'How do you prompt Copilot to write a correct SQL query?', a: 'Provide three things: (1) the schema (CREATE TABLE statements or column list with types), (2) the SQL dialect, (3) the natural-language question with any constraints (date range, top N, filters). Then run the query on a small sample and verify the row count and a manual aggregation.' },
          }}
        />

        <CopilotChatSimulator
          title="Natural Language → SQL"
          scenarios={[
            { id: 'nl1', mode: 'generate', title: 'Top 5 products', prompt: 'Schema: sales(order_id, product, region, revenue, order_date). Write SQLite SQL for: top 5 products by total revenue.', response: { text: 'Here is the SQLite query:', code: [{ code: `SELECT product, SUM(revenue) AS total_revenue\nFROM sales\nGROUP BY product\nORDER BY total_revenue DESC\nLIMIT 5;`, language: 'sql' }] } },
            { id: 'nl2', mode: 'generate', title: 'Revenue by region + tier', prompt: 'Schema: sales(order_id, customer_id, revenue) and customers(customer_id, name, tier). Write SQL for: total revenue by customer tier.', response: { text: 'Join the two tables, group by tier, sum revenue:', code: [{ code: `SELECT c.tier, SUM(s.revenue) AS total_revenue\nFROM sales s\nJOIN customers c ON s.customer_id = c.customer_id\nGROUP BY c.tier\nORDER BY total_revenue DESC;`, language: 'sql' }] } },
            { id: 'nl3', mode: 'fix', title: 'Fix a SQL bug', prompt: 'Why does this return 0 rows? SELECT * FROM sales WHERE order_date BETWEEN "01-01-2024" AND "03-31-2024"', response: { text: 'The date format is wrong. SQLite compares dates as strings, so the format must be YYYY-MM-DD to sort correctly:', code: [{ code: `SELECT * FROM sales\nWHERE order_date BETWEEN '2024-01-01' AND '2024-03-31';`, language: 'sql' }] } },
            { id: 'nl4', mode: 'refactor', title: 'Optimize query', prompt: 'Optimize this query for readability: SELECT * FROM sales s, customers c WHERE s.customer_id = c.customer_id AND c.tier = "Gold"', response: { text: 'Use modern JOIN syntax (explicit JOIN instead of comma-join with WHERE), and select only needed columns:', code: [{ code: `SELECT s.order_id, s.product, s.revenue, c.name\nFROM sales s\nINNER JOIN customers c ON s.customer_id = c.customer_id\nWHERE c.tier = 'Gold';`, language: 'sql' }] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d7-lab" title="2. SQL Execution Lab — Run Real Queries">
        <p className="text-sm leading-relaxed mb-3">
          Write and execute read-only SELECT queries against the sample sales, customers, and employees tables. Results are computed live — no fabrication. Press Ctrl/Cmd+Enter to run.
        </p>
        <SQLLab
          tables={sqlTables}
          sampleQueries={SAMPLE_SQL_QUERIES}
          title="SQL Execution Lab — Live read-only engine"
        />
      </LessonSection>

      <LessonSection id="d7-select-where" title="3. SELECT, WHERE, ORDER BY, GROUP BY & Aggregates">
        <div className="grid md:grid-cols-2 gap-3">
          <CodeBlock language="sql" title="SELECT + WHERE" code={`-- High-value orders, newest first\nSELECT order_id, customer_id, product, revenue\nFROM sales\nWHERE revenue > 100\nORDER BY order_date DESC;`} maxHeight="120px" />
          <CodeBlock language="sql" title="GROUP BY + aggregates" code={`-- Revenue & order count per category\nSELECT category,\n       COUNT(*) AS orders,\n       SUM(revenue) AS total_revenue,\n       AVG(revenue) AS avg_order\nFROM sales\nGROUP BY category\nORDER BY total_revenue DESC;`} maxHeight="140px" />
        </div>
        <Callout type="info" title="Aggregate functions">
          <code className="bg-muted px-1 rounded text-xs">COUNT(*)</code> counts rows · <code className="bg-muted px-1 rounded text-xs">SUM(col)</code> totals a numeric column · <code className="bg-muted px-1 rounded text-xs">AVG(col)</code> average · <code className="bg-muted px-1 rounded text-xs">MIN/MAX(col)</code> extremes. All skip NULL except COUNT(*).
        </Callout>
      </LessonSection>

      <LessonSection id="d7-joins" title="4. SQL Joins">
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted/40">
              <tr><th className="p-2 text-left">Join Type</th><th className="p-2 text-left">Returns</th><th className="p-2 text-left">Use When</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="p-2 font-mono">INNER JOIN</td><td className="p-2">Rows matching in both tables</td><td className="p-2">Default — only want matches</td></tr>
              <tr><td className="p-2 font-mono">LEFT JOIN</td><td className="p-2">All left rows + matching right (NULL if no match)</td><td className="p-2">Want all left rows even if no match</td></tr>
              <tr><td className="p-2 font-mono">RIGHT JOIN</td><td className="p-2">All right rows + matching left</td><td className="p-2">Rarely used (use LEFT instead)</td></tr>
              <tr><td className="p-2 font-mono">FULL OUTER</td><td className="p-2">All rows from both, matched where possible</td><td className="p-2">Want everything from both sides</td></tr>
            </tbody>
          </table>
        </div>
        <CodeBlock language="sql" title="INNER JOIN: orders with customer tier" code={`SELECT s.order_id, c.name, c.tier, s.revenue\nFROM sales s\nINNER JOIN customers c ON s.customer_id = c.customer_id\nWHERE c.tier = 'Gold'\nORDER BY s.revenue DESC;`} maxHeight="120px" />
      </LessonSection>

      <LessonSection id="d7-advanced" title="5. Subqueries, CTEs & Window Functions">
        <div className="grid md:grid-cols-2 gap-3">
          <CodeBlock language="sql" title="CTE (WITH clause)" code={`WITH category_totals AS (\n  SELECT category, SUM(revenue) AS total\n  FROM sales\n  GROUP BY category\n)\nSELECT * FROM category_totals\nWHERE total > (SELECT AVG(total) FROM category_totals);`} maxHeight="160px" />
          <CodeBlock language="sql" title="Window function (ROW_NUMBER)" code={`-- Rank orders within each region by revenue\nSELECT order_id, region, revenue,\n  ROW_NUMBER() OVER (\n    PARTITION BY region\n    ORDER BY revenue DESC\n  ) AS rank_in_region\nFROM sales;`} maxHeight="160px" />
        </div>
        <Callout type="tip" title="When to use what">
          <strong>Subquery</strong>: simple lookup. <strong>CTE</strong>: multi-step logic, more readable. <strong>Window function</strong>: per-group rankings, running totals, lag/lead without collapsing rows.
        </Callout>
      </LessonSection>

      <LessonSection id="d7-debug" title="6. SQL Debugging & Query Optimization">
        <ul className="text-sm space-y-2 leading-relaxed">
          <li>🔍 <strong>Run with LIMIT 10 first</strong> — sanity-check before full execution.</li>
          <li>📊 <strong>EXPLAIN QUERY PLAN</strong> — see if indexes are used.</li>
          <li>🎯 <strong>Avoid SELECT *</strong> — name columns; saves memory and clarifies intent.</li>
          <li>⚡ <strong>Filter early</strong> — WHERE before JOIN when possible.</li>
          <li>📅 <strong>Index foreign keys and common filters</strong> — major speedup.</li>
          <li>🚫 <strong>Watch for cartesian products</strong> — missing ON clause = N×M rows.</li>
          <li>🤖 <strong>Ask Copilot:</strong> "Rewrite this query for readability and suggest indexes that would help."</li>
        </ul>
      </LessonSection>

      <LessonSection id="d7-python-sql" title="7. Python + SQL Integration">
        <CodeBlock language="python" title="Pandas + SQLite with Copilot" code={`import pandas as pd\nimport sqlite3\n\n# Connect to SQLite (or use SQLAlchemy for other DBs)\nconn = sqlite3.connect("sales.db")\n\n# Run SQL from Python — results come back as a DataFrame\ndf = pd.read_sql_query(\n    "SELECT product, SUM(revenue) AS total FROM sales GROUP BY product ORDER BY total DESC LIMIT 5",\n    conn\n)\nprint(df)\n\n# Or load the whole table, then use Pandas\ndf_all = pd.read_sql("SELECT * FROM sales", conn)\nresult = df_all.groupby("product")["revenue"].sum().nlargest(5)\n\nconn.close()`} maxHeight="260px" />
        <Callout type="warning" title="SQL injection">
          Never build SQL with f-strings or string concatenation from user input. Use parameterized queries: <code className="bg-muted px-1 rounded text-xs">{'pd.read_sql(query, conn, params={"region": region})'}</code>.
        </Callout>
      </LessonSection>

      <PracticalExercise id="d7-ex" title="Analyze retail sales using SQL queries">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open the SQL Lab above and run the sample queries.</li>
          <li>Write your own query: top 3 regions by profit.</li>
          <li>Use a JOIN to find which Gold-tier customer placed the highest-revenue single order.</li>
          <li>Use a CTE to compute month-over-month revenue growth.</li>
          <li>Use Copilot to suggest a window function: rank products within each region by revenue.</li>
          <li>Validate each query\'s result against a manual calculation on 5 rows.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d7-quiz" questions={[
        { q: 'Which JOIN returns all rows from the left table even if there is no match in the right?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], correct: 1, explanation: 'LEFT JOIN keeps every left-table row; missing right-table columns are filled with NULL. Use it when you want all left rows regardless of matches.' },
        { q: 'What does COUNT(*) do that COUNT(col) does not?', options: ['Nothing — they are identical', 'COUNT(*) counts all rows including NULLs; COUNT(col) skips NULLs in col', 'COUNT(*) is faster', 'COUNT(col) is faster'], correct: 1, explanation: 'COUNT(*) counts every row. COUNT(col) counts non-NULL values in col. Use COUNT(*) for total rows; COUNT(col) for "how many have a value in this column".' },
        { q: 'When should you use a CTE vs a subquery?', options: ['They are always interchangeable', 'CTEs are more readable for multi-step logic; subqueries for simple lookups', 'Subqueries are always better', 'CTEs are deprecated'], correct: 1, explanation: 'CTEs (WITH clause) shine for multi-step logic and self-references. Subqueries are fine for simple scalar lookups. Both compile to the same plan in most databases.' },
        { q: 'What does ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) do?', options: ['Counts rows in the table', 'Numbers rows 1,2,3... within each region, highest revenue first', 'Returns the region name', 'Deletes duplicate rows'], correct: 1, explanation: 'PARTITION BY defines the group; ORDER BY defines the ranking within that group. ROW_NUMBER assigns 1..N per partition.' },
        { q: 'How do you prevent SQL injection when querying from Python?', options: ['Use f-strings', 'Use parameterized queries with placeholders', 'Trust user input', 'Disable the database connection'], correct: 1, explanation: 'Parameterized queries (? or :name placeholders) separate SQL from data, so user input cannot alter the query structure.' },
        { q: 'Your query returns 10x more rows than expected. Most likely cause?', options: ['Missing or wrong JOIN ON clause causing a cartesian product', 'Wrong column name', 'Missing ORDER BY', 'Wrong SQL dialect'], correct: 0, explanation: 'A missing ON clause (or one that always matches) creates a cartesian product: every left row joined to every right row. Always verify JOIN ON clauses.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day6')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 6</button>
        <button onClick={() => setView('day8')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 8 — Python Data Analytics <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
