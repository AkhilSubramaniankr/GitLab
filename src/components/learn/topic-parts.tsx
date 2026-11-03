'use client'

import * as React from 'react'
import { CheckCircle2, Circle, Clock, ListChecks, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface TopicHeaderProps {
  day: number
  title: string
  duration: string
  objectives: string[]
  prerequisites: string
  color: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red'
  icon: React.ReactNode
}

const colorMap = {
  blue: 'from-ai-blue/20 to-ai-blue/5 text-ai-blue border-ai-blue/30',
  purple: 'from-ai-purple/20 to-ai-purple/5 text-ai-purple border-ai-purple/30',
  cyan: 'from-ai-cyan/20 to-ai-cyan/5 text-ai-cyan border-ai-cyan/30',
  green: 'from-ai-green/20 to-ai-green/5 text-ai-green border-ai-green/30',
  orange: 'from-ai-orange/20 to-ai-orange/5 text-ai-orange border-ai-orange/30',
  red: 'from-ai-red/20 to-ai-red/5 text-ai-red border-ai-red/30',
}

export function TopicHeader({ day, title, duration, objectives, prerequisites, color, icon }: TopicHeaderProps) {
  return (
    <div className={cn('rounded-xl border bg-gradient-to-br p-6 mb-6', colorMap[color])}>
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-xl bg-background/80 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Day {day}</span>
            <span className="text-xs flex items-center gap-1 opacity-80">
              <Clock className="w-3 h-3" /> {duration}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">{title}</h1>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5 opacity-90">
                <Target className="w-3.5 h-3.5" /> Learning objectives
              </p>
              <ul className="space-y-1">
                {objectives.slice(0, 3).map((o, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex gap-2">
                    <span className="opacity-60 shrink-0">•</span>
                    <span>{o}</span>
                  </li>
                ))}
                {objectives.length > 3 && (
                  <li className="text-xs text-foreground/60 italic">+{objectives.length - 3} more</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5 opacity-90">
                <ListChecks className="w-3.5 h-3.5" /> Prerequisites
              </p>
              <p className="text-sm text-foreground/80">{prerequisites}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LessonSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const completed = useAppStore((s) => s.progress.completedLessons[id])
  const toggle = useAppStore((s) => s.toggleLesson)

  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {completed ? (
            <CheckCircle2 className="w-5 h-5 text-ai-green" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/40" />
          )}
          {title}
        </h2>
        <Button
          variant={completed ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => toggle(id)}
          className="shrink-0"
        >
          {completed ? 'Completed' : 'Mark complete'}
        </Button>
      </div>
      <div className="pl-7">{children}</div>
    </section>
  )
}

export function Callout({ type = 'info', title, children }: { type?: 'info' | 'tip' | 'warning' | 'danger' | 'success'; title?: string; children: React.ReactNode }) {
  const styles = {
    info: 'bg-ai-blue/5 border-ai-blue/30 text-ai-blue',
    tip: 'bg-ai-purple/5 border-ai-purple/30 text-ai-purple',
    warning: 'bg-ai-orange/5 border-ai-orange/30 text-ai-orange',
    danger: 'bg-ai-red/5 border-ai-red/30 text-ai-red',
    success: 'bg-ai-green/5 border-ai-green/30 text-ai-green',
  }[type]
  const icons = {
    info: 'ℹ️',
    tip: '💡',
    warning: '⚠️',
    danger: '🚫',
    success: '✅',
  }
  return (
    <div className={cn('rounded-lg border p-4 my-4', styles)}>
      {title && <p className="font-semibold text-sm mb-1 flex items-center gap-1.5">{icons[type]} {title}</p>}
      <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
    </div>
  )
}

export function PracticalExercise({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const completed = useAppStore((s) => s.progress.exercisesCompleted[id])
  const toggle = useAppStore((s) => s.toggleExercise)
  return (
    <div className={cn('rounded-xl border-2 border-dashed p-5 my-4', completed ? 'border-ai-green bg-ai-green/5' : 'border-ai-purple/40 bg-ai-purple/5')}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm flex items-center gap-2 text-ai-purple">
          <span className="text-base">🛠️</span> Practical Exercise: {title}
        </h4>
        <Button variant={completed ? 'secondary' : 'outline'} size="sm" onClick={() => toggle(id)}>
          {completed ? '✓ Done' : 'Mark done'}
        </Button>
      </div>
      <div className="text-sm text-foreground/90 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}
