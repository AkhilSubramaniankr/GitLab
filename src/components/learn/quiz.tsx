'use client'

import * as React from 'react'
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export interface QuizQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface QuizProps {
  id: string
  title?: string
  questions: QuizQuestion[]
}

export function Quiz({ id, title = 'Knowledge Check', questions }: QuizProps) {
  const recordQuiz = useAppStore((s) => s.recordQuiz)
  const [answers, setAnswers] = React.useState<(number | null)[]>(questions.map(() => null))
  const [submitted, setSubmitted] = React.useState(false)
  const [recorded, setRecorded] = React.useState(false)

  const score = answers.reduce<number>((acc, a, i) => acc + (a === questions[i].correct ? 1 : 0), 0)
  const allAnswered = answers.every((a) => a !== null)

  React.useEffect(() => {
    if (submitted && !recorded) {
      recordQuiz(id, score as number, questions.length)
      setRecorded(true)
    }
  }, [submitted, recorded, recordQuiz, id, score, questions.length])

  const reset = () => {
    setAnswers(questions.map(() => null))
    setSubmitted(false)
    setRecorded(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-ai-orange" />
          {title}
        </h4>
        {submitted && (
          <div className={cn(
            'text-sm font-semibold px-3 py-1 rounded-full',
            score === questions.length ? 'bg-ai-green/15 text-ai-green' :
            score >= questions.length / 2 ? 'bg-ai-orange/15 text-ai-orange' :
            'bg-ai-red/15 text-ai-red'
          )}>
            {score} / {questions.length}
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {questions.map((question, qi) => (
          <div key={qi}>
            <div className="flex items-start gap-2 mb-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                {qi + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">{question.q}</p>
                {question.difficulty && (
                  <span className={cn(
                    'inline-block mt-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold',
                    question.difficulty === 'beginner' && 'bg-ai-green/15 text-ai-green',
                    question.difficulty === 'intermediate' && 'bg-ai-orange/15 text-ai-orange',
                    question.difficulty === 'advanced' && 'bg-ai-red/15 text-ai-red',
                  )}>
                    {question.difficulty}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-2 ml-8">
              {question.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                const isCorrect = oi === question.correct
                const showResult = submitted
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => {
                      setAnswers((prev) => {
                        const next = [...prev]
                        next[qi] = oi
                        return next
                      })
                    }}
                    className={cn(
                      'flex items-center gap-2.5 text-left px-3 py-2 rounded-lg border text-sm transition-all',
                      !showResult && selected && 'border-primary bg-primary/5',
                      !showResult && !selected && 'border-border hover:border-primary/40 hover:bg-muted/40',
                      showResult && isCorrect && 'border-ai-green bg-ai-green/10',
                      showResult && selected && !isCorrect && 'border-ai-red bg-ai-red/10',
                      showResult && !selected && !isCorrect && 'border-border opacity-60',
                    )}
                  >
                    <span className={cn(
                      'shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold',
                      !showResult && selected && 'border-primary bg-primary text-primary-foreground',
                      !showResult && !selected && 'border-muted-foreground/40',
                      showResult && isCorrect && 'border-ai-green bg-ai-green text-white',
                      showResult && selected && !isCorrect && 'border-ai-red bg-ai-red text-white',
                      showResult && !selected && !isCorrect && 'border-muted-foreground/40',
                    )}>
                      {showResult && isCorrect ? <CheckCircle2 className="w-3 h-3" /> :
                       showResult && selected && !isCorrect ? <XCircle className="w-3 h-3" /> :
                       String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                )
              })}
            </div>
            {submitted && (
              <div className={cn(
                'mt-2 ml-8 p-2.5 rounded-lg text-xs leading-relaxed fade-in',
                answers[qi] === question.correct ? 'bg-ai-green/5 text-ai-green' : 'bg-ai-orange/5 text-ai-orange'
              )}>
                {answers[qi] === question.correct ? '✓ Correct. ' : '✗ Not quite. '}
                {question.explanation}
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          {!submitted ? (
            <Button onClick={() => setSubmitted(true)} disabled={!allAnswered} size="sm">
              Submit answers
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={reset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" />
              Try again
            </Button>
          )}
          {!allAnswered && !submitted && (
            <span className="text-xs text-muted-foreground">Answer all questions to submit</span>
          )}
        </div>
      </div>
    </div>
  )
}
