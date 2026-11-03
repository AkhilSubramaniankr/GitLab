'use client'

import * as React from 'react'
import { Sparkles, Check, X, ChevronRight, Lightbulb, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SuggestionTrigger {
  id: string
  comment: string
  suggestions: string[]
  explanation: string
}

const TRIGGERS: SuggestionTrigger[] = [
  {
    id: 'load-csv',
    comment: '# Load sales.csv into a DataFrame',
    suggestions: [
      'df = pd.read_csv("sales.csv")',
      'df = pd.read_csv("sales.csv", parse_dates=["order_date"])',
      'df = pd.read_csv("sales.csv", parse_dates=["order_date"], index_col="order_id")',
    ],
    explanation: 'Copilot sees "Load" + "CSV" + "DataFrame" and suggests pd.read_csv(). The second suggestion adds parse_dates because date columns are common in sales data. The third adds index_col — useful if order_id is the primary key.',
  },
  {
    id: 'groupby',
    comment: '# Group by region and sum revenue',
    suggestions: [
      'result = df.groupby("region")["revenue"].sum()',
      'result = df.groupby("region", as_index=False)["revenue"].sum()',
      'result = df.groupby("region")["revenue"].sum().sort_values(ascending=False)',
    ],
    explanation: 'Copilot infers "Group by" → groupby, "region" → the column, "sum revenue" → ["revenue"].sum(). The variations differ in output shape (Series vs DataFrame) and sorting. Read each before accepting.',
  },
  {
    id: 'filter',
    comment: '# Filter orders with revenue greater than 100',
    suggestions: [
      'high_value = df[df["revenue"] > 100]',
      'high_value = df.query("revenue > 100")',
      'high_value = df.loc[df["revenue"] > 100]',
    ],
    explanation: 'All three produce the same result. Copilot offers the boolean-mask form first (most common). The .query() form is more readable for complex conditions. The .loc[] form is explicit about row selection.',
  },
]

export function CodeSuggestionSimulator() {
  const [triggerIdx, setTriggerIdx] = React.useState(0)
  const [typed, setTyped] = React.useState('')
  const [showSuggestion, setShowSuggestion] = React.useState(false)
  const [suggestionIdx, setSuggestionIdx] = React.useState(0)
  const [accepted, setAccepted] = React.useState<string | null>(null)
  const [rejected, setRejected] = React.useState(false)

  const trigger = TRIGGERS[triggerIdx]
  const currentSuggestion = trigger.suggestions[suggestionIdx]

  const startTyping = () => {
    setTyped('')
    setShowSuggestion(false)
    setAccepted(null)
    setRejected(false)
    setSuggestionIdx(0)

    // Simulate typing the comment character by character
    let i = 0
    const interval = setInterval(() => {
      i++
      setTyped(trigger.comment.slice(0, i))
      if (i >= trigger.comment.length) {
        clearInterval(interval)
        // After typing completes, show the suggestion (simulated Copilot delay)
        setTimeout(() => setShowSuggestion(true), 400)
      }
    }, 25)
  }

  const accept = () => {
    setAccepted(currentSuggestion)
    setShowSuggestion(false)
  }

  const reject = () => {
    setShowSuggestion(false)
    setRejected(true)
  }

  const nextSuggestion = () => {
    setSuggestionIdx((i) => (i + 1) % trigger.suggestions.length)
  }

  const reset = () => {
    setTyped('')
    setShowSuggestion(false)
    setAccepted(null)
    setRejected(false)
    setSuggestionIdx(0)
  }

  const switchTrigger = (i: number) => {
    setTriggerIdx(i)
    reset()
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-purple" /> Code Suggestion Simulator
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai-purple/15 text-ai-purple font-semibold uppercase">Simulation</span>
        </h4>
        <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-3.5 h-3.5" /></Button>
      </div>

      <div className="p-4 space-y-3">
        {/* Trigger picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Pick a comment to type</p>
          <div className="flex flex-wrap gap-1.5">
            {TRIGGERS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => switchTrigger(i)}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-full border font-mono transition-colors text-left',
                  triggerIdx === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
                )}
              >
                {t.comment.length > 40 ? t.comment.slice(0, 38) + '…' : t.comment}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated editor */}
        <div className="rounded-lg overflow-hidden border border-border bg-[#0d1117]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
            <span className="text-xs text-gray-400 font-mono">analysis.py</span>
            <span className="text-[10px] text-ai-purple font-semibold">Copilot ready</span>
          </div>
          <div className="p-3 font-mono text-xs leading-relaxed text-[#e6edf3] min-h-[120px]">
            <pre className="whitespace-pre-wrap">
              <span className="text-ai-green">import pandas as pd</span>
              {'\n'}
              <span className="text-ai-green">df = pd.read_csv("sales.csv")</span>
              {'\n\n'}
              {typed && <span className="text-gray-500">{typed}</span>}
              {!typed && !accepted && !rejected && (
                <span className="text-gray-600 italic">Click "Type comment" to simulate typing...</span>
              )}
              {typed && <span className="inline-block w-2 h-3.5 bg-ai-purple/60 ml-0.5 animate-pulse" />}
              {showSuggestion && !accepted && (
                <span className="text-gray-500 italic block mt-1">{currentSuggestion}</span>
              )}
              {accepted && (
                <span className="text-ai-cyan block mt-1">{accepted}</span>
              )}
            </pre>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {!typed && !accepted && (
            <Button size="sm" onClick={startTyping}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Type comment
            </Button>
          )}
          {showSuggestion && !accepted && (
            <>
              <Button size="sm" variant="default" onClick={accept}>
                <Check className="w-3.5 h-3.5 mr-1" /> Tab — Accept
              </Button>
              <Button size="sm" variant="outline" onClick={reject}>
                <X className="w-3.5 h-3.5 mr-1" /> Esc — Reject
              </Button>
              <Button size="sm" variant="outline" onClick={nextSuggestion}>
                <ChevronRight className="w-3.5 h-3.5 mr-1" /> Alt+] — Next ({suggestionIdx + 1}/{trigger.suggestions.length})
              </Button>
            </>
          )}
        </div>

        {/* Accepted result */}
        {accepted && (
          <div className="rounded-lg bg-ai-green/5 border border-ai-green/20 p-2.5 fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-green mb-0.5">✓ Suggestion accepted</p>
            <p className="text-xs text-foreground/80">The code is now in your editor. Always review it before running — Copilot can hallucinate column names or APIs.</p>
          </div>
        )}

        {rejected && (
          <div className="rounded-lg bg-ai-orange/5 border border-ai-orange/20 p-2.5 fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-orange mb-0.5">Suggestion rejected</p>
            <p className="text-xs text-foreground/80">You dismissed the suggestion. You can type your own code or trigger another suggestion.</p>
          </div>
        )}

        {/* Explanation */}
        {(accepted || rejected) && (
          <div className="rounded-lg bg-muted/40 p-3 fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-ai-blue" /> Why this suggestion?
            </p>
            <p className="text-xs text-foreground/90 leading-relaxed">{trigger.explanation}</p>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="rounded-lg bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
          <p className="font-semibold mb-1">Simulated keyboard shortcuts:</p>
          <div className="grid grid-cols-3 gap-1">
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Tab</kbd> Accept</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Esc</kbd> Reject</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Alt+]</kbd> Next suggestion</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground italic">
          This is a simulation. Real Copilot reads your full file context and generates suggestions dynamically. For full interactive completion practice, see Day 3's Code Completion Playground.
        </p>
      </div>
    </Card>
  )
}
