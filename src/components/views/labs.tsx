'use client'

import * as React from 'react'
import { FlaskConical, ArrowRight, GitBranch, Sparkles, MessageSquareCode, Wand2, Bug, GitPullRequest, Database, BarChart3, Bot } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LabCard { id: string; title: string; desc: string; icon: any; color: string; view: any }

const LABS: LabCard[] = [
  { id: 'git', title: 'Git Workflow Simulator', desc: 'Stage, commit, and push files through the full Git lifecycle.', icon: GitBranch, color: 'orange', view: 'day1' },
  { id: 'cmds', title: 'Git Command Explorer', desc: 'Browse 9 essential Git commands with syntax, output, and errors.', icon: GitBranch, color: 'orange', view: 'day1' },
  { id: 'vscode', title: 'VS Code Interface Explorer', desc: 'Click any Copilot UI element to learn its purpose.', icon: Sparkles, color: 'purple', view: 'day2' },
  { id: 'nl-python', title: 'Natural Language → Python', desc: 'See Copilot translate English prompts into Pandas code.', icon: MessageSquareCode, color: 'blue', view: 'day3' },
  { id: 'prompt', title: 'TRICK Prompt Builder', desc: 'Build structured prompts with Task, Role, Input, Condition, Knowledge.', icon: Wand2, color: 'cyan', view: 'day4' },
  { id: 'debug', title: 'Python Debugging Lab', desc: 'Identify errors and pick the correct fix from 3 options.', icon: Bug, color: 'red', view: 'day5' },
  { id: 'branch', title: 'Branching & Merging Simulator', desc: 'Create branches, commit, and merge with a live graph.', icon: GitPullRequest, color: 'orange', view: 'day6' },
  { id: 'pr', title: 'Pull Request Simulator', desc: 'Walk through the 9 stages of a PR workflow.', icon: GitPullRequest, color: 'orange', view: 'day6' },
  { id: 'sql', title: 'SQL Execution Lab', desc: 'Run real SELECT queries against sample tables — live results.', icon: Database, color: 'cyan', view: 'day7' },
  { id: 'pandas', title: 'Pandas Operation Explorer', desc: 'Inspect, clean, transform, and analyze with live results.', icon: BarChart3, color: 'green', view: 'day8' },
  { id: 'viz', title: 'Visualization Playground', desc: 'Bar, line, histogram, box, scatter, pie — all rendered live.', icon: BarChart3, color: 'green', view: 'day8' },
  { id: 'agent', title: 'Agent Loop Visualizer', desc: 'Step through planning → action → observation → validation.', icon: Bot, color: 'purple', view: 'day9' },
]

const COLOR_BG: Record<string, string> = {
  orange: 'bg-ai-orange/10 text-ai-orange',
  purple: 'bg-ai-purple/10 text-ai-purple',
  blue: 'bg-ai-blue/10 text-ai-blue',
  cyan: 'bg-ai-cyan/10 text-ai-cyan',
  red: 'bg-ai-red/10 text-ai-red',
  green: 'bg-ai-green/10 text-ai-green',
}

export function LabsView() {
  const { setView } = useAppStore()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><FlaskConical className="w-6 h-6 text-ai-purple" /> Interactive Labs</h1>
        <p className="text-sm text-muted-foreground">All 12 interactive labs in one place. Click any card to open the lab in its module.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LABS.map((lab) => (
          <button key={lab.id} onClick={() => setView(lab.view)} className="text-left group">
            <Card className="p-5 h-full hover:border-primary/40 transition-all hover:shadow-md">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', COLOR_BG[lab.color])}>
                <lab.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary">{lab.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{lab.desc}</p>
              <p className="text-xs text-primary mt-3 flex items-center gap-1">Open lab <ArrowRight className="w-3 h-3" /></p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
