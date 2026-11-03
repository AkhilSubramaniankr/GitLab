'use client'

import * as React from 'react'
import { GitPullRequest, ArrowRight, ArrowLeft, GitMerge, GitBranch, CheckCircle2, MessageSquare } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { BranchSimulator, PRSimulator } from '@/components/labs/branch-pr-simulator'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'

const day = CURRICULUM[5]

export function Day6View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<GitPullRequest className="w-7 h-7 text-ai-orange" />}
      />

      <LessonSection id="d6-branches" title="1. Git Branches — Creating, Switching & Workflows">
        <ConceptExplorer
          title="Git Branches"
          icon={<GitBranch className="w-4 h-4 text-ai-orange" />}
          blocks={{
            what: 'A branch is a lightweight movable pointer to a commit. The default branch is usually main. New branches let you work in isolation.',
            why: 'Branches let multiple people (or one person on multiple features) work in parallel without breaking main.',
            when: 'Always work on a feature branch — never commit directly to main on a shared project.',
            how: 'git checkout -b feature/cleaning creates and switches in one command. Or git switch -c feature/cleaning (Git 2.23+).',
            syntax: 'git branch                          # list branches\ngit switch -b feature/cleaning       # create + switch\ngit switch main                       # switch back\ngit branch -d feature/cleaning       # delete (after merge)',
            application: 'A Data Analyst creates feature/sql-window-functions to experiment with window functions without breaking the production dashboard code on main.',
            commonMistakes: ['Forgetting to switch branches before starting work — commits land on the wrong branch.', 'Naming branches vaguely ("test", "new") — use feature/<topic> or fix/<topic>.'],
            bestPractices: ['Branch naming: feature/X, fix/X, docs/X, chore/X.', 'Keep branches short-lived (days, not weeks).', 'Rebase onto main before opening a PR to avoid messy merges.'],
            interview: { q: 'What is the difference between git merge and git rebase?', a: 'git merge creates a new merge commit that combines two branches — history is preserved but becomes a graph. git rebase replays your branch commits on top of the target branch — history stays linear but commit hashes change. Use merge for shared branches (main); rebase for your own feature branch before opening a PR.' },
          }}
        />
      </LessonSection>

      <LessonSection id="d6-simulator" title="2. Interactive: Branching & Merging Simulator">
        <p className="text-sm leading-relaxed mb-3">
          Create branches, commit changes, and merge them back. Watch the branch graph update in real time.
        </p>
        <BranchSimulator />
      </LessonSection>

      <LessonSection id="d6-conflicts" title="3. Merge Conflicts — Resolution Lab">
        <ConceptExplorer
          title="Merge Conflicts"
          icon={<GitMerge className="w-4 h-4 text-ai-red" />}
          blocks={{
            what: 'When two branches modify the same lines and Git cannot auto-merge, it pauses and asks you to choose.',
            why: 'Conflicts are a natural part of collaboration. Resolving them well keeps history clean and intent clear.',
            when: 'When merging or rebasing branches that touched the same code.',
            how: 'Git inserts conflict markers (<<<<<<< ======= >>>>>>>) into the file. Edit the file to keep the correct version, remove the markers, then git add + git commit.',
            syntax: '<<<<<<< HEAD\nthis is on your branch\n=======\nthis is on the incoming branch\n>>>>>>> feature/cleaning',
            example: { code: '# Conflict in cleaning.py:\n<<<<<<< HEAD\ndef clean(df): return df.dropna()\n=======\ndef clean(df): return df.dropna(subset=["revenue"])\n>>>>>>> feature/cleaning\n\n# Resolution: keep the more specific version\ndef clean(df): return df.dropna(subset=["revenue"])', explanation: 'Pick the better version (or combine both), delete the markers and the unwanted version, then stage and commit.' },
            commonMistakes: ['Committing conflict markers by accident — always grep for <<< before committing.', 'Resolving without understanding both changes — read the PR conversation.', 'Forgetting to save the file before git add.'],
            bestPractices: ['Resolve in VS Code\'s Merge Editor (3-way view).', 'Run tests after resolving to confirm behavior.', 'Use small, frequent merges to keep conflicts small.'],
            limitations: ['Some semantic conflicts (both branches pass tests, but combined they break) cannot be detected by Git — only tests catch them.'],
            interview: { q: 'How do you minimize merge conflicts in a Data Analytics team?', a: '1) Small, short-lived branches. 2) Frequent rebase onto main (daily). 3) Modular code — separate files for separate concerns (cleaning.py vs analysis.py). 4) Clear ownership of files. 5) Communication before large refactors. 6) Pull main before starting a new feature.' },
          }}
        />
      </LessonSection>

      <LessonSection id="d6-pr" title="4. Pull Requests — Interactive Simulator">
        <p className="text-sm leading-relaxed mb-3">
          A Pull Request (PR) is a request to merge a feature branch into main. Click through each stage of the workflow.
        </p>
        <PRSimulator />
      </LessonSection>

      <LessonSection id="d6-copilot-review" title="5. Copilot-Assisted Code Review & Commit Messages">
        <CopilotChatSimulator
          title="Copilot for Code Review"
          scenarios={[
            { id: 'review', mode: 'refactor', title: 'Review a PR diff', prompt: 'Review this diff for performance, correctness, and readability issues:\n+ def top_products(df): return df.groupby("product")["revenue"].sum().nlargest(5)', response: { text: 'Three observations:', steps: ['Correctness: looks good — groupby + sum + nlargest is the idiomatic approach.', 'Readability: add type hints (df: pd.DataFrame) -> pd.Series and a docstring.', 'Edge cases: empty DataFrame returns an empty Series (safe). Consider adding a guard for missing "product" or "revenue" columns with a clear KeyError.'] } },
            { id: 'commit-msg', mode: 'document', title: 'Generate commit message', prompt: 'Generate a commit message for these changes:\n- Added profit_margin column to cleaning.py\n- Fixed groupby in analysis.py (was grouping on wrong column)\n- Added 2 pytest tests in test_cleaning.py', response: { text: 'Suggested commit message:', code: [{ code: `fix(analysis): correct groupby column and add profit_margin\n\n- Fix groupby in analysis.py: was grouping on "Region" (capital R),\n  now correctly uses "region"\n- Add profit_margin column to cleaning.py: (revenue - cost) / revenue\n- Add pytest tests for profit_margin calculation and groupby correctness\n\nTests: 8 passed` }] } },
            { id: 'pr-desc', mode: 'document', title: 'Generate PR description', prompt: 'Generate a PR description for: branch feature/profit-margin. Changes: added profit_margin, fixed groupby, added tests.', response: { text: 'Suggested PR description:', code: [{ code: `## What\nAdds a profit_margin column and fixes the broken groupby in analysis.py.\n\n## Why\nThe Q3 dashboard was showing 0 profit for several regions because the groupby\nwas using "Region" (capital R) and silently returning empty groups. Adding\nprofit_margin enables the margin-by-category chart requested by Finance.\n\n## Changes\n- \`cleaning.py\`: add \`profit_margin = (revenue - cost) / revenue\`\n- \`analysis.py\`: fix groupby column name \`"Region"\` → \`"region"\`\n- \`test_cleaning.py\`: add 2 tests for profit_margin and groupby correctness\n\n## Testing\n- [x] All 8 tests pass locally\n- [x] Manual check: total profit matches finance report for Q3\n\n## Checklist\n- [x] Code reviewed by Copilot\n- [x] Tests added\n- [x] No breaking changes` }] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d6-best-practices" title="6. Collaboration Best Practices for Data Analytics">
        <ul className="text-sm space-y-2 leading-relaxed">
          <li>📝 <strong>Small PRs</strong> — under 400 lines when possible. Easier to review, fewer conflicts.</li>
          <li>🎯 <strong>One PR = one logical change</strong> — don\'t mix refactoring with new features.</li>
          <li>🔍 <strong>Describe the why</strong> — PR description explains the business reason, not just the code.</li>
          <li>✅ <strong>Tests required</strong> — every PR that changes logic should include or update tests.</li>
          <li>🤖 <strong>Use Copilot for first-pass review</strong> — but human review is still required for business logic.</li>
          <li>📦 <strong>Pin dependencies</strong> — requirements.txt with exact versions for reproducibility.</li>
          <li>📓 <strong>Notebook hygiene</strong> — clear outputs before committing; consider jupyter nbconvert to .py for production.</li>
          <li>🔐 <strong>Never commit data or secrets</strong> — use .gitignore and DVC for large datasets.</li>
        </ul>
      </LessonSection>

      <PracticalExercise id="d6-ex" title="Create a feature branch, improve a script, and complete a PR">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Create a feature branch: <code className="bg-muted px-1 rounded text-xs">git switch -c feature/profit-margin</code></li>
          <li>Modify an analysis script to add a profit_margin column.</li>
          <li>Commit with a descriptive message (use Copilot to suggest one).</li>
          <li>Push and open a Pull Request on GitHub.</li>
          <li>Use Copilot Chat to review your own diff. Address its feedback.</li>
          <li>Merge the PR and delete the branch.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d6-quiz" questions={[
        { q: 'Which command creates and switches to a new branch?', options: ['git branch new-name', 'git switch -c new-name', 'git merge new-name', 'git clone new-name'], correct: 1, explanation: 'git switch -c creates the branch and checks it out in one step. (Older syntax: git checkout -b.)' },
        { q: 'You see <<<<<<< HEAD markers in your file. What happened?', options: ['Syntax error', 'Merge conflict', 'Git crashed', 'Wrong Python version'], correct: 1, explanation: 'These are conflict markers Git inserted during a merge/rebase. Edit the file to keep the right version, delete the markers, then git add + commit.' },
        { q: 'What does a Pull Request represent?', options: ['A bug report', 'A request to merge a feature branch into another branch (usually main)', 'A code review request to GitHub support', 'A backup request'], correct: 1, explanation: 'A PR proposes merging one branch into another. It enables code review, CI checks, and discussion before changes land on main.' },
        { q: 'What should a good PR description include?', options: ['Only the ticket number', 'The what, the why, the changes, and how to test', 'Only the test results', 'The entire diff'], correct: 1, explanation: 'Reviewers need context: what changed, why (business reason), the list of changes, and how to verify. The diff shows the what; the description explains the why.' },
        { q: 'How can Copilot help in code review?', options: ['It cannot help', 'It can spot readability issues, missing edge cases, and common anti-patterns as a first pass', 'It replaces human review entirely', 'It approves PRs automatically'], correct: 1, explanation: 'Copilot is a useful first-pass reviewer for style and common issues. Human review is still required for business logic and domain correctness.' },
        { q: 'Which is a collaboration best practice for analytics code?', options: ['Commit notebooks with all outputs', 'Mix refactoring and new features in one PR', 'Pin dependency versions in requirements.txt', 'Commit raw data for reproducibility'], correct: 2, explanation: 'Pinning dependencies (pandas==2.2.0) ensures everyone runs the same versions. Committing large raw data is an anti-pattern — use .gitignore + DVC or external storage.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day5')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 5</button>
        <button onClick={() => setView('day7')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 7 — SQL Analytics <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
