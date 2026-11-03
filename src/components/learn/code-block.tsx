'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  className?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
  maxHeight?: string
}

// Token-based syntax highlighter.
// Operates on the RAW source string and emits an array of {text, type} tokens,
// which are then rendered as React elements. This avoids the bug where
// regex-on-escaped-HTML corrupts span attributes when the source contains
// reserved words like "class".

type TokenType = 'plain' | 'comment' | 'string' | 'keyword' | 'number' | 'function' | 'decorator' | 'punct'
interface Token { text: string; type: TokenType }

const KEYWORDS: Record<string, Set<string>> = {
  python: new Set('def,class,import,from,as,return,if,elif,else,for,while,try,except,finally,with,lambda,yield,pass,break,continue,in,not,and,or,is,None,True,False,assert,raise,global,nonlocal,del,async,await,print,len,range,open,list,dict,set,tuple,int,str,float,bool,enumerate,zip,map,filter,sorted,sum,min,max,abs,round,self,cls'.split(',')),
  sql: new Set('SELECT,FROM,WHERE,GROUP,BY,ORDER,HAVING,JOIN,LEFT,RIGHT,INNER,OUTER,FULL,ON,AS,AND,OR,NOT,IN,BETWEEN,LIKE,IS,NULL,DISTINCT,LIMIT,OFFSET,UNION,ALL,INSERT,INTO,VALUES,UPDATE,SET,DELETE,CREATE,TABLE,DROP,ALTER,PRIMARY,KEY,FOREIGN,REFERENCES,DEFAULT,CASCADE,WITH,CASE,WHEN,THEN,ELSE,END,OVER,PARTITION,ROW_NUMBER,RANK,DENSE_RANK,COUNT,SUM,AVG,MIN,MAX,ASC,DESC,INTERSECT,EXCEPT,EXISTS,ANY,SOME,USING,NATURAL,CROSS'.split(',')),
  bash: new Set('git,cd,ls,mkdir,rm,cp,mv,touch,echo,cat,sudo,apt,npm,bun,python,python3,pip,code,pushd,popd,source,export,chmod,chown,pwd,clear,history,which,curl,wget,tar,grep,find,sed,awk'.split(',')),
  json: new Set(['true','false','null']),
  javascript: new Set('const,let,var,function,return,if,else,for,while,class,extends,new,this,import,export,from,default,async,await,try,catch,finally,typeof,instanceof,in,of,null,undefined,true,false,break,continue,switch,case,throw,do'.split(',')),
}

function isIdentChar(c: string): boolean {
  return /[A-Za-z0-9_]/.test(c)
}
function isIdentStart(c: string): boolean {
  return /[A-Za-z_]/.test(c)
}

function tokenize(code: string, language: string): Token[] {
  const lang = (language || '').toLowerCase()
  const kws = KEYWORDS[lang]
  const tokens: Token[] = []
  let i = 0
  const n = code.length
  const push = (text: string, type: TokenType) => {
    if (text.length === 0) return
    // merge adjacent plain tokens
    const last = tokens[tokens.length - 1]
    if (last && last.type === 'plain' && type === 'plain') {
      last.text += text
    } else {
      tokens.push({ text, type })
    }
  }

  while (i < n) {
    const c = code[i]
    const next = code[i + 1] || ''

    // Line comments
    if ((lang === 'python' || lang === 'bash' || lang === 'yaml') && c === '#') {
      let j = i
      while (j < n && code[j] !== '\n') j++
      push(code.slice(i, j), 'comment')
      i = j
      continue
    }
    if (lang === 'sql' && c === '-' && next === '-') {
      let j = i
      while (j < n && code[j] !== '\n') j++
      push(code.slice(i, j), 'comment')
      i = j
      continue
    }
    if ((lang === 'javascript' || lang === 'json' || lang === 'markdown') && c === '/' && next === '/') {
      let j = i
      while (j < n && code[j] !== '\n') j++
      push(code.slice(i, j), 'comment')
      i = j
      continue
    }
    if (lang === 'markdown' && c === '>' && (i === 0 || code[i - 1] === '\n')) {
      let j = i
      while (j < n && code[j] !== '\n') j++
      push(code.slice(i, j), 'comment')
      i = j
      continue
    }

    // Triple-quoted strings (Python)
    if (lang === 'python' && (c === '"' && next === '"' && code[i + 2] === '"') || (c === "'" && next === "'" && code[i + 2] === "'")) {
      const q = c + c + c
      let j = i + 3
      while (j < n && code.slice(j, j + 3) !== q) j++
      j = Math.min(j + 3, n)
      push(code.slice(i, j), 'string')
      i = j
      continue
    }

    // Strings (single, double, backtick)
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === c) { j++; break }
        j++
      }
      push(code.slice(i, j), 'string')
      i = j
      continue
    }

    // Numbers
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(next))) {
      let j = i
      while (j < n && /[0-9._eE+\-xXa-fA-F]/.test(code[j])) {
        // stop on +- if not after e/E
        if ((code[j] === '+' || code[j] === '-') && !/[eE]/.test(code[j - 1])) break
        j++
      }
      push(code.slice(i, j), 'number')
      i = j
      continue
    }

    // Decorators (Python @name)
    if (lang === 'python' && c === '@' && isIdentStart(next)) {
      let j = i + 1
      while (j < n && (isIdentChar(code[j]) || code[j] === '.')) j++
      push(code.slice(i, j), 'decorator')
      i = j
      continue
    }

    // Identifiers / keywords / function calls
    if (isIdentStart(c)) {
      let j = i + 1
      while (j < n && isIdentChar(code[j])) j++
      const word = code.slice(i, j)
      // Look ahead for ( to detect function call
      let k = j
      while (k < n && code[k] === ' ') k++
      const isCall = code[k] === '('
      // SQL keywords can be matched case-insensitively
      const lower = word.toLowerCase()
      const upper = word.toUpperCase()
      let type: TokenType = 'plain'
      if (kws) {
        if (kws.has(word) || kws.has(lower) || kws.has(upper)) type = 'keyword'
      }
      if (type === 'plain' && isCall && (lang === 'python' || lang === 'javascript')) {
        type = 'function'
      }
      push(word, type)
      i = j
      continue
    }

    // Punctuation / whitespace / other — group as plain
    let j = i
    while (j < n) {
      const cj = code[j]
      if (isIdentStart(cj) || cj === '"' || cj === "'" || cj === '`' || /[0-9]/.test(cj) || (lang === 'python' && cj === '@' && isIdentStart(code[j + 1] || ''))) break
      if ((lang === 'python' || lang === 'bash') && cj === '#') break
      if (lang === 'sql' && cj === '-' && code[j + 1] === '-') break
      if ((lang === 'javascript' || lang === 'json') && cj === '/' && code[j + 1] === '/') break
      j++
    }
    if (j === i) j = i + 1 // always advance
    push(code.slice(i, j), 'plain')
    i = j
  }

  return tokens
}

const TOKEN_CLASS: Record<TokenType, string> = {
  plain: '',
  comment: 'tok-comment',
  string: 'tok-string',
  keyword: 'tok-keyword',
  number: 'tok-number',
  function: 'tok-function',
  decorator: 'tok-decorator',
  punct: '',
}

function renderTokens(tokens: Token[]): React.ReactNode[] {
  return tokens.map((t, i) => {
    if (!TOKEN_CLASS[t.type]) return <span key={i}>{t.text}</span>
    return <span key={i} className={TOKEN_CLASS[t.type]}>{t.text}</span>
  })
}

export function CodeBlock({
  code,
  language = 'python',
  title,
  className,
  showLineNumbers = false,
  highlightLines = [],
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const lines = code.split('\n')

  return (
    <div className={cn('rounded-lg overflow-hidden border border-border bg-[#0d1117] text-[#e6edf3]', className)}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs text-gray-400 font-mono ml-2">{title || language}</span>
        </div>
        <button
          onClick={onCopy}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div
        className="overflow-auto custom-scrollbar p-3 text-xs leading-relaxed"
        style={{ maxHeight: maxHeight || '500px' }}
      >
        <pre className="font-mono">
          {showLineNumbers ? (
            lines.map((line, i) => {
              const lineTokens = tokenize(line, language)
              return (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    highlightLines.includes(i + 1) && 'bg-ai-blue/15 -mx-3 px-3 border-l-2 border-ai-blue'
                  )}
                >
                  <span className="text-gray-600 select-none w-8 pr-3 text-right shrink-0">{i + 1}</span>
                  <span className="flex-1">
                    {lineTokens.length === 0 ? '\u00A0' : renderTokens(lineTokens)}
                  </span>
                </div>
              )
            })
          ) : (
            <code>{renderTokens(tokenize(code, language))}</code>
          )}
        </pre>
      </div>
      <style jsx>{`
        :global(.tok-comment) { color: #8b949e; font-style: italic; }
        :global(.tok-string) { color: #a5d6ff; }
        :global(.tok-keyword) { color: #ff7b72; }
        :global(.tok-number) { color: #79c0ff; }
        :global(.tok-function) { color: #d2a8ff; }
        :global(.tok-decorator) { color: #ffa657; }
      `}</style>
    </div>
  )
}
