// Central curriculum metadata used by navigation, dashboard, and progress tracking.

export interface DayMeta {
  id: string
  view: string
  day: number
  title: string
  short: string
  duration: string
  color: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red'
  icon: string
  description: string
  objectives: string[]
  prerequisites: string
  topicCount: number
}

export const CURRICULUM: DayMeta[] = [
  {
    id: 'day1',
    view: 'day1',
    day: 1,
    title: 'Git & GitHub Fundamentals',
    short: 'Git & GitHub',
    duration: '2 Hours',
    color: 'orange',
    icon: 'GitBranch',
    description: 'Version control essentials: install Git, manage repositories, run core commands, and connect Git to GitHub for Data Analytics projects.',
    objectives: [
      'Explain version control and why Data Analysts need it',
      'Install and configure Git locally',
      'Create, stage, and commit changes',
      'Connect local repos to GitHub and push projects',
      'Protect sensitive files with .gitignore',
    ],
    prerequisites: 'Basic computer literacy. No prior Git experience needed.',
    topicCount: 17,
  },
  {
    id: 'day2',
    view: 'day2',
    day: 2,
    title: 'Introduction to GitHub Copilot',
    short: 'Copilot Basics',
    duration: '2 Hours',
    color: 'purple',
    icon: 'Sparkles',
    description: 'Understand what GitHub Copilot is, how it works at a high level, and how to install and navigate it inside VS Code.',
    objectives: [
      'Describe the evolution of AI-assisted coding',
      'Install and authenticate Copilot in VS Code',
      'Recognize the Copilot interface elements',
      'Distinguish inline suggestions, chat, and smart actions',
      'Practice responsible AI-assisted development',
    ],
    prerequisites: 'Day 1 Git fundamentals; VS Code installed.',
    topicCount: 18,
  },
  {
    id: 'day3',
    view: 'day3',
    day: 3,
    title: 'Code Generation, Inline Suggestions & Copilot Chat',
    short: 'Code Generation',
    duration: '2 Hours',
    color: 'blue',
    icon: 'MessageSquareCode',
    description: 'Generate Python from natural language, edit code inline, and use Copilot Chat to explain, fix, convert, and document analytics code.',
    objectives: [
      'Use inline suggestions and inline chat effectively',
      'Generate Python functions from comments',
      'Explain, refactor, and convert existing code',
      'Review and validate AI-generated suggestions',
      'Recognize common code-generation errors',
    ],
    prerequisites: 'Day 2 Copilot fundamentals; basic Python syntax.',
    topicCount: 15,
  },
  {
    id: 'day4',
    view: 'day4',
    day: 4,
    title: 'Prompt Engineering & Context-Aware Development',
    short: 'Prompt Engineering',
    duration: '2 Hours',
    color: 'cyan',
    icon: 'Wand2',
    description: 'Master the TRICK framework, zero-shot vs few-shot prompting, role prompting, and context-aware prompts for Pandas, SQL, and visualization.',
    objectives: [
      'Structure prompts with Task, Role, Input, Condition, Knowledge',
      'Compare zero-shot, few-shot, and role prompting',
      'Provide file and workspace context to Copilot',
      'Iteratively refine prompts for analytics tasks',
      'Identify and mitigate AI hallucinations',
    ],
    prerequisites: 'Day 3 code generation; basic Pandas/SQL awareness.',
    topicCount: 20,
  },
  {
    id: 'day5',
    view: 'day5',
    day: 5,
    title: 'Debugging, Testing, Refactoring & Documentation',
    short: 'Debug & Test',
    duration: '2 Hours',
    color: 'red',
    icon: 'Bug',
    description: 'Diagnose and fix Python/Pandas errors, refactor for readability, generate unit tests and assertions, and produce docstrings and READMEs with Copilot.',
    objectives: [
      'Classify syntax, runtime, and logical errors',
      'Use Copilot to debug Pandas errors',
      'Refactor code for readability and performance',
      'Generate unit tests and validate them',
      'Produce docstrings, READMEs, and API specs',
    ],
    prerequisites: 'Day 3-4 Copilot usage; basic Python error types.',
    topicCount: 19,
  },
  {
    id: 'day6',
    view: 'day6',
    day: 6,
    title: 'GitHub Collaboration, Code Review & Version Control',
    short: 'Collaboration',
    duration: '2 Hours',
    color: 'orange',
    icon: 'GitPullRequest',
    description: 'Branch, merge, resolve conflicts, open pull requests, and use Copilot-assisted code review for analytics projects.',
    objectives: [
      'Create and switch Git branches',
      'Merge branches and resolve conflicts',
      'Open and review pull requests',
      'Use Copilot for code review and commit messages',
      'Apply collaboration best practices for analytics',
    ],
    prerequisites: 'Day 1 Git fundamentals; Day 3 Copilot basics.',
    topicCount: 14,
  },
  {
    id: 'day7',
    view: 'day7',
    day: 7,
    title: 'AI-Assisted SQL & Database Analytics',
    short: 'SQL Analytics',
    duration: '2 Hours',
    color: 'cyan',
    icon: 'Database',
    description: 'Write SQL with Copilot: SELECT, WHERE, JOINs, GROUP BY, CTEs, window functions, debugging, optimization, and Python-SQL integration.',
    objectives: [
      'Convert natural language to SQL with Copilot',
      'Write SELECT, WHERE, GROUP BY, and JOIN queries',
      'Use subqueries, CTEs, and window functions',
      'Debug and optimize SQL queries',
      'Integrate Python with SQL databases',
    ],
    prerequisites: 'Day 4 prompt engineering; basic SQL SELECT.',
    topicCount: 18,
  },
  {
    id: 'day8',
    view: 'day8',
    day: 8,
    title: 'AI-Assisted Data Analytics & Visualization',
    short: 'Data Analytics',
    duration: '2 Hours',
    color: 'green',
    icon: 'BarChart3',
    description: 'Use Copilot for Pandas data cleaning, EDA, descriptive statistics, correlation, outliers, and Matplotlib/Seaborn visualization.',
    objectives: [
      'Generate Pandas code for loading and inspecting data',
      'Clean, transform, filter, and aggregate datasets',
      'Perform EDA with descriptive statistics and correlation',
      'Create and customize Matplotlib/Seaborn charts',
      'Validate AI-generated analytics results',
    ],
    prerequisites: 'Day 3-4 Copilot; basic Pandas knowledge helpful.',
    topicCount: 21,
  },
  {
    id: 'day9',
    view: 'day9',
    day: 9,
    title: 'Copilot Agent Mode, CLI, Customization & MCP',
    short: 'Agents & MCP',
    duration: '2 Hours',
    color: 'purple',
    icon: 'Bot',
    description: 'Understand agentic AI, agent vs ask vs plan workflows, multi-file editing, custom instructions, MCP, and responsible agent use.',
    objectives: [
      'Explain AI assistants vs AI agents',
      'Step through the agent loop: plan → act → observe → validate',
      'Compare Ask, Plan, and Agent workflows',
      'Configure custom instructions and reusable prompt files',
      'Understand MCP servers and agent security',
    ],
    prerequisites: 'Day 2-5 Copilot usage; Day 6 collaboration.',
    topicCount: 21,
  },
  {
    id: 'day10',
    view: 'day10',
    day: 10,
    title: 'End-to-End Data Analytics Capstone Project',
    short: 'Capstone',
    duration: '2 Hours',
    color: 'green',
    icon: 'Trophy',
    description: 'Apply the full curriculum to an AI-Assisted Retail Sales Analytics project: clean, analyze, visualize, document, and publish to GitHub.',
    objectives: [
      'Define analytical objectives from a business problem',
      'Generate and validate Pandas/SQL/visualization code',
      'Debug, refactor, and document the solution',
      'Commit changes using Git and publish to GitHub',
      'Present analytical findings clearly',
    ],
    prerequisites: 'All previous days.',
    topicCount: 16,
  },
]

export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ view: 'dashboard' as const, label: 'Dashboard', icon: 'LayoutDashboard' }],
  },
  {
    label: 'Curriculum',
    items: CURRICULUM.map((d) => ({ view: d.view as any, label: `Day ${d.day} — ${d.short}`, icon: d.icon, color: d.color })),
  },
  {
    label: 'Practice',
    items: [
      { view: 'labs' as const, label: 'Interactive Labs', icon: 'FlaskConical' },
      { view: 'practice' as const, label: 'Practice & Quizzes', icon: 'ClipboardCheck' },
      { view: 'progress' as const, label: 'Progress Dashboard', icon: 'TrendingUp' },
      { view: 'glossary' as const, label: 'Glossary', icon: 'BookOpen' },
    ],
  },
]

export function getDayMeta(view: string): DayMeta | undefined {
  return CURRICULUM.find((d) => d.view === view)
}
