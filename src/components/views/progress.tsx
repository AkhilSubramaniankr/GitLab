'use client'

import * as React from 'react'
import { TrendingUp, RotateCcw, Trophy, CheckCircle2, ClipboardList, FlaskConical, Award } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ProgressView() {
  const { progress, resetProgress, setView } = useAppStore()

  // Count completed lessons per day (lessons prefixed d1-, d2-, etc.)
  const dayProgress = CURRICULUM.map((d) => {
    const dayLessons = Object.keys(progress.completedLessons).filter((k) => k.startsWith(`d${d.day}-`))
    const completed = dayLessons.filter((k) => progress.completedLessons[k]).length
    // Approx total lessons per day (varies)
    const expectedTotals: Record<number, number> = { 1: 11, 2: 8, 3: 6, 4: 8, 5: 6, 6: 6, 7: 7, 8: 8, 9: 9, 10: 9 }
    const total = expectedTotals[d.day] || 8
    return { ...d, completed, total, pct: Math.round((completed / total) * 100) }
  })

  const totalLessons = dayProgress.reduce((s, d) => s + d.total, 0)
  const completedLessons = dayProgress.reduce((s, d) => s + d.completed, 0)
  const overallPct = Math.round((completedLessons / totalLessons) * 100)

  const exercisesCompleted = Object.values(progress.exercisesCompleted).filter(Boolean).length
  const totalExercises = 10
  const capstoneDone = Object.values(progress.capstoneTasks).filter(Boolean).length
  const totalCapstone = 16

  const quizScores = Object.entries(progress.quizScores)
  const totalQuizzes = 16 // day quizzes + practice quizzes
  const avgScore = quizScores.length
    ? Math.round((quizScores.reduce((s, [, v]) => s + (v.score / v.total), 0) / quizScores.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-ai-green" /> Progress Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your journey through the 10-day curriculum. Progress is saved locally in your browser.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { if (confirm('Reset all progress? This cannot be undone.')) resetProgress() }}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset all progress
        </Button>
      </div>

      {/* Overall progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Overall course progress</h2>
          <span className="text-2xl font-bold text-ai-green">{overallPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-ai-purple via-ai-blue to-ai-green transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{completedLessons} of {totalLessons} lessons completed</p>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={CheckCircle2} label="Lessons" value={`${completedLessons}/${totalLessons}`} pct={overallPct} color="green" />
        <StatTile icon={FlaskConical} label="Practical exercises" value={`${exercisesCompleted}/${totalExercises}`} pct={Math.round((exercisesCompleted / totalExercises) * 100)} color="purple" />
        <StatTile icon={Trophy} label="Avg quiz score" value={`${avgScore}%`} pct={avgScore} color="orange" />
        <StatTile icon={Award} label="Capstone tasks" value={`${capstoneDone}/${totalCapstone}`} pct={Math.round((capstoneDone / totalCapstone) * 100)} color="cyan" />
      </div>

      {/* Per-day breakdown */}
      <Card className="p-5">
        <h2 className="font-semibold text-sm mb-3">Per-module progress</h2>
        <div className="space-y-3">
          {dayProgress.map((d) => (
            <button key={d.id} onClick={() => setView(d.view as any)} className="w-full text-left group">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                  d.pct === 100 ? 'bg-ai-green/15 text-ai-green' :
                  d.pct > 0 ? 'bg-ai-blue/15 text-ai-blue' : 'bg-muted text-muted-foreground'
                )}>
                  {d.pct === 100 ? <CheckCircle2 className="w-4 h-4" /> : `D${d.day}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate group-hover:text-primary">{d.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{d.completed}/{d.total} · {d.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-ai-purple to-ai-green transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Quiz history */}
      <Card className="p-5">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-ai-orange" /> Quiz history</h2>
        {quizScores.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No quizzes attempted yet. Visit any module or the Practice page to start.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {quizScores.map(([id, score]) => (
              <div key={id} className="rounded-lg border border-border p-3">
                <p className="text-xs font-mono text-muted-foreground">{id}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={cn('text-sm font-semibold',
                    score.score === score.total ? 'text-ai-green' :
                    score.score >= score.total / 2 ? 'text-ai-orange' : 'text-ai-red'
                  )}>{score.score}/{score.total}</span>
                  <span className="text-[10px] text-muted-foreground">{score.attempts} attempt{score.attempts > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Next steps */}
      <Card className="p-5">
        <h2 className="font-semibold text-sm mb-3">Suggested next steps</h2>
        <div className="space-y-2">
          {overallPct === 0 && (
            <Suggestion text="Start with Day 1: Git & GitHub Fundamentals." action="Start Day 1" onClick={() => setView('day1')} />
          )}
          {overallPct > 0 && overallPct < 50 && (
            <Suggestion text="Keep going! Pick up where you left off." action="View modules" onClick={() => setView('dashboard')} />
          )}
          {overallPct >= 50 && overallPct < 100 && (
            <Suggestion text="You're over halfway. Try the capstone project next." action="Open capstone" onClick={() => setView('day10')} />
          )}
          {overallPct === 100 && (
            <Suggestion text="Congratulations! You've completed the curriculum. Apply your skills to a real project." action="Back to dashboard" onClick={() => setView('dashboard')} />
          )}
        </div>
      </Card>
    </div>
  )
}

function StatTile({ icon: Icon, label, value, pct, color }: { icon: any; label: string; value: string; pct: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-ai-green bg-ai-green/10',
    purple: 'text-ai-purple bg-ai-purple/10',
    orange: 'text-ai-orange bg-ai-orange/10',
    cyan: 'text-ai-cyan bg-ai-cyan/10',
  }
  return (
    <Card className="p-4">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', colors[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-current opacity-60" style={{ width: `${pct}%` }} />
      </div>
    </Card>
  )
}

function Suggestion({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30">
      <span className="text-sm text-muted-foreground">{text}</span>
      <Button size="sm" variant="outline" onClick={onClick}>{action}</Button>
    </div>
  )
}
