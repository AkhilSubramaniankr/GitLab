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

// ============ Ask vs Plan vs Agent Comparison ============
interface WorkflowScenario {
  id: string
  task: string
  ask: { prompt: string; actions: string[]; permissions: string[]; output: string }
  plan: { prompt: string; actions: string[]; permissions: string[]; output: string }
  agent: { prompt: string; actions: string[]; permissions: string[]; output: string }
}

const WORKFLOW_SCENARIOS: WorkflowScenario[] = [
  {
    id: 'add-column',
    task: 'Add a profit_margin column to cleaning.py',
    ask: {
      prompt: '"Write a line of Pandas code that adds a profit_margin column calculated as (revenue - cost) / revenue."',
      actions: ['Returns a single code snippet in chat', 'You copy it into cleaning.py manually'],
      permissions: ['None — read-only response'],
      output: 'One line of code in the chat panel. You manually paste and adapt it.',
    },
    plan: {
      prompt: '"@workspace Plan: add a profit_margin column. Show me which files need changes and the steps."',
      actions: ['Reads cleaning.py and analysis.py', 'Identifies 2 files that need changes', 'Produces a numbered plan', 'Waits for your approval before editing'],
      permissions: ['read_file (auto-approved)', 'No edits without your confirmation'],
      output: 'A 4-step plan: (1) add column in cleaning.py, (2) update tests, (3) run tests, (4) verify. You approve before any edit.',
    },
    agent: {
      prompt: '"Add a profit_margin column to cleaning.py, update tests, and run them."',
      actions: ['Reads cleaning.py', 'Edits cleaning.py (asks approval)', 'Edits test_cleaning.py (asks approval)', 'Runs pytest (asks approval)', 'Reports results'],
      permissions: ['read_file (auto)', 'edit_file (per-edit approval)', 'run_terminal_command (approval)'],
      output: '4 tool calls executed. cleaning.py and test_cleaning.py modified. Tests pass. Summary: "Added profit_margin, 2 tests added, all pass."',
    },
  },
  {
    id: 'fix-groupby',
    task: 'Fix a broken groupby returning empty groups',
    ask: {
      prompt: '"Why does df.groupby("Region") return empty groups?"',
      actions: ['Returns an explanation in chat', 'Suggests case sensitivity as the cause'],
      permissions: ['None — read-only response'],
      output: 'Explanation: "Pandas column names are case-sensitive. Use df.columns to check." You fix it manually.',
    },
    plan: {
      prompt: '"@workspace Plan: debug why the groupby in analysis.py returns empty. Show steps."',
      actions: ['Reads analysis.py', 'Identifies the groupby line', 'Checks df.columns via search', 'Produces a fix plan', 'Waits for approval'],
      permissions: ['read_file (auto)', 'search_files (auto)', 'No edits without confirmation'],
      output: 'Plan: (1) groupby uses "Region" (capital R), (2) column is "region" (lowercase), (3) fix the column name, (4) add a regression test. You approve each step.',
    },
    agent: {
      prompt: '"Fix the broken groupby in analysis.py and add a regression test."',
      actions: ['Reads analysis.py', 'Searches for "groupby"', 'Edits analysis.py: "Region" → "region" (asks approval)', 'Edits test_analysis.py (asks approval)', 'Runs pytest (asks approval)'],
      permissions: ['read_file (auto)', 'search_files (auto)', 'edit_file (per-edit approval)', 'run_terminal_command (approval)'],
      output: '3 tool calls. analysis.py fixed, test added. Tests pass. Diff shown for review.',
    },
  },
  {
    id: 'add-chart',
    task: 'Add a monthly revenue chart to the dashboard',
    ask: {
      prompt: '"Write Matplotlib code for a monthly revenue line chart from a sales DataFrame."',
      actions: ['Returns a code snippet in chat', 'You copy it into visualization.py manually'],
      permissions: ['None — read-only response'],
      output: 'A function definition in chat. You manually paste, rename, and wire it into main.py.',
    },
    plan: {
      prompt: '"@workspace Plan: add a monthly revenue chart. Which files need changes?"',
      actions: ['Reads visualization.py, analysis.py, main.py', 'Identifies 3 files needing changes', 'Produces a plan with code sketches', 'Waits for approval'],
      permissions: ['read_file (auto)', 'No edits without confirmation'],
      output: 'Plan: (1) add monthly_revenue() to analysis.py, (2) add revenue_chart() to visualization.py, (3) call both in main.py. You approve before edits.',
    },
    agent: {
      prompt: '"Add a monthly revenue chart to the project. Update all needed files and run tests."',
      actions: ['Reads 3 files', 'Edits analysis.py (asks approval)', 'Edits visualization.py (asks approval)', 'Edits main.py (asks approval)', 'Edits test_analysis.py (asks approval)', 'Runs pytest (asks approval)'],
      permissions: ['read_file (auto)', 'edit_file (per-edit approval)', 'run_terminal_command (approval)'],
      output: '6 tool calls. 4 files edited. Tests pass. Full diff shown. You review the diff before final accept.',
    },
  },
]

export function AskPlanAgentComparison() {
  const [scenarioId, setScenarioId] = React.useState(WORKFLOW_SCENARIOS[0].id)
  const [mode, setMode] = React.useState<'ask' | 'plan' | 'agent'>('ask')
  const scenario = WORKFLOW_SCENARIOS.find((s) => s.id === scenarioId)!
  const data = scenario[mode]

  const MODE_META = {
    ask: { label: 'Ask', color: 'text-ai-blue', bg: 'bg-ai-blue/15', icon: Sparkles, desc: 'Single question → single answer. No file access.' },
    plan: { label: 'Plan', color: 'text-ai-purple', bg: 'bg-ai-purple/15', icon: FileCode2, desc: 'Read-only inspection. Produces a plan you approve before edits.' },
    agent: { label: 'Agent', color: 'text-ai-orange', bg: 'bg-ai-orange/15', icon: Bot, desc: 'Multi-step execution with per-action approval. Edits files, runs commands.' },
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-purple" /> Ask vs Plan vs Agent — Interactive Comparison
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Same task, three workflows. Switch modes to see how the prompt, actions, permissions, and output differ.</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Scenario picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Data Analytics task</p>
          <div className="flex flex-wrap gap-1.5">
            {WORKFLOW_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-full border transition-colors text-left',
                  scenarioId === s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
                )}
              >
                {s.task.length > 45 ? s.task.slice(0, 43) + '…' : s.task}
              </button>
            ))}
          </div>
        </div>

        {/* Mode switcher */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Workflow mode</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(MODE_META) as ('ask' | 'plan' | 'agent')[]).map((m) => {
              const meta = MODE_META[m]
              const Icon = meta.icon
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'p-2.5 rounded-lg border text-left transition-all',
                    mode === m ? cn(meta.bg, 'border-current') : 'border-border hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={cn('w-3.5 h-3.5', meta.color)} />
                    <span className={cn('text-xs font-semibold', mode === m && meta.color)}>{meta.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{meta.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className={cn('rounded-lg border p-3 fade-in', MODE_META[mode].bg, 'border-current/30')} key={`${scenarioId}-${mode}`}>
          <div className="space-y-2.5">
            <div>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-0.5', MODE_META[mode].color)}>Prompt</p>
              <pre className="text-xs font-mono text-foreground/90 whitespace-pre-wrap bg-background/50 p-2 rounded">{data.prompt}</pre>
            </div>

            <div>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-0.5', MODE_META[mode].color)}>Actions ({data.actions.length})</p>
              <ol className="text-xs space-y-0.5">
                {data.actions.map((a, i) => (
                  <li key={i} className="flex gap-1.5 text-foreground/90">
                    <span className={cn('font-semibold', MODE_META[mode].color)}>{i + 1}.</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-0.5', MODE_META[mode].color)}>Permissions</p>
              <div className="flex flex-wrap gap-1">
                {data.permissions.map((p, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-background/50 border border-border font-mono">{p}</span>
                ))}
              </div>
            </div>

            <div>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-0.5', MODE_META[mode].color)}>Output</p>
              <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 p-2 rounded">{data.output}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 text-xs text-foreground/80 leading-relaxed">
          <strong className="text-ai-blue">When to use which:</strong> <strong>Ask</strong> for quick questions and single snippets. <strong>Plan</strong> for multi-step tasks where you want to review the approach before any file changes. <strong>Agent</strong> for well-specified end-to-end tasks where you approve each edit. Always start unfamiliar tasks with Plan to catch misunderstandings early.
        </div>
      </div>
    </Card>
  )
}
