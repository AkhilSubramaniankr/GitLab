'use client'

import * as React from 'react'
import { Bot, ArrowRight, ArrowLeft, Wrench, Shield, Terminal, FileCode2, Cog } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CURRICULUM } from '@/lib/curriculum'
import { TopicHeader, LessonSection, Callout, PracticalExercise } from '@/components/learn/topic-parts'
import { ConceptExplorer } from '@/components/learn/concept-explorer'
import { CodeBlock } from '@/components/learn/code-block'
import { Quiz } from '@/components/learn/quiz'
import { AgentLoopVisualizer } from '@/components/labs/agent-loop-visualizer'
import { CopilotChatSimulator } from '@/components/labs/copilot-chat-simulator'

const day = CURRICULUM[8]

export function Day9View() {
  const { setView } = useAppStore()
  return (
    <div>
      <TopicHeader
        day={day.day} title={day.title} duration={day.duration}
        objectives={day.objectives} prerequisites={day.prerequisites}
        color={day.color} icon={<Bot className="w-7 h-7 text-ai-purple" />}
      />

      <LessonSection id="d9-agentic" title="1. Introduction to Agentic AI">
        <ConceptExplorer
          title="Agentic AI"
          icon={<Bot className="w-4 h-4 text-ai-purple" />}
          blocks={{
            what: 'An AI agent is a system that pursues a goal over multiple steps: it plans, picks tools, takes actions, observes results, and iterates until done.',
            why: 'Single-shot AI (one prompt → one response) cannot handle multi-file edits, long-running tasks, or chained dependencies. Agents can.',
            when: 'Multi-step tasks: "add a feature across 3 files and run the tests", "explore the dataset and produce an EDA notebook", "fix the broken pipeline".',
            how: 'Agent loop: User Task → Planning → Tool Selection → Action → Observation → Validation → (loop or complete). Human approval gates protect against unwanted changes.',
            beginner: 'A regular AI assistant answers questions. An AI agent does work — like a junior developer who can read files, edit code, and run commands, asking for approval before risky actions.',
            technical: 'Agents combine an LLM with a tool-calling interface (read_file, edit_file, run_terminal_command, run_tests). The LLM proposes tool calls; the runtime executes them and feeds results back. Loops continue until a stopping condition is met.',
            analogy: 'An assistant tells you how to fix a leaky faucet. A plumber fixes it. An AI agent is the plumber.',
            application: 'A Data Analyst asks the agent: "Add a profit_margin column to cleaning.py, fix the broken groupby in analysis.py, and add a matplotlib chart to visualization.py. Run the tests when done." The agent plans 5 steps, edits 3 files, runs tests, and reports.',
            commonMistakes: ['Approving every tool call without reading — agents can make unintended changes.', 'Asking agents to do tasks you could not describe precisely.', 'Trusting agent output without running tests.'],
            bestPractices: ['Use agents for multi-file, well-specified tasks.', 'Always review the diff before approving edits.', 'Require test runs after agent edits.', 'Start with a plan-only request before letting the agent act.'],
            limitations: ['Agents can loop forever or get stuck — set step limits.', 'Tool calls have real side effects (file edits, shell commands).', 'Capability varies by editor, plan, and organization policy.'],
            interview: { q: 'What is the difference between an AI assistant and an AI agent?', a: 'An assistant responds to a single prompt with text or code. An agent pursues a goal over multiple steps, using tools to read and modify the world (files, terminals, APIs), observing results, and iterating until the goal is met or it needs human input. Assistants suggest; agents act.' },
          }}
        />
      </LessonSection>

      <LessonSection id="d9-loop" title="2. The Agent Loop — Interactive Visualizer">
        <p className="text-sm leading-relaxed mb-3">
          Step through each stage of the agent loop on a real Data Analytics task. Click "Auto-play" or use the buttons to navigate.
        </p>
        <AgentLoopVisualizer />
      </LessonSection>

      <LessonSection id="d9-workflows" title="3. Ask vs Plan vs Agent Workflows">
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Workflow</th>
                <th className="p-2 text-left">When to use</th>
                <th className="p-2 text-left">Tools</th>
                <th className="p-2 text-left">Human approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-2 font-semibold text-ai-blue">Ask</td>
                <td className="p-2">Quick question, single answer</td>
                <td className="p-2">None — just LLM</td>
                <td className="p-2">Not needed</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold text-ai-purple">Plan</td>
                <td className="p-2">Multi-step task, want to review plan before action</td>
                <td className="p-2">Read-only (inspect files)</td>
                <td className="p-2">Approve plan before any edits</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold text-ai-orange">Agent</td>
                <td className="p-2">Execute a well-specified multi-file task end-to-end</td>
                <td className="p-2">Read, edit, run commands, run tests</td>
                <td className="p-2">Per-tool approval recommended</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="tip" title="Start with Plan, escalate to Agent">
          For unfamiliar tasks, ask Copilot to plan first. Review the plan. If it looks right, ask it to execute the plan in agent mode. This catches misunderstandings before any file is changed.
        </Callout>
      </LessonSection>

      <LessonSection id="d9-multifile" title="4. Multi-File Project Awareness">
        <p className="text-sm leading-relaxed mb-3">
          Agents can reason about an entire project — not just the file you have open. A typical analytics project structure:
        </p>
        <CodeBlock language="bash" title="Multi-file project the agent sees" code={`sales-analysis/\n├── main.py              ← entry point\n├── cleaning.py          ← data cleaning functions\n├── analysis.py          ← aggregations & metrics\n├── visualization.py     ← chart helpers\n├── tests/\n│   └── test_cleaning.py ← pytest tests\n├── requirements.txt     ← pinned deps\n└── README.md            ← project docs`} maxHeight="220px" />
        <p className="text-sm leading-relaxed mt-2">
          When you ask the agent to "add a profit_margin column", it knows to edit <code className="bg-muted px-1 rounded text-xs">cleaning.py</code> (where columns are added), update <code className="bg-muted px-1 rounded text-xs">analysis.py</code> (if profit_margin is used downstream), and add tests in <code className="bg-muted px-1 rounded text-xs">test_cleaning.py</code> — all in one task.
        </p>
      </LessonSection>

      <LessonSection id="d9-tools" title="5. Agent Tools, Permissions & Human Approval">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-ai-blue/30 bg-ai-blue/5 p-4">
            <h4 className="font-semibold text-xs mb-2 text-ai-blue flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Common agent tools</h4>
            <ul className="text-xs space-y-1 text-muted-foreground font-mono">
              <li>• <code>read_file</code> — read a file's contents</li>
              <li>• <code>edit_file</code> — replace lines in a file</li>
              <li>• <code>create_file</code> — create a new file</li>
              <li>• <code>run_terminal_command</code> — execute a shell command</li>
              <li>• <code>run_tests</code> — execute pytest</li>
              <li>• <code>search_files</code> — grep across the project</li>
            </ul>
          </div>
          <div className="rounded-lg border border-ai-red/30 bg-ai-red/5 p-4">
            <h4 className="font-semibold text-xs mb-2 text-ai-red flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Permission best practices</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Require approval for <code>edit_file</code> and <code>run_terminal_command</code></li>
              <li>• Allow auto-approval for <code>read_file</code> and <code>search_files</code></li>
              <li>• Block commands with <code>rm -rf</code>, <code>sudo</code>, <code>git push</code> by default</li>
              <li>• Set a maximum number of agent steps (e.g. 25)</li>
              <li>• Review the full diff before final accept</li>
            </ul>
          </div>
        </div>
      </LessonSection>

      <LessonSection id="d9-cli" title="6. CLI Integration & Terminal Assistance">
        <p className="text-sm leading-relaxed mb-3">
          Copilot CLI / terminal assistance suggests shell commands and explains errors. Always review before running — agents can run destructive commands.
        </p>
        <CodeBlock language="bash" title="Example terminal assistance (simulated)" code={`$ ?? git undo last commit\n\nSuggested command:\n  git reset --soft HEAD~1\n\nExplanation:\n  Removes the last commit but keeps the changes staged.\n  Use --hard instead to discard the changes (DESTRUCTIVE).\n\nApprove? [y/n]`} maxHeight="160px" />
      </LessonSection>

      <LessonSection id="d9-customization" title="7. Custom Instructions, Prompt Files, Custom Agents & MCP">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1.5"><Cog className="w-3.5 h-3.5 text-ai-purple" /> Custom Instructions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">A <code className="bg-muted px-1 rounded text-[10px]">.github/copilot-instructions.md</code> file in your repo tells Copilot your project's conventions. Example: "Always use type hints. Prefer Pandas method chaining. Use Google-style docstrings. Never commit raw data."</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1.5"><FileCode2 className="w-3.5 h-3.5 text-ai-blue" /> Reusable Prompt Files</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Save a prompt as <code className="bg-muted px-1 rounded text-[10px]">prompts/clean-sales.prompt.md</code> and reference it with <code className="bg-muted px-1 rounded text-[10px]">#file:clean-sales.prompt.md</code> in chat. Reusable across team members.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-ai-purple" /> Custom Agents</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Define an agent with a system prompt, tool list, and starting files. Example: a "data-cleaning-agent" that only edits <code className="bg-muted px-1 rounded text-[10px]">cleaning.py</code> and runs tests. Availability depends on your plan.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-ai-cyan" /> MCP (Model Context Protocol)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">An open protocol that lets agents talk to external tools — databases, Jira, Figma, Slack, custom APIs. Connect an MCP server and the agent can query your warehouse or create tickets as part of its workflow.</p>
          </div>
        </div>
        <Callout type="warning" title="Availability varies">
        Agent mode, custom agents, and MCP support depend on your Copilot plan, editor version, and organization policy. Check the official docs at docs.github.com/copilot for current availability.
        </Callout>
      </LessonSection>

      <LessonSection id="d9-custom-instructions-lab" title="8. Custom Instructions Builder — Interactive">
        <CopilotChatSimulator
          title="Custom Instructions Builder"
          scenarios={[
            { id: 'ci1', mode: 'plan', title: 'Pandas project instructions', prompt: 'Generate a .github/copilot-instructions.md for a Pandas-based analytics project that enforces type hints, method chaining, and Google-style docstrings.', response: { text: 'Here is a starter .github/copilot-instructions.md:', code: [{ code: `# Copilot Instructions\n\n## Code Style\n- Always use Python type hints (Python 3.10+ syntax: str | None, list[int]).\n- Prefer Pandas method chaining over intermediate variables.\n- Use Google-style docstrings with Args, Returns, Raises, Example.\n- Use snake_case for functions and variables; CamelCase for classes.\n\n## Data Analysis\n- Always inspect data with df.info() and df.describe() before transforming.\n- Handle missing values explicitly (dropna, fillna) — never silently.\n- Use .copy() when modifying a filtered DataFrame.\n- Validate aggregations against a manual calculation on a 5-row sample.\n\n## Testing\n- Generate pytest tests for any function with non-trivial logic.\n- Always test edge cases: empty DataFrame, NaN values, single row.\n\n## Project Structure\n- src/ for source code, tests/ for tests, data/ for data (gitignored).\n- Never commit raw data files. Use .gitignore.\n- Pin all dependencies in requirements.txt.`, language: 'markdown' }] } },
            { id: 'mcp1', mode: 'explain', title: 'MCP concept', prompt: 'Explain MCP (Model Context Protocol) like I am a Data Analyst.', response: { text: 'MCP is an open standard that lets Copilot talk to external tools — your database, Jira, Slack, or a custom API — using a single protocol.', steps: ['Without MCP: Copilot can only read your files and run shell commands.', 'With MCP: you connect an MCP server (e.g. one that talks to your warehouse). Copilot can now query the warehouse schema and run SELECT queries as part of its work.', 'Example: "What columns does the orders table have?" — the agent calls the MCP tool, gets the schema, and answers accurately instead of guessing.', 'You configure MCP servers in your editor settings; the agent picks tools automatically based on the task.', 'MCP is open-source and supported by Anthropic, GitHub, and others.'] } },
          ]}
        />
      </LessonSection>

      <LessonSection id="d9-security" title="9. Responsible Agent-Assisted Development">
        <div className="rounded-lg border-2 border-ai-red/40 bg-ai-red/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm text-ai-red flex items-center gap-2"><Shield className="w-4 h-4" /> Agent safety checklist</h4>
          <ul className="text-xs space-y-1.5 text-muted-foreground">
            <li>🔒 <strong>Require approval</strong> for every file edit and terminal command — at least until you trust the agent.</li>
            <li>🚫 <strong>Block dangerous commands</strong> — rm -rf, sudo, git push --force, anything that touches prod.</li>
            <li>📦 <strong>Work on a branch</strong> — agent edits should never land directly on main.</li>
            <li>🧪 <strong>Run tests after edits</strong> — agents can break things silently.</li>
            <li>👀 <strong>Review the full diff</strong> — agents may make unintended edits in files you did not ask it to touch.</li>
            <li>🔐 <strong>Never give the agent access to secrets</strong> — .env stays out of context.</li>
            <li>⏱️ <strong>Set a step limit</strong> — agents can loop; cap iterations.</li>
            <li>📄 <strong>Document agent use</strong> — follow your team\'s AI-use disclosure policy.</li>
          </ul>
        </div>
      </LessonSection>

      <PracticalExercise id="d9-ex" title="Plan and (simulated) execute a multi-file analytics task">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open a multi-file project (or use the structure shown above).</li>
          <li>Ask Copilot Chat to <strong>plan</strong> a task: "Add a profit_margin column, fix the groupby in analysis.py, add a chart of monthly revenue."</li>
          <li>Review the plan. If correct, ask it to execute in <strong>agent mode</strong> (if available) or step through manually.</li>
          <li>Approve each edit only after reading it.</li>
          <li>Run the test suite after edits.</li>
          <li>Create a <code className="bg-muted px-1 rounded text-xs">.github/copilot-instructions.md</code> with your project conventions.</li>
        </ol>
      </PracticalExercise>

      <Quiz id="d9-quiz" questions={[
        { q: 'What is the key difference between an AI assistant and an AI agent?', options: ['Agents are faster', 'Agents use tools to take actions over multiple steps; assistants respond to a single prompt', 'Agents are cheaper', 'Assistants cannot write code'], correct: 1, explanation: 'Assistants respond to one prompt. Agents pursue a goal over multiple steps using tools (read/edit files, run commands) and iterate based on results.' },
        { q: 'What is the recommended workflow for an unfamiliar multi-step task?', options: ['Let the agent run end-to-end immediately', 'Ask for a plan first, review it, then escalate to agent mode', 'Use Ask mode only', 'Skip the task'], correct: 1, explanation: 'Plan first → review → execute. This catches misunderstandings before any file is changed, which is much safer than letting the agent act blindly.' },
        { q: 'Which agent tool should ALWAYS require human approval?', options: ['read_file', 'search_files', 'edit_file and run_terminal_command', 'None — auto-approve everything'], correct: 2, explanation: 'Read-only tools (read_file, search_files) are safe to auto-approve. Tools that change the world (edit_file, run_terminal_command) can have destructive side effects — always require approval.' },
        { q: 'What does a .github/copilot-instructions.md file do?', options: ['It is a README', 'It tells Copilot your project conventions so all suggestions follow them', 'It installs Copilot', 'It blocks Copilot'], correct: 1, explanation: 'Custom instructions are automatically included in Copilot\'s context, so it follows your type-hint, docstring, and naming conventions across every interaction.' },
        { q: 'What is MCP (Model Context Protocol)?', options: ['A new programming language', 'An open protocol for agents to talk to external tools (databases, Jira, APIs)', 'A replacement for Git', 'A type of database'], correct: 1, explanation: 'MCP lets agents call external tools through a standard interface — e.g. querying your warehouse, creating a Jira ticket, or reading from an API — without each tool needing custom integration.' },
        { q: 'Which is a critical agent safety practice?', options: ['Auto-approve everything to save time', 'Work on a branch and run tests after edits', 'Give the agent access to .env for convenience', 'Let the agent push directly to main'], correct: 1, explanation: 'Edits should land on a feature branch, not main. Tests must pass after agent edits. Never expose secrets — agent context is uploaded to a server.' },
      ]} />

      <div className="flex justify-between mt-8">
        <button onClick={() => setView('day8')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Day 8</button>
        <button onClick={() => setView('day10')} className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Day 10 — Capstone Project <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
