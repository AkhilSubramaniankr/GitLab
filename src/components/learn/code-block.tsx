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

const KEYWORDS: Record<string, string[]> = {
  python: ['def','class','import','from','as','return','if','elif','else','for','while','try','except','finally','with','lambda','yield','pass','break','continue','in','not','and','or','is','None','True','False','assert','raise','global','nonlocal','del','async','await','print','len','range','open','list','dict','set','tuple','int','str','float','bool','enumerate','zip','map','filter','sorted','sum','min','max','abs','round'],
  sql: ['SELECT','FROM','WHERE','GROUP','BY','ORDER','HAVING','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','ON','AS','AND','OR','NOT','IN','BETWEEN','LIKE','IS','NULL','DISTINCT','LIMIT','OFFSET','UNION','ALL','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','DROP','ALTER','PRIMARY','KEY','FOREIGN','REFERENCES','DEFAULT','CASCADE','WITH','CASE','WHEN','THEN','ELSE','END','OVER','PARTITION','ROW_NUMBER','RANK','DENSE_RANK','COUNT','SUM','AVG','MIN','MAX','ASC','DESC','INTERSECT','EXCEPT','EXISTS','ANY','SOME'],
  bash: ['git','cd','ls','mkdir','rm','cp','mv','touch','echo','cat','sudo','apt','npm','bun','python','python3','pip','code','pushd','popd','source','export','chmod','chown','pwd','clear','history','which'],
  json: ['true','false','null'],
  javascript: ['const','let','var','function','return','if','else','for','while','class','extends','new','this','import','export','from','default','async','await','try','catch','finally','typeof','instanceof','in','of','null','undefined','true','false'],
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlight(code: string, language: string): string {
  const lang = (language || '').toLowerCase()
  const kws = KEYWORDS[lang] || []
  let out = escapeHtml(code)

  if (lang === 'python' || lang === 'bash') {
    out = out.replace(/(^|[^:])(#[^\n]*)/g, (_m, p1, p2) => `${p1}<span class="tok-comment">${p2}</span>`)
  }
  if (lang === 'sql') {
    out = out.replace(/(--[^\n]*)/g, '<span class="tok-comment">$1</span>')
  }
  if (lang === 'javascript') {
    out = out.replace(/(\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>')
  }

  out = out.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    '<span class="tok-string">$1</span>')

  if (lang === 'python') {
    out = out.replace(/(^|\n)(\s*@[\w.]+)/g, '$1<span class="tok-decorator">$2</span>')
  }

  out = out.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-number">$1</span>')

  if (kws.length) {
    const re = new RegExp(`\\b(${kws.join('|')})\\b`, 'g')
    out = out.replace(re, '<span class="tok-keyword">$1</span>')
  }

  if (lang === 'python' || lang === 'javascript') {
    out = out.replace(/\b([a-zA-Z_]\w*)(\s*\()/g, '<span class="tok-function">$1</span>$2')
  }

  return out
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
          <div className="flex gap-1.5">
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
            lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  highlightLines.includes(i + 1) && 'bg-ai-blue/15 -mx-3 px-3 border-l-2 border-ai-blue'
                )}
              >
                <span className="text-gray-600 select-none w-8 pr-3 text-right shrink-0">{i + 1}</span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: highlight(line, language) || '&nbsp;' }}
                />
              </div>
            ))
          ) : (
            <code dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
          )}
        </pre>
      </div>
      <style jsx global>{`
        .tok-comment { color: #8b949e; font-style: italic; }
        .tok-string { color: #a5d6ff; }
        .tok-keyword { color: #ff7b72; }
        .tok-number { color: #79c0ff; }
        .tok-function { color: #d2a8ff; }
        .tok-decorator { color: #ffa657; }
      `}</style>
    </div>
  )
}
