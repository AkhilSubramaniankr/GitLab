'use client'

import * as React from 'react'
import { Sparkles, ArrowRight, ArrowLeft, GitBranch, Code2, ShieldCheck, Bot } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { VSCodeInterfaceExplorer } from '@/components/labs/vscode-interface-explorer'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'
import { CodeSuggestionSimulator } from '@/components/labs/code-suggestion-simulator'
import { TraditionalVsCopilotComparison } from '@/components/labs/partial-features'

const day = CURRICULUM[1]

export function Day2View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<Sparkles className="w-7 h-7 text-ai-purple" />}
      />

      <LessonSection id="d2-evolution" title="1. Evolution of Software Development & AI-Assisted Coding">
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          {[
            { era: '1970s–2000s', title: 'Manual Coding', desc: 'Memorize syntax, type every line, consult paper manuals & docs.', cls: 'border-ai-orange/30 bg-ai-orange/5', text: 'text-ai-orange' },
            { era: '2000s–2010s', title: 'IDE Autocomplete', desc: 'IntelliSense, syntax highlighting, snippet expansion.', cls: 'border-ai-blue/30 bg-ai-blue/5', text: 'text-ai-blue' },
            { era: '2021+', title: 'AI-Assisted Coding', desc: 'Copilot suggests entire functions from natural language or context.', cls: 'border-ai-purple/30 bg-ai-purple/5', text: 'text-ai-purple' },
          ].map((s) => (
            <div key={s.era} className={`rounded-lg border ${s.cls} p-4`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${s.text} mb-1`}>{s.era}</p>
              <h4 className="font-semibold text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <Callout type="info" title="Traditional vs AI-Assisted">
          Traditional: think → search docs → type → debug → repeat. AI-assisted: describe intent → review suggestion → refine. You still debug and validate, but the typing and search steps shrink dramatically.
        </Callout>

        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-2">Interactive: Traditional vs Copilot — Same Task, Side by Side</h3>
          <p className="text-xs text-muted-foreground mb-3">Click through 5 steps of the same task done two ways. See the time difference add up.</p>
          <TraditionalVsCopilotComparison />
        </div>
      </LessonSection>

      <LessonSection id="d2-what" title="2. What GitHub Copilot Does">
        <ConceptExplorer
          title="GitHub Copilot"
          icon={<Sparkles className="w-4 h-4 text-ai-purple" />}
          blocks={{
            what: 'An AI pair programmer that suggests code in real time, answers questions in chat, and performs multi-file edits via agent mode. Trained on billions of lines of public code.',
            why: 'Reduces boilerplate, accelerates learning of new APIs, explains unfamiliar code, generates tests, and frees you to focus on the problem instead of syntax.',
            when: 'Inline while typing; in chat for explanations/refactors; in agent mode for multi-step tasks. Not for: writing code you cannot review, handling secrets, or replacing domain expertise.',
            how: 'Copilot reads the surrounding code, comments, and (in agent mode) the workspace. It sends context to a server-side LLM, gets suggestions back, and presents them as ghost text or chat responses. You review and accept.',
            beginner: 'Like predictive text on your phone, but for code — and much smarter because it understands programming languages.',
            technical: 'Uses OpenAI models fine-tuned on code. The editor plugin manages context windowing: nearby code, imports, open files, and (in chat) @workspace references. Suggestions are streamed token-by-token.',
            analogy: 'A senior developer looking over your shoulder, suggesting the next line and answering questions — but you still own every line that ships.',
            application: 'A Data Analyst types "# calculate monthly revenue trend" and Copilot generates the Pandas groupby. The analyst reviews the column names, accepts, then asks Copilot Chat to add error handling.',
            commonMistakes: ['Accepting suggestions without reading them — they can hallucinate APIs or column names.', 'Trusting AI for security-sensitive code (auth, crypto) without expert review.', 'Treating Copilot as a replacement for understanding the code.'],
            bestPractices: ['Always read every line before accepting.', 'Write clear comments and function names — they are the prompt.', 'Validate AI-generated calculations against a known small dataset.', 'Use chat for explanations and refactors, not just generation.'],
            limitations: ['May suggest deprecated APIs.', 'No access to private business context unless you provide it.', 'Can hallucinate column names, function signatures, or library APIs.', 'Performance depends on prompt clarity (Day 4).'],
            interview: { q: 'Is GitHub Copilot just autocomplete?', a: 'No. Traditional autocomplete suggests the next token based on local patterns. Copilot uses a large language model that understands intent from comments, surrounding code, and (in chat) the whole workspace. It can generate entire functions, refactor code, write tests, and explain unfamiliar APIs — far beyond token completion.' },
            industry: 'Adopted widely at Microsoft, Stripe, Shopify, and many data teams. Used for notebook scaffolding, SQL generation, test creation, and documentation.',
          }}
        />
      </LessonSection>

      <LessonSection id="d2-plans" title="3. Plans, Access & Installation">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-2">Plan</th>
                <th className="text-left p-2">Price (approx.)</th>
                <th className="text-left p-2">Best for</th>
                <th className="text-left p-2">Includes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="p-2 font-semibold">Free</td><td className="p-2">$0</td><td className="p-2">Students, hobbyists, OSS</td><td className="p-2">Limited monthly completions & chat</td></tr>
              <tr><td className="p-2 font-semibold">Pro</td><td className="p-2">$10/mo</td><td className="p-2">Individual professionals</td><td className="p-2">Unlimited completions, chat, agent mode</td></tr>
              <tr><td className="p-2 font-semibold">Business</td><td className="p-2">$19/user/mo</td><td className="p-2">Teams (5+ users)</td><td className="p-2">Central billing, policy, no training on your code</td></tr>
              <tr><td className="p-2 font-semibold">Enterprise</td><td className="p-2">$39/user/mo</td><td className="p-2">Large orgs</td><td className="p-2">Single sign-on, audit logs, model choice</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Verify current pricing and feature availability at github.com/features/copilot — features vary by editor and region.</p>

        <CodeBlock language="bash" title="Install in VS Code" code={`# Method 1: GUI
# 1. Open VS Code → Extensions (Ctrl+Shift+X)
# 2. Search "GitHub Copilot"
# 3. Click Install
# 4. Sign in with your GitHub account when prompted

# Method 2: CLI
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat   # for chat panel`} />
        <Callout type="warning" title="Verify features">
        Specific features (agent mode, MCP, custom agents) depend on your plan, your editor version, and your organization's policy. Always check the official Copilot docs at docs.github.com/copilot for current availability.
        </Callout>
      </LessonSection>

      <LessonSection id="d2-interface" title="4. The Copilot Interface — Interactive Explorer">
        <p className="text-sm leading-relaxed mb-3">
          Click any element in the simulated VS Code window below to learn what it does and see a realistic example interaction.
        </p>
        <VSCodeInterfaceExplorer />
      </LessonSection>

      <LessonSection id="d2-features" title="5. Inline Suggestions, Inline Editing, Chat & Smart Actions">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-ai-purple/30 bg-ai-purple/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-purple">Inline Suggestions (ghost text)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">As you type, Copilot shows greyed-out suggested completions. <strong>Tab</strong> accepts, <strong>Esc</strong> dismisses, <strong>Alt+]</strong> / <strong>Alt+[</strong> cycle through alternatives.</p>
            <CodeBlock code={`# Calculate total revenue per product\nresult = df.groupby("product")["revenue"].sum()  ← ghost text`} language="python" maxHeight="120px" />
          </div>
          <div className="rounded-lg border border-ai-blue/30 bg-ai-blue/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-blue">Inline Chat (⌘I / Ctrl+I)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Select code → press ⌘I → ask Copilot to refactor, fix, or explain. You see a diff and Accept/Reject.</p>
            <CodeBlock code={`# Select a for-loop, press ⌘I, type:\n# "convert to list comprehension"\n# Copilot returns the rewritten line as a diff`} language="python" maxHeight="120px" />
          </div>
          <div className="rounded-lg border border-ai-cyan/30 bg-ai-cyan/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-cyan">Copilot Chat</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">A panel for conversational prompts. Use <strong>@workspace</strong> to ask about the whole project, <strong>@terminal</strong> for shell help, or <strong>#file</strong> to attach a file.</p>
            <CodeBlock code={`# In Copilot Chat:\n# @workspace Explain how cleaning.py is used\n# in analysis.py and suggest a refactor.`} language="python" maxHeight="120px" />
          </div>
          <div className="rounded-lg border border-ai-green/30 bg-ai-green/5 p-4">
            <h4 className="font-semibold text-sm mb-1.5 text-ai-green">Smart Actions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">Inline buttons above code: <strong>Explain</strong>, <strong>Fix</strong>, <strong>Refactor</strong>, <strong>Generate Docs</strong>, <strong>Generate Tests</strong>. Right-click for more.</p>
            <CodeBlock code={`# Hover a function → click "Generate Docs"\n# Copilot inserts a Google-style docstring`} language="python" maxHeight="120px" />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-2">Interactive: Code Suggestion Simulator</h3>
          <p className="text-xs text-muted-foreground mb-3">Watch how Copilot generates inline suggestions as you type a comment. Accept, reject, or cycle through alternatives. (For full completion practice, see Day 3's Code Completion Playground.)</p>
          <CodeSuggestionSimulator />
        </div>
      </LessonSection>

      <LessonSection id="d2-context" title="6. Context & Workspace Awareness">
        <p className="text-sm leading-relaxed mb-3">
          Copilot uses surrounding context to make better suggestions:
        </p>
        <ul className="text-sm space-y-1.5 leading-relaxed">
          <li>• <strong>Open files</strong> — Copilot reads tabs you currently have open.</li>
          <li>• <strong>Imports & function signatures</strong> — informs which APIs are valid.</li>
          <li>• <strong>Comments above the cursor</strong> — the most powerful signal you control.</li>
          <li>• <strong>@workspace</strong> in chat — searches the whole project for relevant files.</li>
          <li>• <strong>#file</strong> syntax — explicitly attaches a file's content to the prompt.</li>
        </ul>
        <Callout type="tip" title="Write better comments, get better code">
          A clear comment like <code className="bg-muted px-1 rounded text-xs"># Group by region, sum revenue, return top 5 as a Series sorted descending</code> produces far better code than a vague one like <code className="bg-muted px-1 rounded text-xs"># do the analysis</code>. Day 4 explores this in depth.
        </Callout>
      </LessonSection>

      <LessonSection id="d2-responsible" title="7. Responsible AI-Assisted Development">
        <div className="rounded-lg border border-ai-red/30 bg-ai-red/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm text-ai-red flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Your responsibilities</h4>
          <ul className="text-xs space-y-1.5 text-muted-foreground">
            <li>• <strong>Review every line</strong> — AI can hallucinate APIs, misname columns, or invent statistics.</li>
            <li>• <strong>Validate calculations</strong> — re-compute a sample by hand or with a different method.</li>
            <li>• <strong>Check licenses</strong> — suggestions may resemble public code; respect license terms.</li>
            <li>• <strong>Protect secrets</strong> — never paste API keys into chat; Copilot uploads context to a server.</li>
            <li>• <strong>Acknowledge AI use</strong> — follow your team or org's disclosure policy.</li>
            <li>• <strong>Bias & fairness</strong> — AI may suggest biased heuristics in analytics; apply domain judgment.</li>
          </ul>
        </div>
      </LessonSection>

      <LessonSection id="d2-demo" title="8. Copilot Chat Simulator — Loading & Inspecting a CSV">
        <CopilotChatSimulator
          title="Copilot Chat — Load & Inspect CSV"
          systemLabel="Simulated Copilot response"
          scenarios={[
            { id: 'load', mode: 'generate', title: 'Generate CSV loader', prompt: 'Write a Python function to load sales.csv with Pandas, handle missing values, and return a cleaned DataFrame.', response: { text: 'Here is a reusable loader with error handling and basic cleaning. It validates that required columns exist and reports missing values.', code: [{ code: `import pandas as pd\nfrom pathlib import Path\n\ndef load_sales(path: str | Path) -> pd.DataFrame:\n    """Load a sales CSV, validate schema, and report issues."""\n    path = Path(path)\n    if not path.exists():\n        raise FileNotFoundError(f"{path} not found")\n    \n    df = pd.read_csv(path)\n    required = {"order_id", "product", "revenue"}\n    missing = required - set(df.columns)\n    if missing:\n        raise ValueError(f"Missing required columns: {missing}")\n    \n    # Report issues\n    na_counts = df.isnull().sum()\n    if na_counts.any():\n        print("Missing values:\\n", na_counts[na_counts > 0])\n    \n    print(f"Loaded {len(df)} rows, {len(df.columns)} columns")\n    return df\n\ndf = load_sales("sales.csv")`, language: 'python', title: 'loader.py' }] } },
            { id: 'inspect', mode: 'explain', title: 'Explain df.info()', prompt: 'Explain what df.info() tells me about my dataset.', response: { text: 'df.info() prints a concise summary:', steps: ['<class \'pandas.core.frame.DataFrame\'> — confirms it is a DataFrame', 'RangeIndex: 20 entries, 0 to 19 — number of rows', 'Data columns (total 11 columns) — column count', 'Each column: name, non-null count, dtype (int64, float64, object)', 'memory usage: how much RAM the DataFrame uses', 'Use it after every load to verify dtypes (dates are datetime, IDs are str, numerics are int/float).'] } },
            { id: 'fix', mode: 'fix', title: 'Fix a dtype issue', prompt: 'order_date is being read as object, not datetime. Fix this.', response: { text: 'Cast order_date to datetime during loading so date arithmetic and grouping work correctly.', code: [{ code: `df["order_date"] = pd.to_datetime(\n    df["order_date"],\n    errors="coerce"   # invalid → NaT instead of crashing\n)\nprint(df["order_date"].dtype)   # datetime64[ns]`, language: 'python', title: 'fix.py' }] } },
          ]}
        />
      </LessonSection>

      <PracticalExercise id="d2-ex" title="Use Copilot to load and inspect a CSV dataset">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Create a new Python file in VS Code with Copilot enabled.</li>
          <li>Type a comment describing a CSV loader with validation.</li>
          <li>Accept Copilot&apos;s suggestion, then use Copilot Chat to add error handling.</li>
          <li>Run <code className="bg-muted px-1 rounded text-xs">df.info()</code> and <code className="bg-muted px-1 rounded text-xs">df.describe()</code> on a small CSV.</li>
          <li>Use the "Explain" Smart Action on any line you do not understand.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d2-quiz" questions={[
        { q: 'Which keyboard shortcut opens Inline Chat in VS Code?', options: ['Tab', 'Ctrl+I (Cmd+I on Mac)', 'Ctrl+Shift+P', 'F1'], correct: 1, explanation: 'Ctrl+I (or Cmd+I on macOS) opens Inline Chat on the current selection, letting you ask Copilot to refactor or fix in place.' },
        { q: 'What does ghost text represent?', options: ['A deleted file', 'Copilot\'s inline suggestion you can accept with Tab', 'An error message', 'A hidden comment'], correct: 1, explanation: 'Ghost text is Copilot\'s suggestion shown as you type. Tab accepts; Esc dismisses; Alt+] / Alt+[ cycle alternatives.' },
        { q: 'Which @-mention asks Copilot about the entire project?', options: ['@file', '@terminal', '@workspace', '@project'], correct: 2, explanation: '@workspace includes your whole project as context — useful for "where is X used?" or "explain the data flow".' },
        { q: 'What is the most important responsible-AI practice with Copilot?', options: ['Always accept suggestions to save time', 'Review every line before accepting', 'Use it only for tests', 'Disable it for production code'], correct: 1, explanation: 'AI can hallucinate APIs, misname columns, or invent statistics. You are responsible for every line that ships — review everything.' },
        { q: 'Why should you never paste API keys into Copilot Chat?', options: ['It slows down responses', 'Context is sent to a server and may be logged', 'Copilot will refuse to answer', 'It triggers billing'], correct: 1, explanation: 'Chat context is uploaded to GitHub/OpenAI servers for inference. Treat it like any external service: never include secrets.' },
        { q: 'Which factor most improves Copilot\'s suggestions?', options: ['Typing faster', 'Using a darker theme', 'Writing clear comments and function names', 'Disabling IntelliSense'], correct: 2, explanation: 'Comments and function names are the prompt. Clear intent → clear code. Day 4 covers prompt engineering in depth.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day1')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Day 1
        </button>
        <button onClick={() => setView('day3')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
          Day 3 — Code Generation & Chat <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
