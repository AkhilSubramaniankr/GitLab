'use client'

import * as React from 'react'
import { RefreshCw, Languages, CheckCircle2, XCircle, Lightbulb, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

interface ConversionChallenge {
  id: string
  title: string
  category: 'Python→Pandas' | 'Pandas→SQL' | 'Python Refactor'
  description: string
  originalCode: string
  originalLang: string
  // Student selects from these conversion options
  options: {
    code: string
    lang: string
    correct: boolean
    explanation: string
  }[]
  // The correct converted code with explanation
  semanticNotes: string
}

const CHALLENGES: ConversionChallenge[] = [
  {
    id: 'loop-to-pandas',
    title: 'Python loop → Pandas vectorized',
    category: 'Python→Pandas',
    description: 'Convert this manual loop to idiomatic Pandas. Which option is the correct vectorized equivalent?',
    originalCode: 'total = 0\nfor v in df["revenue"]:\n    if v > 0:\n        total += v\nprint(total)',
    originalLang: 'python',
    options: [
      {
        code: 'total = df.loc[df["revenue"] > 0, "revenue"].sum()',
        lang: 'python',
        correct: true,
        explanation: 'Correct. df.loc filters rows where revenue > 0, selects the revenue column, and .sum() computes the total in one vectorized call. This is ~100x faster than the loop on large DataFrames.',
      },
      {
        code: 'total = df["revenue"].sum()',
        lang: 'python',
        correct: false,
        explanation: 'Incorrect. This sums ALL revenue values including negatives (returns/refunds). The original loop skips negative values with the if v > 0 check.',
      },
      {
        code: 'total = sum([v for v in df["revenue"] if v > 0])',
        lang: 'python',
        correct: false,
        explanation: 'Technically correct output, but this is still a loop (list comprehension). It is not vectorized Pandas — it defeats the purpose of the conversion. Use df.loc + .sum().',
      },
    ],
    semanticNotes: 'Pandas .sum() skips NaN by default. The loop would raise TypeError on NaN. Use skipna=True (default) or handle NaN explicitly. Vectorized operations are 100-1000x faster on large DataFrames.',
  },
  {
    id: 'pandas-to-sql',
    title: 'Pandas aggregation → SQL',
    category: 'Pandas→SQL',
    description: 'Convert this Pandas groupby aggregation to an equivalent SQL query.',
    originalCode: 'df.groupby("region")["revenue"] \\\n  .sum() \\\n  .sort_values(ascending=False) \\\n  .head(5)',
    originalLang: 'python',
    options: [
      {
        code: 'SELECT region, SUM(revenue) AS total_revenue\nFROM sales\nGROUP BY region\nORDER BY total_revenue DESC\nLIMIT 5;',
        lang: 'sql',
        correct: true,
        explanation: 'Correct. GROUP BY region corresponds to .groupby("region"); SUM(revenue) corresponds to ["revenue"].sum(); ORDER BY ... DESC corresponds to .sort_values(ascending=False); LIMIT 5 corresponds to .head(5).',
      },
      {
        code: 'SELECT region, revenue FROM sales ORDER BY revenue DESC LIMIT 5;',
        lang: 'sql',
        correct: false,
        explanation: 'Incorrect. This returns individual rows, not aggregated totals per region. Missing GROUP BY and SUM().',
      },
      {
        code: 'SELECT TOP 5 region, SUM(revenue) FROM sales GROUP BY region ORDER BY SUM(revenue) DESC;',
        lang: 'sql',
        correct: false,
        explanation: 'Syntactically valid in SQL Server (TOP), but not standard SQL/SQLite. Also, ORDER BY without an alias on the aggregate is less readable. Use LIMIT and an AS alias.',
      },
    ],
    semanticNotes: 'Pandas .head(5) returns exactly 5 rows. SQL LIMIT 5 does the same. But SQL ORDER BY ties are implementation-defined; Pandas sort is stable. If two regions have equal revenue, their order may differ between Pandas and SQL.',
  },
  {
    id: 'refactor-comprehension',
    title: 'Python refactor: loop → comprehension',
    category: 'Python Refactor',
    description: 'Refactor this for-loop into a list comprehension. Which option preserves behavior exactly?',
    originalCode: 'result = []\nfor order in orders:\n    if order["status"] == "shipped":\n        result.append(order["revenue"] * 1.1)\nprint(result)',
    originalLang: 'python',
    options: [
      {
        code: 'result = [order["revenue"] * 1.1 for order in orders if order["status"] == "shipped"]',
        lang: 'python',
        correct: true,
        explanation: 'Correct. The comprehension [expr for item in iter if cond] exactly mirrors the loop: filter by status == "shipped", then apply revenue * 1.1. Order matters — the if clause comes before the expression in comprehension syntax.',
      },
      {
        code: 'result = [order["revenue"] * 1.1 if order["status"] == "shipped" else 0 for order in orders]',
        lang: 'python',
        correct: false,
        explanation: 'Incorrect. This is a conditional expression (ternary), not a filter. It includes ALL orders, putting 0 for non-shipped ones. The original loop only includes shipped orders.',
      },
      {
        code: 'result = [order["revenue"] * 1.1 for order in orders if order["status"] == "shipped" else 0]',
        lang: 'python',
        correct: false,
        explanation: 'Invalid Python syntax. You cannot mix a filter if with an else in a list comprehension. Either filter (no else) or use a ternary (else required for all items).',
      },
    ],
    semanticNotes: 'List comprehensions are faster than for-loops with .append() because they avoid the method lookup and list resizing. However, very long comprehensions hurt readability — keep them under ~80 characters or use a regular loop.',
  },
  {
    id: 'nested-to-apply',
    title: 'Nested loops → Pandas apply',
    category: 'Python→Pandas',
    description: 'Convert this nested loop (calculating profit margin per row) to a Pandas vectorized operation.',
    originalCode: 'margins = []\nfor i in range(len(df)):\n    rev = df.iloc[i]["revenue"]\n    cost = df.iloc[i]["cost"]\n    if rev > 0:\n        margins.append((rev - cost) / rev)\n    else:\n        margins.append(0)\ndf["margin"] = margins',
    originalLang: 'python',
    options: [
      {
        code: 'df["margin"] = (df["revenue"] - df["cost"]) / df["revenue"]\ndf["margin"] = df["margin"].fillna(0)',
        lang: 'python',
        correct: true,
        explanation: 'Correct. Vectorized arithmetic on columns is the idiomatic Pandas approach. Division by zero produces inf/nan, which .fillna(0) handles. This is ~1000x faster than iloc in a loop.',
      },
      {
        code: 'df["margin"] = df.apply(lambda r: (r["revenue"]-r["cost"])/r["revenue"] if r["revenue"]>0 else 0, axis=1)',
        lang: 'python',
        correct: false,
        explanation: 'Technically correct output, but .apply(axis=1) is a row-wise loop under the hood — it is 10-100x slower than vectorized column arithmetic. Only use apply when vectorized operations are impossible.',
      },
      {
        code: 'for i in range(len(df)):\n    df.loc[i, "margin"] = (df.loc[i, "revenue"] - df.loc[i, "cost"]) / df.loc[i, "revenue"]',
        lang: 'python',
        correct: false,
        explanation: 'Incorrect. This is still a loop using .loc — slower than the original iloc version. Never iterate over a DataFrame when you can use vectorized column operations.',
      },
    ],
    semanticNotes: 'Vectorized column arithmetic is the #1 Pandas performance optimization. The vectorized version runs in C; the loop runs in Python. On a 1M-row DataFrame, the difference is 0.01s vs 30s.',
  },
]

export function CodeConversionLab() {
  const [challengeIdx, setChallengeIdx] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [submitted, setSubmitted] = React.useState(false)

  const challenge = CHALLENGES[challengeIdx]

  const reset = () => { setSelected(null); setSubmitted(false) }
  const next = () => { setChallengeIdx((i) => (i + 1) % CHALLENGES.length); reset() }
  const prev = () => { setChallengeIdx((i) => (i - 1 + CHALLENGES.length) % CHALLENGES.length); reset() }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Languages className="w-4 h-4 text-ai-cyan" /> Interactive Code Conversion Lab
        </h4>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={prev}>Previous</Button>
          <span className="text-xs text-muted-foreground self-center">{challengeIdx + 1} / {CHALLENGES.length}</span>
          <Button size="sm" variant="ghost" onClick={next}>Next</Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Challenge header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
              challenge.category === 'Python→Pandas' && 'bg-ai-purple/15 text-ai-purple',
              challenge.category === 'Pandas→SQL' && 'bg-ai-cyan/15 text-ai-cyan',
              challenge.category === 'Python Refactor' && 'bg-ai-green/15 text-ai-green',
            )}>{challenge.category}</span>
          </div>
          <h5 className="font-semibold text-sm">{challenge.title}</h5>
          <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
        </div>

        {/* Original code */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Original code</p>
          <CodeBlock code={challenge.originalCode} language={challenge.originalLang} title="original" maxHeight="160px" />
        </div>

        {/* Conversion options */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Select the correct conversion</p>
          <div className="space-y-2">
            {challenge.options.map((opt, i) => {
              const showResult = submitted
              const isCorrect = opt.correct
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
                    <span className={cn(
                      'shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold',
                      !showResult && isSelected && 'border-primary bg-primary text-primary-foreground',
                      !showResult && !isSelected && 'border-muted-foreground/40',
                      showResult && isCorrect && 'border-ai-green bg-ai-green text-white',
                      showResult && isSelected && !isCorrect && 'border-ai-red bg-ai-red text-white',
                    )}>
                      {showResult && isCorrect ? <CheckCircle2 className="w-3 h-3" /> : showResult && isSelected && !isCorrect ? <XCircle className="w-3 h-3" /> : String.fromCharCode(65 + i)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <CodeBlock code={opt.code} language={opt.lang} title={`Option ${String.fromCharCode(65 + i)}`} maxHeight="140px" />
                      {(showResult || isSelected) && (
                        <p className={cn('text-xs mt-1.5', isCorrect ? 'text-ai-green' : 'text-muted-foreground')}>{opt.explanation}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit / Reset */}
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)} disabled={selected === null} size="sm">
            <Play className="w-3.5 h-3.5 mr-1" /> Validate conversion
          </Button>
        ) : (
          <div className="space-y-2">
            {/* Semantic notes */}
            <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 flex gap-2 items-start">
              <Lightbulb className="w-3.5 h-3.5 text-ai-blue shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-0.5">Semantic differences & limitations</p>
                <p className="text-xs text-foreground/90 leading-relaxed">{challenge.semanticNotes}</p>
              </div>
            </div>
            <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Try again</Button>
          </div>
        )}
      </div>
    </Card>
  )
}
