'use client'

import * as React from 'react'
import { Wand2, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { PromptBuilder } from '@/components/labs/prompt-builder'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'

const day = CURRICULUM[3]

export function Day4View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<Wand2 className="w-7 h-7 text-ai-cyan" />}
      />

      <LessonSection id="d4-what" title="1. What is Prompt Engineering & Why Prompts Matter">
        <ConceptExplorer
          title="Prompt Engineering"
          icon={<Wand2 className="w-4 h-4 text-ai-cyan" />}
          blocks={{
            what: 'The practice of writing clear, structured inputs (comments, chat messages, instructions) so an AI like Copilot produces accurate, useful, and safe code.',
            why: 'Garbage in, garbage out. Vague prompts produce generic, often-wrong code. Structured prompts dramatically reduce hallucinations and review cycles.',
            when: 'Every time you write a comment for Copilot, every time you ask Copilot Chat a question, every time you write a custom instruction.',
            how: 'State the task, the role, the input, the constraints, and the relevant knowledge. Iterate based on the output. Validate the result.',
            beginner: 'Like asking a junior developer for help — be specific about what you want, what data they have, and what rules to follow.',
            technical: 'A prompt is the input window the LLM conditions on. Token ordering, specificity, and explicit constraints shape the probability distribution of the output. Few-shot examples bias the model toward the demonstrated pattern.',
            analogy: 'Ordering at a restaurant: "some food" gets you whatever the kitchen feels like; "vegan pad thai, medium spice, no peanuts" gets you exactly what you want.',
            application: 'A Data Analyst writes "Using Python Pandas, inspect the provided sales dataset for missing values, duplicate records, and inconsistent categories. Generate a cleaning function, preserve the original dataset, explain each transformation, and include validation checks." Copilot returns a clean, tested, well-documented function instead of a generic dropna().',
            commonMistakes: ['Vague verbs: "clean this data" — what does clean mean?', 'No constraints: missing "preserve the original", "include tests", "use type hints".', 'No context: Copilot does not know your schema unless you tell it.', 'No validation: not asking Copilot to add assertion checks.'],
            bestPractices: ['Use the TRICK framework: Task, Role, Input, Condition, Knowledge.', 'Provide a small example for non-obvious transformations.', 'Iterate: refine the prompt based on the output.', 'Ask Copilot to explain its own reasoning.', 'Validate every calculation against known data.'],
            limitations: ['Even perfect prompts can produce hallucinations.', 'Very long prompts may exceed the context window.', 'Prompt quality cannot fix incorrect or biased training data.'],
            interview: { q: 'What is the TRICK prompt framework and when would you use it?', a: 'T-R-I-C-K: Task (what to do), Role (who Copilot acts as), Input (what data/schema), Condition (constraints), Knowledge (domain rules/examples). Use it for any non-trivial generation request where vague prompts would produce generic or wrong code. It forces you to specify the why and the constraints, not just the what.' },
            industry: 'Prompt engineering is now a core skill at every company using LLMs. Anthropic, OpenAI, and GitHub all publish prompt-pattern guides. Data teams use it daily for SQL generation, cleaning, and visualization requests.',
          }}
        />
      </LessonSection>

      <LessonSection id="d4-good-bad" title="2. Good Prompts vs Poor Prompts">
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg border-2 border-ai-red/40 bg-ai-red/5 p-4">
            <h4 className="font-semibold text-sm mb-2 text-ai-red flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Poor prompt</h4>
            <CodeBlock language="python" code={`# Clean this data`} maxHeight="80px" />
            <p className="text-xs text-muted-foreground mt-2">No specification of: which dataset, what "clean" means, what to do with missing values, whether to preserve the original, what output format.</p>
          </div>
          <div className="rounded-lg border-2 border-ai-green/40 bg-ai-green/5 p-4">
            <h4 className="font-semibold text-sm mb-2 text-ai-green flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Improved prompt</h4>
            <CodeBlock language="python" code={`# Using Python Pandas, inspect the provided sales dataset
# for missing values, duplicate records, and inconsistent
# categories. Generate a cleaning function that:
# - preserves the original DataFrame (returns a copy)
# - fills missing numeric columns with the median
# - drops duplicate order_id rows
# - normalizes category casing to Title Case
# - explains each transformation in a docstring
# - includes assertion checks for column presence`} maxHeight="200px" />
            <p className="text-xs text-muted-foreground mt-2">Specific task, constraints, and validation. Copilot returns production-ready code.</p>
          </div>
        </div>
      </LessonSection>

      <LessonSection id="d4-trick" title="3. The TRICK Framework — Interactive Builder">
        <p className="text-sm leading-relaxed mb-3">
          Build a structured prompt by filling in each TRICK component. Click "Load example" to see a complete prompt for a Pandas cleaning task.
        </p>
        <PromptBuilder />
      </LessonSection>

      <LessonSection id="d4-techniques" title="4. Zero-Shot, Few-Shot, Role & Structured Prompting">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-ai-blue/30 bg-ai-blue/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-blue">Zero-Shot</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Ask with no examples. Works for common tasks Copilot has seen many times.</p>
            <CodeBlock language="python" code={`# Convert order_date to datetime and extract month`} maxHeight="80px" />
          </div>
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-purple">Few-Shot</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Provide 2-3 input/output examples. Best for custom transformations.</p>
            <CodeBlock language="python" code={`# Convert region codes to full names:
# "W" -> "West", "E" -> "East", "N" -> "North", "S" -> "South"
# Apply this mapping to df["region"]`} maxHeight="120px" />
          </div>
          <div className="rounded-lg border border-ai-cyan/30 bg-ai-cyan/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-cyan">Role Prompting</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Tell Copilot who to act as — sets expertise and tone.</p>
            <CodeBlock language="python" code={`# Act as a senior data analyst experienced with retail data.\n# Review this groupby for performance and correctness:`} maxHeight="100px" />
          </div>
          <div className="rounded-lg border border-ai-green/30 bg-ai-green/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-green">Structured (TRICK)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Use explicit sections for task, role, input, conditions, knowledge.</p>
            <CodeBlock language="python" code={`# T: Add a profit_margin column\n# R: Senior data analyst\n# I: df with revenue, cost columns\n# C: handle divide-by-zero, round to 4 decimals\n# K: profit_margin = profit / revenue`} maxHeight="120px" />
          </div>
        </div>
      </LessonSection>

      <LessonSection id="d4-iterative" title="5. Iterative Prompt Refinement">
        <p className="text-sm leading-relaxed mb-3">Prompt engineering is iterative. Start simple, observe the output, refine:</p>
        <ol className="text-sm space-y-1.5 leading-relaxed list-decimal pl-5">
          <li>Write the simplest version of the prompt.</li>
          <li>Read Copilot's output critically — what is wrong or missing?</li>
          <li>Add a constraint or example addressing the gap.</li>
          <li>Re-run and check if the output improved.</li>
          <li>Repeat until the output is correct and well-structured.</li>
        </ol>
        <Callout type="tip" title="Ask Copilot to critique its own output">
          After generating code, ask: "What edge cases does this code not handle?" or "What assumptions am I making?" Copilot often surfaces issues you missed.
        </Callout>
      </LessonSection>

      <LessonSection id="d4-context" title="6. Context Awareness — File & Workspace Context">
        <p className="text-sm leading-relaxed mb-3">Copilot uses surrounding context. The same prompt produces different code depending on what files are open and what schema it can see.</p>
        <CopilotChatSimulator
          title="Context Awareness Simulator"
          scenarios={[
            { id: 'no-ctx', mode: 'generate', title: 'No context', prompt: 'Write a function to compute total revenue.', response: { text: 'Without schema context, Copilot guesses column names:', code: [{ code: `def total_revenue(df):\n    return df["revenue"].sum()  # assumes column exists\n# ⚠ No type hints, no error handling, assumes "revenue" column`, language: 'python' }] } },
            { id: 'with-ctx', mode: 'generate', title: 'With schema context', prompt: '# Schema: df has columns order_id, product, region, quantity, unit_price, revenue (float)\n# Write a function to compute total revenue, with type hints and a guard for empty DataFrames.', response: { text: 'With explicit schema context, the output is precise and safe:', code: [{ code: `import pandas as pd\n\ndef total_revenue(df: pd.DataFrame) -> float:\n    """Return total revenue across all orders.\n    \n    Args:\n        df: Sales DataFrame with a 'revenue' (float) column.\n    Returns:\n        Total revenue as a float. Returns 0.0 for empty DataFrames.\n    Raises:\n        KeyError: if 'revenue' column is missing.\n    """\n    if df.empty:\n        return 0.0\n    if "revenue" not in df.columns:\n        raise KeyError("DataFrame must have a 'revenue' column")\n    return float(df["revenue"].sum())`, language: 'python' }] } },
            { id: 'with-rules', mode: 'generate', title: 'With business rules', prompt: '# Business rule: high-value orders have revenue > $100 and exclude returns (negative quantity)\n# Write a function to flag high-value orders.', response: { text: 'With business rules stated, Copilot encodes them correctly:', code: [{ code: `def is_high_value(row) -> bool:\n    """Flag high-value, non-return orders."""\n    return row["revenue"] > 100 and row["quantity"] > 0\n\ndf["is_high_value"] = df.apply(is_high_value, axis=1)`, language: 'python' }] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d4-domain" title="7. Prompting for Python, Pandas, SQL & Visualization">
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-blue">Pandas — be explicit about input shape</h4>
            <CodeBlock language="python" code={`# Input: DataFrame 'df' with columns [order_id, product, revenue, cost]\n# Task: add 'profit_margin' = (revenue - cost) / revenue, rounded to 4 decimals\n# Constraint: handle divide-by-zero by returning 0.0 where revenue == 0`} maxHeight="100px" />
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-cyan">SQL — state the schema and the dialect</h4>
            <CodeBlock language="python" code={`# Schema: sales(order_id, product, region, revenue, order_date)\n# Dialect: SQLite\n# Task: top 5 products by revenue in Q1 2024\n# Constraint: only include products with > 3 orders`} maxHeight="100px" />
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-green">Visualization — pick the chart for the question</h4>
            <CodeBlock language="python" code={`# Task: Matplotlib bar chart of total revenue by region\n# Input: df with 'region' and 'revenue' columns\n# Style: sorted descending, value labels on bars, title and axis labels\n# Constraint: use a colorblind-safe palette`} maxHeight="120px" />
          </div>
        </div>
      </LessonSection>

      <LessonSection id="d4-validation" title="8. Prompt Validation & Handling Hallucinations">
        <div className="rounded-lg border-2 border-ai-orange/40 bg-ai-orange/5 p-4">
          <h4 className="font-semibold text-sm mb-2 text-ai-orange flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Hallucination patterns to watch for</h4>
          <ul className="text-xs space-y-1.5 text-muted-foreground">
            <li>• <strong>Invented column names</strong> — Copilot guesses "date" when your column is "order_date".</li>
            <li>• <strong>Imagined library functions</strong> — pd.smart_merge() does not exist.</li>
            <li>• <strong>Fabricated statistics</strong> — Copilot may state "average revenue is $X" without computing it.</li>
            <li>• <strong>Plausible but wrong SQL</strong> — joins with wrong ON clauses that run without error.</li>
            <li>• <strong>Deprecated APIs</strong> — pd.append() (removed in 2.0).</li>
          </ul>
        </div>
        <Callout type="success" title="Validation checklist">
          ✓ Column names match df.columns &nbsp; ✓ Functions exist in current library version &nbsp; ✓ Numbers computed from real data &nbsp; ✓ SQL runs without error &nbsp; ✓ Edge cases (empty, NaN, divide-by-zero) handled &nbsp; ✓ Tests pass
        </Callout>
      </LessonSection>

      <PracticalExercise id="d4-ex" title="Create optimized prompts for Pandas, SQL, and Matplotlib">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Use the TRICK builder above to write a Pandas cleaning prompt. Verify the output handles missing values and duplicates.</li>
          <li>Write a SQL prompt that includes the schema and a constraint. Run it in the Day 7 SQL Lab.</li>
          <li>Write a visualization prompt that specifies chart type, styling, and data columns. Generate and review.</li>
          <li>For each, identify one hallucination risk and add a constraint to prevent it.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d4-quiz" questions={[
        { q: 'What does the "T" in TRICK stand for?', options: ['Type', 'Task', 'Test', 'Token'], correct: 1, explanation: 'T = Task: the specific action you want Copilot to perform, stated as a verb + object + deliverable.' },
        { q: 'Few-shot prompting means:', options: ['Asking Copilot to use fewer shots', 'Providing 2-3 input/output examples to bias the output', 'A prompt with no examples', 'Asking the same question multiple times'], correct: 1, explanation: 'Few-shot prompting includes examples in the prompt so the model mimics the demonstrated pattern. Best for custom transformations.' },
        { q: 'Which is the BEST prompt for a custom mapping?', options: ['# map regions', '# Map region codes: W→West, E→East, N→North, S→South. Apply to df["region"]', '# transform regions', '# clean region column'], correct: 1, explanation: 'The second provides the exact mapping (few-shot) and the target column. Copilot cannot guess your custom mapping.' },
        { q: 'What is a common Copilot hallucination in Pandas code?', options: ['Always using the correct column names', 'Inventing column names that do not exist in your DataFrame', 'Refusing to write code', 'Adding too many comments'], correct: 1, explanation: 'Copilot may use "date" when your column is "order_date". Always verify with df.columns.' },
        { q: 'Why does providing schema context improve Copilot\'s output?', options: ['It does not help', 'It removes ambiguity about column names and types, so Copilot does not have to guess', 'It speeds up the response', 'It triggers billing'], correct: 1, explanation: 'Stating the schema explicitly eliminates the most common source of Pandas errors: wrong column names.' },
        { q: 'What should you do after Copilot generates a SQL query?', options: ['Run it in production immediately', 'Review the JOIN ON clauses, run on sample data, verify the row count', 'Delete your prompt', 'Ask Copilot to write another one'], correct: 1, explanation: 'SQL hallucinations often run without error but produce wrong results. Always verify JOINs and row counts on a small sample.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day3')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 3</button>
        <button onClick={() => setView('day5')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 5 — Debugging & Testing <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
