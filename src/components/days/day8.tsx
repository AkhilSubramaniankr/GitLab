'use client'

import * as React from 'react'
import { BarChart3, ArrowRight, ArrowLeft, Sparkles, FlaskConical, Table2, Sigma } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { PandasOperationExplorer } from '@/components/labs/pandas-explorer'
import { VisualizationPlayground } from '@/components/labs/visualization-playground'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'
import { retailSales, dirtyRetailSales } from '@/lib/data/datasets'

const day = CURRICULUM[7]

export function Day8View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<BarChart3 className="w-7 h-7 text-ai-green" />}
      />

      <LessonSection id="d8-load" title="1. Loading CSVs & Dataset Inspection with Copilot">
        <CodeBlock language="python" title="Load + inspect (Copilot-assisted)" code={`import pandas as pd

# Load
df = pd.read_csv("sales.csv", parse_dates=["order_date"])

# Inspect
print(df.shape)              # (rows, cols)
print(df.dtypes)             # column types
print(df.head())             # first 5 rows
print(df.info())             # concise summary
print(df.describe())         # descriptive stats for numerics
print(df.isnull().sum())     # missing values per column
print(df.duplicated().sum()) # duplicate row count`} maxHeight="280px" />
        <Callout type="tip" title="Copilot prompt">
          <code className="bg-muted px-1 rounded text-xs"># Load sales.csv, parse order_date as datetime, and print a complete inspection report including shape, dtypes, missing values, and duplicates</code> — Copilot drafts the above block.
        </Callout>
      </LessonSection>

      <LessonSection id="d8-pandas-lab" title="2. Pandas Operation Explorer — Live Data">
        <p className="text-sm leading-relaxed mb-3">
          Pick an operation and see the actual code + output computed from the sample dataset. Switch between the clean and dirty dataset to see how each operation behaves on messy data.
        </p>
        <PandasOperationExplorer />
      </LessonSection>

      <LessonSection id="d8-cleaning" title="3. Data Cleaning — Missing Values, Duplicates, Inconsistent Categories">
        <div className="rounded-lg border-2 border-ai-orange/40 bg-ai-orange/5 p-4 mb-3">
          <h4 className="font-semibold text-sm mb-2 text-ai-orange">The dirty dataset has 4 deliberate issues</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• <strong>Duplicate rows</strong> — same order_id appears twice</li>
            <li>• <strong>Missing values</strong> — null in customer_id, product, and revenue</li>
            <li>• <strong>Inconsistent casing</strong> — "west", "West", "WEST" all appear</li>
            <li>• <strong>Wrong date format</strong> — one row uses MM/DD/YYYY</li>
            <li>• <strong>Invalid value</strong> — negative quantity</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">Use the Pandas Explorer above with the "Dirty dataset" toggle to inspect and clean these issues.</p>
        </div>
        <CodeBlock language="python" title="Complete cleaning function (Copilot-generated)" code={`def clean_sales(df: pd.DataFrame) -> pd.DataFrame:\n    """Clean a sales DataFrame in place-safe fashion.\n    \n    Steps:\n    1. Drop duplicate rows (keep first)\n    2. Drop rows with missing revenue (critical field)\n    3. Fill missing customer_id with 'UNKNOWN'\n    4. Normalize category and region to Title Case\n    5. Parse order_date to datetime (coerce errors)\n    6. Filter out invalid (negative) quantity\n    """\n    df = df.drop_duplicates().copy()\n    df = df.dropna(subset=["revenue"])\n    df["customer_id"] = df["customer_id"].fillna("UNKNOWN")\n    df["category"] = df["category"].str.title()\n    df["region"] = df["region"].str.title()\n    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")\n    df = df[df["quantity"] >= 0]\n    return df.reset_index(drop=True)`} maxHeight="280px" />
      </LessonSection>

      <LessonSection id="d8-eda" title="4. Exploratory Data Analysis (EDA)">
        <ConceptExplorer
          title="EDA"
          icon={<Sigma className="w-4 h-4 text-ai-green" />}
          blocks={{
            what: 'EDA is the process of summarizing a dataset\'s main characteristics — usually with visual methods and descriptive statistics — before formal modeling.',
            why: 'You cannot model what you do not understand. EDA reveals data quality issues, distributions, relationships, and outliers that shape every downstream decision.',
            when: 'Always as the first step of any analysis. Re-run it after every major transformation.',
            how: 'Inspect shape, dtypes, missing values, descriptive statistics, distributions (histograms), relationships (scatter, correlation), and outliers (box plots, IQR).',
            application: 'A Data Analyst loads sales.csv and runs df.describe(), plots a histogram of revenue, a correlation heatmap of numerics, and a box plot of profit by category. They spot negative profit rows (data entry errors) and a long right tail on revenue (a few large orders).',
            commonMistakes: ['Skipping EDA and jumping to modeling — garbage in, garbage out.', 'Trusting descriptive stats without checking for outliers (mean is misleading).', 'Not visualizing distributions — summary stats hide shape.'],
            bestPractices: ['Always run df.info() and df.describe() first.', 'Plot before you model.', 'Document what you find — it informs feature engineering and modeling choices.'],
            interview: { q: 'What are the key steps in EDA for a tabular dataset?', a: '1) Inspect: shape, dtypes, head. 2) Missing values: count per column, decide imputation strategy. 3) Duplicates: count and drop. 4) Descriptive statistics: mean, median, std, min, max, quartiles. 5) Distributions: histograms for each numeric column. 6) Categorical value counts. 7) Correlation matrix + scatter for relationships. 8) Outliers via box plots and IQR. 9) Document findings.' },
          }}
        />
      </LessonSection>

      <LessonSection id="d8-stats" title="5. Descriptive Statistics & Correlation">
        <p className="text-sm leading-relaxed mb-3">
          Use the Pandas Explorer above (Analyze section) to compute descriptive statistics and the correlation matrix on the sample dataset. Key concepts:
        </p>
        <ul className="text-sm space-y-1.5 leading-relaxed">
          <li>📊 <strong>Mean vs Median</strong>: median is robust to outliers; compare both to detect skew.</li>
          <li>📈 <strong>Standard deviation</strong>: how spread out values are. ~68% within ±1 std for normal data.</li>
          <li>🔗 <strong>Correlation</strong>: -1 to +1. +1 = perfect positive; 0 = no linear relationship; -1 = perfect negative.</li>
          <li>⚠️ <strong>Correlation ≠ causation</strong>: two variables can move together for unrelated reasons.</li>
          <li>🎯 <strong>Outliers</strong>: values beyond Q1 - 1.5×IQR or Q3 + 1.5×IQR. Investigate, don\'t auto-drop.</li>
        </ul>
      </LessonSection>

      <LessonSection id="d8-viz-lab" title="6. Visualization Playground — Live Charts">
        <p className="text-sm leading-relaxed mb-3">
          Pick a chart type and columns. Charts are rendered live from the sample sales data — every bar, slice, and dot reflects real values.
        </p>
        <VisualizationPlayground />
      </LessonSection>

      <LessonSection id="d8-copilot-demo" title="7. Copilot Code Generation Demonstration">
        <CopilotChatSimulator
          title="Copilot for Pandas & Matplotlib"
          scenarios={[
            { id: 'gen-clean', mode: 'generate', title: 'Generate cleaning code', prompt: 'Write a Pandas function that drops duplicates, fills missing revenue with 0, normalizes region casing, and returns a clean copy.', response: { text: 'Here is a cleaning function with type hints, docstring, and edge-case handling:', code: [{ code: `def clean_sales(df: pd.DataFrame) -> pd.DataFrame:\n    """Drop duplicates, fill missing revenue, normalize region.\n    \n    Preserves the original DataFrame.\n    """\n    df = df.drop_duplicates().copy()\n    df["revenue"] = df["revenue"].fillna(0)\n    df["region"] = df["region"].str.strip().str.title()\n    return df`, language: 'python' }] } },
            { id: 'gen-eda', mode: 'generate', title: 'Generate EDA report', prompt: 'Generate an EDA function that prints shape, dtypes, missing values, descriptive stats, and correlation for a DataFrame.', response: { text: 'Here is a reusable EDA function:', code: [{ code: `def eda_report(df: pd.DataFrame) -> None:\n    """Print a complete EDA report."""\n    print("=== SHAPE ===")\n    print(df.shape)\n    print("\\n=== DTYPES ===")\n    print(df.dtypes)\n    print("\\n=== MISSING VALUES ===")\n    print(df.isnull().sum()[df.isnull().sum() > 0])\n    print("\\n=== DESCRIPTIVE STATS ===")\n    print(df.describe())\n    print("\\n=== CORRELATION ===")\n    print(df.corr(numeric_only=True))\n\neda_report(df)`, language: 'python' }] } },
            { id: 'gen-chart', mode: 'generate', title: 'Generate Matplotlib chart', prompt: 'Write Matplotlib code for a bar chart of total revenue by region, sorted descending, with value labels on each bar.', response: { text: 'Here is a styled Matplotlib bar chart with value labels:', code: [{ code: `import matplotlib.pyplot as plt\n\nrevenue_by_region = df.groupby("region")["revenue"].sum().sort_values(ascending=False)\n\nfig, ax = plt.subplots(figsize=(8, 5))\nbars = ax.bar(revenue_by_region.index, revenue_by_region.values,\n              color="#a855f7", edgecolor="white")\n\n# Value labels\nfor bar in bars:\n    h = bar.get_height()\n    ax.text(bar.get_x() + bar.get_width()/2, h,\n            f"\${h:,.0f}", ha="center", va="bottom", fontsize=10)\n\nax.set_title("Total Revenue by Region", fontsize=14, fontweight="bold")\nax.set_xlabel("Region")\nax.set_ylabel("Total Revenue ($)")\nax.spines[["top", "right"]].set_visible(False)\nplt.tight_layout()\nplt.show()`, language: 'python' }] } },
            { id: 'gen-seaborn', mode: 'generate', title: 'Generate Seaborn heatmap', prompt: 'Generate a Seaborn correlation heatmap for the numeric columns of df.', response: { text: 'Here is a Seaborn heatmap with annotations:', code: [{ code: `import seaborn as sns\nimport matplotlib.pyplot as plt\n\ncorr = df.corr(numeric_only=True)\nplt.figure(figsize=(8, 6))\nsns.heatmap(corr, annot=True, cmap="coolwarm",\n            center=0, fmt=".2f",\n            square=True, linewidths=0.5)\nplt.title("Correlation Heatmap")\nplt.tight_layout()\nplt.show()`, language: 'python' }] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d8-validate" title="8. Validating AI-Generated Analytics">
        <div className="rounded-lg border-2 border-ai-red/40 bg-ai-red/5 p-4">
          <h4 className="font-semibold text-sm mb-2 text-ai-red">Validation checklist for every AI-generated analysis</h4>
          <ol className="text-xs space-y-1.5 text-muted-foreground list-decimal pl-4">
            <li>Column names match <code className="bg-muted px-1 rounded text-[10px]">df.columns</code></li>
            <li>Aggregation row count matches the unique values in the group-by column</li>
            <li>Total revenue from groupby = total revenue from <code className="bg-muted px-1 rounded text-[10px]">df["revenue"].sum()</code></li>
            <li>Spot-check 3 rows manually — does the aggregation include them correctly?</li>
            <li>Check for silent NaN behavior — does <code className="bg-muted px-1 rounded text-[10px]">.sum()</code> skip or include them?</li>
            <li>Verify chart axes match the data — wrong column = wrong chart</li>
            <li>Run on a 5-row subsample with a known answer</li>
          </ol>
        </div>
      </LessonSection>

      <PracticalExercise id="d8-ex" title="Perform EDA and visualization using the retail dataset">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Use the Pandas Explorer to inspect both clean and dirty datasets.</li>
          <li>Generate a cleaning function with Copilot Chat and apply it to the dirty dataset.</li>
          <li>Compute descriptive statistics and the correlation matrix.</li>
          <li>Identify outliers in profit using the IQR method (Explorer → Analyze → profit outliers).</li>
          <li>Use the Visualization Playground to create: a bar chart of revenue by category, a histogram of revenue, a box plot of profit by region, and a scatter of quantity vs revenue.</li>
          <li>For each chart, write a 1-sentence business insight.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d8-quiz" questions={[
        { q: 'What is the first thing you should do after loading a CSV in Pandas?', options: ['Build a model', 'Inspect: df.shape, df.dtypes, df.head(), df.info()', 'Plot everything', 'Export to Excel'], correct: 1, explanation: 'Inspection reveals schema, types, missing values, and obvious data quality issues before any analysis.' },
        { q: 'Why compare mean and median for a numeric column?', options: ['They should always match', 'A large difference signals skew or outliers affecting the mean', 'Median is always wrong', 'Mean is always wrong'], correct: 1, explanation: 'Median is robust to outliers; if mean >> median (or vice versa), the distribution is skewed and you should investigate outliers.' },
        { q: 'What does a correlation of -0.9 between two variables mean?', options: ['No relationship', 'Strong negative linear relationship', 'Strong positive relationship', 'Causation'], correct: 1, explanation: '-0.9 is a strong negative linear relationship: as X increases, Y tends to decrease. Note: correlation is not causation.' },
        { q: 'How does Pandas .sum() handle NaN values?', options: ['Returns NaN if any NaN exists', 'Skips NaN and sums the rest', 'Treats NaN as 0 always', 'Raises an error'], correct: 1, explanation: 'Pandas .sum() skips NaN by default. Use skipna=False to return NaN if any NaN exists. Know which behavior you are getting.' },
        { q: 'Which chart is best for showing the distribution of a single numeric variable?', options: ['Pie chart', 'Bar chart', 'Histogram', 'Scatter plot'], correct: 2, explanation: 'Histograms bin a numeric variable and show frequency per bin — perfect for distributions. Bar charts compare categories; scatter shows relationships.' },
        { q: 'What is the IQR method for outlier detection?', options: ['Values more than 1 std from the mean', 'Values below Q1 - 1.5×IQR or above Q3 + 1.5×IQR', 'Values equal to the median', 'Values in the top 10%'], correct: 1, explanation: 'IQR = Q3 - Q1. Outliers are values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]. The 1.5 multiplier catches moderate outliers; 3.0 catches extreme ones.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day7')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 7</button>
        <button onClick={() => setView('day9')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 9 — Agents & Advanced Features <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
