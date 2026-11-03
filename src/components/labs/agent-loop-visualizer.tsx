'use client'

import * as React from 'react'
import { Play, RotateCcw, ChevronRight, User, Bot, Wrench, Eye, CheckCircle2, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AgentStep {
  id: string
  label: string
  icon: any
  color: string
  detail: string
  tool?: { name: string; input: string; output: string; approved: boolean }
}

const AGENT_STEPS: AgentStep[] = [
  {
    id: 'task',
    label: 'User Task',
    icon: User,
    color: 'text-ai-cyan',
    detail: 'User asks: "In my sales-analysis project, add a column for profit margin, fix the broken groupby, and add a chart of monthly revenue."',
  },
  {
    id: 'plan',
    label: 'Planning',
    icon: Brain,
    color: 'text-ai-purple',
    detail: 'Agent inspects the workspace, identifies the files involved, and proposes a plan:\n1. Read analysis.py to find the broken groupby\n2. Add profit_margin column in cleaning.py\n3. Replace groupby("region") with groupby("region", as_index=False)\n4. Add a matplotlib chart to visualization.py\n5. Run tests to verify',
  },
  {
    id: 'tools',
    label: 'Tool Selection',
    icon: Wrench,
    color: 'text-ai-blue',
    detail: 'Agent picks the right tools for each step: read_file, edit_file, run_terminal_command, run_tests.',
  },
  {
    id: 'action',
    label: 'Action',
    icon: Bot,
    color: 'text-ai-orange',
    detail: 'Agent calls edit_file to modify cleaning.py — adding the profit_margin line.',
    tool: { name: 'edit_file', input: 'path: cleaning.py\nadd after line 14: df["profit_margin"] = df["profit"] / df["revenue"]', output: '✓ File edited successfully (1 insertion).', approved: true },
  },
  {
    id: 'observe',
    label: 'Observation',
    icon: Eye,
    color: 'text-ai-green',
    detail: 'Tool result returned. Agent reads the diff back to confirm the change was applied as intended.',
    tool: { name: 'read_file', input: 'path: cleaning.py, lines: 12-18', output: '12: df["revenue"] = df["quantity"] * df["unit_price"]\n13: df["cost"] = df["quantity"] * df["unit_cost"]\n14: df["profit"] = df["revenue"] - df["cost"]\n15: df["profit_margin"] = df["profit"] / df["revenue"]\n16: return df', approved: true },
  },
  {
    id: 'validate',
    label: 'Validation',
    icon: CheckCircle2,
    color: 'text-ai-green',
    detail: 'Agent runs the test suite. All 6 tests pass. No new errors in the terminal.',
    tool: { name: 'run_tests', input: 'pytest tests/', output: '6 passed in 1.42s', approved: true },
  },
  {
    id: 'complete',
    label: 'Completion',
    icon: CheckCircle2,
    color: 'text-ai-green',
    detail: 'Agent summarizes: "I added profit_margin to cleaning.py, fixed the groupby in analysis.py, and added a monthly revenue chart to visualization.py. All tests pass."',
  },
]

export function AgentLoopVisualizer() {
  const [step, setStep] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!playing) return
    if (step >= AGENT_STEPS.length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1500)
    return () => clearTimeout(t)
  }, [playing, step])

  const reset = () => { setStep(0); setPlaying(false) }
  const play = () => {
    if (step >= AGENT_STEPS.length - 1) setStep(0)
    setPlaying(true)
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-purple" /> Agent Loop Visualizer
        </h4>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-3.5 h-3.5" /></Button>
          <Button size="sm" onClick={play} disabled={playing}>
            <Play className="w-3.5 h-3.5 mr-1" /> {step >= AGENT_STEPS.length - 1 ? 'Replay' : 'Auto-play'}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Step rail */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-2">
          {AGENT_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => { setStep(i); setPlaying(false) }}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2 rounded-lg border min-w-[90px] transition-all',
                  i === step ? 'border-primary bg-primary/10' :
                  i < step ? 'border-ai-green/40 bg-ai-green/5' :
                  'border-border opacity-50'
                )}
              >
                <s.icon className={cn('w-5 h-5', i <= step ? s.color : 'text-muted-foreground')} />
                <span className="text-[10px] font-medium text-center leading-tight">{s.label}</span>
              </button>
              {i < AGENT_STEPS.length - 1 && (
                <ChevronRight className={cn('w-3 h-3 shrink-0', i < step ? 'text-ai-green' : 'text-muted-foreground/40')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Detail */}
        <div className="rounded-lg border border-border p-4 fade-in" key={step}>
          {(() => {
            const StepIcon = AGENT_STEPS[step].icon
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <StepIcon className={cn('w-5 h-5', AGENT_STEPS[step].color)} />
                  <h5 className="font-semibold text-sm">Step {step + 1}: {AGENT_STEPS[step].label}</h5>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{AGENT_STEPS[step].detail}</p>

                {AGENT_STEPS[step].tool && (
                  <div className="mt-3 rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono space-y-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-ai-blue" />
                      <span className="text-ai-blue font-semibold">tool: {AGENT_STEPS[step].tool!.name}</span>
                      {AGENT_STEPS[step].tool!.approved && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-ai-green/15 text-ai-green">✓ approved</span>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wide">input</p>
                      <pre className="whitespace-pre-wrap text-[11px]">{AGENT_STEPS[step].tool!.input}</pre>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wide">output</p>
                      <pre className="whitespace-pre-wrap text-[11px] text-ai-green">{AGENT_STEPS[step].tool!.output}</pre>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <Button size="sm" variant="outline" onClick={() => { setStep((s) => Math.max(0, s - 1)); setPlaying(false) }} disabled={step === 0}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground self-center">{step + 1} of {AGENT_STEPS.length}</span>
          <Button size="sm" variant="outline" onClick={() => { setStep((s) => Math.min(AGENT_STEPS.length - 1, s + 1)); setPlaying(false) }} disabled={step === AGENT_STEPS.length - 1}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}
