// Standalone test for the CodeBlock tokenizer (plain JS, no TS).
// Verifies that the visible text output equals the input source code
// (no HTML corruption, no swallowed/inserted characters).

const KEYWORDS = {
  python: new Set('def,class,import,from,as,return,if,elif,else,for,while,try,except,finally,with,lambda,yield,pass,break,continue,in,not,and,or,is,None,True,False,assert,raise,global,nonlocal,del,async,await,print,len,range,open,list,dict,set,tuple,int,str,float,bool,enumerate,zip,map,filter,sorted,sum,min,max,abs,round,self,cls'.split(',')),
  sql: new Set('SELECT,FROM,WHERE,GROUP,BY,ORDER,HAVING,JOIN,LEFT,RIGHT,INNER,OUTER,FULL,ON,AS,AND,OR,NOT,IN,BETWEEN,LIKE,IS,NULL,DISTINCT,LIMIT,OFFSET,UNION,ALL,INSERT,INTO,VALUES,UPDATE,SET,DELETE,CREATE,TABLE,DROP,ALTER,PRIMARY,KEY,FOREIGN,REFERENCES,DEFAULT,CASCADE,WITH,CASE,WHEN,THEN,ELSE,END,OVER,PARTITION,ROW_NUMBER,RANK,DENSE_RANK,COUNT,SUM,AVG,MIN,MAX,ASC,DESC,INTERSECT,EXCEPT,EXISTS,ANY,SOME,USING,NATURAL,CROSS'.split(',')),
  bash: new Set('git,cd,ls,mkdir,rm,cp,mv,touch,echo,cat,sudo,apt,npm,bun,python,python3,pip,code,pushd,popd,source,export,chmod,chown,pwd,clear,history,which,curl,wget,tar,grep,find,sed,awk'.split(',')),
  json: new Set(['true','false','null']),
  javascript: new Set('const,let,var,function,return,if,else,for,while,class,extends,new,this,import,export,from,default,async,await,try,catch,finally,typeof,instanceof,in,of,null,undefined,true,false,break,continue,switch,case,throw,do'.split(',')),
}

function isIdentChar(c) { return /[A-Za-z0-9_]/.test(c) }
function isIdentStart(c) { return /[A-Za-z_]/.test(c) }

function tokenize(code, language) {
  const lang = (language || '').toLowerCase()
  const kws = KEYWORDS[lang]
  const tokens = []
  let i = 0
  const n = code.length
  const push = (text, type) => {
    if (text.length === 0) return
    const last = tokens[tokens.length - 1]
    if (last && last.type === 'plain' && type === 'plain') last.text += text
    else tokens.push({ text, type })
  }

  while (i < n) {
    const c = code[i]
    const next = code[i + 1] || ''

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

    if (lang === 'python' && ((c === '"' && next === '"' && code[i + 2] === '"') || (c === "'" && next === "'" && code[i + 2] === "'"))) {
      const q = c + c + c
      let j = i + 3
      while (j < n && code.slice(j, j + 3) !== q) j++
      j = Math.min(j + 3, n)
      push(code.slice(i, j), 'string')
      i = j
      continue
    }

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

    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(next))) {
      let j = i
      while (j < n && /[0-9._eE+\-xXa-fA-F]/.test(code[j])) {
        if ((code[j] === '+' || code[j] === '-') && !/[eE]/.test(code[j - 1])) break
        j++
      }
      push(code.slice(i, j), 'number')
      i = j
      continue
    }

    if (lang === 'python' && c === '@' && isIdentStart(next)) {
      let j = i + 1
      while (j < n && (isIdentChar(code[j]) || code[j] === '.')) j++
      push(code.slice(i, j), 'decorator')
      i = j
      continue
    }

    if (isIdentStart(c)) {
      let j = i + 1
      while (j < n && isIdentChar(code[j])) j++
      const word = code.slice(i, j)
      let k = j
      while (k < n && code[k] === ' ') k++
      const isCall = code[k] === '('
      const lower = word.toLowerCase()
      const upper = word.toUpperCase()
      let type = 'plain'
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

    let j = i
    while (j < n) {
      const cj = code[j]
      if (isIdentStart(cj) || cj === '"' || cj === "'" || cj === '`' || /[0-9]/.test(cj) || (lang === 'python' && cj === '@' && isIdentStart(code[j + 1] || ''))) break
      if ((lang === 'python' || lang === 'bash') && cj === '#') break
      if (lang === 'sql' && cj === '-' && code[j + 1] === '-') break
      if ((lang === 'javascript' || lang === 'json') && cj === '/' && code[j + 1] === '/') break
      j++
    }
    if (j === i) j = i + 1
    push(code.slice(i, j), 'plain')
    i = j
  }

  return tokens
}

function tokensToText(tokens) {
  return tokens.map((t) => t.text).join('')
}

let passed = 0
let failed = 0

function check(name, input, language) {
  const tokens = tokenize(input, language)
  const output = tokensToText(tokens)
  if (output !== input) {
    console.error(`FAIL: ${name}`)
    console.error(`  input:    ${JSON.stringify(input)}`)
    console.error(`  output:   ${JSON.stringify(output)}`)
    failed++
  } else {
    console.log(`PASS: ${name} (${tokens.length} tokens)`)
    passed++
  }
}

check('python-comment-with-class', '# macOS (Homebrew)\nbrew install git', 'bash')
check('python-class-def', 'class DataFrame:\n    def __init__(self):\n        pass', 'python')
check('python-string-with-class', 'html = "<span class=\\"x\\">text</span>"', 'python')
check('sql-comment-with-select', '-- SELECT all rows\nSELECT * FROM sales', 'sql')
check('sql-join-alias', 'SELECT c.tier, SUM(s.revenue) AS rev\nFROM sales s\nJOIN customers c ON s.customer_id = c.customer_id\nGROUP BY c.tier', 'sql')
check('js-template-literal', 'const html = `<div class="card">${value}</div>`', 'javascript')
check('numbers-operators', 'x = 3.14 + 2 * 10 - 0.5e-3', 'python')
check('python-docstring', 'def f():\n    """This is a docstring with class and def inside."""\n    return 42', 'python')
check('empty', '', 'python')
check('whitespace-only', '   \n  \n', 'python')
check('python-decorator', '@property\ndef x(self):\n    return self._x', 'python')
check('sql-strings', "SELECT * FROM sales WHERE region = 'West' AND product LIKE '%Mouse%'", 'sql')
check('json', '{"name": "Alice", "age": 30, "active": true, "data": null}', 'json')
check('bash', '# Initialize repo\ngit init\ngit add .\ngit commit -m "Initial"', 'bash')
check('html-like', 'template = "<div><span>hi</span></div>"  # render class', 'python')
check('pandas-chain', 'result = (df.groupby("product")["revenue"]\n            .sum()\n            .sort_values(ascending=False)\n            .head(5))', 'python')
check('sql-window', 'SELECT order_id, region, revenue,\n  ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rank\nFROM sales', 'sql')
check('python-fstring', 'print(f"Total: ${total:,.2f}")', 'python')
check('markdown-heading', '# Title\n\nSome **bold** text.', 'markdown')

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
