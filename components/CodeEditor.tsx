'use client'

import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  onSubmitCode: (code: string, language: string) => void
}

const LANGUAGES = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'Go', value: 'go' },
  { label: 'TypeScript', value: 'typescript' },
] as const

const DEFAULT_CODE: Record<string, string> = {
  python: `# Write your solution here\n\ndef solution():\n    pass\n`,
  javascript: `// Write your solution here\n\nfunction solution() {\n  \n}\n`,
  java: `// Write your solution here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}\n`,
  cpp: `// Write your solution here\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n`,
  go: `// Write your solution here\npackage main\n\nfunc solution() {\n\t\n}\n`,
  typescript: `// Write your solution here\n\nfunction solution(): void {\n  \n}\n`,
}

export default function CodeEditor({ onSubmitCode }: CodeEditorProps) {
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(DEFAULT_CODE['python'])
  const [isRunning, setIsRunning] = useState(false)

  const handleLanguageChange = useCallback((newLang: string) => {
    setLanguage(newLang)
    setCode(DEFAULT_CODE[newLang] || '')
  }, [])

  const handleRun = useCallback(() => {
    setIsRunning(true)
    // Visual-only: simulate a brief "running" state
    setTimeout(() => setIsRunning(false), 1500)
  }, [])

  const handleSubmit = useCallback(() => {
    const langLabel = LANGUAGES.find(l => l.value === language)?.label || language
    onSubmitCode(code, langLabel)
  }, [code, language, onSubmitCode])

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-zinc-500">
              <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/50 outline-none hover:border-zinc-600 focus:border-zinc-500 transition-colors cursor-pointer appearance-none pr-7"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%2371717a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isRunning
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-zinc-700/50 text-zinc-400 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5'
            }`}
          >
            {isRunning ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Running...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2l10 6-10 6V2z"/>
                </svg>
                Run
              </>
            )}
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 8h12M10 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Submit to Interviewer
          </button>
        </div>
      </div>

      {/* Output panel for Run (visual only) */}
      {isRunning && (
        <div className="shrink-0 border-b border-zinc-800/80 bg-zinc-900/30 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Executing code...
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: 'var(--font-mono), "Fira Code", "JetBrains Mono", Menlo, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'off',
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoIndent: 'full',
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              verticalSliderSize: 6,
            },
          }}
        />
      </div>
    </div>
  )
}
