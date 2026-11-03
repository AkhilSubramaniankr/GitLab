'use client'

import * as React from 'react'
import { Search, GitBranch, Play, Bug, Sparkles, MessageSquare, FileCode2, Terminal as TerminalIcon, X, Check, ChevronRight, Files } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface UIElement {
  id: string
  label: string
  desc: string
  example: string
}

const ELEMENTS: UIElement[] = [
  { id: 'editor', label: 'Editor', desc: 'Where you write and view code. Copilot shows inline ghost-text suggestions here as you type. Press Tab to accept, Esc to dismiss.', example: 'Type "# calculate total revenue" and Copilot suggests df.groupby("product")["revenue"].sum() as ghost text.' },
  { id: 'chat', label: 'Copilot Chat', desc: 'A conversational panel where you ask questions, request explanations, generate code, or fix bugs. Supports @workspace, @file, and #file references for context.', example: 'Ask: "Explain this function and add type hints" — Copilot returns the refactored code with an explanation.' },
  { id: 'inline', label: 'Inline Suggestions', desc: 'Ghost-text completions that appear as you type. Press Tab to accept, Alt+] / Alt+[ to cycle through alternatives.', example: 'After def clean(df):, Copilot suggests the function body line-by-line based on the function name and surrounding code.' },
  { id: 'inline-chat', label: 'Inline Chat (⌘I)', desc: 'Press Cmd/Ctrl+I inside the editor to ask Copilot to modify the selected code in place. You review the diff and Accept or Reject.', example: 'Select a loop and press ⌘I: "convert to a list comprehension" — Copilot rewrites it inline.' },
  { id: 'terminal', label: 'Terminal', desc: 'Run shell commands, scripts, and tests. Copilot can suggest commands and explain errors that appear here.', example: 'Paste a stack trace into Copilot Chat and ask: "why did this fail?" — Copilot pinpoints the line and suggests a fix.' },
  { id: 'files', label: 'File Explorer', desc: 'Browse the project tree. Right-click a file to "Explain with Copilot" or "Generate tests" using Smart Actions.', example: 'Right-click analysis.py → "Generate tests" → Copilot creates test_analysis.py with parametrized tests.' },
  { id: 'source-control', label: 'Source Control', desc: 'View changed files, stage, commit, and open PRs. The Copilot icon next to the message box generates a commit message from your diff.', example: 'Stage 3 files → click the Copilot sparkle in the message input → it suggests "Add profit_margin column and fix groupby in analysis.py".' },
  { id: 'smart-actions', label: 'Smart Actions', desc: 'Inline buttons above code: Explain, Fix, Refactor, Generate Docs, Generate Tests. Right-click for more options.', example: 'Hover over a function → "Generate Docs" → Copilot inserts a Google-style docstring with args, returns, and example.' },
]

export function VSCodeInterfaceExplorer() {
  const [active, setActive] = React.useState('editor')
  const el = ELEMENTS.find((e) => e.id === active)!

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-purple" /> VS Code Interface Explorer (educational simulation)
        </h4>
      </div>

      <div className="p-4 space-y-3">
        {/* Mock VS Code window */}
        <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e] text-[#cccccc] text-xs">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3c3c3c]">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[10px] text-gray-400 ml-2">sales-analysis — Visual Studio Code</span>
          </div>

          <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr_200px]">
            {/* File explorer */}
            <div className="bg-[#252526] p-2 border-r border-[#3c3c3c]">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1.5 uppercase tracking-wide">
                <Files className="w-3 h-3" /> Explorer
              </div>
              <button
                onClick={() => setActive('files')}
                className={cn('flex items-center gap-1 w-full text-left px-1 py-0.5 rounded text-[10px]', active === 'files' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2a2a]')}
              >
                <ChevronRight className="w-2.5 h-2.5" /> SALES-ANALYSIS
              </button>
              <div className="ml-2 space-y-0.5 mt-0.5">
                <div className="text-[10px] text-gray-300 flex items-center gap-1"><FileCode2 className="w-2.5 h-2.5 text-ai-blue" /> analysis.py</div>
                <div className="text-[10px] text-gray-300 flex items-center gap-1"><FileCode2 className="w-2.5 h-2.5 text-ai-cyan" /> cleaning.py</div>
                <div className="text-[10px] text-gray-300 flex items-center gap-1"><FileCode2 className="w-2.5 h-2.5 text-ai-green" /> visualization.py</div>
                <div className="text-[10px] text-gray-300 flex items-center gap-1"><FileCode2 className="w-2.5 h-2.5 text-ai-orange" /> README.md</div>
              </div>
            </div>

            {/* Editor + Chat */}
            <div className="bg-[#1e1e1e]">
              {/* Tabs */}
              <div className="flex items-center border-b border-[#3c3c3c]">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#1e1e1e] border-r border-[#3c3c3c] text-[10px]">
                  <FileCode2 className="w-2.5 h-2.5 text-ai-blue" /> analysis.py
                  <X className="w-2.5 h-2.5 ml-1 text-gray-500" />
                </div>
                <button
                  onClick={() => setActive('editor')}
                  className={cn('px-2 py-1 text-[10px]', active === 'editor' && 'text-ai-purple')}
                >Editor</button>
                <button
                  onClick={() => setActive('inline')}
                  className={cn('px-2 py-1 text-[10px]', active === 'inline' && 'text-ai-purple')}
                >Inline</button>
                <button
                  onClick={() => setActive('inline-chat')}
                  className={cn('px-2 py-1 text-[10px]', active === 'inline-chat' && 'text-ai-purple')}
                >⌘I Chat</button>
                <button
                  onClick={() => setActive('smart-actions')}
                  className={cn('px-2 py-1 text-[10px]', active === 'smart-actions' && 'text-ai-purple')}
                >Smart Actions</button>
              </div>

              {/* Editor content */}
              <button
                onClick={() => setActive('editor')}
                className="block w-full text-left p-3 font-mono text-[11px] leading-relaxed"
              >
                <div className="text-gray-500">1  <span className="text-ai-pink">import</span> pandas <span className="text-ai-pink">as</span> pd</div>
                <div className="text-gray-500">2  <span className="text-ai-pink">import</span> matplotlib.pyplot <span className="text-ai-pink">as</span> plt</div>
                <div className="text-gray-500">3  </div>
                <div className="text-gray-500">4  <span className="text-ai-pink">def</span> <span className="text-ai-yellow">load_data</span>(path: <span className="text-ai-cyan">str</span>):</div>
                <div className="text-gray-500">5      <span className="text-ai-green">"""Load and preview sales data."""</span></div>
                <div className="text-gray-500">6      df = pd.read_csv(path)</div>
                <div className="text-gray-500">7      <span className="text-ai-pink">return</span> df</div>
                <div className="text-gray-500">8  </div>
                <div className="text-gray-500">9  <span className="text-gray-600"># Calculate total revenue per product</span></div>
                <div className="text-gray-500">10 <span className="text-ai-purple italic">  result = df.groupby("product")["revenue"].sum()  ← ghost text</span></div>
              </button>

              {/* Smart Actions bar */}
              <div className="border-t border-[#3c3c3c] px-2 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-ai-purple" />
                <button onClick={() => setActive('smart-actions')} className={cn('text-[10px] px-1.5 py-0.5 rounded hover:bg-[#2a2a2a]', active === 'smart-actions' && 'bg-[#37373d]')}>Explain</button>
                <button onClick={() => setActive('smart-actions')} className={cn('text-[10px] px-1.5 py-0.5 rounded hover:bg-[#2a2a2a]', active === 'smart-actions' && 'bg-[#37373d]')}>Fix</button>
                <button onClick={() => setActive('smart-actions')} className={cn('text-[10px] px-1.5 py-0.5 rounded hover:bg-[#2a2a2a]', active === 'smart-actions' && 'bg-[#37373d]')}>Refactor</button>
                <button onClick={() => setActive('smart-actions')} className={cn('text-[10px] px-1.5 py-0.5 rounded hover:bg-[#2a2a2a]', active === 'smart-actions' && 'bg-[#37373d]')}>Docs</button>
                <button onClick={() => setActive('smart-actions')} className={cn('text-[10px] px-1.5 py-0.5 rounded hover:bg-[#2a2a2a]', active === 'smart-actions' && 'bg-[#37373d]')}>Tests</button>
              </div>
            </div>

            {/* Copilot Chat panel */}
            <div className="hidden md:block bg-[#252526] border-l border-[#3c3c3c]">
              <button
                onClick={() => setActive('chat')}
                className={cn('w-full flex items-center gap-1.5 px-2 py-1.5 border-b border-[#3c3c3c] text-[10px]', active === 'chat' && 'bg-[#37373d]')}
              >
                <MessageSquare className="w-3 h-3 text-ai-purple" /> Copilot Chat
              </button>
              <div className="p-2 space-y-2">
                <div className="rounded bg-[#1e1e1e] p-1.5 text-[10px]">
                  <p className="text-ai-purple font-semibold mb-0.5">You</p>
                  <p className="text-gray-300">Explain the load_data function</p>
                </div>
                <div className="rounded bg-[#1e1e1e] p-1.5 text-[10px]">
                  <p className="text-ai-cyan font-semibold mb-0.5">Copilot</p>
                  <p className="text-gray-300">Loads a CSV from the given path into a Pandas DataFrame and returns it. Add error handling for missing files...</p>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-[#1e1e1e] text-gray-500">
                  <Sparkles className="w-3 h-3 text-ai-purple" />
                  <span className="text-[10px]">Ask Copilot...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 px-2 py-1 bg-[#007acc] text-white text-[10px]">
            <button onClick={() => setActive('source-control')} className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
              <GitBranch className="w-2.5 h-2.5" /> main
            </button>
            <button onClick={() => setActive('terminal')} className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
              <TerminalIcon className="w-2.5 h-2.5" /> Terminal
            </button>
            <button onClick={() => setActive('smart-actions')} className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
              <Sparkles className="w-2.5 h-2.5" /> Copilot
            </button>
            <span className="ml-auto">UTF-8 · Python</span>
          </div>
        </div>

        {/* Element detail */}
        <div className="rounded-lg bg-ai-purple/5 border border-ai-purple/20 p-4 fade-in" key={active}>
          <h5 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ai-purple" /> {el.label}
          </h5>
          <p className="text-sm text-foreground/90 leading-relaxed mb-2">{el.desc}</p>
          <div className="rounded bg-muted/40 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Example interaction</p>
            <p className="text-xs text-foreground/80 italic leading-relaxed">{el.example}</p>
          </div>
        </div>

        {/* Element picker */}
        <div className="flex flex-wrap gap-1.5">
          {ELEMENTS.map((e) => (
            <button
              key={e.id}
              onClick={() => setActive(e.id)}
              className={cn(
                'text-[11px] px-2 py-1 rounded-full border transition-colors',
                active === e.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
              )}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .text-ai-pink { color: #c586c0; }
        .text-ai-yellow { color: #dcdcaa; }
        .text-ai-cyan { color: #4ec9b0; }
        .text-ai-green { color: #6a9955; }
        .text-ai-purple { color: #a855f7; }
      `}</style>
    </Card>
  )
}
