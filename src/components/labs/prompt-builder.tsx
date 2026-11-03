'use client'

import * as React from 'react'
import { Wand2, Sparkles, Copy, Check, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PromptField {
  key: 'task' | 'role' | 'input' | 'condition' | 'knowledge'
  label: string
  letter: string
  color: string
  desc: string
  placeholder: string
  example: string
}

const FIELDS: PromptField[] = [
  { key: 'task', label: 'Task', letter: 'T', color: 'ai-blue', desc: 'What you want Copilot to do — verb + object + deliverable.', placeholder: 'Write a Python function that...', example: 'Write a Python function that calculates total revenue per product from a Pandas DataFrame and returns the top 5 as a sorted Series.' },
  { key: 'role', label: 'Role', letter: 'R', color: 'ai-purple', desc: 'Who Copilot should act as — sets the expertise level and tone.', placeholder: 'Act as a senior data analyst...', example: 'Act as a senior data analyst experienced with retail sales data and Pandas best practices.' },
  { key: 'input', label: 'Input', letter: 'I', color: 'ai-cyan', desc: 'What data, schema, or context Copilot has to work with.', placeholder: 'Input: a DataFrame with columns...', example: 'Input: a DataFrame named df with columns order_id, order_date, product, category, quantity, unit_price, revenue. The DataFrame may contain missing values and duplicates.' },
  { key: 'condition', label: 'Condition', letter: 'C', color: 'ai-orange', desc: 'Constraints and rules the code must satisfy.', placeholder: 'Constraints: handle missing values, ...', example: 'Constraints: handle missing revenue by filling with 0, exclude duplicate order_id rows, raise ValueError if the DataFrame is empty, and include type hints.' },
  { key: 'knowledge', label: 'Knowledge', letter: 'K', color: 'ai-green', desc: 'Domain knowledge, business rules, or examples Copilot should apply.', placeholder: 'Knowledge: revenue = quantity × unit_price; ...', example: 'Knowledge: revenue = quantity × unit_price; profit = revenue - cost; top products are sorted descending by total revenue.' },
]

const FIELD_STYLES: Record<string, string> = {
  'ai-blue': 'bg-ai-blue/15 text-ai-blue',
  'ai-purple': 'bg-ai-purple/15 text-ai-purple',
  'ai-cyan': 'bg-ai-cyan/15 text-ai-cyan',
  'ai-orange': 'bg-ai-orange/15 text-ai-orange',
  'ai-green': 'bg-ai-green/15 text-ai-green',
}

export function PromptBuilder() {
  const [values, setValues] = React.useState<Record<string, string>>({
    task: '',
    role: '',
    input: '',
    condition: '',
    knowledge: '',
  })
  const [copied, setCopied] = React.useState(false)

  const fullPrompt = FIELDS.map((f) => {
    const v = values[f.key].trim()
    if (!v) return null
    return `${f.letter} — ${f.label}: ${v}`
  }).filter(Boolean).join('\n\n')

  const fillExample = () => setValues(Object.fromEntries(FIELDS.map((f) => [f.key, f.example])))
  const clear = () => setValues({ task: '', role: '', input: '', condition: '', knowledge: '' })

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-ai-purple" /> TRICK Prompt Builder
        </h4>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={fillExample}>Load example</Button>
          <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-x divide-border">
        {/* Inputs */}
        <div className="p-4 space-y-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs',
                  FIELD_STYLES[f.color]
                )}>
                  {f.letter}
                </span>
                <label className="text-xs font-semibold">{f.label}</label>
              </div>
              <p className="text-[11px] text-muted-foreground mb-1.5">{f.desc}</p>
              <textarea
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5 min-h-[60px] resize-y custom-scrollbar"
              />
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ai-purple" /> Generated prompt
            </p>
            <Button size="sm" variant="ghost" onClick={onCopy} disabled={!fullPrompt}>
              {copied ? <Check className="w-3.5 h-3.5 text-ai-green" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <div className="flex-1 rounded-lg bg-[#0d1117] text-[#e6edf3] p-3 text-xs font-mono whitespace-pre-wrap min-h-[200px]">
            {fullPrompt || <span className="text-muted-foreground italic">Fill in any field above to build your structured prompt...</span>}
          </div>
          <div className="mt-3 rounded-lg bg-ai-blue/5 border border-ai-blue/20 p-3 flex gap-2 items-start">
            <Lightbulb className="w-3.5 h-3.5 text-ai-blue shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              A complete TRICK prompt gives Copilot the role, context, and constraints it needs to produce code you can trust.
              Paste this into Copilot Chat or use it as the opening comment of a Python file.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
