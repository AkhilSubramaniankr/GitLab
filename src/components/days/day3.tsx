'use client'

import * as React from 'react'
import { MessageSquareCode, ArrowRight, ArrowLeft, GitBranch } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { NLToPythonExplorer } from '@/components/labs/nl-to-python-explorer'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'
import { CodeCompletionPlayground } from '@/components/labs/code-completion-playground'
import { CodeConversionLab } from '@/components/labs/code-conversion-lab'

const day = CURRICULUM[2]

export function Day3View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<MessageSquareCode className="w-7 h-7 text-ai-blue" />}
      />

      <LessonSection id="d3-completion" title="1. Basic Code Completion & Code Generation">
        <p className="text-sm leading-relaxed mb-3">
          Copilot operates in two related modes: <strong>completion</strong> (finishing what you are typing) and <strong>generation</strong> (writing fresh code from a comment or chat prompt). Generation is more powerful because you describe intent in natural language.
        </p>
        <CodeBlock language="python" title="Comment-driven generation" code={`# Step 1: write a clear comment
# Calculate total revenue per product, sorted descending

# Step 2: press Enter. Copilot suggests:
result = (df.groupby("product")["revenue"]
            .sum()
            .sort_values(ascending=False))

# Step 3: review column names, accept with Tab, run to validate`} />
        <Callout type="tip" title="Function-name driven generation">
          A well-named function signature alone is often enough. Typing <code className="bg-muted px-1 rounded text-xs">{'def top_5_products_by_revenue(df: pd.DataFrame) -> pd.Series:'}</code> and pressing Enter usually produces a correct body.
        </Callout>

        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-2">Interactive: Code Completion Playground</h3>
          <CodeCompletionPlayground />
        </div>
      </LessonSection>

      <LessonSection id="d3-nl" title="2. Natural Language → Python Explorer">
        <p className="text-sm leading-relaxed mb-3">
          Try the examples below to see how Copilot translates natural-language analytics requests into Pandas code. Always validate the output against your real data.
        </p>
        <NLToPythonExplorer />
      </LessonSection>

      <LessonSection id="d3-inline" title="3. Inline Suggestions & Inline Editing">
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg border border-ai-blue/30 bg-ai-blue/5 p-4">
            <h4 className="font-semibold text-sm mb-2 text-ai-blue">Inline Suggestions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Ghost text as you type. Best for short, well-defined continuations.</p>
            <CodeBlock language="python" code={`import pandas as pd\ndf = pd.read_csv("sales.csv")\n\n# Group by region\ndf.groupby("region")  # ← ghost text suggests ["revenue"].sum()`} maxHeight="160px" />
          </div>
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-4">
            <h4 className="font-semibold text-sm mb-2 text-ai-purple">Inline Editing (⌘I)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Select code → ⌘I → describe the change. Copilot shows a diff.</p>
            <CodeBlock language="python" code={`# Select this loop:\nresult = []\nfor p in df["product"].unique():\n    result.append(df[df["product"]==p]["revenue"].sum())\n\n# ⌘I prompt: "convert to groupby"\n# Copilot returns: df.groupby("product")["revenue"].sum()`} maxHeight="160px" />
          </div>
        </div>
      </LessonSection>

      <LessonSection id="d3-chat" title="4. Deep Dive into Copilot Chat">
        <ConceptExplorer
          title="Copilot Chat"
          icon={<MessageSquareCode className="w-4 h-4 text-ai-blue" />}
          blocks={{
            what: 'A conversational panel where you ask Copilot to explain, generate, fix, refactor, test, or document code using natural language.',
            why: 'Chat handles tasks too complex for inline completion: multi-step refactors, exploring unfamiliar code, asking "why does this fail?"',
            how: 'Type a message in the chat panel. Use @mentions to add context (@workspace, @terminal, #file). Copilot streams a response; code blocks have Copy and Insert buttons.',
            syntax: '# In Copilot Chat:\n@workspace Explain how cleaning.py is used\n#file:analysis.py Refactor the load_data function to add error handling\n@terminal Why did the last command fail?',
            commonMistakes: ['Asking vague questions ("make it better") — be specific.', 'Forgetting @workspace when asking project-wide questions.', 'Pasting large files instead of using #file:filename.'],
            bestPractices: ['State the goal + the constraint: "Refactor for readability, keep behavior identical".', 'Iterate: ask follow-up questions to refine.', 'Use "Insert" to put code into the editor, then run it.'],
            limitations: ['May not know about your private business rules unless you state them.', 'Cannot run code — outputs are predictions, not executions.', 'Context window is finite; very long chats lose early messages.'],
            interview: { q: 'When would you use Copilot Chat instead of inline suggestions?', a: 'Use chat for: (1) explaining unfamiliar code, (2) multi-file refactors, (3) debugging errors you cannot pin down, (4) generating tests or docs, (5) when you do not yet know the exact code shape. Use inline for: completing a clear, short continuation of what you are already typing.' },
          }}
        />
        <CopilotChatSimulator
          title="Copilot Chat — Retail Sales Scenarios"
          scenarios={[
            { id: 'explain', mode: 'explain', title: 'Explain code', prompt: 'Explain what this function does: def clean(df): return df.dropna(subset=["revenue"]).reset_index(drop=True)', response: { text: 'This function removes rows where the revenue column is missing (NaN), then resets the DataFrame\'s index to a clean 0..N-1 sequence. dropna(subset=...) targets only the revenue column — rows with missing values in other columns are kept. reset_index(drop=True) discards the old index instead of inserting it as a new column.', } },
            { id: 'generate', mode: 'generate', title: 'Generate function', prompt: 'Write a function that returns the top N products by total revenue, with a default of 5.', response: { text: 'Here is a function with type hints, a default argument, and a docstring.', code: [{ code: `def top_products(df: pd.DataFrame, n: int = 5) -> pd.DataFrame:\n    """Return the top N products by total revenue.\n    \n    Args:\n        df: Sales DataFrame with 'product' and 'revenue' columns.\n        n: Number of top products to return. Defaults to 5.\n    \n    Returns:\n        DataFrame with columns [product, total_revenue], sorted desc.\n    """\n    return (df.groupby("product", as_index=False)["revenue"]\n              .sum()\n              .nlargest(n, "revenue")\n              .reset_index(drop=True))`, language: 'python', title: 'top_products.py' }] } },
            { id: 'fix', mode: 'fix', title: 'Fix bug', prompt: 'This throws KeyError: "Product". Why? result = df.groupby("Product")["revenue"].sum()', response: { text: 'Pandas column names are case-sensitive. The CSV likely has "product" (lowercase). Verify with df.columns and use the exact name. If you are unsure of casing, normalize first: df.columns = df.columns.str.lower().', } },
            { id: 'improve', mode: 'refactor', title: 'Improve code', prompt: 'Refactor this for readability: r = df[df["rev"]>100].groupby("p").agg({"q":"sum","r":"mean"})', response: { text: 'The original is dense and uses abbreviated names. Here is a clearer version with named aggregations and explicit comparisons:', code: [{ code: `high_value_orders = df[df["revenue"] > 100]\nsummary = (high_value_orders\n    .groupby("product")\n    .agg(\n        total_quantity=("quantity", "sum"),\n        avg_revenue=("revenue", "mean"),\n    )\n    .reset_index())`, language: 'python' }] } },
            { id: 'comments', mode: 'document', title: 'Add comments', prompt: 'Add inline comments to: result = df.groupby("region")["revenue"].sum().sort_values(ascending=False)', response: { text: 'Here is the same line with explanatory comments:', code: [{ code: `# Group orders by region, sum revenue per region,\n# then sort regions from highest to lowest revenue.\nresult = (\n    df.groupby("region")["revenue"]   # group + select column\n    .sum()                            # aggregate\n    .sort_values(ascending=False)     # sort descending\n)`, language: 'python' }] } },
            { id: 'convert', mode: 'refactor', title: 'Convert to SQL', prompt: 'Convert this Pandas to SQL: df.groupby("product")["revenue"].sum().nlargest(5)', response: { text: 'Equivalent SQL (assumes a sales table with product and revenue columns):', code: [{ code: `SELECT product, SUM(revenue) AS total_revenue\nFROM sales\nGROUP BY product\nORDER BY total_revenue DESC\nLIMIT 5;`, language: 'sql' }] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d3-conversion" title="5. Code Conversion Lab">
        <p className="text-sm leading-relaxed mb-3">
          Convert code between Python, Pandas, and SQL. Each challenge shows original code and 3 conversion options — pick the correct one. The lab explains semantic differences and limitations after each answer.
        </p>
        <CodeConversionLab />
      </LessonSection>

      <LessonSection id="d3-review" title="6. Reviewing & Validating AI-Generated Code">
        <ul className="text-sm space-y-2 leading-relaxed">
          <li>✓ <strong>Read every line.</strong> Do not accept ghost text you have not read.</li>
          <li>✓ <strong>Check column names</strong> against <code className="bg-muted px-1 rounded text-xs">df.columns</code>.</li>
          <li>✓ <strong>Verify API signatures</strong> — Copilot may use deprecated methods.</li>
          <li>✓ <strong>Test on a tiny sample</strong> with a known answer before running on the full dataset.</li>
          <li>✓ <strong>Watch for silent failures</strong> — wrong but plausible numbers are worse than errors.</li>
          <li>✓ <strong>Run tests</strong> if any exist; ask Copilot to generate them if not (Day 5).</li>
        </ul>
      </LessonSection>

      <PracticalExercise id="d3-ex" title="Generate, explain, and validate reusable Python functions for retail sales">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open a Python file with a sample sales CSV loaded.</li>
          <li>Use Copilot Chat to generate 3 functions: <code className="bg-muted px-1 rounded text-xs">load_sales</code>, <code className="bg-muted px-1 rounded text-xs">top_products</code>, <code className="bg-muted px-1 rounded text-xs">monthly_revenue_trend</code>.</li>
          <li>Ask Copilot to explain each function back to you.</li>
          <li>Run them and validate output against a manual calculation on 5 rows.</li>
          <li>Use ⌘I to refactor at least one function for readability.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d3-quiz" questions={[
        { q: 'What is the safest way to validate Copilot-generated aggregation code?', options: ['Trust the first suggestion', 'Run it on the full dataset and check the dashboard', 'Test on a small sample with a manually computed answer', 'Ask Copilot if it is correct'], correct: 2, explanation: 'A small known sample lets you verify the calculation by hand. Full-dataset outputs are hard to verify, and asking Copilot to self-check is circular.' },
        { q: 'Which ⌘I (Inline Chat) prompt is best for refactoring a long function?', options: ['"make it better"', '"refactor for readability, keep behavior identical, extract helper functions"', '"rewrite this"', '"shorten"'], correct: 1, explanation: 'Specific constraints (readability, behavior preservation, helper extraction) give Copilot clear targets and reduce the risk of behavior changes.' },
        { q: 'What does Copilot Chat\'s @workspace mention do?', options: ['Closes the workspace', 'Includes your whole project as context for the question', 'Creates a new workspace', 'Lists all files'], correct: 1, explanation: '@workspace tells Copilot to search the project for relevant files before answering — useful for "where is X used?" questions.' },
        { q: 'You grouped by "Product" and got a KeyError. What should you check first?', options: ['Reinstall Pandas', 'df.columns to confirm the exact column name and casing', 'Restart VS Code', 'Use a different IDE'], correct: 1, explanation: 'Pandas column names are case-sensitive. df.columns lists the exact names so you can use the correct one.' },
        { q: 'What is a behavior difference between Pandas .sum() and SQL SUM?', options: ['They are always identical', 'Pandas sum skips NaN; SQL SUM skips NULL but returns NULL if all are NULL', 'Pandas sum is faster', 'SQL SUM only works on integers'], correct: 1, explanation: 'Both skip missing values, but SQL SUM returns NULL when all input values are NULL, while Pandas returns 0 by default for an all-NaN column. Test conversions carefully.' },
        { q: 'When should you use inline suggestions vs Copilot Chat?', options: ['Always use chat', 'Always use inline', 'Inline for short, well-defined continuations; chat for explanations, multi-step refactors, and exploration', 'They are interchangeable'], correct: 2, explanation: 'Inline completion is fastest for clear continuations. Chat excels at explanation, debugging, multi-file tasks, and generation when the code shape is unclear.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day2')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 2</button>
        <button onClick={() => setView('day4')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 4 — Prompt Engineering <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
