'use client'

import * as React from 'react'
import { FolderPlus, FileEdit, Plus, GitCommitVertical, Upload, RotateCcw, FileText, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SimFile { name: string; content: string; status: 'untracked' | 'modified' | 'staged' | 'committed' }
interface Commit { id: string; message: string; files: string[]; time: string }

const initialFiles: SimFile[] = [
  { name: 'README.md', content: '# Sales Analysis\n', status: 'committed' },
]

const sampleFiles: Record<string, string> = {
  'sales_analysis.py': 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\nprint(df.head())\n',
  'cleaning.py': 'import pandas as pd\n\ndef clean(df):\n    df = df.drop_duplicates()\n    return df.fillna(0)\n',
  'eda.ipynb': '# EDA notebook\n# Inspect dataset, missing values, distributions\n',
  '.gitignore': '__pycache__/\n*.pyc\n.env\nvenv/\ndata/*.csv\n',
  'requirements.txt': 'pandas==2.2.0\nnumpy==1.26.0\nmatplotlib==3.8.0\n',
  'README.md': '# Sales Analysis\n\nA Pandas-based retail sales analysis project.\n',
}

export function GitWorkflowSimulator() {
  const [files, setFiles] = React.useState<SimFile[]>(initialFiles)
  const [commits, setCommits] = React.useState<Commit[]>([
    { id: 'a1b2c3', message: 'Initial commit: README', files: ['README.md'], time: 'Day 1, 09:00' },
  ])
  const [pushed, setPushed] = React.useState(1)
  const [log, setLog] = React.useState<string[]>(['Repository initialized on main branch.'])
  const [newFileName, setNewFileName] = React.useState('sales_analysis.py')

  const addLog = (msg: string) => setLog((l) => [...l, msg])

  const createFile = () => {
    if (!newFileName || files.some((f) => f.name === newFileName)) return
    const content = sampleFiles[newFileName] || `# ${newFileName}\n`
    setFiles((f) => [...f, { name: newFileName, content, status: 'untracked' }])
    addLog(`Created file: ${newFileName} (untracked)`)
  }

  const modifyFile = (name: string) => {
    setFiles((f) => f.map((file) => file.name === name ? { ...file, content: file.content + '\n# modified ' + new Date().toLocaleTimeString(), status: file.status === 'committed' ? 'modified' : file.status } : file))
    addLog(`Modified: ${name}`)
  }

  const stageAll = () => {
    setFiles((f) => f.map((file) => (file.status === 'untracked' || file.status === 'modified') ? { ...file, status: 'staged' } : file))
    addLog(`Staged all changes.`)
  }

  const stageFile = (name: string) => {
    setFiles((f) => f.map((file) => file.name === name ? { ...file, status: 'staged' } : file))
    addLog(`Staged: ${name}`)
  }

  const [commitMsg, setCommitMsg] = React.useState('')
  const commit = () => {
    const staged = files.filter((f) => f.status === 'staged')
    if (staged.length === 0) return
    const msg = commitMsg || `Update ${staged.length} file(s)`
    const id = Math.random().toString(16).slice(2, 8)
    setCommits((c) => [{ id, message: msg, files: staged.map((f) => f.name), time: 'Day 1, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...c])
    setFiles((f) => f.map((file) => file.status === 'staged' ? { ...file, status: 'committed' } : file))
    setCommitMsg('')
    addLog(`Committed ${staged.length} file(s): "${msg}"`)
  }

  const push = () => {
    if (commits.length > pushed) {
      setPushed(commits.length)
      addLog(`Pushed ${commits.length - pushed} commit(s) to origin/main.`)
    }
  }

  const reset = () => {
    setFiles(initialFiles)
    setCommits([{ id: 'a1b2c3', message: 'Initial commit: README', files: ['README.md'], time: 'Day 1, 09:00' }])
    setPushed(1)
    setLog(['Repository initialized on main branch.'])
    setCommitMsg('')
  }

  const unpushed = commits.length - pushed

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-ai-orange" /> Git Workflow Simulator
        </h4>
        <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Flow visualization */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center">
          <FlowBox label="Working Directory" count={files.filter((f) => f.status === 'untracked' || f.status === 'modified').length} color="orange" icon={FileEdit} desc="Modified or untracked files" />
          <FlowBox label="Staging Area" count={files.filter((f) => f.status === 'staged').length} color="cyan" icon={Plus} desc="git add" />
          <FlowBox label="Local Repo" count={commits.length} color="purple" icon={GitCommitVertical} desc="git commit" />
          <FlowBox label="Remote (GitHub)" count={pushed} color="green" icon={Upload} desc="git push" />
        </div>

        {/* File creation */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="text-xs rounded-md border border-border bg-background px-2 py-1.5"
          >
            {Object.keys(sampleFiles).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={createFile}><FileText className="w-3.5 h-3.5 mr-1" /> Create file</Button>
          <Button size="sm" variant="outline" onClick={stageAll} disabled={!files.some((f) => f.status === 'untracked' || f.status === 'modified')}>
            <Plus className="w-3.5 h-3.5 mr-1" /> git add .
          </Button>
        </div>

        {/* Files list */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-3 py-2 bg-muted/40 text-xs font-semibold border-b border-border">Files in working directory</div>
          <div className="divide-y divide-border max-h-48 overflow-y-auto custom-scrollbar">
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-2 px-3 py-2 text-xs">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 font-mono truncate">{f.name}</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                  f.status === 'untracked' && 'bg-ai-orange/15 text-ai-orange',
                  f.status === 'modified' && 'bg-ai-orange/15 text-ai-orange',
                  f.status === 'staged' && 'bg-ai-cyan/15 text-ai-cyan',
                  f.status === 'committed' && 'bg-ai-green/15 text-ai-green',
                )}>{f.status}</span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => modifyFile(f.name)} disabled={f.status === 'untracked'}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => stageFile(f.name)} disabled={f.status === 'staged' || f.status === 'committed'}>
                  Stage
                </Button>
              </div>
            ))}
            {files.length === 0 && <div className="px-3 py-4 text-xs text-muted-foreground text-center">No files yet. Create one above.</div>}
          </div>
        </div>

        {/* Commit + push */}
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground block mb-1">Commit message</label>
            <input
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="Add new sales analysis script"
              className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5"
            />
          </div>
          <Button size="sm" onClick={commit} disabled={!files.some((f) => f.status === 'staged')}>
            <GitCommitVertical className="w-3.5 h-3.5 mr-1" /> git commit
          </Button>
          <Button size="sm" variant="secondary" onClick={push} disabled={unpushed === 0}>
            <Upload className="w-3.5 h-3.5 mr-1" /> git push {unpushed > 0 && `(${unpushed})`}
          </Button>
        </div>

        {/* Commit history */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 text-xs font-semibold border-b border-border">Commit history (local)</div>
            <div className="divide-y divide-border max-h-40 overflow-y-auto custom-scrollbar">
              {commits.map((c) => (
                <div key={c.id} className="px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ai-purple">{c.id}</span>
                    <span className="text-muted-foreground text-[10px]">{c.time}</span>
                  </div>
                  <p className="font-medium mt-0.5">{c.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.files.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 text-xs font-semibold border-b border-border">Activity log</div>
            <div className="divide-y divide-border max-h-40 overflow-y-auto custom-scrollbar font-mono text-[11px]">
              {log.slice().reverse().slice(0, 12).map((l, i) => (
                <div key={i} className="px-3 py-1.5 text-muted-foreground">
                  <span className="text-ai-green">$</span> {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function FlowBox({ label, count, color, icon: Icon, desc }: { label: string; count: number; color: string; icon: any; desc: string }) {
  const colorMap: Record<string, string> = {
    orange: 'border-ai-orange/40 bg-ai-orange/5 text-ai-orange',
    cyan: 'border-ai-cyan/40 bg-ai-cyan/5 text-ai-cyan',
    purple: 'border-ai-purple/40 bg-ai-purple/5 text-ai-purple',
    green: 'border-ai-green/40 bg-ai-green/5 text-ai-green',
  }
  return (
    <div className={cn('rounded-lg border p-3', colorMap[color])}>
      <Icon className="w-5 h-5 mx-auto mb-1" />
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-[11px] font-semibold leading-tight">{label}</p>
      <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
    </div>
  )
}
