'use client'

import * as React from 'react'
import { Trophy, ArrowRight, ArrowLeft, CheckCircle2, Circle, GitBranch, FileCode2, Database, BarChart3, Sparkles, FileText, Github, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { SQLLab } from '@/components/labs/sql-lab'
import { PandasOperationExplorer } from '@/components/labs/pandas-explorer'
import { VisualizationPlayground } from '@/components/labs/visualization-playground'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { sqlTables, SAMPLE_SQL_QUERIES } from '@/lib/data/datasets'

const day = CURRICULUM[9]

interface CapstoneTask { id: string; label: string; icon: any; hint: string }

const CAPSTONE_TASKS: CapstoneTask[] = [
  { id: 'c1', label: 'Understand the business problem', icon: FileText, hint: 'Q3 revenue dipped in the West region. Identify the cause and recommend 3 actions.' },
  { id: 'c2', label: 'Inspect the dataset', icon: Database, hint: 'Use the Pandas Explorer: shape, dtypes, head, missing, duplicates.' },
  { id: 'c3', label: 'Define analytical objectives', icon: FileText, hint: 'Write 3 questions: revenue by region, top products, monthly trend.' },
  { id: 'c4', label: 'Create effective Copilot prompts', icon: Sparkles, hint: 'Use TRICK: task, role, input, condition, knowledge.' },
  { id: 'c5', label: 'Generate Python/Pandas code', icon: FileCode2, hint: 'Cleaning function, aggregation, monthly trend.' },
  { id: 'c6', label: 'Clean and preprocess data', icon: Database, hint: 'Drop dups, fill missing, normalize categories, fix dates.' },
  { id: 'c7', label: 'Perform EDA', icon: BarChart3, hint: 'Descriptive stats, correlation, outliers, distributions.' },
  { id: 'c8', label: 'Generate SQL queries', icon: Database, hint: 'Use the SQL Lab: top products, revenue by region, customer tier analysis.' },
  { id: 'c9', label: 'Create visualizations', icon: BarChart3, hint: 'Bar (revenue by category), histogram (revenue), scatter (qty vs rev).' },
  { id: 'c10', label: 'Validate calculations and outputs', icon: CheckCircle2, hint: 'Spot-check 3 aggregations against a manual calculation.' },
  { id: 'c11', label: 'Debug incorrect code', icon: AlertTriangle, hint: 'Use the Debugging Lab. Fix any KeyError, SettingWithCopyWarning.' },
  { id: 'c12', label: 'Refactor the solution', icon: FileCode2, hint: 'Use Copilot to refactor for readability, type hints, docstrings.' },
  { id: 'c13', label: 'Generate documentation', icon: FileText, hint: 'Docstrings for each function; README.md with project overview.' },
  { id: 'c14', label: 'Commit changes using Git', icon: GitBranch, hint: 'Feature branch, descriptive commits, push to GitHub.' },
  { id: 'c15', label: 'Upload project to GitHub', icon: Github, hint: 'Push branch, open PR, merge after review.' },
  { id: 'c16', label: 'Present analytical findings', icon: Trophy, hint: 'Write a 1-page summary: insights, recommendations, next steps.' },
]

export function Day10View() {
  const { setView, progress, toggleCapstoneTask } = useAppStore()
  const completedCount = CAPSTONE_TASKS.filter((t) => progress.capstoneTasks[t.id]).length
  const pct = Math.round((completedCount / CAPSTONE_TASKS.length) * 100)

  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<Trophy className="w-7 h-7 text-ai-green" />}
      />

      <LessonSection id="d10-brief" title="Project Brief — AI-Assisted Retail Sales Analytics">
        <Card className="p-5 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-ai-green/15 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-ai-green" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Business problem</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The retail sales team has noticed that <strong>Q3 revenue dipped in the West region</strong> compared to Q1 and Q2. Your task is to:
                1) identify which products and categories drove the dip, 2) assess whether customer tier mix changed, and 3) recommend 3 concrete actions to recover Q4 revenue. Use the sample dataset, write Pandas + SQL code with Copilot assistance, produce visualizations, document everything, and publish to GitHub.
              </p>
            </div>
          </div>
        </Card>

        <Callout type="info" title="Dataset">
          The sample <code className="bg-muted px-1 rounded text-xs">sales</code> table has 20 orders across 3 months, 5 product categories, and 4 regions. Use it for development; the analytical process you build should work on a larger dataset unchanged.
        </Callout>
      </LessonSection>

      <LessonSection id="d10-checklist" title="Interactive Capstone Workspace — Task Checklist">
        <Card className="overflow-hidden mb-4">
          <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
            <h4 className="font-semibold text-sm">Project progress</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{completedCount}/{CAPSTONE_TASKS.length} tasks</span>
              <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-ai-purple to-ai-green transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold">{pct}%</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-1.5 p-3">
            {CAPSTONE_TASKS.map((task, i) => {
              const done = progress.capstoneTasks[task.id]
              return (
                <button
                  key={task.id}
                  onClick={() => toggleCapstoneTask(task.id)}
                  className={cn(
                    'flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all',
                    done ? 'border-ai-green/40 bg-ai-green/5' : 'border-border hover:bg-muted/40'
                  )}
                >
                  {done ? <CheckCircle2 className="w-4 h-4 text-ai-green shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium', done && 'line-through text-muted-foreground')}>
                      <span className="text-muted-foreground mr-1">{i + 1}.</span>
                      {task.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <task.icon className="w-2.5 h-2.5" /> {task.hint}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      </LessonSection>

      <LessonSection id="d10-dataset" title="Dataset Preview">
        <p className="text-sm leading-relaxed mb-3">
          Inspect the dataset using the Pandas Explorer. Try the Inspect and Analyze operations to understand the data before writing any code.
        </p>
        <PandasOperationExplorer />
      </LessonSection>

      <LessonSection id="d10-prompts" title="Prompt Examples for the Capstone">
        <div className="grid md:grid-cols-2 gap-3">
          <CodeBlock language="python" title="Cleaning prompt" code={`# T: Clean the sales DataFrame\n# R: Senior data analyst\n# I: df with columns order_id, order_date, customer_id,\n#    product, category, region, quantity, unit_price,\n#    revenue, cost, profit\n# C: drop duplicates, fill missing revenue with 0,\n#    normalize region to Title Case, parse order_date\n# K: revenue = quantity * unit_price; profit = revenue - cost`} maxHeight="220px" />
          <CodeBlock language="python" title="EDA prompt" code={`# T: Generate an EDA function that prints shape, dtypes,\n#    missing values, descriptive stats, and correlation\n# R: Senior data analyst using Pandas\n# I: df (cleaned sales DataFrame)\n# C: include numeric_only=True for corr; format floats to 2 dp\n# K: revenue, cost, profit are floats; quantity is int`} maxHeight="220px" />
          <CodeBlock language="python" title="Visualization prompt" code={`# T: Matplotlib bar chart of total revenue by region,\n#    sorted descending, with value labels on each bar\n# R: Data visualization expert\n# I: df with 'region' and 'revenue' columns\n# C: colorblind-safe palette, no top/right spines,\n#    tight_layout, value labels with thousand separator\n# K: regions are West, East, North, South`} maxHeight="220px" />
          <CodeBlock language="python" title="SQL prompt" code={`-- Schema: sales(order_id, order_date, customer_id, product,\n--   category, region, quantity, unit_price, revenue, cost, profit)\n-- Dialect: SQLite\n-- Task: monthly revenue trend by region for Q1-Q3 2024\n-- Constraint: only include regions with > 2 orders per month`} maxHeight="220px" />
        </div>
      </LessonSection>

      <LessonSection id="d10-sql" title="SQL Analysis Workspace">
        <p className="text-sm leading-relaxed mb-3">
          Write SQL queries against the sample sales, customers, and employees tables to answer the business questions.
        </p>
        <SQLLab tables={sqlTables} sampleQueries={SAMPLE_SQL_QUERIES} title="Capstone SQL Workspace" />
      </LessonSection>

      <LessonSection id="d10-viz" title="Visualization Workspace">
        <p className="text-sm leading-relaxed mb-3">
          Generate visualizations to support your findings. Recommended: bar chart of revenue by region, histogram of revenue, scatter of quantity vs revenue.
        </p>
        <VisualizationPlayground />
      </LessonSection>

      <LessonSection id="d10-validation" title="Validation Checklist">
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-ai-green" /> Validate before publishing</h4>
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            {[
              'All column names in code match df.columns',
              'Total revenue from groupby = df["revenue"].sum()',
              'Spot-checked 3 aggregations manually',
              'No SettingWithCopyWarning in console',
              'All SQL queries return non-empty results on sample data',
              'Charts use the correct columns and aggregation',
              'Edge cases tested: empty DataFrame, NaN values',
              'All functions have type hints and docstrings',
              'pytest passes (8+ tests)',
              'requirements.txt pins all dependencies',
              'README explains how to run the analysis',
              'No raw data or secrets committed',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-ai-green shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </LessonSection>

      <LessonSection id="d10-publish" title="GitHub Publishing Instructions">
        <CodeBlock language="bash" title="Publish your capstone to GitHub" code={`# 1. Create the project folder and initialize Git
mkdir retail-sales-capstone && cd retail-sales-capstone
git init
git config user.name "Your Name"
git config user.email "you@example.com"

# 2. Create the project structure
mkdir src tests data
touch src/cleaning.py src/analysis.py src/visualization.py main.py
touch tests/test_cleaning.py requirements.txt README.md .gitignore

# 3. Add .gitignore (BEFORE adding any data)
cat > .gitignore << 'EOF'
__pycache__/
*.pyc
.env
venv/
.ipynb_checkpoints/
data/raw/
data/processed/
!data/sample.csv
.DS_Store
EOF

# 4. Write your code, then commit
git add .
git commit -m "Initial capstone: retail sales analytics"

# 5. Create an empty repo on github.com (no README)
# Then push
git remote add origin https://github.com/you/retail-sales-capstone.git
git branch -M main
git push -u origin main

# 6. Create a feature branch for improvements
git switch -c feature/profit-margin-analysis
# ... make changes ...
git add . && git commit -m "Add profit margin analysis"
git push -u origin feature/profit-margin-analysis

# 7. Open a Pull Request on GitHub, review, merge, delete branch`} maxHeight="380px" />
      </LessonSection>

      <LessonSection id="d10-deliverables" title="Final Deliverables">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Python analysis files', icon: FileCode2, items: ['main.py', 'src/cleaning.py', 'src/analysis.py', 'src/visualization.py'] },
            { label: 'Cleaning script', icon: Database, items: ['Reproducible cleaning.py', 'Logs transformations', 'Sample data included'] },
            { label: 'SQL queries', icon: Database, items: ['queries/01_top_products.sql', 'queries/02_revenue_by_region.sql', 'queries/03_customer_tier_analysis.sql'] },
            { label: 'Visualizations', icon: BarChart3, items: ['revenue_by_region.png', 'revenue_distribution.png', 'quantity_vs_revenue.png'] },
            { label: 'Analytical summary', icon: FileText, items: ['1-page summary', '3 insights', '3 recommendations'] },
            { label: 'README & docs', icon: FileText, items: ['README.md', 'Docstrings on every function', 'requirements.txt'] },
          ].map((d) => (
            <div key={d.label} className="rounded-lg border border-border p-3">
              <h4 className="font-semibold text-xs mb-2 flex items-center gap-1.5"><d.icon className="w-3.5 h-3.5 text-ai-purple" /> {d.label}</h4>
              <ul className="text-[11px] space-y-0.5 text-muted-foreground">
                {d.items.map((i) => <li key={i} className="font-mono">• {i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </LessonSection>

      <PracticalExercise id="d10-ex" title="Complete the capstone project">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Use the task checklist above to track your progress.</li>
          <li>Inspect the dataset, then write TRICK prompts for cleaning, EDA, and visualization.</li>
          <li>Generate, review, and validate the code with Copilot.</li>
          <li>Write SQL queries to answer the 3 business questions.</li>
          <li>Create 3 visualizations and write a 1-sentence insight for each.</li>
          <li>Debug, refactor, and document the solution.</li>
          <li>Publish to GitHub with a clean README and a feature branch + PR workflow.</li>
          <li>Write a 1-page analytical summary with 3 recommendations.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d10-quiz" questions={[
        { q: 'What should you do FIRST in a capstone analytics project?', options: ['Start writing code', 'Understand the business problem and inspect the data', 'Build a dashboard', 'Push to GitHub'], correct: 1, explanation: 'Without understanding the problem and the data, you cannot choose the right analysis. Always start with the brief and a thorough data inspection.' },
        { q: 'Why validate aggregations against a manual calculation?', options: ['It is faster', 'AI-generated code can silently produce wrong totals', 'GitHub requires it', 'It improves performance'], correct: 1, explanation: 'A 5-row manual check catches logical errors that no exception will raise. Silent wrong numbers are the worst kind of bug in analytics.' },
        { q: 'What is the recommended Git workflow for the capstone?', options: ['Commit everything to main', 'Feature branch → commit → push → PR → review → merge', 'No commits, just push', 'Email the code to a teammate'], correct: 1, explanation: 'Feature branches keep main stable. PRs enable review and CI before changes land. This mirrors real-world team workflows.' },
        { q: 'What should the README include?', options: ['Only the project name', 'Project overview, setup instructions, how to run, key findings', 'The entire codebase', 'Only the license'], correct: 1, explanation: 'A good README lets anyone clone, install, run, and understand the project in under 5 minutes. Include setup, usage, and a short findings section.' },
        { q: 'Which is a key deliverable of the capstone?', options: ['A 50-page report', 'An analytical summary with 3 recommendations', 'A new AI model', 'A production database'], correct: 1, explanation: 'Stakeholders need actionable recommendations, not just analysis. A 1-page summary with insights and recommendations is the most important deliverable.' },
        { q: 'Before publishing to GitHub, you should verify:', options: ['The repo is public', 'No raw data or secrets are committed, all tests pass, README is complete', 'The repo has 100 stars', 'The code is perfect'], correct: 1, explanation: 'Check .gitignore covers data/raw and .env, tests pass, README explains how to run. Secrets and large data should never be in Git history.' },
      ]} />

      <div className="rounded-xl border border-ai-green/30 bg-gradient-to-br from-ai-green/10 to-transparent p-6 mt-8">
        <div className="flex items-start gap-4">
          <Trophy className="w-10 h-10 text-ai-green shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">Congratulations!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              You have completed the 10-day GitHub Copilot for Data Analytics curriculum. You can now use Git & GitHub, generate code with Copilot, engineer effective prompts, debug and test AI-assisted code, write SQL with Copilot, perform EDA and visualization, work with agent workflows, and ship a complete analytics project to GitHub.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Next steps: apply these skills to a real dataset at work, contribute to an open-source analytics project, and keep iterating on your prompts — prompt engineering is a skill that compounds with practice.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day9')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 9</button>
        <button onClick={() => setView('progress')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">View your progress <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
