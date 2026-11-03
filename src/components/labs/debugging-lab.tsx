'use client'

import * as React from 'react'
import { Bug, Play, RotateCcw, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

interface DebugExercise {
  id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  buggyCode: string
  errorType: string
  symptom: string
  fixes: { code: string; correct: boolean; explanation: string }[]
  explanation: string
}

const EXERCISES: DebugExercise[] = [
  {
    id: 'dbg-1',
    title: 'KeyError on groupby column',
    level: 'beginner',
    errorType: 'RuntimeError — KeyError',
    symptom: 'The script crashes with: KeyError: "Region" when grouping sales by region.',
    buggyCode: `import pandas as pd

df = pd.read_csv("sales.csv")

# Group sales by region and sum revenue
result = df.groupby("Region")["revenue"].sum()
print(result)`,
    fixes: [
      { code: 'df.groupby("region")["revenue"].sum()', correct: true, explanation: 'Pandas column names are case-sensitive. The CSV has "region" (lowercase), not "Region". Use df.columns to verify names.' },
      { code: 'df.groupby("REGION")["revenue"].sum()', correct: false, explanation: 'No — column names are case-sensitive. Uppercase would still throw KeyError.' },
      { code: 'df.Region.sum()', correct: false, explanation: 'Same case-sensitivity issue, and .Region accesses a column attribute-style (also case-sensitive).' },
    ],
    explanation: 'Pandas column names are case-sensitive. Always inspect df.columns first. Copilot can spot this instantly if you paste the error message and ask "why does this raise KeyError?"',
  },
  {
    id: 'dbg-2',
    title: 'SettingWithCopyWarning on chained assignment',
    level: 'intermediate',
    errorType: 'Logical error + SettingWithCopyWarning',
    symptom: 'Modifications to a filtered DataFrame do not persist, and Pandas prints a SettingWithCopyWarning.',
    buggyCode: `import pandas as pd

df = pd.read_csv("sales.csv")

# Filter high-value orders and add a flag
high_value = df[df["revenue"] > 100]
high_value["is_high"] = True  # <-- warning here

print(high_value["is_high"].sum())`,
    fixes: [
      { code: 'high_value = df[df["revenue"] > 100].copy()\nhigh_value["is_high"] = True', correct: true, explanation: 'Use .copy() to make high_value a separate DataFrame. The warning happens because high_value is a view into df, not a new object — chained assignment may not persist.' },
      { code: 'high_value = df[df["revenue"] > 100]\nhigh_value.loc[:, "is_high"] = True', correct: false, explanation: 'Using .loc is good practice but still warns on a view — the underlying issue is that high_value is a view, not a copy.' },
      { code: 'df[df["revenue"] > 100]["is_high"] = True', correct: false, explanation: 'This is exactly the chained assignment anti-pattern the warning is about. The change will not persist.' },
    ],
    explanation: 'Always use .copy() when you plan to modify a filtered DataFrame. Ask Copilot: "Explain SettingWithCopyWarning and rewrite this safely."',
  },
  {
    id: 'dbg-3',
    title: 'Off-by-one in profit calculation',
    level: 'intermediate',
    errorType: 'Logical error — silent',
    symptom: 'Total profit does not match the finance team\'s report. The discrepancy grows with order count.',
    buggyCode: `import pandas as pd

df = pd.read_csv("sales.csv")

# Calculate profit per order and total profit
df["profit"] = df["revenue"] - df["cost"]
total_profit = df["profit"].sum()
print(f"Total profit: \${total_profit:,.2f}")`,
    fixes: [
      { code: 'df["profit"] = df["revenue"] - df["cost"] * df["quantity"]\ntotal_profit = df["profit"].sum()', correct: false, explanation: 'The formula change is unverified — always confirm the business rule with stakeholders before changing a calculation.' },
      { code: 'df["profit"] = (df["revenue"] - df["cost"]) * df["quantity"]\ntotal_profit = df["profit"].sum()', correct: false, explanation: 'This changes the formula in a different way without confirming which is correct.' },
      { code: '# Verify the schema first:\nprint(df[["revenue", "cost", "quantity"]].head())\nprint(df[["revenue", "cost", "quantity"]].dtypes)\n# Then confirm: is "cost" per unit or per order?\n# Ask the data owner before changing the formula.', correct: true, explanation: 'Silent logical errors require verification, not a quick fix. The original code may be correct if cost is per-order; wrong if cost is per-unit. Always confirm the data dictionary.' },
    ],
    explanation: 'Logical errors are the hardest to debug because no exception is raised. Copilot can suggest schema checks and unit tests, but you must validate the business rule with stakeholders.',
  },
]

export function DebuggingLab() {
  const [exIdx, setExIdx] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const ex = EXERCISES[exIdx]

  const reset = () => { setSelected(null); setSubmitted(false) }
  const next = () => { setExIdx((i) => (i + 1) % EXERCISES.length); reset() }
  const prev = () => { setExIdx((i) => (i - 1 + EXERCISES.length) % EXERCISES.length); reset() }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Bug className="w-4 h-4 text-ai-red" /> Python Debugging Lab
        </h4>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={prev}>Previous</Button>
          <span className="text-xs text-muted-foreground self-center">{exIdx + 1} / {EXERCISES.length}</span>
          <Button size="sm" variant="ghost" onClick={next}>Next</Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-sm">{ex.title}</h5>
            <span className={cn(
              'text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold',
              ex.level === 'beginner' && 'bg-ai-green/15 text-ai-green',
              ex.level === 'intermediate' && 'bg-ai-orange/15 text-ai-orange',
              ex.level === 'advanced' && 'bg-ai-red/15 text-ai-red',
            )}>{ex.level}</span>
          </div>
          <p className="text-xs text-muted-foreground">{ex.errorType}</p>
        </div>

        <div className="rounded-lg bg-ai-red/5 border border-ai-red/30 p-3">
          <p className="text-xs font-semibold text-ai-red mb-0.5">Symptom</p>
          <p className="text-sm text-foreground/90">{ex.symptom}</p>
        </div>

        <CodeBlock code={ex.buggyCode} language="python" title="buggy_code.py" />

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
                    <span className={cn(
                      'shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold',
                      !showResult && isSelected && 'border-primary bg-primary text-primary-foreground',
                      !showResult && !isSelected && 'border-muted-foreground/40',
                      showResult && isCorrect && 'border-ai-green bg-ai-green text-white',
                      showResult && isSelected && !isCorrect && 'border-ai-red bg-ai-red text-white',
                    )}>
                      {showResult && isCorrect ? <CheckCircle2 className="w-3 h-3" /> :
                       showResult && isSelected && !isCorrect ? <XCircle className="w-3 h-3" /> :
                       String.fromCharCode(65 + i)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <pre className="text-xs font-mono bg-[#0d1117] text-[#e6edf3] p-2 rounded overflow-auto">{f.code}</pre>
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
            <Play className="w-3.5 h-3.5 mr-1" /> Run fix
          </Button>
        ) : (
          <div className="space-y-3">
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
