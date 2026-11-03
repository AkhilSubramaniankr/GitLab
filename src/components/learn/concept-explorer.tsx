'use client'

import * as React from 'react'
import { ChevronDown, Lightbulb, AlertTriangle, CheckCircle2, BookOpen, Wrench, Target, HelpCircle, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConceptBlock {
  what?: string
  why?: string
  when?: string
  how?: string
  beginner?: string
  technical?: string
  analogy?: string
  application?: string
  syntax?: string
  example?: { code?: string; language?: string; explanation?: string }
  commonMistakes?: string[]
  bestPractices?: string[]
  limitations?: string[]
  interview?: { q: string; a: string }
  industry?: string
}

interface ConceptExplorerProps {
  title: string
  icon?: React.ReactNode
  blocks: ConceptBlock
  children?: React.ReactNode
  defaultOpen?: ('what' | 'why' | 'how' | 'example' | 'mistakes' | 'interview')[]
}

const SECTIONS = [
  { id: 'what', label: 'What is it?', icon: BookOpen, color: 'text-ai-blue' },
  { id: 'why', label: 'Why & When', icon: Target, color: 'text-ai-green' },
  { id: 'how', label: 'How it works', icon: Wrench, color: 'text-ai-purple' },
  { id: 'example', label: 'Example', icon: Lightbulb, color: 'text-ai-cyan' },
  { id: 'mistakes', label: 'Mistakes & Best Practices', icon: AlertTriangle, color: 'text-ai-orange' },
  { id: 'interview', label: 'Interview & Industry', icon: Briefcase, color: 'text-ai-red' },
] as const

export function ConceptExplorer({ title, icon, blocks, children, defaultOpen = ['what'] }: ConceptExplorerProps) {
  const [open, setOpen] = React.useState<Set<string>>(new Set(defaultOpen))
  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-muted/40 border-b border-border">
        {icon}
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="divide-y divide-border">
        {/* What */}
        <Section open={open.has('what')} onToggle={() => toggle('what')} label="What is it?" icon={BookOpen} color="text-ai-blue">
          {blocks.what && <p className="text-sm text-muted-foreground leading-relaxed">{blocks.what}</p>}
          {blocks.beginner && (
            <div className="mt-3 rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3">
              <p className="text-xs font-semibold text-ai-blue mb-1">Beginner-friendly</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{blocks.beginner}</p>
            </div>
          )}
          {blocks.technical && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Technical explanation</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{blocks.technical}</p>
            </div>
          )}
          {blocks.analogy && (
            <p className="mt-3 text-sm italic text-muted-foreground">
              <span className="font-semibold not-italic text-ai-orange">Real-world analogy: </span>
              {blocks.analogy}
            </p>
          )}
        </Section>

        {/* Why & When */}
        <Section open={open.has('why')} onToggle={() => toggle('why')} label="Why & When" icon={Target} color="text-ai-green">
          {blocks.why && <p className="text-sm text-muted-foreground leading-relaxed">{blocks.why}</p>}
          {blocks.when && (
            <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
              <span className="font-semibold text-ai-green">When to use: </span>
              {blocks.when}
            </p>
          )}
          {blocks.application && (
            <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
              <span className="font-semibold text-ai-cyan">Data Analytics application: </span>
              {blocks.application}
            </p>
          )}
        </Section>

        {/* How */}
        <Section open={open.has('how')} onToggle={() => toggle('how')} label="How it works" icon={Wrench} color="text-ai-purple">
          {blocks.how && <p className="text-sm text-muted-foreground leading-relaxed">{blocks.how}</p>}
          {blocks.syntax && (
            <pre className="mt-3 rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono overflow-auto">{blocks.syntax}</pre>
          )}
        </Section>

        {/* Example */}
        {(blocks.example || children) && (
          <Section open={open.has('example')} onToggle={() => toggle('example')} label="Example & Demonstration" icon={Lightbulb} color="text-ai-cyan">
            {blocks.example?.code && (
              <pre className="rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono overflow-auto mb-3">{blocks.example.code}</pre>
            )}
            {blocks.example?.explanation && (
              <p className="text-sm text-muted-foreground leading-relaxed">{blocks.example.explanation}</p>
            )}
            {children}
          </Section>
        )}

        {/* Mistakes & Best Practices */}
        {(blocks.commonMistakes || blocks.bestPractices || blocks.limitations) && (
          <Section open={open.has('mistakes')} onToggle={() => toggle('mistakes')} label="Mistakes, Best Practices & Limitations" icon={AlertTriangle} color="text-ai-orange">
            {blocks.commonMistakes && blocks.commonMistakes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-ai-red mb-1.5">Common mistakes</p>
                <ul className="space-y-1">
                  {blocks.commonMistakes.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-ai-red shrink-0">✗</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {blocks.bestPractices && blocks.bestPractices.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-ai-green mb-1.5">Best practices</p>
                <ul className="space-y-1">
                  {blocks.bestPractices.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-ai-green shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {blocks.limitations && blocks.limitations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ai-orange mb-1.5">Limitations</p>
                <ul className="space-y-1">
                  {blocks.limitations.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-ai-orange shrink-0">⚠</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}

        {/* Interview & Industry */}
        {(blocks.interview || blocks.industry) && (
          <Section open={open.has('interview')} onToggle={() => toggle('interview')} label="Interview & Industry Application" icon={Briefcase} color="text-ai-red">
            {blocks.interview && (
              <div className="mb-3 rounded-lg bg-ai-purple/5 border border-ai-purple/20 p-3">
                <p className="text-xs font-semibold text-ai-purple mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Interview question
                </p>
                <p className="text-sm font-medium text-foreground mb-2">{blocks.interview.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{blocks.interview.a}</p>
              </div>
            )}
            {blocks.industry && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Industry application: </span>
                {blocks.industry}
              </p>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({
  open,
  onToggle,
  label,
  icon: Icon,
  color,
  children,
}: {
  open: boolean
  onToggle: () => void
  label: string
  icon: any
  color: string
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium">
          <Icon className={cn('w-4 h-4', color)} />
          {label}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-5 pb-4 pt-1 fade-in">{children}</div>}
    </div>
  )
}
