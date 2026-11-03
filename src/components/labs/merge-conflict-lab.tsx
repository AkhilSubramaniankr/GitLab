'use client'

import * as React from 'react'
import { GitMerge, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Edit3, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ConflictScenario {
  id: string
  title: string
  context: string
  fileName: string
  // The full file with conflict markers
  conflictedCode: string
  // The HEAD (current branch) version
  headVersion: string
  // The incoming (feature branch) version
  incomingVersion: string
  // Combined version (best resolution)
  combinedVersion: string
  // Validation: what the resolved code must contain / not contain
  validation: {
    mustNotContain: string[]  // e.g. conflict markers
    mustContain: string[]     // e.g. required function signature
    syntaxCheck: (code: string) => boolean
  }
  explanation: string
  bestChoice: 'head' | 'incoming' | 'combine'
}

const SCENARIOS: ConflictScenario[] = [
  {
    id: 'clean-fn',
    title: 'Data cleaning function signature',
    context: 'You are merging feature/cleaning into main. Both branches modified the clean() function in cleaning.py. The main branch added a copy() call; the feature branch added a subset parameter. You need both changes.',
    fileName: 'cleaning.py',
    conflictedCode: `def clean(df):
<<<<<<< HEAD
    df = df.dropna().copy()
    return df
=======
    df = df.dropna(subset=["revenue"])
    return df
>>>>>>> feature/cleaning`,
    headVersion: `def clean(df):
    df = df.dropna().copy()
    return df`,
    incomingVersion: `def clean(df):
    df = df.dropna(subset=["revenue"])
    return df`,
    combinedVersion: `def clean(df):
    df = df.dropna(subset=["revenue"]).copy()
    return df`,
    validation: {
      mustNotContain: ['<<<<<<<', '=======', '>>>>>>>'],
      mustContain: ['def clean(df)', 'dropna', 'copy'],
      syntaxCheck: (code) => {
        // Basic Python syntax check: balanced parens, no orphan markers
        const opens = (code.match(/\(/g) || []).length
        const closes = (code.match(/\)/g) || []).length
        return opens === closes && !code.includes('<<<') && !code.includes('>>>')
      },
    },
    explanation: 'The best resolution combines both changes: dropna(subset=["revenue"]) to target the critical column, then .copy() to avoid SettingWithCopyWarning. This preserves both branches\' intent.',
    bestChoice: 'combine',
  },
  {
    id: 'agg-method',
    title: 'Aggregation method conflict',
    context: 'Merging feature/profit-margin into main. Main uses mean(); the feature branch uses sum() for profit_margin. The business requirement is total profit, not average — so the feature branch is correct.',
    fileName: 'analysis.py',
    conflictedCode: `def profit_by_category(df):
<<<<<<< HEAD
    return df.groupby("category")["profit"].mean()
=======
    return df.groupby("category")["profit"].sum()
>>>>>>> feature/profit-margin`,
    headVersion: `def profit_by_category(df):
    return df.groupby("category")["profit"].mean()`,
    incomingVersion: `def profit_by_category(df):
    return df.groupby("category")["profit"].sum()`,
    combinedVersion: `def profit_by_category(df):
    return df.groupby("category")["profit"].sum()`,
    validation: {
      mustNotContain: ['<<<<<<<', '=======', '>>>>>>>'],
      mustContain: ['def profit_by_category', 'groupby', 'sum'],
      syntaxCheck: (code) => {
        const opens = (code.match(/\(/g) || []).length
        const closes = (code.match(/\)/g) || []).length
        return opens === closes && !code.includes('<<<') && !code.includes('>>>')
      },
    },
    explanation: 'The feature branch is correct: sum() gives total profit per category, which is what the business asked for. mean() would give average profit per order — a different question. In this case, "Keep incoming" is the right choice, not "Combine".',
    bestChoice: 'incoming',
  },
  {
    id: 'column-rename',
    title: 'Column rename with dependent code',
    context: 'Main branch renamed "rev" to "revenue" in the function body. Feature branch added a new filter line that still uses the old "rev" name. You need the rename AND the filter — but the filter must use the new name.',
    fileName: 'analysis.py',
    conflictedCode: `def high_value_orders(df):
<<<<<<< HEAD
    return df[df["revenue"] > 100]
=======
    return df[df["rev"] > 100].sort_values("rev", ascending=False)
>>>>>>> feature/new-filter`,
    headVersion: `def high_value_orders(df):
    return df[df["revenue"] > 100]`,
    incomingVersion: `def high_value_orders(df):
    return df[df["rev"] > 100].sort_values("rev", ascending=False)`,
    combinedVersion: `def high_value_orders(df):
    return df[df["revenue"] > 100].sort_values("revenue", ascending=False)`,
    validation: {
      mustNotContain: ['<<<<<<<', '=======', '>>>>>>>', '"rev"'],
      mustContain: ['def high_value_orders', 'revenue', 'sort_values'],
      syntaxCheck: (code) => {
        const opens = (code.match(/\(/g) || []).length
        const closes = (code.match(/\)/g) || []).length
        return opens === closes && !code.includes('<<<') && !code.includes('>>>')
      },
    },
    explanation: 'Combine is required, but you cannot just paste both versions — the feature branch\'s "rev" references must be updated to "revenue" to match the rename. This is a semantic conflict: both branches are syntactically valid alone, but combining them naively would break at runtime.',
    bestChoice: 'combine',
  },
]

type Choice = 'head' | 'incoming' | 'combine' | 'manual'

export function MergeConflictLab() {
  const [scenarioIdx, setScenarioIdx] = React.useState(0)
  const [choice, setChoice] = React.useState<Choice | null>(null)
  const [manualCode, setManualCode] = React.useState('')
  const [validated, setValidated] = React.useState(false)
  const [view, setView] = React.useState<'conflict' | 'resolved'>('conflict')

  const scenario = SCENARIOS[scenarioIdx]

  const reset = () => {
    setChoice(null)
    setManualCode('')
    setValidated(false)
    setView('conflict')
  }

  const switchScenario = (i: number) => {
    setScenarioIdx(i)
    reset()
  }

  const resolvedCode = React.useMemo(() => {
    if (choice === 'head') return scenario.headVersion
    if (choice === 'incoming') return scenario.incomingVersion
    if (choice === 'combine') return scenario.combinedVersion
    if (choice === 'manual') return manualCode
    return ''
  }, [choice, manualCode, scenario])

  const validationResult = React.useMemo(() => {
    if (!validated || !resolvedCode) return null
    const errors: string[] = []
    const warnings: string[] = []

    // Check for conflict markers
    for (const marker of scenario.validation.mustNotContain) {
      if (resolvedCode.includes(marker)) {
        errors.push(`Contains conflict marker or forbidden text: "${marker}"`)
      }
    }

    // Check for required content
    for (const req of scenario.validation.mustContain) {
      if (!resolvedCode.includes(req)) {
        errors.push(`Missing required element: "${req}"`)
      }
    }

    // Syntax check
    if (!scenario.validation.syntaxCheck(resolvedCode)) {
      errors.push('Syntax check failed: unbalanced parentheses or orphan conflict markers')
    }

    // Best-choice feedback
    const isBestChoice = choice === scenario.bestChoice || (choice === 'manual' && resolvedCode.trim() === scenario.combinedVersion.trim())

    return { errors, warnings, isBestChoice, passed: errors.length === 0 }
  }, [validated, resolvedCode, scenario, choice])

  const selectChoice = (c: Choice) => {
    setChoice(c)
    setValidated(false)
    setView('resolved')
    if (c === 'manual' && !manualCode) {
      setManualCode(scenario.headVersion)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-ai-red" /> Interactive Merge Conflict Resolution Lab
        </h4>
        <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Scenario picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Scenarios ({scenarioIdx + 1} of {SCENARIOS.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {SCENARIOS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => switchScenario(i)}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-full border transition-colors text-left',
                  scenarioIdx === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
                )}
              >
                {i + 1}. {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Context */}
        <div className="rounded-lg bg-ai-orange/5 border border-ai-orange/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ai-orange mb-1">Scenario</p>
          <p className="text-xs text-foreground/90 leading-relaxed">{scenario.context}</p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1">
          <Button size="sm" variant={view === 'conflict' ? 'default' : 'outline'} onClick={() => setView('conflict')}>
            <Eye className="w-3.5 h-3.5 mr-1" /> Conflicted file
          </Button>
          <Button size="sm" variant={view === 'resolved' ? 'default' : 'outline'} onClick={() => setView('resolved')} disabled={!choice}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolved preview
          </Button>
        </div>

        {/* Code display */}
        {view === 'conflict' ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{scenario.fileName} — with conflict markers</p>
            <pre className="rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono overflow-auto border border-ai-red/30">
              {scenario.conflictedCode.split('\n').map((line, i) => {
                const isMarker = line.includes('<<<') || line.includes('===') || line.includes('>>>')
                const isHead = line.startsWith('<<<<<<<')
                const isSep = line.startsWith('=======')
                const isIncoming = line.startsWith('>>>>>>>')
                return (
                  <div key={i} className={cn(
                    'whitespace-pre',
                    isHead && 'text-ai-blue font-bold',
                    isSep && 'text-muted-foreground font-bold',
                    isIncoming && 'text-ai-purple font-bold',
                    !isMarker && (line.includes('dropna().copy()') || line.includes('"revenue"] > 100') || line.includes('.mean()')) && 'text-ai-blue/80',
                    !isMarker && (line.includes('subset=["revenue"]') || line.includes('.sum()') || line.includes('sort_values')) && 'text-ai-purple/80',
                  )}>{line || ' '}</div>
                )
              })}
            </pre>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{scenario.fileName} — resolved preview</p>
            {choice === 'manual' ? (
              <div>
                <textarea
                  value={manualCode}
                  onChange={(e) => { setManualCode(e.target.value); setValidated(false) }}
                  className="w-full rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono border border-border min-h-[120px] resize-y custom-scrollbar"
                  spellCheck={false}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Edit the code above to write your manual resolution.</p>
              </div>
            ) : (
              <pre className="rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono overflow-auto border border-ai-green/30">
                {resolvedCode || 'Select a resolution option below.'}
              </pre>
            )}
          </div>
        )}

        {/* Resolution choices */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Choose a resolution</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => selectChoice('head')}
              className={cn(
                'p-2.5 rounded-lg border text-left transition-all',
                choice === 'head' ? 'border-ai-blue bg-ai-blue/10' : 'border-border hover:bg-muted/40'
              )}
            >
              <p className="text-xs font-semibold text-ai-blue">Keep current (HEAD)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Use the main branch version</p>
            </button>
            <button
              onClick={() => selectChoice('incoming')}
              className={cn(
                'p-2.5 rounded-lg border text-left transition-all',
                choice === 'incoming' ? 'border-ai-purple bg-ai-purple/10' : 'border-border hover:bg-muted/40'
              )}
            >
              <p className="text-xs font-semibold text-ai-purple">Keep incoming</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Use the feature branch version</p>
            </button>
            <button
              onClick={() => selectChoice('combine')}
              className={cn(
                'p-2.5 rounded-lg border text-left transition-all',
                choice === 'combine' ? 'border-ai-green bg-ai-green/10' : 'border-border hover:bg-muted/40'
              )}
            >
              <p className="text-xs font-semibold text-ai-green">Combine both</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Merge changes intelligently</p>
            </button>
            <button
              onClick={() => selectChoice('manual')}
              className={cn(
                'p-2.5 rounded-lg border text-left transition-all',
                choice === 'manual' ? 'border-ai-orange bg-ai-orange/10' : 'border-border hover:bg-muted/40'
              )}
            >
              <p className="text-xs font-semibold text-ai-orange flex items-center gap-1"><Edit3 className="w-3 h-3" /> Manual edit</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Write your own resolution</p>
            </button>
          </div>
        </div>

        {/* Validate button */}
        {choice && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setValidated(true)} disabled={!resolvedCode}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Validate resolution
            </Button>
            <span className="text-[10px] text-muted-foreground">Checks for conflict markers, required elements, and syntax balance.</span>
          </div>
        )}

        {/* Validation result */}
        {validationResult && (
          <div className={cn(
            'rounded-lg border p-3 fade-in',
            validationResult.passed ? 'border-ai-green/40 bg-ai-green/5' : 'border-ai-red/40 bg-ai-red/5'
          )}>
            <div className="flex items-center gap-2 mb-1.5">
              {validationResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-ai-green" />
              ) : (
                <XCircle className="w-4 h-4 text-ai-red" />
              )}
              <p className={cn('text-sm font-semibold', validationResult.passed ? 'text-ai-green' : 'text-ai-red')}>
                {validationResult.passed ? 'Resolution valid' : 'Resolution has issues'}
              </p>
            </div>
            {validationResult.errors.length > 0 && (
              <ul className="text-xs space-y-1 mb-2">
                {validationResult.errors.map((e, i) => (
                  <li key={i} className="text-ai-red flex gap-1.5"><span>✗</span><span>{e}</span></li>
                ))}
              </ul>
            )}
            {validationResult.passed && (
              <div className="text-xs space-y-1">
                <p className={cn('font-semibold flex items-center gap-1.5', validationResult.isBestChoice ? 'text-ai-green' : 'text-ai-orange')}>
                  {validationResult.isBestChoice ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Optimal resolution — this is the recommended approach.</>
                  ) : (
                    <><AlertTriangle className="w-3.5 h-3.5" /> Valid but not optimal. See explanation below.</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {validated && (
          <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Explanation
            </p>
            <p className="text-xs text-foreground/90 leading-relaxed">{scenario.explanation}</p>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between items-center pt-1">
          <Button size="sm" variant="ghost" onClick={() => switchScenario(Math.max(0, scenarioIdx - 1))} disabled={scenarioIdx === 0}>
            Previous scenario
          </Button>
          <Button size="sm" variant="ghost" onClick={() => switchScenario(Math.min(SCENARIOS.length - 1, scenarioIdx + 1))} disabled={scenarioIdx === SCENARIOS.length - 1}>
            Next scenario
          </Button>
        </div>
      </div>
    </Card>
  )
}
