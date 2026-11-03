'use client'

import * as React from 'react'
import { Terminal, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface CmdInfo {
  cmd: string
  purpose: string
  syntax: string
  example: string
  output: string
  when: string
  errors: string[]
}

const COMMANDS: CmdInfo[] = [
  {
    cmd: 'git init',
    purpose: 'Create a new Git repository in the current folder.',
    syntax: 'git init [directory]',
    example: '$ git init',
    output: 'Initialized empty Git repository in /Users/you/sales-analysis/.git/',
    when: 'Starting a brand-new project that is not yet under version control.',
    errors: ['Reinitializing an existing repo is harmless but the .git folder should not be edited by hand.'],
  },
  {
    cmd: 'git status',
    purpose: 'Show the working-tree state: untracked, modified, and staged files.',
    syntax: 'git status [-s | --short]',
    example: '$ git status',
    output: 'On branch main\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tnew file:   sales_analysis.py\n\nUntracked files:\n\tcleaning.py',
    when: 'Before staging or committing — to see what will be included in the next commit.',
    errors: ['A clean tree shows "nothing to commit, working tree clean". That is normal, not an error.'],
  },
  {
    cmd: 'git add',
    purpose: 'Stage changes so they will be included in the next commit.',
    syntax: 'git add <pathspec>   # e.g. git add .  or  git add sales.py',
    example: '$ git add sales_analysis.py cleaning.py',
    output: '(no output — files are now staged. Run git status to confirm.)',
    when: 'When you have modified or created files you want to record in history.',
    errors: ['"git add ." stages everything including unwanted files — pair it with a .gitignore.', 'Staging a file does NOT save the change yet; you must commit.'],
  },
  {
    cmd: 'git commit',
    purpose: 'Record a snapshot of the staged changes in the local repository.',
    syntax: 'git commit -m "<message>"',
    example: '$ git commit -m "Add sales cleaning function"',
    output: '[main 9f3a1b2] Add sales cleaning function\n 1 file changed, 12 insertions(+)\n create mode 100644 cleaning.py',
    when: 'After staging — to permanently record the change in history.',
    errors: ['"nothing to commit" means nothing is staged; run git add first.', 'Avoid vague messages like "update" — describe the WHY.'],
  },
  {
    cmd: 'git log',
    purpose: 'Show the commit history of the current branch.',
    syntax: 'git log [--oneline] [--graph] [-n <count>]',
    example: '$ git log --oneline -5',
    output: '9f3a1b2 (HEAD -> main) Add sales cleaning function\na1b2c3d Initial commit: README\n...',
    when: 'Reviewing what has changed, finding a commit to revert, or preparing a PR description.',
    errors: ['Press q to exit the pager if the log is long.'],
  },
  {
    cmd: 'git remote',
    purpose: 'Manage remote repositories (e.g. the GitHub URL this repo syncs with).',
    syntax: 'git remote add <name> <url>   |   git remote -v',
    example: '$ git remote add origin https://github.com/you/sales-analysis.git',
    output: '(no output. Verify with: git remote -v\norigin  https://github.com/you/sales-analysis.git (fetch)\norigin  https://github.com/you/sales-analysis.git (push))',
    when: 'Connecting a local repo to GitHub for the first time, or changing the upstream URL.',
    errors: ['"remote origin already exists" — use git remote set-url origin <url> to update.'],
  },
  {
    cmd: 'git push',
    purpose: 'Send local commits to a remote repository (e.g. GitHub).',
    syntax: 'git push [-u] <remote> <branch>',
    example: '$ git push -u origin main',
    output: 'Enumerating objects: 5, done.\nWriting objects: 100% (5/5), 480 bytes | 480.00 KiB/s, done.\nTo github.com:you/sales-analysis.git\n * [new branch]      main -> main',
    when: 'After committing locally — to share your work or back it up to GitHub.',
    errors: ['"rejected - non-fast-forward" means the remote has commits you do not. Run git pull first.', 'Use -u once to set the upstream so future git push works without arguments.'],
  },
  {
    cmd: 'git pull',
    purpose: 'Fetch from the remote and merge the changes into the current branch.',
    syntax: 'git pull [<remote>] [<branch>]',
    example: '$ git pull origin main',
    output: 'Updating a1b2c3d..9f3a1b2\nFast-forward\n cleaning.py | 12 +++++++++++\n 1 file changed, 12 insertions(+)',
    when: 'Before starting work each day, or after a teammate pushes changes to the shared branch.',
    errors: ['Pull can create merge commits if local and remote both moved. Use git fetch + git rebase for a linear history when preferred.'],
  },
  {
    cmd: 'git clone',
    purpose: 'Copy a remote repository to your machine, including its full history.',
    syntax: 'git clone <url> [directory]',
    example: '$ git clone https://github.com/you/sales-analysis.git',
    output: "Cloning into 'sales-analysis'...\nremote: Enumerating objects: 24, done.\nReceiving objects: 100% (24/24), done.",
    when: 'Starting work on an existing project, or downloading a starter project from GitHub.',
    errors: ['Clone creates a subfolder named after the repo. Use the second argument to rename it.'],
  },
]

export function GitCommandExplorer() {
  const [selected, setSelected] = React.useState(0)
  const cmd = COMMANDS[selected]
  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-[200px_1fr] divide-x divide-border">
        {/* List */}
        <div className="max-h-96 md:max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 bg-muted/40 text-xs font-semibold sticky top-0">Commands</div>
          <div className="divide-y divide-border">
            {COMMANDS.map((c, i) => (
              <button
                key={c.cmd}
                onClick={() => setSelected(i)}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-mono transition-colors',
                  selected === i ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/40'
                )}
              >
                {c.cmd}
              </button>
            ))}
          </div>
        </div>
        {/* Detail */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-mono font-bold text-sm text-primary flex items-center gap-2">
              <Terminal className="w-4 h-4" /> {cmd.cmd}
            </h4>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Purpose</p>
            <p className="text-sm">{cmd.purpose}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Syntax</p>
            <pre className="rounded bg-[#0d1117] text-[#e6edf3] p-2 text-xs font-mono overflow-auto">{cmd.syntax}</pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Example & output</p>
            <pre className="rounded bg-[#0d1117] text-[#e6edf3] p-2 text-xs font-mono overflow-auto">{cmd.example}\n{cmd.output}</pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">When to use</p>
            <p className="text-sm">{cmd.when}</p>
          </div>
          <div className="rounded-lg bg-ai-red/5 border border-ai-red/20 p-3">
            <p className="text-xs font-semibold text-ai-red mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Common errors
            </p>
            <ul className="space-y-1">
              {cmd.errors.map((e, i) => (
                <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                  <span className="text-ai-red shrink-0">⚠</span><span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
