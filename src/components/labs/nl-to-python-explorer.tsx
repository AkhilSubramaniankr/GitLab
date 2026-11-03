'use client'

import * as React from 'react'
import { Sparkles, ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

interface NLExample {
  id: string
  prompt: string
  code: string
  explanation: string
  output: string
}

const EXAMPLES: NLExample[] = [
  {
    id: 'revenue-by-product',
    prompt: 'Create a Python function to calculate total revenue for each product.',
    code: `import pandas as pd

def total_revenue_by_product(df: pd.DataFrame) -> pd.Series:
    """Return total revenue for each product, sorted descending."""
    return (df.groupby("product")["revenue"]
              .sum()
              .sort_values(ascending=False))

# Usage
result = total_revenue_by_product(df)
print(result.head())`,
    explanation: 'The function groups the DataFrame by the product column, sums the revenue column for each group, and returns the result sorted from highest to lowest. Type hints and a docstring make it reusable and testable.',
    output: 'product\nOffice Chair      599.96\nWireless Mouse    233.91\nDesk Lamp         192.00\nCoffee Mug        110.50\nUSB-C Cable        99.90\nName: revenue, dtype: float64',
  },
  {
    id: 'clean-missing',
    prompt: 'Write a function that drops rows where revenue is missing and fills missing customer_id with "UNKNOWN".',
    code: `import pandas as pd

def clean_revenue_data(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows with missing revenue; fill missing customer_id."""
    df = df.dropna(subset=["revenue"])
    df["customer_id"] = df["customer_id"].fillna("UNKNOWN")
    return df.reset_index(drop=True)

clean_df = clean_revenue_data(df)
print(f"Rows after cleaning: {len(clean_df)}")`,
    explanation: 'dropna(subset=...) removes only the rows where the specified column is null. fillna replaces missing customer_id values with a sentinel string. reset_index restores a clean integer index after rows are dropped.',
    output: 'Rows after cleaning: 19',
  },
  {
    id: 'monthly-trend',
    prompt: 'Add a month column and compute monthly revenue trend.',
    code: `import pandas as pd

def monthly_revenue_trend(df: pd.DataFrame) -> pd.DataFrame:
    """Compute total revenue by month."""
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"])
    df["month"] = df["order_date"].dt.to_period("M")
    return (df.groupby("month")["revenue"]
              .sum()
              .reset_index(name="total_revenue"))

trend = monthly_revenue_trend(df)
print(trend)`,
    explanation: 'pd.to_datetime normalizes date formats. dt.to_period("M") extracts year-month. groupby + sum aggregates revenue per month. reset_index converts the Series back to a DataFrame with named columns.',
    output: '     month  total_revenue\n0  2024-01         329.42\n1  2024-02         532.91\n2  2024-03         461.40',
  },
  {
    id: 'profit-margin',
    prompt: 'Create a function that adds a profit_margin column and identifies loss-making orders.',
    code: `import pandas as pd

def add_profit_margin(df: pd.DataFrame) -> pd.DataFrame:
    """Add profit_margin column and flag loss-making orders."""
    df = df.copy()
    df["profit_margin"] = (df["profit"] / df["revenue"]).round(4)
    df["is_loss"] = df["profit"] < 0
    return df

result = add_profit_margin(df)
losses = result[result["is_loss"]]
print(f"{len(losses)} loss-making orders out of {len(result)}")`,
    explanation: 'A new column is derived by dividing profit by revenue, rounded to 4 decimals. A boolean is_loss flag makes filtering downstream code readable. The function copies the DataFrame first to avoid SettingWithCopyWarning.',
    output: '0 loss-making orders out of 20',
  },
]

export function NLToPythonExplorer() {
  const [active, setActive] = React.useState(0)
  const ex = EXAMPLES[active]
  const [showOutput, setShowOutput] = React.useState(false)

  React.useEffect(() => { setShowOutput(false) }, [active])

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-purple" /> Natural Language → Python Explorer
        </h4>
      </div>
      <div className="p-4 space-y-4">
        {/* Example picker */}
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.id}
              onClick={() => setActive(i)}
              className={cn(
                'text-[11px] px-2 py-1 rounded-full border transition-colors text-left',
                active === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'
              )}
            >
              {e.prompt.length > 50 ? e.prompt.slice(0, 48) + '…' : e.prompt}
            </button>
          ))}
        </div>

        {/* NL → Code flow */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
          <div className="rounded-lg bg-ai-blue/5 border border-ai-blue/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-blue mb-1.5">Natural language prompt</p>
            <p className="text-sm leading-relaxed">{ex.prompt}</p>
          </div>
          <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground mt-8 mx-auto" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ai-purple mb-1.5">Generated Python code</p>
            <CodeBlock code={ex.code} language="python" title="generated.py" maxHeight="260px" />
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">How it works</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{ex.explanation}</p>
        </div>

        {/* Run button + output */}
        <div>
          <Button size="sm" onClick={() => setShowOutput(true)}>
            <Play className="w-3.5 h-3.5 mr-1" /> Run code (simulated output)
          </Button>
          {showOutput && (
            <div className="mt-2 rounded-lg bg-ai-green/5 border border-ai-green/20 p-3 fade-in">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ai-green mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Output (computed from sample data)
              </p>
              <pre className="text-xs font-mono text-foreground/90 whitespace-pre-wrap">{ex.output}</pre>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-ai-orange/5 border border-ai-orange/20 p-3 text-xs text-foreground/80 leading-relaxed">
          <strong className="text-ai-orange">Always review:</strong> AI-generated code can use the wrong column names, miss edge cases, or invent APIs.
          Validate output against a small known subset of your data before trusting the result.
        </div>
      </div>
    </Card>
  )
}
