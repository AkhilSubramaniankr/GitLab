'use client'

import * as React from 'react'
import { Wand2, Lightbulb, CheckCircle2, AlertTriangle, RotateCcw, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Rubric criteria. Each returns a 0-3 score and feedback.
interface RubricResult { score: number; max: number; feedback: string; passed: boolean }

const CRITERIA: { name: string; description: string; check: (p: string) => RubricResult }[] = [
  {
    name: 'Task clarity',
    description: 'Does the prompt state a specific action with a verb and deliverable?',
    check: (p) => {
      const verbs = /\b(write|create|generate|build|compute|calculate|clean|filter|group|sort|merge|join|load|inspect|analyze|convert|refactor|fix|debug|test|document|explain|optimize|visualize|plot|summarize|aggregate|transform)\b/i
      const hasVerb = verbs.test(p)
      const long = p.split(/\s+/).length >= 8
      if (hasVerb && long) return { score: 3, max: 3, feedback: 'Clear action verb and sufficient detail. Copilot knows what to build.', passed: true }
      if (hasVerb) return { score: 2, max: 3, feedback: 'Has an action verb but is too short. Add the deliverable (function? chart? query?).', passed: false }
      return { score: 0, max: 3, feedback: 'No clear action verb. Start with "Write...", "Create...", "Compute...".', passed: false }
    },
  },
  {
    name: 'Input specification',
    description: 'Does it describe the input data (columns, schema, type)?',
    check: (p) => {
      const hasInput = /\b(input|df|dataframe|table|column|schema|with columns|containing|fields)\b/i.test(p)
      const mentionsCol = /\b(order_id|product|revenue|customer|date|region|quantity|price|cost|profit|name|tier)\b/i.test(p)
      if (hasInput && mentionsCol) return { score: 3, max: 3, feedback: 'Explicitly names the input and key columns. Copilot will not hallucinate column names.', passed: true }
      if (hasInput || mentionsCol) return { score: 2, max: 3, feedback: 'Mentions input or columns but not both. Add: "Input: df with columns ..."', passed: false }
      return { score: 0, max: 3, feedback: 'No input described. Copilot will guess column names — often wrong.', passed: false }
    },
  },
  {
    name: 'Constraints',
    description: 'Does it specify constraints (handle missing, preserve, raise error, etc.)?',
    check: (p) => {
      const constraints = /\b(handle|preserve|raise|error|guard|edge case|missing|duplicate|na|nan|null|empty|copy|in.place|return|round|limit|exclude|include)\b/i
      const count = (p.match(constraints) || []).length
      if (count >= 2) return { score: 3, max: 3, feedback: `Multiple constraints stated (${count}). Copilot will handle edge cases.`, passed: true }
      if (count === 1) return { score: 2, max: 3, feedback: 'One constraint. Add at least one more (e.g. "preserve the original", "handle missing values").', passed: false }
      return { score: 0, max: 3, feedback: 'No constraints. Copilot produces generic code that may break on edge cases.', passed: false }
    },
  },
  {
    name: 'Role / expertise',
    description: 'Does it set a role or expertise level?',
    check: (p) => {
      const role = /\b(act as|senior|expert|experienced|you are|as a|data analyst|data scientist|engineer|specialist)\b/i
      if (role.test(p)) return { score: 3, max: 3, feedback: 'Role set. Copilot adopts the right expertise and tone.', passed: true }
      return { score: 1, max: 3, feedback: 'No role. Add "Act as a senior data analyst..." to set expertise.', passed: false }
    },
  },
  {
    name: 'Knowledge / domain context',
    description: 'Does it provide domain knowledge or business rules?',
    check: (p) => {
      const knowledge = /\b(knowledge|business rule|revenue = |profit = |formula|definition|where |note:|context:|background:|known)\b/i
      if (knowledge.test(p)) return { score: 3, max: 3, feedback: 'Domain knowledge provided. Copilot applies the right business rules.', passed: true }
      return { score: 1, max: 3, feedback: 'No domain knowledge. Add formulas or rules: "Knowledge: revenue = quantity × unit_price".', passed: false }
    },
  },
  {
    name: 'Output format',
    description: 'Does it specify the expected output format?',
    check: (p) => {
      const out = /\b(return|output|print|format|as a|series|dataframe|list|dict|chart|plot|table|json|sql)\b/i
      if (out.test(p)) return { score: 3, max: 3, feedback: 'Output format specified. Copilot returns the right type.', passed: true }
      return { score: 1, max: 3, feedback: 'No output format. Add "return as a Series" or "produce a bar chart".', passed: false }
    },
  },
]

const SAMPLE_PROMPTS = [
  {
    label: 'Poor: "Clean this data"',
    text: 'Clean this data',
  },
  {
    label: 'Better: with constraints',
    text: 'Using Python Pandas, clean the sales dataset by dropping duplicate order_id rows, filling missing revenue with 0, and normalizing the region column to Title Case. Preserve the original DataFrame and return a cleaned copy.',
  },
  {
    label: 'Best: full TRICK',
    text: 'T — Task: Write a Python function that calculates total revenue per product and returns the top 5 as a sorted Series.\nR — Role: Act as a senior data analyst experienced with Pandas.\nI — Input: a DataFrame df with columns order_id, product, revenue (float).\nC — Constraints: handle empty DataFrame by returning an empty Series; raise KeyError if "revenue" column is missing; include type hints.\nK — Knowledge: revenue = quantity × unit_price; top products are sorted descending by total revenue.',
  },
]

export function PromptImprovementLab() {
  const [prompt, setPrompt] = React.useState(SAMPLE_PROMPTS[0].text)
  const [results, setResults] = React.useState<RubricResult[] | null>(null)
  const [totalScore, setTotalScore] = React.useState(0)
  const [maxScore, setMaxScore] = React.useState(0)

  const evaluate = () => {
    const rs = CRITERIA.map((c) => c.check(prompt))
    setResults(rs)
    setTotalScore(rs.reduce((s, r) => s + r.score, 0))
    setMaxScore(rs.reduce((s, r) => s + r.max, 0))
  }

  const loadSample = (text: string) => {
    setPrompt(text)
    setResults(null)
  }

  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const grade = pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 50 ? 'C' : 'D'
  const gradeColor = pct >= 85 ? 'text-ai-green' : pct >= 70 ? 'text-ai-blue' : pct >= 50 ? 'text-ai-orange' : 'text-ai-red'

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-ai-purple" /> Prompt Improvement Laboratory
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Write a prompt, get an instant rubric score with specific feedback.</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Sample prompts */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Try a sample prompt</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROMPTS.map((s, i) => (
              <button
                key={i}
                onClick={() => loadSample(s.text)}
                className="text-[11px] px-2 py-1 rounded-full border border-border hover:bg-muted/40 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Your prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setResults(null) }}
            className="w-full text-xs rounded-md border border-border bg-background px-3 py-2 min-h-[100px] resize-y custom-scrollbar font-mono"
            placeholder="Write your prompt here..."
          />
        </div>

        <Button size="sm" onClick={evaluate}>
          <Gauge className="w-3.5 h-3.5 mr-1" /> Score my prompt
        </Button>

        {/* Results */}
        {results && (
          <div className="space-y-3 fade-in">
            {/* Overall score */}
            <div className="rounded-lg border border-border p-4 flex items-center gap-4">
              <div className="text-center">
                <div className={cn('text-3xl font-bold', gradeColor)}>{grade}</div>
                <div className="text-[10px] text-muted-foreground uppercase">grade</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">Overall score</span>
                  <span className={cn('text-sm font-bold', gradeColor)}>{totalScore}/{maxScore} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full transition-all', pct >= 85 ? 'bg-ai-green' : pct >= 70 ? 'bg-ai-blue' : pct >= 50 ? 'bg-ai-orange' : 'bg-ai-red')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {pct >= 85 ? 'Production-ready prompt. Copilot will produce reliable code.' :
                   pct >= 70 ? 'Good prompt with minor gaps. Address the failed criteria below.' :
                   pct >= 50 ? 'Partial prompt. Add the missing TRICK components.' :
                   'Vague prompt. Copilot will guess — likely producing wrong or generic code.'}
                </p>
              </div>
            </div>

            {/* Per-criterion */}
            <div className="space-y-1.5">
              {CRITERIA.map((c, i) => {
                const r = results[i]
                return (
                  <div key={c.name} className={cn(
                    'rounded-lg border p-2.5',
                    r.passed ? 'border-ai-green/30 bg-ai-green/5' : 'border-ai-orange/30 bg-ai-orange/5'
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        {r.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-ai-green" /> : <AlertTriangle className="w-3.5 h-3.5 text-ai-orange" />}
                        {c.name}
                      </span>
                      <span className={cn('text-xs font-mono', r.passed ? 'text-ai-green' : 'text-ai-orange')}>
                        {r.score}/{r.max}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-1">{c.description}</p>
                    <p className={cn('text-[11px]', r.passed ? 'text-ai-green' : 'text-foreground/80')}>{r.feedback}</p>
                  </div>
                )
              })}
            </div>

            {/* TRICK reminder */}
            <div className="rounded-lg bg-ai-purple/5 border border-ai-purple/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ai-purple mb-1.5 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> TRICK framework reminder
              </p>
              <div className="grid grid-cols-5 gap-1 text-[10px]">
                {[['T','Task'],['R','Role'],['I','Input'],['C','Condition'],['K','Knowledge']].map(([l, n]) => (
                  <div key={l} className="text-center p-1 rounded bg-muted/40">
                    <div className="font-bold text-ai-purple">{l}</div>
                    <div className="text-muted-foreground">{n}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
