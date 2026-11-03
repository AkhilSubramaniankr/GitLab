'use client'

import * as React from 'react'
import { FolderPlus, FileText, Folder, ChevronRight, ChevronDown, FileCode2, FileCog, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/learn/code-block'

interface RepoFile {
  name: string
  type: 'file' | 'folder'
  icon: any
  purpose: string
  sample?: string
  language?: string
  tracked?: boolean
  children?: RepoFile[]
}

const TREE: RepoFile[] = [
  {
    name: 'sales-analysis/',
    type: 'folder',
    icon: Folder,
    purpose: 'Project root folder. Contains all source code, data, tests, and documentation for the Pandas sales analysis project.',
    children: [
      {
        name: 'data/',
        type: 'folder',
        icon: Folder,
        purpose: 'Holds datasets. The raw/ subfolder is gitignored (large original files); processed/ holds cleaned outputs; sample.csv is a small tracked sample for tests.',
        children: [
          { name: 'raw/', type: 'folder', icon: Folder, purpose: 'Original, unmodified CSVs. Gitignored — never committed. Re-downloadable from the data source.', tracked: false },
          { name: 'processed/', type: 'folder', icon: Folder, purpose: 'Cleaned, transformed datasets. Gitignored — reproducible from src/cleaning.py + raw data.', tracked: false },
          { name: 'sample.csv', type: 'file', icon: FileText, purpose: 'Small (≤ 50 rows) synthetic sample dataset, committed to the repo so tests can run without the full data.', sample: 'order_id,order_date,product,revenue\n1001,2024-01-05,Wireless Mouse,51.98\n1002,2024-01-07,Office Chair,149.99', language: 'csv', tracked: true },
        ],
      },
      {
        name: 'notebooks/',
        type: 'folder',
        icon: Folder,
        purpose: 'Jupyter notebooks for exploratory analysis. Clear outputs before committing to keep diffs readable.',
        children: [
          { name: 'eda.ipynb', type: 'file', icon: FileCode2, purpose: 'Exploratory Data Analysis notebook: df.info(), describe(), distributions, correlation, outliers.', tracked: true },
        ],
      },
      {
        name: 'src/',
        type: 'folder',
        icon: Folder,
        purpose: 'Source code — reusable Python modules. Each file has a single responsibility (cleaning, analysis, visualization).',
        children: [
          { name: 'cleaning.py', type: 'file', icon: FileCode2, purpose: 'Data cleaning functions: drop_duplicates, fillna, normalize casing, parse dates. Each function has type hints + docstring + tests.', sample: 'import pandas as pd\n\ndef clean_sales(df: pd.DataFrame) -> pd.DataFrame:\n    """Drop duplicates, fill missing revenue, normalize region."""\n    df = df.drop_duplicates().copy()\n    df["revenue"] = df["revenue"].fillna(0)\n    df["region"] = df["region"].str.strip().str.title()\n    return df', language: 'python', tracked: true },
          { name: 'analysis.py', type: 'file', icon: FileCode2, purpose: 'Aggregation and metric functions: top_products, monthly_revenue_trend, profit_by_category.', sample: 'def top_products(df, n=5):\n    """Return top N products by total revenue."""\n    return (df.groupby("product")["revenue"]\n              .sum()\n              .nlargest(n))', language: 'python', tracked: true },
          { name: 'visualization.py', type: 'file', icon: FileCode2, purpose: 'Matplotlib/Seaborn chart helpers: bar, line, histogram, scatter. Each returns a matplotlib Figure.', sample: 'import matplotlib.pyplot as plt\n\ndef revenue_by_region(df):\n    """Bar chart of total revenue by region."""\n    fig, ax = plt.subplots(figsize=(8, 5))\n    df.groupby("region")["revenue"].sum().plot.bar(ax=ax)\n    return fig', language: 'python', tracked: true },
        ],
      },
      {
        name: 'tests/',
        type: 'folder',
        icon: Folder,
        purpose: 'pytest test files. One test file per source module. Run with: pytest tests/',
        children: [
          { name: 'test_cleaning.py', type: 'file', icon: FileCode2, purpose: 'Tests for cleaning.py: verifies drop_duplicates, fillna, normalize behavior on a small sample.', sample: 'import pandas as pd\nimport pytest\nfrom src.cleaning import clean_sales\n\ndef test_drop_duplicates():\n    df = pd.DataFrame({"revenue": [10, 10, 20]})\n    assert len(clean_sales(df)) == 2\n\ndef test_fillna_revenue():\n    df = pd.DataFrame({"revenue": [10, None]})\n    assert clean_sales(df)["revenue"].iloc[1] == 0', language: 'python', tracked: true },
        ],
      },
      { name: '.gitignore', type: 'file', icon: ShieldCheck, purpose: 'Tells Git which files to skip: __pycache__/, *.pyc, .env, venv/, data/raw/, data/processed/, .DS_Store, .ipynb_checkpoints/.', sample: '__pycache__/\n*.pyc\n.env\nvenv/\ndata/raw/\ndata/processed/\n.ipynb_checkpoints/\n.DS_Store', language: 'bash', tracked: true },
      { name: 'requirements.txt', type: 'file', icon: FileCog, purpose: 'Pinned Python dependencies. Pinning exact versions (pandas==2.2.0) ensures reproducible runs across machines.', sample: 'pandas==2.2.0\nnumpy==1.26.0\nmatplotlib==3.8.0\nseaborn==0.13.0\npytest==8.0.0', language: 'text', tracked: true },
      { name: 'README.md', type: 'file', icon: FileText, purpose: 'Project overview: what it does, how to install, how to run, key findings. The first thing new collaborators read.', sample: '# Sales Analysis\n\nA Pandas-based retail sales analysis project.\n\n## Setup\n```bash\npython -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\n```\n\n## Usage\n```bash\npython main.py\n```\n\n## Tests\n```bash\npytest tests/\n```', language: 'markdown', tracked: true },
      { name: 'main.py', type: 'file', icon: FileCode2, purpose: 'Entry point. Loads data, runs cleaning + analysis + visualization, prints summary.', sample: 'from src.cleaning import clean_sales\nfrom src.analysis import top_products\nfrom src.visualization import revenue_by_region\nimport pandas as pd\n\ndef main():\n    df = pd.read_csv("data/sample.csv")\n    df = clean_sales(df)\n    print(top_products(df))\n    revenue_by_region(df)\n\nif __name__ == "__main__":\n    main()', language: 'python', tracked: true },
    ],
  },
]

export function RepoStructureExplorer() {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['sales-analysis/', 'sales-analysis/data/', 'sales-analysis/src/', 'sales-analysis/tests/']))
  const [selected, setSelected] = React.useState<RepoFile | null>(null)

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const renderTree = (files: RepoFile[], parentPath: string = '', depth: number = 0): React.ReactNode => {
    return files.map((file) => {
      const path = parentPath + file.name
      const isExpanded = expanded.has(path)
      const isSelected = selected?.name === file.name && (selected as any).__path === path
      const tracked = file.tracked !== false
      return (
        <div key={path}>
          <button
            onClick={() => {
              if (file.type === 'folder') toggle(path)
              setSelected({ ...file, __path: path } as any)
            }}
            className={cn(
              'w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-left transition-colors',
              isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40'
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {file.type === 'folder' ? (
              isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <file.icon className={cn('w-3.5 h-3.5 shrink-0', file.type === 'folder' ? 'text-ai-blue' : 'text-muted-foreground')} />
            <span className="font-mono truncate flex-1">{file.name}</span>
            {file.tracked === false && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-ai-red/15 text-ai-red font-semibold shrink-0">ignored</span>
            )}
            {file.tracked === true && file.type === 'file' && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-ai-green/15 text-ai-green font-semibold shrink-0">tracked</span>
            )}
          </button>
          {file.type === 'folder' && isExpanded && file.children && renderTree(file.children, path, depth + 1)}
        </div>
      )
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-ai-orange" /> Repository Structure Explorer
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Click any file or folder to see its purpose and contents.</p>
      </div>
      <div className="grid md:grid-cols-[300px_1fr] divide-x divide-border">
        <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {renderTree(TREE)}
        </div>
        <div className="p-4">
          {!selected && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Select a file or folder to see its purpose and contents.
            </div>
          )}
          {selected && (
            <div className="space-y-3 fade-in" key={(selected as any).__path}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <selected.icon className="w-4 h-4 text-ai-blue" />
                  <h5 className="font-mono font-semibold text-sm">{selected.name}</h5>
                  {selected.tracked === false && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-ai-red/15 text-ai-red font-semibold">gitignored</span>
                  )}
                  {selected.tracked === true && selected.type === 'file' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-ai-green/15 text-ai-green font-semibold">tracked</span>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{selected.purpose}</p>
              </div>
              {selected.sample && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Sample contents</p>
                  <CodeBlock code={selected.sample} language={selected.language || 'text'} title={selected.name} maxHeight="220px" />
                </div>
              )}
              {selected.type === 'folder' && selected.children && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Contains ({selected.children.length} items)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.children.map((c) => (
                      <span key={c.name} className="text-[11px] px-2 py-0.5 rounded-full border border-border font-mono">{c.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
