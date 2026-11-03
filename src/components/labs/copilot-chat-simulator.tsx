'use client'

import * as React from 'react'
import { Send, Sparkles, User, Bot, Loader2, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

export interface CopilotScenario {
  id: string
  mode: 'explain' | 'generate' | 'fix' | 'refactor' | 'test' | 'document' | 'plan' | 'agent'
  title: string
  prompt: string
  response: { text?: string; code?: { code: string; language?: string; title?: string }[]; steps?: string[] }
}

interface CopilotChatSimulatorProps {
  scenarios: CopilotScenario[]
  title?: string
  systemLabel?: string
}

const MODE_COLORS: Record<string, string> = {
  explain: 'bg-ai-blue/15 text-ai-blue',
  generate: 'bg-ai-purple/15 text-ai-purple',
  fix: 'bg-ai-red/15 text-ai-red',
  refactor: 'bg-ai-cyan/15 text-ai-cyan',
  test: 'bg-ai-green/15 text-ai-green',
  document: 'bg-ai-orange/15 text-ai-orange',
  plan: 'bg-ai-blue/15 text-ai-blue',
  agent: 'bg-ai-purple/15 text-ai-purple',
}

export function CopilotChatSimulator({ scenarios, title = 'Copilot Chat Simulator', systemLabel = 'Simulated Copilot response' }: CopilotChatSimulatorProps) {
  const [active, setActive] = React.useState(0)
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant'; content: CopilotScenario['response']; prompt: string }[]>([])
  const [loading, setLoading] = React.useState(false)

  const run = (i: number) => {
    setActive(i)
    const sc = scenarios[i]
    setLoading(true)
    setMessages([{ role: 'user', content: {}, prompt: sc.prompt }])
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: sc.response, prompt: sc.prompt }])
      setLoading(false)
    }, 700)
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-ai-purple" />
        <h4 className="font-semibold text-sm">{title}</h4>
        <span className="ml-auto text-[10px] text-muted-foreground italic">{systemLabel}</span>
      </div>

      <div className="p-3 border-b border-border">
        <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wide font-semibold">Try a task</p>
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => run(i)}
              className={cn(
                'text-[11px] px-2 py-1 rounded-full border transition-colors',
                active === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
              )}
            >
              <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', MODE_COLORS[s.mode].split(' ')[0])} />
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Pick a task above to see Copilot in action.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
              m.role === 'user' ? 'bg-ai-cyan/15 text-ai-cyan' : 'bg-ai-purple/15 text-ai-purple'
            )}>
              {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={cn(
              'rounded-lg p-3 max-w-[85%] space-y-2',
              m.role === 'user' ? 'bg-ai-cyan/10 border border-ai-cyan/20' : 'bg-ai-purple/5 border border-ai-purple/20'
            )}>
              {m.role === 'user' ? (
                <p className="text-sm">{m.prompt}</p>
              ) : (
                <>
                  {m.content.text && <p className="text-sm leading-relaxed">{m.content.text}</p>}
                  {m.content.steps && (
                    <ol className="space-y-1 text-sm">
                      {m.content.steps.map((st, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="font-semibold text-ai-purple shrink-0">{j + 1}.</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {m.content.code?.map((c, j) => (
                    <CodeBlock key={j} code={c.code} language={c.language || 'python'} title={c.title} maxHeight="280px" />
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-ai-purple/15 text-ai-purple flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="rounded-lg p-3 bg-ai-purple/5 border border-ai-purple/20">
              <Loader2 className="w-4 h-4 animate-spin text-ai-purple" />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
