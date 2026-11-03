'use client'

import * as React from 'react'
import { ArrowRight, Sparkles, Database, Code2, BarChart3, GitBranch, Bot, CheckCircle2, Circle, Zap, Target, Trophy, Clock } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const COLOR_CLASS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-ai-blue/10', text: 'text-ai-blue', border: 'border-ai-blue/30' },
  purple: { bg: 'bg-ai-purple/10', text: 'text-ai-purple', border: 'border-ai-purple/30' },
  cyan: { bg: 'bg-ai-cyan/10', text: 'text-ai-cyan', border: 'border-ai-cyan/30' },
  green: { bg: 'bg-ai-green/10', text: 'text-ai-green', border: 'border-ai-green/30' },
  orange: { bg: 'bg-ai-orange/10', text: 'text-ai-orange', border: 'border-ai-orange/30' },
  red: { bg: 'bg-ai-red/10', text: 'text-ai-red', border: 'border-ai-red/30' },
}

const HERO_STEPS = [
  { label: 'Business Problem', icon: Target, color: 'text-ai-orange', desc: 'Define the analytical question: e.g. "Why did Q3 revenue drop in the West region?"' },
  { label: 'Copilot Prompt', icon: Sparkles, color: 'text-ai-purple', desc: 'Write a TRICK-structured prompt: Task, Role, Input, Condition, Knowledge.' },
  { label: 'AI-Assisted Code', icon: Code2, color: 'text-ai-blue', desc: 'Copilot generates Pandas/SQL code that you review, edit, and accept.' },
  { label: 'Data Analysis', icon: BarChart3, color: 'text-ai-cyan', desc: 'Run the code, inspect outputs, validate every number against the source data.' },
  { label: 'Validation', icon: CheckCircle2, color: 'text-ai-green', desc: 'Cross-check aggregations, edge cases, and statistical assumptions.' },
  { label: 'Business Insight', icon: Zap, color: 'text-ai-orange', desc: 'Translate results into a clear recommendation the business can act on.' },
  { label: 'GitHub Project', icon: GitBranch, color: 'text-ai-blue', desc: 'Commit the cleaned code, README, and visualizations to a shared repository.' },
]

export function Dashboard() {
  const { setView, progress } = useAppStore()
  const completedLessons = Object.values(progress.completedLessons).filter(Boolean).length
  const overallPct = Math.round((completedLessons / 120) * 100)
  const [activeStep, setActiveStep] = React.useState(0)

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-sidebar via-sidebar to-primary/20 text-sidebar-foreground p-8 md:p-12">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, var(--ai-purple) 0, transparent 35%), radial-gradient(circle at 80% 70%, var(--ai-blue) 0, transparent 35%)'
        }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sidebar-accent text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-ai-purple" />
            10 Days · 20 Hours · Beginner to Intermediate
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
            GitHub Copilot for<br />
            <span className="bg-gradient-to-r from-ai-purple to-ai-cyan bg-clip-text text-transparent">Data Analytics</span>
          </h1>
          <p className="text-base md:text-lg text-sidebar-foreground/80 max-w-2xl mb-6 leading-relaxed">
            Learn Git, GitHub, GitHub Copilot, prompt engineering, AI-assisted Python, SQL, debugging, data visualization, and modern agent workflows through interactive practical lessons.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setView('day1')} size="lg">
              Start Learning <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button onClick={() => setView('labs')} variant="secondary" size="lg" className="bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80">
              Open Interactive Labs
            </Button>
            <Button onClick={() => setView('day10')} variant="ghost" size="lg" className="text-sidebar-foreground hover:bg-sidebar-accent/50">
              View Capstone Project
            </Button>
          </div>
        </div>
      </section>

      {/* Hero workflow visualization */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">The AI-Assisted Analytics Workflow</h2>
          <span className="text-xs text-muted-foreground">Click each step to explore</span>
        </div>
        <Card className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
            {HERO_STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all',
                  activeStep === i ? `${COLOR_CLASS[step.color === 'text-ai-orange' ? 'orange' : step.color === 'text-ai-purple' ? 'purple' : step.color === 'text-ai-blue' ? 'blue' : step.color === 'text-ai-cyan' ? 'cyan' : 'green'].bg} ${COLOR_CLASS[step.color === 'text-ai-orange' ? 'orange' : step.color === 'text-ai-purple' ? 'purple' : step.color === 'text-ai-blue' ? 'blue' : step.color === 'text-ai-cyan' ? 'cyan' : 'green'].border}` : 'border-border hover:bg-muted/40'
                )}
              >
                <step.icon className={cn('w-5 h-5', step.color)} />
                <span className="text-[11px] font-medium leading-tight">{step.label}</span>
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-muted/40 p-4 fade-in" key={activeStep}>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-bold uppercase tracking-wider', HERO_STEPS[activeStep].color)}>
                Step {activeStep + 1} of {HERO_STEPS.length}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{HERO_STEPS[activeStep].desc}</p>
          </div>
        </Card>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Course Duration" value="20 hrs" sub="10 days × 2 hrs" color="blue" />
        <StatCard icon={GitBranch} label="Modules" value="10" sub="Git → Agents → Capstone" color="purple" />
        <StatCard icon={Database} label="Interactive Labs" value="9+" sub="Real execution & sims" color="cyan" />
        <StatCard icon={Trophy} label="Your Progress" value={`${overallPct}%`} sub={`${completedLessons} lessons done`} color="green" />
      </section>

      {/* Module grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Course Modules</h2>
          <Button variant="ghost" size="sm" onClick={() => setView('labs')}>
            All labs <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURRICULUM.map((day) => {
            const color = COLOR_CLASS[day.color]
            return (
              <button
                key={day.id}
                onClick={() => setView(day.view as any)}
                className="text-left group"
              >
                <Card className="p-5 h-full hover:border-primary/40 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color.bg, color.text)}>
                      <span className="font-bold text-sm">D{day.day}</span>
                    </div>
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', color.bg, color.text)}>
                      {day.duration}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors">{day.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{day.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{day.topicCount} topics</span>
                    <span className={cn('inline-flex items-center gap-1 font-medium', color.text)}>
                      Start <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      </section>

      {/* Quick start */}
      <section className="rounded-xl border border-ai-purple/30 bg-gradient-to-br from-ai-purple/5 to-transparent p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-ai-purple/15 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-ai-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">New to AI-assisted analytics?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Start with Day 1 to set up Git and GitHub, then move through the curriculum in order. Each day builds on the previous one and ends with a hands-on exercise and quiz.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setView('day1')}>Begin Day 1 <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
              <Button size="sm" variant="outline" onClick={() => setView('glossary')}>Browse glossary</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  const c = COLOR_CLASS[color]
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg, c.text)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  )
}
