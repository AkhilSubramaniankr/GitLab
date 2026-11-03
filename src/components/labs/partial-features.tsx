'use client'

import * as React from 'react'
import { GitBranch, Sparkles, Terminal, FileCode2, CheckCircle2, XCircle, ArrowRight, Bot, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

// ============ Traditional vs Copilot Comparison ============
const STEPS = [
  {
    label: 'Define task',
    traditional: { time: '2 min', desc: 'Open browser, search Pandas docs for "groupby sum"', icon: Terminal },
    copilot: { time: '10 sec', desc: 'Write a comment: # Group by product and sum revenue', icon: Sparkles },
  },
  {
    label: 'Draft code',
    traditional: { time: '8 min', desc: 'Read docs, type the groupby, fix column name typos', icon: FileCode2 },
    copilot: { time: '30 sec', desc: 'Copilot suggests the groupby; press Tab to accept', icon: Sparkles },
  },
  {
    label: 'Debug',
    traditional: { time: '5 min', desc: 'Run, get KeyError, re-read docs, find case sensitivity bug', icon: Terminal },
    copilot: { time: '1 min', desc: 'Paste error in Copilot Chat → instant fix suggestion', icon: Bot },
  },
  {
    label: 'Add tests',
    traditional: { time: '10 min', desc: 'Write 3 test functions manually', icon: FileCode2 },
    copilot: { time: '1 min', desc: 'Smart Action: Generate Tests → review → accept', icon: Sparkles },
  },
  {
    label: 'Document',
    traditional: { time: '5 min', desc: 'Write docstring and README section by hand', icon: FileCode2 },
    copilot: { time: '30 sec', desc: 'Smart Action: Generate Docs → insert', icon: Sparkles },
  },
]

export function TraditionalVsCopilotComparison() {
  const [step, setStep] = React.useState(0)
  // Convert times to seconds for accurate totals (handles "X min" and "X sec")
  const toSeconds = (t: string): number => {
    const m = t.match(/(\d+)\s*(min|sec)/i)
    if (!m) return 0
    const n = parseInt(m[1], 10)
    return m[2].toLowerCase() === 'min' ? n * 60 : n
  }
  const totalTraditionalSec = STEPS.reduce((s, x) => s + toSeconds(x.traditional.time), 0)
  const totalCopilotSec = STEPS.reduce((s, x) => s + toSeconds(x.copilot.time), 0)
  const totalTraditional = Math.round(totalTraditionalSec / 60 * 10) / 10
  const totalCopilot = Math.round(totalCopilotSec / 60 * 10) / 10

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-ai-orange" /> Traditional Coding vs Copilot — Side by Side
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">The same task (group by product, sum revenue, add tests + docs) done two ways.</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 text-[10px] font-bold uppercase tracking-wider">
          <div></div>
          <div className="text-ai-orange flex items-center gap-1"><Terminal className="w-3 h-3" /> Traditional</div>
          <div className="text-ai-purple flex items-center gap-1"><Sparkles className="w-3 h-3" /> With Copilot</div>
        </div>

        {/* Steps */}
        {STEPS.map((s, i) => {
          const isActive = step === i
          return (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                'w-full grid grid-cols-[80px_1fr_1fr] gap-2 p-2 rounded-lg border text-left transition-all',
                isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
              )}
            >
              <div className="text-xs font-semibold self-center">{s.label}</div>
              <div className={cn('rounded p-2 text-xs', isActive ? 'bg-ai-orange/10' : 'bg-muted/20')}>
                <div className="flex items-center gap-1 text-[10px] font-bold text-ai-orange mb-0.5">
                  <Clock className="w-2.5 h-2.5" /> {s.traditional.time}
                </div>
                <p className="text-foreground/80">{s.traditional.desc}</p>
              </div>
              <div className={cn('rounded p-2 text-xs', isActive ? 'bg-ai-purple/10' : 'bg-muted/20')}>
                <div className="flex items-center gap-1 text-[10px] font-bold text-ai-purple mb-0.5">
                  <Clock className="w-2.5 h-2.5" /> {s.copilot.time}
                </div>
                <p className="text-foreground/80">{s.copilot.desc}</p>
              </div>
            </button>
          )
        })}

        {/* Total */}
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 p-2 rounded-lg bg-muted/40 border border-border">
          <div className="text-xs font-bold self-center">TOTAL</div>
          <div className="rounded p-2 bg-ai-orange/10">
            <div className="text-sm font-bold text-ai-orange">{totalTraditional} min</div>
          </div>
          <div className="rounded p-2 bg-ai-purple/10">
            <div className="text-sm font-bold text-ai-purple">{totalCopilot} min</div>
            <div className="text-[10px] text-muted-foreground">{Math.round((1 - totalCopilot / totalTraditional) * 100)}% faster</div>
          </div>
        </div>

        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 text-xs text-foreground/80">
          <strong className="text-ai-blue">Key insight:</strong> Copilot does not eliminate your work — it shifts it from typing and searching to <em>reviewing and validating</em>. You still own every line that ships; you just get there faster.
        </div>
      </div>
    </Card>
  )
}

// ============ MCP Concept Explorer ============
const MCP_STEPS = [
  { id: 'user', label: 'User', icon: Terminal, color: 'text-ai-cyan', desc: 'You ask Copilot: "What columns does the orders table have?"' },
  { id: 'agent', label: 'Agent', icon: Bot, color: 'text-ai-purple', desc: 'Agent sees you mentioned a database table. It looks for an MCP tool that can query schemas.' },
  { id: 'mcp', label: 'MCP Server', icon: Sparkles, color: 'text-ai-blue', desc: 'The MCP server (e.g. postgres-mcp) receives the request. It connects to your warehouse and runs INFORMATION_SCHEMA.' },
  { id: 'tool', label: 'External Tool', icon: GitBranch, color: 'text-ai-orange', desc: 'The warehouse returns the schema: orders(order_id, customer_id, order_date, total). MCP forwards it back.' },
  { id: 'response', label: 'Response', icon: CheckCircle2, color: 'text-ai-green', desc: 'Agent answers: "orders has 4 columns: order_id (INT), customer_id (VARCHAR), order_date (DATE), total (DECIMAL)."' },
]

export function MCPConceptExplorer() {
  const [active, setActive] = React.useState(0)
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-blue" /> MCP (Model Context Protocol) — Interactive Diagram
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Click each stage to see how an agent uses MCP to talk to external tools.</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-2">
          {MCP_STEPS.map((s, i) => {
            const StepIcon = s.icon
            return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => setActive(i)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border min-w-[80px] transition-all',
                  i === active ? 'border-primary bg-primary/10' : i < active ? 'border-ai-green/40 bg-ai-green/5' : 'border-border opacity-60'
                )}
              >
                <StepIcon className={cn('w-4 h-4', i <= active ? s.color : 'text-muted-foreground')} />
                <span className="text-[10px] font-medium text-center leading-tight">{s.label}</span>
              </button>
              {i < MCP_STEPS.length - 1 && <ArrowRight className={cn('w-3 h-3 shrink-0', i < active ? 'text-ai-green' : 'text-muted-foreground/40')} />}
            </React.Fragment>
            )
          })}
        </div>
        <div className="rounded-lg border border-border p-4 fade-in" key={active}>
          {(() => {
            const StepIcon = MCP_STEPS[active].icon
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <StepIcon className={cn('w-5 h-5', MCP_STEPS[active].color)} />
                  <h5 className="font-semibold text-sm">Step {active + 1}: {MCP_STEPS[active].label}</h5>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{MCP_STEPS[active].desc}</p>
              </>
            )
          })()}
        </div>
        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 text-xs text-foreground/80">
          <strong className="text-ai-blue">Why MCP matters:</strong> Without MCP, Copilot can only read files and run shell commands. With MCP, it can query your database, create Jira tickets, read from Figma, or call any API that has an MCP server — turning the agent into a true multi-tool operator.
        </div>
      </div>
    </Card>
  )
}

// ============ Terminal Assistance Demonstration ============
interface TerminalCmd {
  id: string
  prompt: string
  suggested: string
  explanation: string
  dangerous: boolean
  approved: boolean | null
}

const INITIAL_CMDS: TerminalCmd[] = [
  { id: 'c1', prompt: 'How do I undo my last commit?', suggested: 'git reset --soft HEAD~1', explanation: 'Removes the last commit but keeps the changes staged. Use --hard to discard changes (DESTRUCTIVE).', dangerous: false, approved: null },
  { id: 'c2', prompt: 'Show me what changed since yesterday', suggested: 'git log --since="yesterday" --oneline --stat', explanation: 'Lists commits since yesterday with file change stats. Read-only — safe to run.', dangerous: false, approved: null },
  { id: 'c3', prompt: 'Delete all .pyc files', suggested: 'find . -name "*.pyc" -delete', explanation: 'Removes compiled Python files. Safe — they regenerate on next run.', dangerous: false, approved: null },
  { id: 'c4', prompt: 'Force push to main', suggested: 'git push --force origin main', explanation: 'DESTRUCTIVE: overwrites remote main history. Never do this on shared branches.', dangerous: true, approved: null },
  { id: 'c5', prompt: 'Install pandas', suggested: 'pip install pandas', explanation: 'Installs pandas into the active environment. Safe — but pin the version for reproducibility.', dangerous: false, approved: null },
]

export function TerminalAssistanceDemo() {
  const [cmds, setCmds] = React.useState(INITIAL_CMDS)
  const [selected, setSelected] = React.useState(0)

  const approve = (id: string) => setCmds((c) => c.map((x) => x.id === id ? { ...x, approved: true } : x))
  const reject = (id: string) => setCmds((c) => c.map((x) => x.id === id ? { ...x, approved: false } : x))
  const reset = () => setCmds(INITIAL_CMDS.map((c) => ({ ...c, approved: null })))

  const cmd = cmds[selected]

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4 text-ai-cyan" /> Terminal Assistance Demonstration
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Simulated Copilot CLI suggestions. Approve or reject each command — destructive commands are flagged.</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Prompt picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">User asks</p>
          <div className="flex flex-wrap gap-1.5">
            {cmds.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelected(i)}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-full border transition-colors text-left',
                  selected === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
                )}
              >
                {c.prompt.length > 35 ? c.prompt.slice(0, 33) + '…' : c.prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal mock */}
        <div className="rounded-lg overflow-hidden border border-border bg-[#0d1117]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
            <Terminal className="w-3.5 h-3.5 text-ai-green" />
            <span className="text-xs text-gray-400 font-mono">terminal — bash</span>
          </div>
          <div className="p-3 font-mono text-xs space-y-2">
            <div className="text-gray-400">$ <span className="text-ai-cyan">??</span> <span className="text-gray-300">{cmd.prompt}</span></div>
            <div className="text-ai-green">Suggested command:</div>
            <div className={cn('rounded px-2 py-1.5 bg-[#161b22] text-[#e6edf3]', cmd.dangerous && 'border-l-2 border-ai-red')}>
              <span className="text-ai-green">$</span> {cmd.suggested}
            </div>
            {cmd.dangerous && (
              <div className="text-ai-red text-[11px] flex items-center gap-1.5">
                <XCircle className="w-3 h-3" /> Destructive command — requires explicit approval
              </div>
            )}
            <div className="text-gray-400 text-[11px]">{cmd.explanation}</div>

            {cmd.approved === null && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => approve(cmd.id)}
                  className={cn(
                    'text-[11px] px-2.5 py-1 rounded border transition-colors',
                    cmd.dangerous
                      ? 'border-ai-red/40 text-ai-red hover:bg-ai-red/10'
                      : 'border-ai-green/40 text-ai-green hover:bg-ai-green/10'
                  )}
                >
                  {cmd.dangerous ? '⚠ Approve (destructive)' : '✓ Approve'}
                </button>
                <button
                  onClick={() => reject(cmd.id)}
                  className="text-[11px] px-2.5 py-1 rounded border border-border text-muted-foreground hover:bg-muted/40"
                >
                  Reject
                </button>
              </div>
            )}
            {cmd.approved === true && (
              <div className="text-ai-green text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Approved — running...
                <span className="text-gray-500 ml-2">(simulated)</span>
              </div>
            )}
            {cmd.approved === false && (
              <div className="text-ai-orange text-[11px] flex items-center gap-1.5">
                <XCircle className="w-3 h-3" /> Rejected — command not executed.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button size="sm" variant="ghost" onClick={reset}>Reset all</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected((s) => (s + 1) % cmds.length)}>
            Next prompt <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="rounded-lg bg-ai-orange/5 border border-ai-orange/20 p-3 text-xs text-foreground/80">
          <strong className="text-ai-orange">Safety rule:</strong> Always review shell commands before approving. Destructive operations (rm -rf, git push --force, DROP TABLE) should require extra confirmation. In real Copilot CLI, you can configure auto-approval for safe commands and require approval for dangerous ones.
        </div>
      </div>
    </Card>
  )
}
