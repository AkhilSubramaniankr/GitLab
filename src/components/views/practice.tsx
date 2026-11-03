'use client'

import * as React from 'react'
import { ClipboardCheck, Trophy } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Quiz, type QuizQuestion } from '@/components/learn/quiz'
import { cn } from '@/lib/utils'

// Comprehensive quiz bank — pulls questions from all 10 days plus general questions.
const ALL_QUIZZES: { id: string; title: string; questions: QuizQuestion[] }[] = [
  {
    id: 'practice-git', title: 'Git & GitHub Fundamentals',
    questions: [
      { q: 'What is the difference between Git and GitHub?', options: ['Git is a tool; GitHub hosts Git repos', 'They are the same', 'GitHub is a tool; Git is a service', 'Git is for documents only'], correct: 0, explanation: 'Git is the version control engine; GitHub is a hosting service that adds collaboration.', difficulty: 'beginner' },
      { q: 'Which command stages a file?', options: ['git commit', 'git add', 'git push', 'git stage'], correct: 1, explanation: 'git add moves a file to the staging area. git commit then records the snapshot.', difficulty: 'beginner' },
      { q: 'What does .gitignore do?', options: ['Lists files Git should not track', 'Deletes files', 'Encrypts files', 'Pushes files to GitHub'], correct: 0, explanation: '.gitignore patterns tell Git which files to skip.', difficulty: 'beginner' },
      { q: 'You pushed an API key by accident. First action?', options: ['Add to .gitignore', 'Rotate the key immediately', 'Delete the file', 'Email GitHub'], correct: 1, explanation: 'Treat any pushed secret as compromised. Rotate first, then clean history.', difficulty: 'intermediate' },
      { q: 'What does git push -u origin main do?', options: ['Pushes main and sets upstream', 'Pulls from origin', 'Creates a branch', 'Merges origin'], correct: 0, explanation: '-u sets the upstream tracking branch so future push/pull work without args.', difficulty: 'intermediate' },
    ],
  },
  {
    id: 'practice-copilot', title: 'Copilot Fundamentals',
    questions: [
      { q: 'Inline Chat is opened with which shortcut?', options: ['Tab', 'Ctrl+I (Cmd+I)', 'Ctrl+Shift+P', 'F1'], correct: 1, explanation: 'Ctrl+I (Cmd+I on macOS) opens Inline Chat on the current selection.', difficulty: 'beginner' },
      { q: 'Ghost text represents?', options: ['A deleted file', 'Copilot\'s inline suggestion', 'An error', 'A hidden comment'], correct: 1, explanation: 'Ghost text is the suggested completion. Tab accepts; Esc dismisses.', difficulty: 'beginner' },
      { q: 'Which @mention adds project-wide context?', options: ['@file', '@terminal', '@workspace', '@project'], correct: 2, explanation: '@workspace includes your whole project.', difficulty: 'intermediate' },
      { q: 'Most important responsible-AI practice?', options: ['Always accept suggestions', 'Review every line', 'Disable for production', 'Use only for tests'], correct: 1, explanation: 'AI can hallucinate. You own every line that ships.', difficulty: 'beginner' },
    ],
  },
  {
    id: 'practice-prompt', title: 'Prompt Engineering',
    questions: [
      { q: 'What does T stand for in TRICK?', options: ['Type', 'Task', 'Test', 'Token'], correct: 1, explanation: 'T = Task: the action you want Copilot to perform.', difficulty: 'beginner' },
      { q: 'Few-shot prompting means:', options: ['Fewer shots', 'Providing 2-3 examples', 'No examples', 'Repeat the question'], correct: 1, explanation: 'Few-shot includes examples to bias the output.', difficulty: 'intermediate' },
      { q: 'Common Pandas hallucination?', options: ['Correct column names', 'Invented column names', 'Refusing code', 'Too many comments'], correct: 1, explanation: 'Copilot may guess "date" when your column is "order_date".', difficulty: 'intermediate' },
      { q: 'Why does schema context improve output?', options: ['No effect', 'Removes column-name ambiguity', 'Speeds response', 'Triggers billing'], correct: 1, explanation: 'Explicit schema eliminates the most common Pandas error source.', difficulty: 'intermediate' },
    ],
  },
  {
    id: 'practice-debug', title: 'Debugging & Testing',
    questions: [
      { q: 'Hardest error to detect?', options: ['Syntax', 'Runtime', 'Logical', 'Import'], correct: 2, explanation: 'Logical errors run but return wrong results. Tests are the only catch.', difficulty: 'beginner' },
      { q: 'Cause of SettingWithCopyWarning?', options: ['Typo', 'Assigning to a view DataFrame', 'Missing import', 'Wrong version'], correct: 1, explanation: 'Pandas warns when you assign to a slice. Fix with .copy().', difficulty: 'intermediate' },
      { q: 'How to validate AI-generated tests?', options: ['Trust them', 'Verify each assertion against a manual value', 'Delete if failing', 'Ask Copilot'], correct: 1, explanation: 'Generated tests can assert wrong values. Verify by hand.', difficulty: 'intermediate' },
      { q: 'Refactoring should always:', options: ['Change behavior', 'Preserve behavior', 'Remove comments', 'Add lines'], correct: 1, explanation: 'Refactoring changes structure, not behavior. Run tests before and after.', difficulty: 'beginner' },
    ],
  },
  {
    id: 'practice-collab', title: 'Collaboration',
    questions: [
      { q: 'Which creates + switches to a branch?', options: ['git branch name', 'git switch -c name', 'git merge name', 'git clone name'], correct: 1, explanation: 'git switch -c creates and checks out in one step.', difficulty: 'beginner' },
      { q: '<<<<<<< HEAD markers indicate?', options: ['Syntax error', 'Merge conflict', 'Git crash', 'Wrong Python'], correct: 1, explanation: 'Conflict markers. Edit the file to keep the right version, then add + commit.', difficulty: 'beginner' },
      { q: 'A Pull Request represents?', options: ['A bug report', 'A request to merge a feature branch', 'A support request', 'A backup'], correct: 1, explanation: 'A PR proposes merging one branch into another, with review and CI.', difficulty: 'beginner' },
      { q: 'Best practice for analytics code?', options: ['Commit notebooks with outputs', 'Pin dependency versions', 'Mix refactor + features', 'Commit raw data'], correct: 1, explanation: 'Pinned versions ensure reproducibility.', difficulty: 'intermediate' },
    ],
  },
  {
    id: 'practice-sql', title: 'SQL Analytics',
    questions: [
      { q: 'Which JOIN keeps all left rows?', options: ['INNER', 'LEFT', 'RIGHT', 'CROSS'], correct: 1, explanation: 'LEFT JOIN keeps every left row; missing right cols are NULL.', difficulty: 'beginner' },
      { q: 'COUNT(*) vs COUNT(col)?', options: ['Identical', 'COUNT(*) counts all rows; COUNT(col) skips NULLs', 'COUNT(col) is faster', 'COUNT(*) is faster'], correct: 1, explanation: 'COUNT(*) counts rows; COUNT(col) counts non-NULL values.', difficulty: 'intermediate' },
      { q: 'CTE vs subquery?', options: ['Always interchangeable', 'CTEs for multi-step; subqueries for simple lookups', 'Subqueries always better', 'CTEs deprecated'], correct: 1, explanation: 'CTEs shine for multi-step logic; subqueries for simple lookups.', difficulty: 'intermediate' },
      { q: 'ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC)?', options: ['Counts rows', 'Numbers rows 1..N within each region, highest revenue first', 'Returns region', 'Deletes dups'], correct: 1, explanation: 'PARTITION BY defines the group; ORDER BY ranks within it.', difficulty: 'advanced' },
      { q: 'Prevent SQL injection in Python?', options: ['f-strings', 'Parameterized queries', 'Trust input', 'Disable connection'], correct: 1, explanation: 'Parameterized queries separate SQL from data.', difficulty: 'intermediate' },
    ],
  },
  {
    id: 'practice-data', title: 'Data Analytics & Visualization',
    questions: [
      { q: 'First thing after loading a CSV?', options: ['Build a model', 'Inspect: shape, dtypes, head, info', 'Plot everything', 'Export to Excel'], correct: 1, explanation: 'Inspection reveals schema, types, missing values, issues.', difficulty: 'beginner' },
      { q: 'Why compare mean and median?', options: ['They should match', 'Large difference signals skew or outliers', 'Median is wrong', 'Mean is wrong'], correct: 1, explanation: 'Median is robust; if mean >> median, distribution is skewed.', difficulty: 'intermediate' },
      { q: 'Correlation of -0.9 means?', options: ['No relationship', 'Strong negative linear', 'Strong positive', 'Causation'], correct: 1, explanation: 'Strong negative linear relationship. Not causation.', difficulty: 'intermediate' },
      { q: 'How does Pandas .sum() handle NaN?', options: ['Returns NaN', 'Skips NaN', 'Treats as 0', 'Raises error'], correct: 1, explanation: '.sum() skips NaN by default. Use skipna=False to change.', difficulty: 'intermediate' },
      { q: 'Best chart for distribution of one numeric var?', options: ['Pie', 'Bar', 'Histogram', 'Scatter'], correct: 2, explanation: 'Histograms bin a numeric variable and show frequency.', difficulty: 'beginner' },
      { q: 'IQR outlier rule?', options: ['>1 std from mean', 'Below Q1-1.5×IQR or above Q3+1.5×IQR', 'Equal to median', 'Top 10%'], correct: 1, explanation: 'IQR = Q3-Q1. Outliers fall outside [Q1-1.5×IQR, Q3+1.5×IQR].', difficulty: 'advanced' },
    ],
  },
  {
    id: 'practice-agents', title: 'Agents & Advanced Features',
    questions: [
      { q: 'Assistant vs agent?', options: ['Agents are faster', 'Agents use tools over multiple steps', 'Agents are cheaper', 'Assistants cannot code'], correct: 1, explanation: 'Assistants respond to one prompt. Agents pursue a goal using tools.', difficulty: 'intermediate' },
      { q: 'Recommended workflow for unfamiliar task?', options: ['Run agent end-to-end', 'Plan first, review, then agent mode', 'Ask only', 'Skip'], correct: 1, explanation: 'Plan → review → execute catches misunderstandings safely.', difficulty: 'intermediate' },
      { q: 'Which tool always needs approval?', options: ['read_file', 'search_files', 'edit_file and run_terminal_command', 'None'], correct: 2, explanation: 'Tools with side effects need approval; read-only tools can auto-approve.', difficulty: 'intermediate' },
      { q: '.github/copilot-instructions.md does what?', options: ['A README', 'Tells Copilot your conventions', 'Installs Copilot', 'Blocks Copilot'], correct: 1, explanation: 'Auto-included in context so suggestions follow your style.', difficulty: 'intermediate' },
      { q: 'MCP is?', options: ['A language', 'A protocol for agents to use external tools', 'A Git replacement', 'A database'], correct: 1, explanation: 'MCP connects agents to external tools via a standard interface.', difficulty: 'advanced' },
    ],
  },
]

export function PracticeView() {
  const { progress } = useAppStore()
  const totalQuestions = ALL_QUIZZES.reduce((s, q) => s + q.questions.length, 0)
  const answeredQuizzes = ALL_QUIZZES.filter((q) => progress.quizScores[q.id]).length
  const bestScores = ALL_QUIZZES.map((q) => progress.quizScores[q.id]?.score ?? 0)
  const totalEarned = bestScores.reduce((s, v) => s + v, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><ClipboardCheck className="w-6 h-6 text-ai-orange" /> Practice & Quizzes</h1>
        <p className="text-sm text-muted-foreground">Consolidated quiz bank across all 10 modules. {totalQuestions} questions total.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Quizzes attempted</p>
          <p className="text-2xl font-bold">{answeredQuizzes}/{ALL_QUIZZES.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Best score total</p>
          <p className="text-2xl font-bold">{totalEarned}/{totalQuestions}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Overall accuracy</p>
          <p className="text-2xl font-bold">{totalQuestions ? Math.round((totalEarned / totalQuestions) * 100) : 0}%</p>
        </Card>
      </div>

      <div className="space-y-6">
        {ALL_QUIZZES.map((q) => {
          const score = progress.quizScores[q.id]
          return (
            <div key={q.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-ai-orange" /> {q.title}
                </h2>
                {score && (
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    score.score === score.total ? 'bg-ai-green/15 text-ai-green' :
                    score.score >= score.total / 2 ? 'bg-ai-orange/15 text-ai-orange' :
                    'bg-ai-red/15 text-ai-red'
                  )}>
                    Best: {score.score}/{score.total} · {score.attempts} attempt{score.attempts > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Quiz id={q.id} questions={q.questions} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
