'use client'

import * as React from 'react'
import { Bug, ArrowRight, ArrowLeft, FlaskConical, FileText, Code2, GitBranch } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { DebuggingLab } from '@/components/labs/debugging-lab'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'

const day = CURRICULUM[4]

export function Day5View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<Bug className="w-7 h-7 text-ai-red" />}
      />

      <LessonSection id="d5-error-types" title="1. Syntax, Runtime & Logical Errors">
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div className="rounded-lg border border-ai-orange/30 bg-ai-orange/5 p-4">
            <h4 className="font-semibold text-sm mb-1 text-ai-orange">Syntax Error</h4>
            <p className="text-xs text-muted-foreground mb-2">Code is not valid Python — interpreter refuses to run it.</p>
            <CodeBlock language="python" code={`def clean(df\n    return df  # missing ):`} maxHeight="80px" />
            <p className="text-[10px] mt-1 text-ai-orange">Caught at parse time. Easy to fix.</p>
          </div>
          <div className="rounded-lg border border-ai-red/30 bg-ai-red/5 p-4">
            <h4 className="font-semibold text-sm mb-1 text-ai-red">Runtime Error</h4>
            <p className="text-xs text-muted-foreground mb-2">Code runs but crashes — exception is raised.</p>
            <CodeBlock language="python" code={`df.groupby("Region")["revenue"].sum()\n# KeyError: 'Region'`} maxHeight="80px" />
            <p className="text-[10px] mt-1 text-ai-red">Caught at execution. Read the traceback.</p>
          </div>
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-4">
            <h4 className="font-semibold text-sm mb-1 text-ai-purple">Logical Error</h4>
            <p className="text-xs text-muted-foreground mb-2">Code runs and returns a wrong result silently.</p>
            <CodeBlock language="python" code={`# cost might be per-unit, not per-order:\ndf["profit"] = df["revenue"] - df["cost"]`} maxHeight="80px" />
            <p className="text-[10px] mt-1 text-ai-purple">Hardest to detect. Use tests.</p>
          </div>
        </div>
      </LessonSection>

      <LessonSection id="d5-pandas-errors" title="2. Pandas Error Resolution with Copilot">
        <ConceptExplorer
          title="Common Pandas Errors"
          icon={<Bug className="w-4 h-4 text-ai-red" />}
          blocks={{
            what: 'A set of recurring errors every Pandas user meets: KeyError, SettingWithCopyWarning, dtype mismatch, merge shape changes, ValueCounts surprise.',
            why: 'Pandas has implicit behaviors (copies vs views, dtype inference) that surface as confusing errors.',
            how: 'Paste the FULL traceback into Copilot Chat. Ask: "Why does this raise X, and what is the safest fix?" Always verify the fix on a sample.',
            syntax: '# In Copilot Chat:\n# I got this error: <paste traceback>\n# My code: <paste code>\n# Why did it fail and what is the safest fix?',
            example: { code: '# Error: SettingWithCopyWarning\nhigh = df[df["revenue"] > 100]\nhigh["tier"] = "A"  # ← warns\n\n# Fix: use .copy()\nhigh = df[df["revenue"] > 100].copy()\nhigh["tier"] = "A"', explanation: 'high was a view, not a new DataFrame. .copy() makes it independent so assignment is safe.' },
            commonMistakes: ['Reading only the last line of the traceback — read it top to bottom.', 'Suppressing warnings instead of fixing them.', 'Patching with .loc[] without understanding the underlying view issue.'],
            bestPractices: ['Always copy a filtered DataFrame you plan to modify.', 'Use df.dtypes after every load to catch type mismatches early.', 'Run df.isnull().sum() before aggregations.'],
            interview: { q: 'What is SettingWithCopyWarning and how do you fix it?', a: 'A warning Pandas raises when you assign to a DataFrame that is a view (slice) of another. The assignment may not persist. Fix it by calling .copy() on the filtered DataFrame before modifying it, or use .loc[] for explicit assignment.' },
          }}
        />
      </LessonSection>

      <LessonSection id="d5-debug-lab" title="3. Interactive: Python Debugging Lab">
        <p className="text-sm leading-relaxed mb-3">
          Identify the error, then choose the correct fix. Each exercise uses realistic Data Analytics scenarios.
        </p>
        <DebuggingLab />
      </LessonSection>

      <LessonSection id="d5-refactor" title="4. Code Refactoring, Optimization & Readability">
        <p className="text-sm leading-relaxed mb-3">Refactoring changes structure without changing behavior. Use Copilot Chat to:</p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5">Before</h4>
            <CodeBlock language="python" code={`r = df[df["rev"]>100].groupby("p").agg({"q":"sum","r":"mean"})`} maxHeight="80px" />
          </div>
          <div className="rounded-lg border border-ai-green/30 bg-ai-green/5 p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-green">After refactoring</h4>
            <CodeBlock language="python" code={`high_value = df[df["revenue"] > 100]\nsummary = (high_value\n    .groupby("product")\n    .agg(total_qty=("quantity", "sum"),\n         avg_rev=("revenue", "mean"))\n    .reset_index())`} maxHeight="120px" />
          </div>
        </div>
        <Callout type="tip" title="Refactoring checklist">
          Behavior unchanged (same outputs) · More readable (descriptive names, spacing) · More maintainable (smaller functions, less nesting) · Equal or better performance.
        </Callout>
      </LessonSection>

      <LessonSection id="d5-tests" title="5. Generating Unit Tests & Assertions">
        <ConceptExplorer
          title="Unit Tests with Copilot"
          icon={<FlaskConical className="w-4 h-4 text-ai-green" />}
          blocks={{
            what: 'Functions that verify your functions. pytest is the most popular Python test framework — Copilot generates pytest-style tests from any function.',
            why: 'Tests catch regressions when you refactor. They document expected behavior. They make refactor-as-you-go sustainable.',
            when: 'Generate tests for any function with non-trivial logic — especially calculations, transformations, and edge cases.',
            how: 'Right-click a function → "Generate Tests" (Smart Action). Or in chat: "Generate pytest tests for top_products including edge cases for empty input and n=0".',
            syntax: '# tests/test_cleaning.py\nimport pandas as pd\nimport pytest\nfrom cleaning import clean_revenue\n\ndef test_clean_revenue_drops_missing():\n    df = pd.DataFrame({"revenue": [10, None, 30]})\n    result = clean_revenue(df)\n    assert len(result) == 2\n\ndef test_clean_revenue_empty():\n    df = pd.DataFrame({"revenue": []})\n    assert clean_revenue(df).empty',
            commonMistakes: ['Trusting generated tests blindly — they can have wrong assertions.', 'Not testing edge cases (empty, NaN, single row).', 'Testing implementation details instead of behavior.'],
            bestPractices: ['Review each test\'s assertion for correctness.', 'Add edge-case tests Copilot missed.', 'Run tests after every refactor.'],
            limitations: ['Generated tests may assert wrong values — verify against a known output.', 'Cannot test business logic Copilot does not know about.'],
            interview: { q: 'How do you validate AI-generated tests?', a: '1) Verify each assertion against a manually computed expected value. 2) Run the tests against a deliberately broken function — they should fail. 3) Add edge cases (empty, NaN, single-row, divide-by-zero) that Copilot likely missed. 4) Run mutation testing occasionally to confirm tests catch real bugs.' },
          }}
        />

        <CopilotChatSimulator
          title="Unit Test Generator Simulator"
          scenarios={[
            { id: 'gen-tests', mode: 'test', title: 'Generate pytest tests', prompt: 'Generate pytest tests for: def top_products(df, n=5): return df.groupby("product")["revenue"].sum().nlargest(n).reset_index()', response: { text: 'Here are pytest tests covering happy path, default arg, edge cases, and error handling:', code: [{ code: `import pandas as pd\nimport pytest\nfrom analysis import top_products\n\n@pytest.fixture\ndef sample_df():\n    return pd.DataFrame({\n        "product": ["A", "A", "B", "B", "C"],\n        "revenue": [10, 20, 30, 40, 50],\n    })\n\ndef test_top_products_default_n(sample_df):\n    result = top_products(sample_df)\n    assert len(result) == 3  # only 3 unique products\n    assert result.iloc[0]["product"] == "B"  # 30+40=70 is highest\n\ndef test_top_products_custom_n(sample_df):\n    result = top_products(sample_df, n=2)\n    assert len(result) == 2\n\ndef test_top_products_empty():\n    df = pd.DataFrame({"product": [], "revenue": []})\n    result = top_products(df)\n    assert result.empty\n\ndef test_top_products_n_larger_than_unique(sample_df):\n    result = top_products(sample_df, n=10)\n    assert len(result) == 3  # only 3 unique products`, language: 'python', title: 'test_analysis.py' }] } },
            { id: 'gen-docstring', mode: 'document', title: 'Generate docstring', prompt: 'Generate a Google-style docstring for: def clean_revenue(df): return df.dropna(subset=["revenue"]).reset_index(drop=True)', response: { text: 'Here is a Google-style docstring with args, returns, raises, and example:', code: [{ code: `def clean_revenue(df: pd.DataFrame) -> pd.DataFrame:\n    """Drop rows with missing revenue and reset the index.\n    \n    Preserves all other columns. The original DataFrame is not modified.\n    \n    Args:\n        df: Sales DataFrame with a 'revenue' column (float or int).\n    \n    Returns:\n        A new DataFrame with rows where revenue is NaN removed,\n        and the index reset to 0..N-1.\n    \n    Raises:\n        KeyError: If 'revenue' column is not present.\n    \n    Example:\n        >>> df = pd.DataFrame({"revenue": [10, None, 30]})\n        >>> clean_revenue(df).shape\n        (2, 1)\n    """\n    return df.dropna(subset=["revenue"]).reset_index(drop=True)`, language: 'python' }] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d5-docs" title="6. Documentation Generation — Docstrings, READMEs, API Specs">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-ai-blue/30 bg-ai-blue/5 p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-blue flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Docstrings</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Hover a function → Smart Action → "Generate Docs". Or ask Copilot Chat for a specific style (Google, NumPy, Sphinx).</p>
          </div>
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-purple flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> README</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Create an empty README.md, type "## ", and let Copilot draft sections. Or chat: "Generate a README for this project from the file structure."</p>
          </div>
          <div className="rounded-lg border border-ai-green/30 bg-ai-green/5 p-4">
            <h4 className="font-semibold text-xs mb-1.5 text-ai-green flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> API Spec</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">For FastAPI routes, Copilot can generate OpenAPI descriptions, request/response models, and example payloads.</p>
          </div>
        </div>
      </LessonSection>

      <PracticalExercise id="d5-ex" title="Debug and refactor a sales analysis script and create tests">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Use the Debugging Lab above to practice the 3 error types.</li>
          <li>Take any analysis script and ask Copilot Chat to refactor it for readability.</li>
          <li>Generate pytest tests for at least 2 functions using the Smart Action.</li>
          <li>Manually verify each test assertion against a known output.</li>
          <li>Add 2 edge-case tests Copilot missed (empty DataFrame, NaN values).</li>
          <li>Generate a Google-style docstring for each function.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d5-quiz" questions={[
        { q: 'Which error type is the hardest to detect?', options: ['Syntax error', 'Runtime error', 'Logical error', 'Import error'], correct: 2, explanation: 'Logical errors run without crashing but return wrong results. Tests and manual validation are the only way to catch them.' },
        { q: 'What causes SettingWithCopyWarning?', options: ['A typo in column name', 'Assigning to a DataFrame that is a view of another', 'Missing import', 'Wrong Pandas version'], correct: 1, explanation: 'Pandas warns when you assign to a slice (view) because the assignment may not persist. Fix with .copy() before assigning.' },
        { q: 'What is the safest way to validate AI-generated tests?', options: ['Run them once and trust the output', 'Verify each assertion against a manually computed value', 'Delete them if they fail', 'Ask Copilot if they are correct'], correct: 1, explanation: 'Generated tests can assert wrong values. Verify each assertion by hand on a small known input.' },
        { q: 'Refactoring should always:', options: ['Change behavior to be faster', 'Preserve behavior while improving structure', 'Remove comments', 'Increase line count'], correct: 1, explanation: 'Refactoring changes structure (readability, maintainability) without changing observable behavior. Run tests before and after to confirm.' },
        { q: 'What is a good edge-case test for an aggregation function?', options: ['Test with a 1000-row DataFrame', 'Test with an empty DataFrame', 'Test with random data', 'Test that the function is fast'], correct: 1, explanation: 'Empty input is a classic edge case — many aggregations behave unexpectedly (NaN, 0, or exception) on empty DataFrames.' },
        { q: 'After generating a docstring with Copilot, you should:', options: ['Accept it without reading', 'Verify the args/returns match the actual function signature', 'Delete it', 'Replace it with TODO comments'], correct: 1, explanation: 'Copilot can hallucinate parameter names or return types. Always cross-check the docstring against the actual function.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day4')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 4</button>
        <button onClick={() => setView('day6')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 6 — Collaboration <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
