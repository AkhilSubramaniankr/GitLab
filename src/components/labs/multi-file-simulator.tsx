'use client'

import * as React from 'react'
import { Bot, FileCode2, FolderTree, Wrench, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface ProjectFile { name: string; purpose: string }
interface ProjectTask {
  id: string
  title: string
  description: string
  // Which files the agent would touch and why
  affectedFiles: { file: string; reason: string; change: string }[]
  // Tools the agent would use
  tools: string[]
  // Tests to run after
  validation: string
}

const PROJECT_FILES: ProjectFile[] = [
  { name: 'main.py', purpose: 'Entry point — orchestrates load, clean, analyze, visualize' },
  { name: 'cleaning.py', purpose: 'Data cleaning functions: drop_duplicates, fillna, normalize' },
  { name: 'analysis.py', purpose: 'Aggregation logic: top_products, monthly_trend, profit_by_category' },
  { name: 'visualization.py', purpose: 'Matplotlib chart helpers: bar, line, histogram' },
  { name: 'tests/test_cleaning.py', purpose: 'pytest tests for cleaning.py' },
  { name: 'tests/test_analysis.py', purpose: 'pytest tests for analysis.py' },
  { name: 'requirements.txt', purpose: 'Pinned Python dependencies' },
  { name: 'README.md', purpose: 'Project documentation' },
]

const TASKS: ProjectTask[] = [
  {
    id: 'profit-margin',
    title: 'Add a profit_margin column',
    description: 'User asks the agent: "Add a profit_margin column to the sales analysis."',
    affectedFiles: [
      { file: 'cleaning.py', reason: 'Add the new column during cleaning', change: 'Add: df["profit_margin"] = (df["profit"] / df["revenue"]).round(4)' },
      { file: 'analysis.py', reason: 'No change needed — profit_margin is now available', change: 'No change (column flows through automatically)' },
      { file: 'tests/test_cleaning.py', reason: 'Add a test for the new column', change: 'Add test_profit_margin_calculation()' },
      { file: 'tests/test_analysis.py', reason: 'No change', change: 'No change' },
    ],
    tools: ['read_file (cleaning.py)', 'edit_file (cleaning.py)', 'edit_file (tests/test_cleaning.py)', 'run_tests'],
    validation: 'Run pytest tests/ — all tests must pass. Verify profit_margin = profit / revenue on a sample row.',
  },
  {
    id: 'fix-groupby',
    title: 'Fix a broken groupby',
    description: 'User asks: "The groupby in analysis.py is returning empty groups. Fix it."',
    affectedFiles: [
      { file: 'analysis.py', reason: 'Fix the groupby column name (case sensitivity)', change: 'Change groupby("Region") → groupby("region")' },
      { file: 'tests/test_analysis.py', reason: 'Add a regression test', change: 'Add test_groupby_returns_nonempty()' },
      { file: 'cleaning.py', reason: 'No change', change: 'No change' },
      { file: 'visualization.py', reason: 'No change', change: 'No change' },
    ],
    tools: ['read_file (analysis.py)', 'search_files ("groupby")', 'edit_file (analysis.py)', 'edit_file (tests/test_analysis.py)', 'run_tests'],
    validation: 'Run pytest tests/ — confirm groupby now returns non-empty groups. Run main.py to confirm output is non-empty.',
  },
  {
    id: 'add-chart',
    title: 'Add a monthly revenue chart',
    description: 'User asks: "Add a Matplotlib chart showing monthly revenue trend."',
    affectedFiles: [
      { file: 'visualization.py', reason: 'Add a new chart function', change: 'Add: def monthly_revenue_chart(df): ...' },
      { file: 'analysis.py', reason: 'Add a monthly aggregation helper', change: 'Add: def monthly_revenue(df): ...' },
      { file: 'main.py', reason: 'Call the new chart function', change: 'Add: monthly_revenue_chart(df) after analysis' },
      { file: 'tests/test_analysis.py', reason: 'Test the new aggregation', change: 'Add test_monthly_revenue()' },
    ],
    tools: ['read_file (visualization.py)', 'read_file (analysis.py)', 'read_file (main.py)', 'edit_file (visualization.py)', 'edit_file (analysis.py)', 'edit_file (main.py)', 'edit_file (tests/test_analysis.py)', 'run_tests'],
    validation: 'Run pytest tests/. Run main.py — confirm a chart file is saved. Inspect the chart visually.',
  },
  {
    id: 'rename-column',
    title: 'Rename "rev" to "revenue" everywhere',
    description: 'User asks: "Rename the rev column to revenue across the project."',
    affectedFiles: [
      { file: 'cleaning.py', reason: 'Update column references', change: 'Replace df["rev"] → df["revenue"]' },
      { file: 'analysis.py', reason: 'Update column references', change: 'Replace groupby("rev") → groupby("revenue")' },
      { file: 'visualization.py', reason: 'Update column references', change: 'Replace "rev" labels → "revenue"' },
      { file: 'tests/test_cleaning.py', reason: 'Update test fixtures', change: 'Rename "rev" in test DataFrames' },
      { file: 'tests/test_analysis.py', reason: 'Update test fixtures', change: 'Rename "rev" in test DataFrames' },
    ],
    tools: ['search_files ("rev")', 'read_file (each affected file)', 'edit_file (each affected file)', 'run_tests'],
    validation: 'Run pytest tests/ — all tests must pass. grep -r "rev" src/ tests/ should return no matches.',
  },
]

export function MultiFileProjectSimulator() {
  const [taskId, setTaskId] = React.useState(TASKS[0].id)
  const [expandedFile, setExpandedFile] = React.useState<string | null>(null)
  const task = TASKS.find((t) => t.id === taskId)!

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-purple" /> Multi-file Project Simulator
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Pick a task. The agent identifies which files need changes and why.</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Task picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Project-level task</p>
          <div className="flex flex-wrap gap-1.5">
            {TASKS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTaskId(t.id); setExpandedFile(null) }}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-full border transition-colors text-left',
                  taskId === t.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
                )}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Task description */}
        <div className="rounded-lg bg-ai-purple/5 border border-ai-purple/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ai-purple mb-1">Task</p>
          <p className="text-sm text-foreground/90">{task.description}</p>
        </div>

        {/* File tree with affected highlights */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <FolderTree className="w-3 h-3" /> Project files — click an affected file to see the change
          </p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {PROJECT_FILES.map((file) => {
              const affected = task.affectedFiles.find((f) => f.file === file.name)
              const isNoChange = affected && affected.change === 'No change'
              const isExpanded = expandedFile === file.name
              return (
                <button
                  key={file.name}
                  onClick={() => affected && !isNoChange && setExpandedFile(isExpanded ? null : file.name)}
                  className={cn(
                    'text-left p-2 rounded-lg border text-xs transition-all',
                    !affected && 'border-border opacity-50',
                    affected && isNoChange && 'border-border bg-muted/20',
                    affected && !isNoChange && 'border-ai-orange/40 bg-ai-orange/5 hover:bg-ai-orange/10',
                    isExpanded && 'ring-2 ring-ai-orange/40'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <FileCode2 className={cn('w-3.5 h-3.5 shrink-0', affected && !isNoChange ? 'text-ai-orange' : 'text-muted-foreground')} />
                    <span className="font-mono flex-1 truncate">{file.name}</span>
                    {affected && !isNoChange && <span className="text-[9px] px-1 py-0.5 rounded bg-ai-orange/20 text-ai-orange font-semibold shrink-0">EDIT</span>}
                    {isNoChange && <span className="text-[9px] text-muted-foreground shrink-0">no change</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-5">{file.purpose}</p>
                  {isExpanded && affected && (
                    <div className="mt-2 ml-5 p-2 rounded bg-ai-orange/10 border border-ai-orange/20 fade-in">
                      <p className="text-[10px] font-semibold text-ai-orange mb-0.5">Reason</p>
                      <p className="text-[11px] text-foreground/90 mb-1">{affected.reason}</p>
                      <p className="text-[10px] font-semibold text-ai-orange mb-0.5">Change</p>
                      <pre className="text-[10px] font-mono text-foreground/90 whitespace-pre-wrap">{affected.change}</pre>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tools */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Tools the agent will use (in order)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {task.tools.map((tool, i) => (
              <React.Fragment key={i}>
                <span className="text-[11px] px-2 py-1 rounded bg-muted/40 border border-border font-mono">{tool}</span>
                {i < task.tools.length - 1 && <ArrowRight className="w-3 h-3 self-center text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Validation */}
        <div className="rounded-lg bg-ai-green/5 border border-ai-green/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ai-green mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Validation (agent runs after edits)
          </p>
          <p className="text-xs text-foreground/90">{task.validation}</p>
        </div>
      </div>
    </Card>
  )
}
