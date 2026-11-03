'use client'

import * as React from 'react'
import { GitBranch, GitMerge, GitPullRequest, Plus, Check, X, GitCommitVertical, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BranchNode { id: string; branch: string; message: string; parent?: string }

const INITIAL: BranchNode[] = [
  { id: 'c1', branch: 'main', message: 'Initial commit' },
  { id: 'c2', branch: 'main', message: 'Add sales.csv loader', parent: 'c1' },
  { id: 'c3', branch: 'main', message: 'Add README', parent: 'c2' },
]

export function BranchSimulator() {
  const [commits, setCommits] = React.useState<BranchNode[]>(INITIAL)
  const [branches, setBranches] = React.useState<string[]>(['main'])
  const [current, setCurrent] = React.useState('main')
  const [commitMsg, setCommitMsg] = React.useState('')
  const [newBranch, setNewBranch] = React.useState('feature/cleaning')
  const [mergeMsg, setMergeMsg] = React.useState('')
  const [mergeSource, setMergeSource] = React.useState('feature/cleaning')

  const headOf = (branch: string) => {
    const onBranch = commits.filter((c) => c.branch === branch)
    return onBranch[onBranch.length - 1]
  }

  const createBranch = () => {
    if (!newBranch || branches.includes(newBranch)) return
    setBranches((b) => [...b, newBranch])
    setCurrent(newBranch)
    // Branch starts from current HEAD of the previously-current branch
    const head = headOf(current)
    if (head) {
      setCommits((c) => [...c, { id: 'b-' + Math.random().toString(36).slice(2, 6), branch: newBranch, message: `(branch from ${current}: ${head.message})`, parent: head.id }])
    }
  }

  const commit = () => {
    if (!commitMsg) return
    const head = headOf(current)
    setCommits((c) => [...c, { id: 'c-' + Math.random().toString(36).slice(2, 6), branch: current, message: commitMsg, parent: head?.id }])
    setCommitMsg('')
  }

  const merge = () => {
    if (mergeSource === current || !branches.includes(mergeSource)) return
    const srcHead = headOf(mergeSource)
    const dstHead = headOf(current)
    if (!srcHead) return
    setCommits((c) => [...c, {
      id: 'm-' + Math.random().toString(36).slice(2, 6),
      branch: current,
      message: mergeMsg || `Merge branch '${mergeSource}' into ${current}`,
      parent: dstHead?.id,
    }])
    setMergeMsg('')
  }

  const reset = () => { setCommits(INITIAL); setBranches(['main']); setCurrent('main'); setCommitMsg(''); setMergeMsg(''); setNewBranch('feature/cleaning'); setMergeSource('feature/cleaning') }

  // Layout: each branch on its own row, commits in order
  const branchRows = branches.map((b) => commits.filter((c) => c.branch === b))

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-ai-orange" /> Branching & Merging Simulator
        </h4>
        <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-3.5 h-3.5" /></Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Branch graph */}
        <div className="space-y-2">
          {branchRows.map((row, bi) => (
            <div key={bi} className="flex items-center gap-2 min-h-[40px]">
              <div className={cn(
                'w-32 shrink-0 text-xs font-mono px-2 py-1 rounded truncate',
                current === branches[bi] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {branches[bi]}
              </div>
              <div className="flex-1 flex items-center gap-1 overflow-x-auto custom-scrollbar">
                {row.map((c, i) => (
                  <React.Fragment key={c.id}>
                    {i > 0 && <GitCommitVertical className="w-3 h-3 text-muted-foreground shrink-0" />}
                    <div className={cn(
                      'shrink-0 px-2 py-1 rounded border text-[10px] font-mono',
                      current === branches[bi] ? 'border-ai-orange/40 bg-ai-orange/5' : 'border-border'
                    )} title={c.message}>
                      <span className="text-muted-foreground">{c.id.slice(0, 6)}</span>
                      <span className="ml-1.5">{c.message.length > 30 ? c.message.slice(0, 28) + '…' : c.message}</span>
                    </div>
                  </React.Fragment>
                ))}
                {row.length === 0 && <span className="text-xs text-muted-foreground italic">empty</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-3">
          {/* Create branch */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-orange mb-2">Create branch</p>
            <div className="flex gap-1.5 mb-2">
              <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} className="flex-1 text-xs rounded border border-border bg-background px-2 py-1 font-mono" placeholder="feature/cleaning" />
              <Button size="sm" onClick={createBranch}><Plus className="w-3 h-3" /></Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Branches from <span className="font-mono">{current}</span>. Switch by clicking a branch name above.</p>
          </div>

          {/* Commit */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-2">Commit on {current}</p>
            <div className="flex gap-1.5 mb-2">
              <input value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} className="flex-1 text-xs rounded border border-border bg-background px-2 py-1" placeholder="Add data cleaning function" />
              <Button size="sm" onClick={commit}><GitCommitVertical className="w-3 h-3" /></Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Adds a new commit on the current branch.</p>
          </div>

          {/* Merge */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-purple mb-2">Merge into {current}</p>
            <select value={mergeSource} onChange={(e) => setMergeSource(e.target.value)} className="w-full text-xs rounded border border-border bg-background px-2 py-1 mb-1.5 font-mono">
              {branches.filter((b) => b !== current).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <input value={mergeMsg} onChange={(e) => setMergeMsg(e.target.value)} className="w-full text-xs rounded border border-border bg-background px-2 py-1 mb-1.5" placeholder="Merge message (optional)" />
            <Button size="sm" variant="secondary" onClick={merge} className="w-full"><GitMerge className="w-3 h-3 mr-1" /> Merge</Button>
          </div>
        </div>

        {/* Branch switcher */}
        <div className="flex flex-wrap gap-1.5">
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => setCurrent(b)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-mono transition-colors',
                current === b ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
              )}
            >
              <GitBranch className="w-3 h-3 inline mr-1" />{b}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Pull Request Simulator — a step-by-step walkthrough
interface PRStage { id: string; label: string; icon: any; desc: string }

const PR_STAGES: PRStage[] = [
  { id: 'branch', label: 'Feature Branch', icon: GitBranch, desc: 'Create a feature branch from main: git checkout -b feature/sales-cleaning. All work happens here, isolated from main.' },
  { id: 'commits', label: 'Commits', icon: GitCommitVertical, desc: 'Commit your changes with clear messages: "Add drop_duplicates call", "Fix missing value handling for revenue".' },
  { id: 'push', label: 'Push to GitHub', icon: GitPullRequest, desc: 'Push the branch: git push -u origin feature/sales-cleaning. GitHub detects the new branch and offers to open a PR.' },
  { id: 'pr', label: 'Open Pull Request', icon: GitPullRequest, desc: 'Click "Compare & pull request". Write a clear title and description: what changed, why, how to test.' },
  { id: 'review', label: 'Code Review', icon: Check, desc: 'A reviewer (or Copilot) inspects the diff, leaves comments, and requests changes or approves.' },
  { id: 'fix', label: 'Address Feedback', icon: X, desc: 'Push additional commits to the same branch — the PR updates automatically. No new PR needed.' },
  { id: 'approve', label: 'Approval', icon: Check, desc: 'Reviewer approves. Required checks (tests, lint) pass.' },
  { id: 'merge', label: 'Merge', icon: GitMerge, desc: 'Click "Merge pull request". Choose Squash, Merge commit, or Rebase based on your team\'s convention.' },
  { id: 'delete', label: 'Delete Branch', icon: X, desc: 'Delete the feature branch to keep the repo clean. The work is now on main.' },
]

export function PRSimulator() {
  const [stage, setStage] = React.useState(0)
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-ai-purple" /> Pull Request Simulator
        </h4>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-4 overflow-x-auto custom-scrollbar pb-2">
          {PR_STAGES.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => setStage(i)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border min-w-[80px] transition-all',
                  i === stage ? 'border-primary bg-primary/10' :
                  i < stage ? 'border-ai-green/40 bg-ai-green/5' :
                  'border-border opacity-50'
                )}
              >
                <s.icon className={cn('w-4 h-4', i <= stage ? 'text-ai-purple' : 'text-muted-foreground')} />
                <span className="text-[10px] font-medium text-center leading-tight">{s.label}</span>
              </button>
              {i < PR_STAGES.length - 1 && <div className={cn('w-3 h-0.5 shrink-0', i < stage ? 'bg-ai-green' : 'bg-border')} />}
            </React.Fragment>
          ))}
        </div>
        <div className="rounded-lg border border-border p-4 fade-in" key={stage}>
          <h5 className="font-semibold text-sm mb-1">Step {stage + 1}: {PR_STAGES[stage].label}</h5>
          <p className="text-sm text-foreground/80 leading-relaxed">{PR_STAGES[stage].desc}</p>
        </div>
        <div className="flex justify-between mt-3">
          <Button size="sm" variant="outline" onClick={() => setStage((s) => Math.max(0, s - 1))} disabled={stage === 0}>Previous</Button>
          <Button size="sm" variant="outline" onClick={() => setStage((s) => Math.min(PR_STAGES.length - 1, s + 1))} disabled={stage === PR_STAGES.length - 1}>Next</Button>
        </div>
      </div>
    </Card>
  )
}
