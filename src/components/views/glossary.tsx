'use client'

import * as React from 'react'
import { BookOpen, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GlossaryTerm {
  term: string
  category: 'Git' | 'Copilot' | 'Pandas' | 'SQL' | 'Python' | 'Agents' | 'General'
  def: string
}

const TERMS: GlossaryTerm[] = [
  // Git
  { term: 'Branch', category: 'Git', def: 'A lightweight movable pointer to a commit. Lets you work in isolation without affecting main.' },
  { term: 'Commit', category: 'Git', def: 'A snapshot of your project at a point in time, identified by a SHA-1 hash.' },
  { term: 'Conflict (merge)', category: 'Git', def: 'When two branches modify the same lines and Git cannot auto-merge. Resolved by editing the file and removing conflict markers.' },
  { term: 'Fork', category: 'Git', def: 'A personal copy of someone else\'s repository on GitHub. You can edit your fork and propose changes back via PR.' },
  { term: 'HEAD', category: 'Git', def: 'A pointer to the current commit your working tree is based on. Usually the tip of the current branch.' },
  { term: 'Merge', category: 'Git', def: 'Combining two branches. Creates a merge commit preserving both histories.' },
  { term: 'Pull Request (PR)', category: 'Git', def: 'A proposal to merge a feature branch into another branch (usually main). Enables review and CI before merge.' },
  { term: 'Rebase', category: 'Git', def: 'Replays your branch commits on top of another branch. Produces linear history but rewrites commit hashes.' },
  { term: 'Remote', category: 'Git', def: 'A version of your repository hosted elsewhere (e.g. GitHub). origin is the default name.' },
  { term: 'Repository', category: 'Git', def: 'A folder Git is tracking. Contains a hidden .git folder with all history.' },
  { term: 'Staging Area', category: 'Git', def: 'The holding area for the next commit. Populated by git add. Also called the index.' },
  { term: 'Working Directory', category: 'Git', def: 'The files on your disk that you are editing. Modified files appear in git status.' },
  // Copilot
  { term: 'Agent Mode', category: 'Copilot', def: 'A Copilot mode where the AI pursues a multi-step task using tools (read, edit, run) with human approval.' },
  { term: 'Ghost Text', category: 'Copilot', def: 'The greyed-out inline suggestion Copilot shows as you type. Tab accepts; Esc dismisses.' },
  { term: 'Inline Chat', category: 'Copilot', def: 'Copilot chat invoked inside the editor (Cmd/Ctrl+I) on the current selection. Returns a diff.' },
  { term: 'Smart Actions', category: 'Copilot', def: 'Inline buttons above code: Explain, Fix, Refactor, Generate Docs, Generate Tests.' },
  { term: 'Workspace Context', category: 'Copilot', def: 'Information about your open files and project that Copilot uses to make better suggestions.' },
  { term: 'Custom Instructions', category: 'Copilot', def: 'A .github/copilot-instructions.md file describing your project conventions. Auto-included in context.' },
  { term: 'MCP', category: 'Copilot', def: 'Model Context Protocol — an open standard for agents to talk to external tools (databases, Jira, APIs).' },
  // Pandas
  { term: 'DataFrame', category: 'Pandas', def: 'A 2D labeled table with columns of potentially different types. The core Pandas data structure.' },
  { term: 'Series', category: 'Pandas', def: 'A 1D labeled array. A single DataFrame column is a Series.' },
  { term: 'groupby', category: 'Pandas', def: 'Splits data into groups, applies a function (sum, mean, count), and combines the result.' },
  { term: 'SettingWithCopyWarning', category: 'Pandas', def: 'Warning when assigning to a DataFrame that is a view of another. Fix with .copy() before assigning.' },
  { term: 'iloc vs loc', category: 'Pandas', def: 'iloc uses integer positions; loc uses labels. loc includes the end; iloc does not.' },
  { term: 'apply', category: 'Pandas', def: 'Apply a function along an axis (rows or columns). Slower than vectorized ops but flexible.' },
  { term: 'pivot_table', category: 'Pandas', def: 'Reshape data: rows = one column, columns = another, values = aggregated. Like Excel pivot.' },
  { term: 'merge', category: 'Pandas', def: 'Combine two DataFrames on a key. Equivalent to SQL JOIN. Use how="left"/"right"/"inner"/"outer".' },
  // SQL
  { term: 'CTE', category: 'SQL', def: 'Common Table Expression — a named subquery defined with WITH. Improves readability of multi-step queries.' },
  { term: 'JOIN', category: 'SQL', def: 'Combine rows from two tables based on a related column. Types: INNER, LEFT, RIGHT, FULL OUTER.' },
  { term: 'Window Function', category: 'SQL', def: 'A function that operates over a "window" of rows (PARTITION BY). Includes ROW_NUMBER, RANK, SUM OVER. Does not collapse rows.' },
  { term: 'Aggregate', category: 'SQL', def: 'A function that reduces many rows to one: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY.' },
  { term: 'Subquery', category: 'SQL', def: 'A query nested inside another query. Can be in WHERE, FROM, or SELECT.' },
  { term: 'HAVING', category: 'SQL', def: 'Like WHERE but applied after aggregation. Use to filter groups.' },
  { term: 'NULL', category: 'SQL', def: 'A missing or unknown value. NULL != NULL; use IS NULL or IS NOT NULL to test.' },
  // Python
  { term: 'List Comprehension', category: 'Python', def: 'A concise way to build a list: [expr for x in iter if cond]. Faster and clearer than a for-loop with .append().' },
  { term: 'Type Hint', category: 'Python', def: 'An annotation specifying a function\'s expected types: def f(x: int) -> str:. Optional but improves readability.' },
  { term: 'Docstring', category: 'Python', def: 'A string literal as the first statement in a function/class/module. Documents purpose, args, returns.' },
  { term: 'Virtual Environment', category: 'Python', def: 'An isolated Python environment with its own packages. Use venv or virtualenv to avoid version conflicts.' },
  { term: 'pytest', category: 'Python', def: 'A popular Python testing framework. Test files start with test_; test functions start with test_.' },
  // Agents
  { term: 'Agent', category: 'Agents', def: 'An AI system that pursues a goal over multiple steps using tools, observing results, and iterating.' },
  { term: 'Agent Loop', category: 'Agents', def: 'Plan → Tool Selection → Action → Observation → Validation → repeat until done.' },
  { term: 'Tool Calling', category: 'Agents', def: 'When an LLM proposes a function call (e.g. edit_file) that the runtime executes and feeds back.' },
  { term: 'Human-in-the-loop', category: 'Agents', def: 'A pattern where humans approve agent actions before they execute. Critical for safety.' },
  // General
  { term: 'EDA', category: 'General', def: 'Exploratory Data Analysis — summarizing a dataset\'s main characteristics, usually with visual methods.' },
  { term: 'Hallucination', category: 'General', def: 'When an AI produces confident but incorrect output — invented APIs, wrong statistics, fabricated references.' },
  { term: 'Prompt Engineering', category: 'General', def: 'Writing clear, structured inputs to an LLM to produce accurate, useful, safe output.' },
  { term: 'TRICK', category: 'General', def: 'A prompt framework: Task, Role, Input, Condition, Knowledge.' },
  { term: 'Outlier', category: 'General', def: 'A data point far from other values. Often defined as < Q1 - 1.5×IQR or > Q3 + 1.5×IQR.' },
  { term: 'Correlation', category: 'General', def: 'A measure of linear relationship between two variables, from -1 to +1. Not causation.' },
  { term: 'Reproducibility', category: 'General', def: 'The ability for someone else (or future you) to re-run your analysis and get the same result. Requires pinned deps, versioned code, and documented data.' },
]

const CATEGORIES = ['All', 'Git', 'Copilot', 'Pandas', 'SQL', 'Python', 'Agents', 'General'] as const

const CATEGORY_COLORS: Record<string, string> = {
  Git: 'bg-ai-orange/15 text-ai-orange',
  Copilot: 'bg-ai-purple/15 text-ai-purple',
  Pandas: 'bg-ai-green/15 text-ai-green',
  SQL: 'bg-ai-cyan/15 text-ai-cyan',
  Python: 'bg-ai-blue/15 text-ai-blue',
  Agents: 'bg-ai-purple/15 text-ai-purple',
  General: 'bg-muted text-muted-foreground',
}

export function GlossaryView() {
  const [query, setQuery] = React.useState('')
  const [cat, setCat] = React.useState<(typeof CATEGORIES)[number]>('All')

  const filtered = TERMS.filter((t) => {
    if (cat !== 'All' && t.category !== cat) return false
    if (query && !t.term.toLowerCase().includes(query.toLowerCase()) && !t.def.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }).sort((a, b) => a.term.localeCompare(b.term))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><BookOpen className="w-6 h-6 text-ai-blue" /> Glossary</h1>
        <p className="text-sm text-muted-foreground">Key terms across Git, Copilot, Pandas, SQL, Python, and Agents. {TERMS.length} terms.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'text-xs px-2.5 py-1.5 rounded-full border transition-colors',
                cat === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No terms match your search.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((t) => (
            <Card key={t.term} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-sm">{t.term}</h3>
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0', CATEGORY_COLORS[t.category])}>
                  {t.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.def}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
