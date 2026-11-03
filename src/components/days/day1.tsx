'use client'

import * as React from 'react'
import { GitBranch, ArrowRight, ArrowLeft, CheckCircle2, FolderTree, Terminal, Shield } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { GitWorkflowSimulator } from '@/components/labs/git-workflow-simulator'
import { GitCommandExplorer } from '@/components/labs/git-command-explorer'

const day = CURRICULUM[0]

export function Day1View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day}
        title={day.title}
        duration={day.duration}
        objectives={day.objectives}
        prerequisites={day.prerequisites}
        color={day.color}
        icon={<GitBranch className="w-7 h-7 text-ai-orange" />}
      />

      <LessonSection id="d1-vc" title="1. Introduction to Version Control">
        <ConceptExplorer
          title="Version Control"
          icon={<GitBranch className="w-4 h-4 text-ai-orange" />}
          blocks={{
            what: 'Version control is a system that records changes to a file or set of files over time so you can recall specific versions later.',
            beginner: 'Think of it as "save points" in a video game. Every time you save a snapshot, you can return to it later if something breaks.',
            technical: 'A version control system (VCS) tracks diffs at the file level, stores them as a directed acyclic graph (DAG) of commits, and supports branching, merging, and distributed collaboration.',
            analogy: 'Like Google Docs\' version history — but for code, with full offline support, branching, and collaboration.',
            why: 'Without version control, you end up with files like report_final.pdf, report_final_v2.pdf, report_FINAL_FINAL.pdf. Version control gives every change a unique ID and a clear history.',
            when: 'Use version control for any code, notebook, or document that changes over time or that more than one person works on.',
            application: 'In Data Analytics, version control lets you track which dataset version produced which chart, revert a broken transformation, and collaborate on the same notebook without overwriting each other.',
            commonMistakes: ['Committing large binary files (datasets > 50 MB) directly — use Git LFS or .gitignore.', 'Committing once a week instead of small, frequent commits.', 'Writing commit messages like "fix" or "update".'],
            bestPractices: ['Commit early, commit often — one logical change per commit.', 'Write commit messages that answer "why", not "what".', 'Never commit credentials, API keys, or sensitive data.'],
            limitations: ['Git is not designed for huge binary files. Use Git LFS or external storage for large datasets.', 'Learning curve: 5-10 core commands cover 90% of daily work.'],
            interview: { q: 'Why should a Data Analyst learn version control?', a: 'Reproducibility (anyone can re-run your analysis from a specific commit), collaboration (multiple analysts can work in parallel branches), and accountability (every change has an author and timestamp). It also lets you safely experiment — if a transformation breaks, you can roll back instantly.' },
            industry: 'Every modern data team (Netflix, Airbnb, Spotify) uses Git for analytics code, dbt models, and notebooks. GitHub and GitLab are the de facto standards.',
          }}
        />
      </LessonSection>

      <LessonSection id="d1-git" title="2. What is Git?">
        <p className="text-sm leading-relaxed mb-3">
          Git is a <strong>distributed version control system</strong> created by Linus Torvalds in 2005. "Distributed" means every clone of a repository contains the full history — you can work offline and sync later.
        </p>
        <ConceptExplorer
          title="Git"
          icon={<GitBranch className="w-4 h-4 text-ai-orange" />}
          blocks={{
            what: 'A command-line tool that tracks changes to files in a folder (a "repository") and lets you branch, merge, and collaborate.',
            how: 'Git stores snapshots of your project at each commit. A commit is identified by a SHA-1 hash (e.g. 9f3a1b2). Commits form a graph — branches are just lightweight pointers to commits.',
            syntax: 'git init             # start tracking a folder\ngit add <file>       # stage a change\ngit commit -m "msg"  # record a snapshot\ngit push             # sync to a remote\ngit pull             # fetch + merge remote',
            example: { code: '$ git init\nInitialized empty Git repository in /Users/you/sales-analysis/.git/\n\n$ git add sales.py\n$ git commit -m "Add sales data loader"\n[main (root-commit) 9f3a1b2] Add sales data loader\n 1 file changed, 12 insertions(+)', explanation: 'init creates a hidden .git folder that stores all history. add stages a change, commit records it. The hash 9f3a1b2 uniquely identifies this snapshot forever.' },
            commonMistakes: ['Editing files inside the .git folder by hand — never do this.', 'Forgetting to git add before git commit (results in "nothing to commit").'],
            bestPractices: ['Configure your name and email once: git config --global user.name "Your Name"', 'Set your default branch to main: git config --global init.defaultBranch main'],
            interview: { q: 'What is the difference between git add and git commit?', a: 'git add stages changes — moves them from the working directory into the staging area (index). git commit records a snapshot of the staged changes into the permanent history. You can stage multiple times before a single commit, which lets you build a clean, logical commit.' },
          }}
        />
      </LessonSection>

      <LessonSection id="d1-github" title="3. What is GitHub? (Git vs GitHub)">
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg border border-ai-orange/30 bg-ai-orange/5 p-4">
            <h4 className="font-semibold text-sm mb-2 text-ai-orange">Git</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• A command-line <strong>tool</strong> installed locally</li>
              <li>• Tracks file changes (the engine)</li>
              <li>• Works offline</li>
              <li>• Free, open-source, created in 2005</li>
              <li>• You own the .git folder</li>
            </ul>
          </div>
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-4">
            <h4 className="font-semibold text-sm mb-2 text-ai-purple">GitHub</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• A cloud <strong>service</strong> (website) that hosts Git repositories</li>
              <li>• Adds collaboration: PRs, issues, code review</li>
              <li>• Requires internet</li>
              <li>• Owned by Microsoft; free tier available</li>
              <li>• Adds CI/CD, Actions, Copilot, Pages</li>
            </ul>
          </div>
        </div>
        <Callout type="tip" title="The analogy">
          Git is the录音机 (recording engine); GitHub is the Spotify that hosts and shares the recordings. You can use Git without GitHub, but most teams use both together.
        </Callout>
      </LessonSection>

      <LessonSection id="d1-why" title="4. Why Data Analysts need Git & GitHub">
        <ul className="text-sm space-y-2 leading-relaxed">
          <li><strong className="text-ai-blue">Reproducibility:</strong> Pin a notebook to a commit hash so anyone can re-run the exact analysis.</li>
          <li><strong className="text-ai-blue">Collaboration:</strong> Multiple analysts can clean, transform, and visualize in parallel branches without overwriting each other.</li>
          <li><strong className="text-ai-blue">Code review:</strong> A teammate reviews your SQL transformation in a Pull Request before it reaches production.</li>
          <li><strong className="text-ai-blue">Rollback:</strong> If your data cleaning breaks the dashboard, revert the commit in seconds.</li>
          <li><strong className="text-ai-blue">Portfolio:</strong> A GitHub profile with clean analytics projects is the modern résumé for data roles.</li>
          <li><strong className="text-ai-blue">CI/CD:</strong> GitHub Actions can run your dbt tests and re-publish dashboards automatically on every commit.</li>
        </ul>
      </LessonSection>

      <LessonSection id="d1-install" title="5. Installing & Configuring Git">
        <CodeBlock language="bash" title="Install + configure Git" code={`# macOS (Homebrew)
brew install git

# Windows: download Git for Windows from git-scm.com
# (includes Git Bash terminal)

# Linux (Debian/Ubuntu)
sudo apt update && sudo apt install git

# Verify
git --version

# Configure your identity (do this once)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"  # use VS Code`} />
        <Callout type="warning" title="Email privacy">
          If you enable email privacy on GitHub, use the <code className="text-xs bg-muted px-1 rounded">noreply</code> email from your GitHub settings — otherwise your real email is exposed in every commit.
        </Callout>
      </LessonSection>

      <LessonSection id="d1-repo" title="6. Repository Fundamentals — Local vs Remote, Public vs Private">
        <ConceptExplorer
          title="Repositories"
          icon={<FolderTree className="w-4 h-4 text-ai-orange" />}
          blocks={{
            what: 'A repository (repo) is a folder Git is tracking. A local repo lives on your machine; a remote repo lives on a server like GitHub.',
            why: 'A local repo lets you work offline and commit fast. A remote repo backs up your work, enables collaboration, and is the source of truth for the team.',
            when: 'Create a local repo when you start a new project. Connect a remote once you want to back up or share it.',
            how: 'Local: git init in any folder. Remote: create an empty repo on github.com, then git remote add origin <url> and git push -u origin main.',
            application: 'A Data Analyst starts a local repo for a Pandas project, commits locally while developing, then pushes to a private GitHub repo for backup and code review.',
            commonMistakes: ['Pushing without -u on first push — the upstream branch is not set.', 'Creating a remote repo with a README, then trying to push — creates a non-fast-forward conflict. Push to an empty remote first.'],
            bestPractices: ['Use private repos for client work; public repos for portfolios.', 'Name repos in kebab-case: sales-analysis, hr-attrition-eda.'],
          }}
        />
      </LessonSection>

      <LessonSection id="d1-areas" title="7. Working Directory, Staging Area, Repository">
        <p className="text-sm leading-relaxed mb-3">
          Git tracks files across <strong>three areas</strong>. Understanding this three-state model is the single most important Git concept.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div className="rounded-lg border border-ai-orange/30 bg-ai-orange/5 p-3">
            <h4 className="font-semibold text-xs mb-1 text-ai-orange">1. Working Directory</h4>
            <p className="text-xs text-muted-foreground">The actual files on your disk. Modified but not yet staged. <code className="bg-muted px-1 rounded text-[10px]">git status</code> shows these.</p>
          </div>
          <div className="rounded-lg border border-ai-cyan/30 bg-ai-cyan/5 p-3">
            <h4 className="font-semibold text-xs mb-1 text-ai-cyan">2. Staging Area (Index)</h4>
            <p className="text-xs text-muted-foreground">A holding area for the next commit. <code className="bg-muted px-1 rounded text-[10px]">git add</code> moves files here.</p>
          </div>
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-3">
            <h4 className="font-semibold text-xs mb-1 text-ai-purple">3. Local Repository</h4>
            <p className="text-xs text-muted-foreground">Permanent history (the .git folder). <code className="bg-muted px-1 rounded text-[10px]">git commit</code> records staged changes here.</p>
          </div>
        </div>
        <Callout type="info" title="Plus a 4th area: the Remote">
          GitHub is the <em>remote</em> — a separate copy of the repository on a server. <code className="bg-muted px-1 rounded text-xs">git push</code> sends commits from local → remote; <code className="bg-muted px-1 rounded text-xs">git pull</code> brings remote → local.
        </Callout>

        {/* Git Workflow Simulator */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-ai-orange" /> Interactive: Git Workflow Simulator
          </h3>
          <GitWorkflowSimulator />
        </div>
      </LessonSection>

      <LessonSection id="d1-cmds" title="8. Basic Git Commands — Interactive Explorer">
        <p className="text-sm leading-relaxed mb-3">
          Click any command below to see its purpose, syntax, example output, and common errors.
        </p>
        <GitCommandExplorer />
      </LessonSection>

      <LessonSection id="d1-connect" title="9. Connecting Git with GitHub & VS Code">
        <CodeBlock language="bash" title="Push a local project to GitHub" code={`# 1. Create an empty repo on github.com (no README, no .gitignore)

# 2. In your local project folder:
git init
git add .
git commit -m "Initial commit: Pandas sales analysis"

# 3. Connect to the remote and push
git remote add origin https://github.com/you/sales-analysis.git
git branch -M main
git push -u origin main`} />
        <p className="text-sm leading-relaxed mt-3">
          In VS Code, the <strong>Source Control panel</strong> (Ctrl+Shift+G) gives you a GUI for staging, committing, and pushing without typing commands. Click the <code className="bg-muted px-1 rounded text-xs">✓</code> to commit, and the <code className="bg-muted px-1 rounded text-xs">Sync Changes</code> button to push and pull in one click.
        </p>
      </LessonSection>

      <LessonSection id="d1-gitignore" title="10. .gitignore — Protecting Sensitive Files">
        <ConceptExplorer
          title=".gitignore"
          icon={<Shield className="w-4 h-4 text-ai-red" />}
          blocks={{
            what: 'A text file in your repo that lists files and folders Git should NOT track.',
            why: 'Prevents secrets (API keys, .env), large data files, and generated artifacts (venv, __pycache__) from being committed.',
            when: 'Always — every project should have a .gitignore from day one.',
            how: 'Each line is a pattern. Lines starting with # are comments. Patterns can use wildcards.',
            syntax: '# Secrets\n.env\n*.pem\n\n# Python\n__pycache__/\n*.pyc\nvenv/\n.ipynb_checkpoints/\n\n# Data (large)\ndata/*.csv\ndata/*.xlsx\n!data/sample.csv   # exception: DO track this\n\n# OS\n.DS_Store',
            application: 'A Data Analyst working with customer PII keeps the raw dataset out of Git (data/raw/*.csv) but tracks the cleaning script and a small synthetic sample for tests.',
            commonMistakes: ['Adding a file to .gitignore AFTER it was already committed — Git keeps tracking it. Run git rm --cached <file> first.', 'Using .gitignore to hide secrets that were already pushed — they are still in history. Rotate the secret immediately.'],
            bestPractices: ['Use github.com/github/gitignore templates for your language.', 'Add .env to .gitignore before creating .env.'],
            limitations: ['.gitignore cannot remove a file that is already tracked. Use git rm --cached.', 'Once a secret is pushed, it is in history forever. Rotate it.'],
            interview: { q: 'A teammate accidentally committed an API key. What do you do?', a: '1. Rotate/revoke the key immediately — assume it is compromised. 2. Remove the file from history with git filter-repo or BFG Repo-Cleaner. 3. Add it to .gitignore. 4. Force-push the cleaned history. 5. Notify anyone with a clone to re-clone. Never just delete the file in a new commit — it stays in history.' },
          }}
        />
        <Callout type="danger" title="Critical">
          If you committed a secret, GitHub automatically alerts (for known token formats) and notifies the provider. Treat every pushed secret as compromised — rotate it now.
        </Callout>
      </LessonSection>

      <LessonSection id="d1-project" title="11. Uploading a Python Data Analytics Project">
        <p className="text-sm leading-relaxed mb-3">A typical Pandas project structure:</p>
        <CodeBlock language="bash" title="Recommended project structure" code={`sales-analysis/
├── data/
│   ├── raw/             # .gitignored — original CSVs
│   ├── processed/       # .gitignored — cleaned outputs
│   └── sample.csv       # tracked — small synthetic sample
├── notebooks/
│   └── eda.ipynb        # exploratory notebooks
├── src/
│   ├── cleaning.py      # data cleaning functions
│   ├── analysis.py      # aggregation logic
│   └── visualization.py # chart helpers
├── tests/
│   └── test_cleaning.py # pytest tests
├── .gitignore
├── requirements.txt     # pinned dependencies
├── README.md            # project overview
└── main.py              # entry point`} />
      </LessonSection>

      <PracticalExercise id="d1-ex" title="Create a GitHub repository for a Pandas sales analysis project">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Create a folder <code className="bg-muted px-1 rounded text-xs">sales-analysis</code> and run <code className="bg-muted px-1 rounded text-xs">git init</code>.</li>
          <li>Add a small <code className="bg-muted px-1 rounded text-xs">sample.csv</code> and a <code className="bg-muted px-1 rounded text-xs">analysis.py</code> that loads it with Pandas.</li>
          <li>Create a <code className="bg-muted px-1 rounded text-xs">.gitignore</code> that excludes <code className="bg-muted px-1 rounded text-xs">data/raw/</code>, <code className="bg-muted px-1 rounded text-xs">__pycache__/</code>, and <code className="bg-muted px-1 rounded text-xs">.env</code>.</li>
          <li>Commit with a descriptive message.</li>
          <li>Create an empty repo on GitHub, add it as <code className="bg-muted px-1 rounded text-xs">origin</code>, and push.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d1-quiz" questions={[
        { q: 'What is the difference between Git and GitHub?', options: ['Git is a tool, GitHub is a hosting service for Git repos', 'Git is for code, GitHub is for documents', 'GitHub is a tool, Git is a hosting service', 'They are the same thing'], correct: 0, explanation: 'Git is the version control engine that runs locally; GitHub is a cloud service that hosts Git repositories and adds collaboration features.', difficulty: 'beginner' },
        { q: 'Which command moves a file from the working directory to the staging area?', options: ['git commit', 'git push', 'git add', 'git stage'], correct: 2, explanation: 'git add stages the change. git commit then records the staged snapshot permanently.' },
        { q: 'You ran git commit but nothing was staged. What happens?', options: ['Git commits all files automatically', 'Git shows "nothing to commit, working tree clean" or similar', 'Git crashes', 'Git pushes to remote'], correct: 1, explanation: 'Git only commits what is staged. You must git add files first.' },
        { q: 'What does the .gitignore file do?', options: ['Lists files Git should not track', 'Deletes files from your disk', 'Encrypts sensitive files', 'Lists files to push to GitHub only'], correct: 0, explanation: '.gitignore patterns tell Git which files to skip entirely. It cannot untrack files already committed without git rm --cached.' },
        { q: 'You accidentally pushed an API key. What is the FIRST action?', options: ['Add it to .gitignore', 'Delete the file in a new commit', 'Rotate/revoke the key immediately', 'Email GitHub support'], correct: 2, explanation: 'A pushed secret must be treated as compromised. Rotate it first, then clean history. Adding to .gitignore does not remove it from past commits.' },
        { q: 'What does git push -u origin main do?', options: ['Pushes main to origin and sets upstream for future push/pull', 'Pulls from origin', 'Creates a new branch', 'Merges origin into main'], correct: 0, explanation: 'The -u flag sets the upstream tracking branch. After the first push with -u, you can run plain git push / git pull.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('dashboard')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <button onClick={() => setView('day2')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
          Day 2 — Copilot Fundamentals <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
