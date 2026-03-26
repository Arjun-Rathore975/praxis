'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSessionById, type InterviewSession } from '@/lib/storage'

const decisionColors: Record<string, string> = {
  'Strong Hire': 'text-[#00d4aa]',
  Hire: 'text-[#00d4aa]',
  'Lean Hire': 'text-[#f5a623]',
  'Lean No Hire': 'text-[#f5a623]',
  'No Hire': 'text-[#ee5555]',
}

function ReplayContent() {
  const router = useRouter()
  const params = useSearchParams()
  const sessionId = params.get('id') || ''
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeMessage, setActiveMessage] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    if (sessionId) {
      setSession(getSessionById(sessionId))
    }
  }, [sessionId])

  if (!mounted) return null

  if (!session) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[var(--text-secondary)]">Session not found.</p>
          <button onClick={() => router.push('/history')} className="text-sm underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors">
            Back to History
          </button>
        </div>
      </main>
    )
  }

  const scoreColor = (score: number) =>
    score >= 8 ? 'text-[#00d4aa]' : score >= 6 ? 'text-[#f5a623]' : 'text-[#ee5555]'

  // Identify which messages are questions (interviewer messages that end with ?)
  const questionIndices = session.transcript
    .map((msg, i) => (msg.role === 'assistant' && msg.content.includes('?') ? i : -1))
    .filter(i => i >= 0)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/history')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <h1 className="text-sm font-medium">Interview Replay</h1>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="text-xs text-[var(--text-secondary)]">{session.company}</span>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="text-xs text-[var(--text-secondary)]">{session.category}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${decisionColors[session.decision] || 'text-[var(--text-secondary)]'}`}>
            {session.decision}
          </span>
          <span className={`text-lg font-bold tabular-nums ${scoreColor(session.scores.overall)}`}>
            {session.scores.overall}/10
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Score Summary Bar */}
        <div className="grid grid-cols-4 gap-3 animate-fadeIn">
          {[
            { label: 'Problem Solving', score: session.scores.problem_solving },
            { label: 'Communication', score: session.scores.communication },
            { label: 'Technical Depth', score: session.scores.technical_depth },
            { label: 'Overall', score: session.scores.overall },
          ].map(({ label, score }) => (
            <div key={label} className="border border-[var(--border)] rounded-lg p-3 text-center">
              <p className={`text-xl font-bold tabular-nums ${scoreColor(score)}`}>{score}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements inline */}
        <div className="grid grid-cols-2 gap-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="border border-[var(--border)] rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#00d4aa]/60 mb-2">Strengths</p>
            {session.strengths.map((s, i) => (
              <p key={i} className="text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                <span className="text-[#00d4aa]">+</span> {s}
              </p>
            ))}
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#f5a623]/60 mb-2">To Improve</p>
            {session.improvements.map((s, i) => (
              <p key={i} className="text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                <span className="text-[#f5a623]">-</span> {s}
              </p>
            ))}
          </div>
        </div>

        {/* Transcript with annotations */}
        <div className="space-y-1 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Full Transcript &middot; {session.transcript.length} messages
          </h2>

          {session.transcript.map((msg, i) => {
            const isQuestion = questionIndices.includes(i)
            const isExpanded = activeMessage === i

            return (
              <div
                key={i}
                className={`rounded-lg transition-all duration-200 ${
                  msg.role === 'user'
                    ? 'ml-12'
                    : 'mr-12'
                }`}
              >
                <div
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    msg.role === 'user'
                      ? 'bg-[var(--bg-user-msg)] border border-[var(--border)]'
                      : 'bg-[var(--bg-secondary)] border border-[var(--border)]'
                  } ${isExpanded ? 'ring-1 ring-[var(--border-hover)]' : ''}`}
                  onClick={() => setActiveMessage(isExpanded ? null : i)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      {msg.role === 'user' ? 'You' : 'Interviewer'}
                    </span>
                    {isQuestion && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Question
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--text-muted)] ml-auto">#{i + 1}</span>
                  </div>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.push(`/interview?company=${session.company}&category=${session.category}&difficulty=${session.difficulty}`)}
            className="flex-1 py-3 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all duration-200"
          >
            Retry This Interview
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-sm font-medium hover:opacity-90 transition-all duration-200"
          >
            New Interview
          </button>
        </div>
      </div>
    </main>
  )
}

export default function ReplayPage() {
  return (
    <Suspense>
      <ReplayContent />
    </Suspense>
  )
}
