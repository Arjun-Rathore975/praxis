'use client'

import { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveSession } from '@/lib/storage'
import { useVoicePlayback } from '@/app/hooks'
import { ConversationMode, VoicePlayback } from '@/app/components'
import dynamic from 'next/dynamic'

const Split = dynamic(() => import('react-split'), { ssr: false })
const CodeEditor = lazy(() => import('@/components/CodeEditor'))

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function InterviewChat() {
  const router = useRouter()
  const params = useSearchParams()
  const company = params.get('company') || ''
  const category = params.get('category') || ''
  const difficulty = params.get('difficulty') || ''
  const timed = params.get('timed') !== 'false'

  const isDSA = category === 'DSA'

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [listening, setListening] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showTimeWarning, setShowTimeWarning] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const voice = useVoicePlayback()

  // Auto-speak new AI messages when conversation mode is on
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (voice.conversationMode && last?.role === 'assistant' && messages.length > 0) {
      voice.speak(last.content)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // Auto-activate mic after TTS finishes speaking
  voice.onSpeechEnd.current = () => {
    if (voice.conversationMode && !listening && !loading) {
      toggleVoice()
    }
  }

  const INTERVIEW_DURATION = 45 * 60
  const WARNING_TIME = 5 * 60
  const remainingSeconds = INTERVIEW_DURATION - elapsedSeconds
  const isOverTime = remainingSeconds <= 0
  const isWarning = remainingSeconds <= WARNING_TIME && remainingSeconds > 0

  useEffect(() => {
    if (timerActive && timed) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1
          if (INTERVIEW_DURATION - next === WARNING_TIME) {
            setShowTimeWarning(true)
            setTimeout(() => setShowTimeWarning(false), 5000)
          }
          return next
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerActive, timed])

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    let finalTranscript = input

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript
        } else {
          interim = transcript
        }
      }
      setInput(finalTranscript + (interim ? ' ' + interim : ''))
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }
  }, [input])

  const handleScorecard = useCallback((data: { message: string }, updatedMessages: Message[]) => {
    if (data.message.includes('"decision"')) {
      const jsonMatch = data.message.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1])
          saveSession({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            company,
            category,
            difficulty,
            scores: parsed.scores,
            decision: parsed.decision,
            strengths: parsed.strengths,
            improvements: parsed.improvements,
            summary: parsed.summary,
            transcript: updatedMessages,
            durationSeconds: elapsedSeconds,
          })
        } catch {
          // ignore
        }

        setTimerActive(false)
        const scorecard = encodeURIComponent(jsonMatch[1])
        const transcriptParam = encodeURIComponent(JSON.stringify(updatedMessages))
        setTimeout(() => {
          router.push(`/results?scorecard=${scorecard}&company=${company}&category=${category}&difficulty=${difficulty}&transcript=${transcriptParam}`)
        }, 2000)
      }
    }
  }, [company, category, difficulty, elapsedSeconds, router])

  async function sendMessage(content: string) {
    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, company, category, difficulty }),
      })
      const data = await res.json()
      const reply: Message = { role: 'assistant', content: data.message }
      const updatedMessages = [...newMessages, reply]
      setMessages(updatedMessages)
      handleScorecard(data, updatedMessages)
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  async function startInterview() {
    setStarted(true)
    setLoading(true)
    startTimeRef.current = Date.now()
    setTimerActive(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Please start the interview.' }],
          company,
          category,
          difficulty,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setMessages([
          { role: 'assistant', content: `Error: ${data.error}. Check your API key in .env.local and restart the dev server.` },
        ])
        setTimerActive(false)
      } else {
        setMessages([
          { role: 'user', content: 'Please start the interview.' },
          { role: 'assistant', content: data.message },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !loading) sendMessage(input.trim())
    }
  }

  const handleSubmitCode = useCallback((code: string, langLabel: string) => {
    const formatted = `Here is my code (${langLabel}):\n\n\`\`\`${langLabel.toLowerCase()}\n${code}\n\`\`\``
    sendMessage(formatted)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading, listening, company, category, difficulty])

  const exchangeCount = messages.filter(m => m.role === 'user').length

  // --- Chat panel (reused in both layouts) ---
  const chatPanel = (
    <div className={`flex flex-col h-full ${isDSA ? '' : ''}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className={`${isDSA ? 'max-w-none' : 'max-w-2xl mx-auto'} space-y-4`}>
          {!started ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
              <div className="space-y-3 animate-fadeIn">
                <div className="w-14 h-14 rounded-lg border border-white/10 flex items-center justify-center text-xl font-medium text-[#888888] mx-auto mb-6">
                  {company === 'Google' ? 'G' : company === 'Meta' ? 'M' : company === 'Amazon' ? 'A' : company === 'Apple' ? '' : company.charAt(0)}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Ready for your {company} interview?</h2>
                <p className="text-[#888888] max-w-sm mx-auto">
                  {category} &middot; {difficulty} &middot; You&apos;ll be interviewed by a senior {company} engineer
                </p>
                {timed && (
                  <p className="text-xs text-[#666666] flex items-center justify-center gap-1.5 mt-3">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    45-minute timed session
                  </p>
                )}
              </div>
              <button
                onClick={startInterview}
                className="px-10 py-3 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-all duration-200 active:scale-[0.98] animate-fadeIn"
                style={{ animationDelay: '0.2s' }}
              >
                Start Interview
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex msg-appear ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-[10px] font-medium text-[#666666] shrink-0 mr-3 mt-1">
                      AI
                    </div>
                  )}
                  <div
                    className={`${isDSA ? 'max-w-[90%]' : 'max-w-[75%]'} rounded-lg px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-white text-black rounded-br-sm'
                        : 'bg-[#0a0a0a] border border-white/10 text-[#ededed] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && (
                    <VoicePlayback
                      text={msg.content}
                      index={i}
                      speakingIndex={voice.speakingIndex}
                      onToggle={voice.toggleMessage}
                    />
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start msg-appear">
                  <div className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-[10px] font-medium text-[#666666] shrink-0 mr-3 mt-1">
                    AI
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#666666] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#666666] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#666666] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      {started && (
        <div className="shrink-0 border-t border-white/10 px-4 py-4 bg-black/80 backdrop-blur-sm">
          <div className={isDSA ? '' : 'max-w-2xl mx-auto'}>
            <div className={`flex items-end gap-3 bg-[#0a0a0a] rounded-lg border transition-colors duration-200 p-2 ${
              listening ? 'border-[#ee5555]/50' : 'border-white/10 focus-within:border-white/20'
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={listening ? 'Listening... speak your answer' : 'Type your answer...'}
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-[#ededed] text-sm resize-none outline-none placeholder-[#666666] py-2 px-2 max-h-40"
              />
              <div className="flex items-center gap-1.5 shrink-0 pb-1">
                <button
                  onClick={toggleVoice}
                  disabled={loading}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 ${
                    listening
                      ? 'bg-[#ee5555] text-white animate-pulse'
                      : 'border border-white/10 text-[#666666] hover:text-[#ededed] hover:border-white/20'
                  }`}
                  title={listening ? 'Stop recording' : 'Voice input'}
                >
                  {listening ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="4" width="8" height="8" rx="1"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="5.5" y="2" width="5" height="8" rx="2.5"/><path d="M3 8a5 5 0 0010 0M8 13v2" strokeLinecap="round"/></svg>
                  )}
                </button>
                <button
                  onClick={() => input.trim() && !loading && sendMessage(input.trim())}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-md flex items-center justify-center bg-white text-black disabled:opacity-20 hover:bg-white/90 transition-all duration-200 active:scale-95"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#666666] text-center mt-2">
              Enter to send &middot; Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <main className="h-screen bg-black text-[#ededed] flex flex-col overflow-hidden">
      {/* Time Warning */}
      {showTimeWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm border border-[#f5a623]/30 text-[#f5a623] text-sm px-6 py-3 rounded-lg animate-fadeIn">
          5 minutes remaining — start wrapping up
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 border-b border-white/10 px-6 py-3.5 flex items-center justify-between bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-[#666666] hover:text-[#ededed] transition-colors duration-200 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{company}</span>
            <span className="text-[#666666]">/</span>
            <span className="text-sm text-[#888888]">{category}</span>
            <span className="text-[#666666]">/</span>
            <span className="text-xs text-[#888888]">{difficulty}</span>
          </div>
          {isDSA && started && (
            <>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-xs text-[#666666] flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[#666666]">
                  <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Code Editor
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {started && <ConversationMode voice={voice} visible={started} />}
          {started && (
            <span className="text-xs text-[#666666]">
              Q{exchangeCount - 1 > 0 ? exchangeCount - 1 : 0}/6
            </span>
          )}
          {started && timed && (
            <div className={`text-sm font-mono tabular-nums px-3 py-1 rounded-md border ${
              isOverTime ? 'text-[#ee5555] border-[#ee5555]/30 bg-[#ee5555]/5 animate-pulse' :
              isWarning ? 'text-[#f5a623] border-[#f5a623]/30 bg-[#f5a623]/5' :
              'text-[#888888] border-white/10'
            }`}>
              {isOverTime ? `+${formatTime(Math.abs(remainingSeconds))}` : formatTime(remainingSeconds)}
            </div>
          )}
          {started && !timed && (
            <div className="text-sm font-mono tabular-nums text-[#666666]">
              {formatTime(elapsedSeconds)}
            </div>
          )}
          {started && (
            <button
              onClick={() => sendMessage('end interview')}
              className="text-xs px-4 py-2 rounded-md border border-white/10 text-[#888888] hover:border-[#ee5555]/30 hover:text-[#ee5555] transition-all duration-200"
            >
              End Interview
            </button>
          )}
        </div>
      </header>

      {/* Main content area */}
      {isDSA && started ? (
        <Split
          className="split-pane flex-1 flex overflow-hidden"
          sizes={[45, 55]}
          minSize={300}
          gutterSize={6}
          direction="horizontal"
          cursor="col-resize"
        >
          <div className="h-full overflow-hidden">
            {chatPanel}
          </div>
          <div className="h-full overflow-hidden border-l border-white/10">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full text-[#666666] text-sm">
                Loading editor...
              </div>
            }>
              <CodeEditor onSubmitCode={handleSubmitCode} />
            </Suspense>
          </div>
        </Split>
      ) : (
        chatPanel
      )}
    </main>
  )
}

export default function InterviewPage() {
  return (
    <Suspense>
      <InterviewChat />
    </Suspense>
  )
}
