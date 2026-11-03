'use client'

import * as React from 'react'
import { Sparkles, Play, RotateCcw, Lightbulb, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

interface CompletionExercise {
  id: string
  title: string
  prompt: string
  starterCode: string
  // The "ghost text" Copilot would suggest, shown in grey
  suggestions: string[]
  // The correct completed code
  completed: string
  explanation: string
}

const EXERCISES: CompletionExercise[] = [
  {
    id: 'groupby',
    title: 'Group by product',
    prompt: 'You have a sales DataFrame. Write a comment asking Copilot to group by product and sum revenue.',
    starterCode: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Group by product and sum revenue\n',
    suggestions: [
      'result = df.groupby("product")["revenue"].sum()',
      'result = df.groupby("product", as_index=False)["revenue"].sum()',
      'result = df.groupby("product")["revenue"].sum().sort_values(ascending=False)',
    ],
    completed: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Group by product and sum revenue\nresult = df.groupby("product")["revenue"].sum().sort_values(ascending=False)\nprint(result)',
    explanation: 'Copilot suggests the most common pattern first (groupby + sum). Press Alt+] to cycle through alternatives: the third option adds sorting, which is usually what you want for "top products" analysis.',
  },
  {
    id: 'function',
    title: 'Generate a function',
    prompt: 'Type a function signature and let Copilot complete the body.',
    starterCode: 'def top_n_products(df, n=5):\n    """Return the top N products by revenue."""\n    ',
    suggestions: [
      'return df.groupby("product")["revenue"].sum().nlargest(n)',
      'return (df.groupby("product")["revenue"]\n            .sum()\n            .nlargest(n)\n            .reset_index())',
      'return df.groupby("product")["revenue"].sum().sort_values(ascending=False).head(n)',
    ],
    completed: 'def top_n_products(df, n=5):\n    """Return the top N products by revenue."""\n    return (df.groupby("product")["revenue"]\n                .sum()\n                .nlargest(n)\n                .reset_index())',
    explanation: 'The function name + docstring are strong signals. Copilot infers you want a groupby on "product" summing "revenue", limited to n. The second suggestion uses method chaining and returns a DataFrame (more useful than a Series for downstream code).',
  },
  {
    id: 'cleaning',
    title: 'Data cleaning',
    prompt: 'Write a comment describing a cleaning operation. Copilot suggests the implementation.',
    starterCode: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Drop duplicate order_id rows and fill missing revenue with 0\n',
    suggestions: [
      'df = df.drop_duplicates(subset="order_id")\ndf["revenue"] = df["revenue"].fillna(0)',
      'df = df.drop_duplicates()\ndf["revenue"].fillna(0, inplace=True)',
      'df.drop_duplicates(subset="order_id", inplace=True)\ndf["revenue"] = df["revenue"].fillna(0)',
    ],
    completed: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Drop duplicate order_id rows and fill missing revenue with 0\ndf = df.drop_duplicates(subset="order_id")\ndf["revenue"] = df["revenue"].fillna(0)\nprint(f"Rows after cleaning: {len(df)}")',
    explanation: 'The comment specifies "duplicate order_id rows" — Copilot picks up the subset="order_id" hint. The first suggestion is safest (returns a new DataFrame, no inplace). The second uses drop_duplicates() without subset, which would drop fully identical rows only.',
  },
]

export function CodeCompletionPlayground() {
  const [exIdx, setExIdx] = React.useState(0)
  const [code, setCode] = React.useState(EXERCISES[0].starterCode)
  const [suggestionIdx, setSuggestionIdx] = React.useState(0)
  const [accepted, setAccepted] = React.useState(false)
  const [showSuggestion, setShowSuggestion] = React.useState(false)

  const ex = EXERCISES[exIdx]
  const currentSuggestion = ex.suggestions[suggestionIdx]

  const switchExercise = (i: number) => {
    setExIdx(i)
    setCode(EXERCISES[i].starterCode)
    setSuggestionIdx(0)
    setAccepted(false)
    setShowSuggestion(false)
  }

  const triggerSuggestion = () => {
    setShowSuggestion(true)
    setAccepted(false)
    setSuggestionIdx(0)
  }

  const cycleSuggestion = () => {
    setSuggestionIdx((i) => (i + 1) % ex.suggestions.length)
  }

  const accept = () => {
    setCode(ex.starterCode + currentSuggestion + '\n')
    setAccepted(true)
    setShowSuggestion(false)
  }

  const reject = () => {
    setShowSuggestion(false)
  }

  const reset = () => {
    setCode(ex.starterCode)
    setAccepted(false)
    setShowSuggestion(false)
    setSuggestionIdx(0)
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-purple" /> Code Completion Playground
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Simulated Copilot inline suggestions. Tab = accept, Esc = reject, Alt+] = next suggestion.</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Exercise picker */}
        <div className="flex flex-wrap gap-1.5">
          {EXERCISES.map((e, i) => (
            <button
              key={e.id}
              onClick={() => switchExercise(i)}
              className={cn(
                'text-[11px] px-2 py-1 rounded-full border transition-colors',
                exIdx === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
              )}
            >
              {e.title}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-1">Task</p>
          <p className="text-sm text-foreground/90">{ex.prompt}</p>
        </div>

        {/* Editor with ghost text */}
        <div className="rounded-lg overflow-hidden border border-border bg-[#0d1117]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
            <span className="text-xs text-gray-400 font-mono">analysis.py</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs h-7" onClick={reset}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
          </div>
          <div className="p-3 font-mono text-xs leading-relaxed text-[#e6edf3] min-h-[140px]">
            <pre className="whitespace-pre-wrap">
              {code}
              {showSuggestion && !accepted && (
                <span className="text-gray-500 italic">{currentSuggestion}</span>
              )}
              {showSuggestion && !accepted && <span className="inline-block w-2 h-3.5 bg-ai-purple/60 ml-0.5 animate-pulse" />}
            </pre>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {!showSuggestion && !accepted && (
            <Button size="sm" onClick={triggerSuggestion}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Trigger Copilot suggestion
            </Button>
          )}
          {showSuggestion && !accepted && (
            <>
              <Button size="sm" variant="default" onClick={accept}>
                <span className="mr-1">⇥</span> Tab — Accept
              </Button>
              <Button size="sm" variant="outline" onClick={reject}>
                Esc — Reject
              </Button>
              <Button size="sm" variant="outline" onClick={cycleSuggestion}>
                Alt+] — Next suggestion ({suggestionIdx + 1}/{ex.suggestions.length})
              </Button>
            </>
          )}
        </div>

        {/* Result */}
        {accepted && (
          <div className="fade-in space-y-2">
            <div className="rounded-lg bg-ai-green/5 border border-ai-green/20 p-2.5 flex items-center gap-2">
              <span className="text-ai-green text-xs font-semibold">✓ Suggestion accepted</span>
            </div>
            <CodeBlock code={code} language="python" title="analysis.py — accepted" maxHeight="180px" />
          </div>
        )}

        {/* Explanation */}
        {accepted && (
          <div className="rounded-lg bg-muted/40 p-3 fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-ai-blue" /> Why this suggestion?
            </p>
            <p className="text-xs text-foreground/90 leading-relaxed">{ex.explanation}</p>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="rounded-lg bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
          <p className="font-semibold mb-1">Keyboard shortcuts (simulated):</p>
          <div className="grid grid-cols-3 gap-1">
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Tab</kbd> Accept</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Esc</kbd> Reject</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Alt+]</kbd> Next suggestion</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-xs text-muted-foreground">Exercise {exIdx + 1} of {EXERCISES.length}</span>
          <Button size="sm" variant="ghost" onClick={() => switchExercise((exIdx + 1) % EXERCISES.length)}>
            Next exercise <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
