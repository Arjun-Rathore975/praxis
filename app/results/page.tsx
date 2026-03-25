'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Scorecard {
  scores: {
    problem_solving: number
    communication: number
    technical_depth: number
    overall: number
  }
  decision: string
  strengths: string[]
  improvements: string[]
  summary: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AnswerComparison {
  question: string
  yourAnswer: string
  idealAnswer: string
  gap: string
}

const decisionConfig: Record<string, { color: string; bg: string; glow: string }> = {
  'Strong Hire': { color: 'text-green-400', bg: 'border-green-500/40 bg-green-500/10', glow: 'glow-green' },
  'Hire': { color: 'text-green-300', bg: 'border-green-400/40 bg-green-400/8', glow: 'glow-green' },
  'Lean Hire': { color: 'text-yellow-400', bg: 'border-yellow-500/40 bg-yellow-500/10', glow: 'glow-yellow' },
  'Lean No Hire': { color: 'text-orange-400', bg: 'border-orange-500/40 bg-orange-500/10', glow: 'glow-yellow' },
  'No Hire': { color: 'text-red-400', bg: 'border-red-500/40 bg-red-500/10', glow: 'glow-red' },
}

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const [width, setWidth] = useState(0)
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500'
  const glowColor = score >= 8 ? 'shadow-green-500/20' : score >= 6 ? 'shadow-yellow-500/20' : 'shadow-red-500/20'

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100 + delay)
    return () => clearTimeout(timer)
  }, [pct, delay])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">{label}</span>
        <span className="text-white font-semibold tabular-nums">{score}<span className="text-zinc-600 font-normal">/10</span></span>
      </div>
      <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full score-bar-fill shadow-sm ${glowColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function Results() {
  const router = useRouter()
  const params = useSearchParams()
  const scorecardStr = params.get('scorecard')
  const company = params.get('company') || ''
  const category = params.get('category') || ''
  const difficulty = params.get('difficulty') || ''
  const transcriptStr = params.get('transcript')

  const [comparisons, setComparisons] = useState<AnswerComparison[]>([])
  const [loadingComparison, setLoadingComparison] = useState(false)
  const [comparisonLoaded, setComparisonLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  let scorecard: Scorecard | null = null
  try {
    if (scorecardStr) scorecard = JSON.parse(decodeURIComponent(scorecardStr))
  } catch {
    // invalid
  }

  let transcript: Message[] = []
  try {
    if (transcriptStr) transcript = JSON.parse(decodeURIComponent(transcriptStr))
  } catch {
    // invalid
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  async function loadComparison() {
    if (comparisonLoaded || loadingComparison || transcript.length === 0) return
    setLoadingComparison(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, company, category, difficulty }),
      })
      const data = await res.json()
      if (data.comparisons) setComparisons(data.comparisons)
    } catch {
      // ignore
    } finally {
      setLoadingComparison(false)
      setComparisonLoaded(true)
    }
  }

  useEffect(() => {
    if (transcript.length > 0 && !comparisonLoaded && !loadingComparison) {
      loadComparison()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!scorecard) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4 animate-fadeIn">
          <p className="text-zinc-500">No results found.</p>
          <button onClick={() => router.push('/')} className="text-white underline underline-offset-4 text-sm hover:text-zinc-300">
            Start a new interview
          </button>
        </div>
      </main>
    )
  }

  const config = decisionConfig[scorecard.decision] || { color: 'text-zinc-400', bg: 'border-zinc-700 bg-zinc-800', glow: '' }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/[0.015] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-16 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 animate-fadeIn">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">{company} &middot; {category} &middot; {difficulty}</p>
          <h1 className="text-3xl font-bold tracking-tight">Interview Complete</h1>
        </div>

        {/* Decision Card */}
        <div className={`border rounded-2xl p-8 text-center animate-slideUp ${config.bg} ${config.glow}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Hiring Decision</p>
          <p className={`text-3xl font-bold ${config.color}`}>{scorecard.decision}</p>
          <p className="text-sm text-zinc-500 mt-3 max-w-md mx-auto leading-relaxed">{scorecard.summary}</p>
        </div>

        {/* Scores */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Performance Breakdown</h2>
          <ScoreBar label="Problem Solving" score={scorecard.scores.problem_solving} delay={0} />
          <ScoreBar label="Communication" score={scorecard.scores.communication} delay={100} />
          <ScoreBar label="Technical Depth" score={scorecard.scores.technical_depth} delay={200} />
          <div className="pt-3 border-t border-zinc-800/80">
            <ScoreBar label="Overall" score={scorecard.scores.overall} delay={300} />
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-green-500/80">Strengths</h2>
            <ul className="space-y-2.5">
              {scorecard.strengths.map((s, i) => (
                <li key={i} className="text-sm text-zinc-300 flex gap-2.5 leading-relaxed">
                  <span className="text-green-500 mt-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-yellow-500/80">To Improve</h2>
            <ul className="space-y-2.5">
              {scorecard.improvements.map((s, i) => (
                <li key={i} className="text-sm text-zinc-300 flex gap-2.5 leading-relaxed">
                  <span className="text-yellow-500 mt-1 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Answer Comparison */}
        {transcript.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">Your Answer vs. Strong Hire</h2>
              {loadingComparison && (
                <span className="text-xs text-zinc-600 animate-breathe">Analyzing...</span>
              )}
            </div>

            {loadingComparison && comparisons.length === 0 && (
              <div className="space-y-3">
                <div className="h-24 animate-shimmer rounded-xl" />
                <div className="h-24 animate-shimmer rounded-xl" />
              </div>
            )}

            {comparisons.map((comp, i) => (
              <div key={i} className="border border-zinc-800/60 rounded-xl overflow-hidden">
                <div className="bg-zinc-800/30 px-4 py-2.5">
                  <p className="text-xs text-zinc-400 font-medium">Q: {comp.question}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-zinc-800/60">
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-orange-400/70 mb-2">Your Answer</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{comp.yourAnswer}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-green-400/70 mb-2">Strong Hire Answer</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{comp.idealAnswer}</p>
                  </div>
                </div>
                <div className="bg-zinc-800/20 px-4 py-2.5 border-t border-zinc-800/60">
                  <p className="text-[10px] uppercase tracking-widest text-blue-400/50 mb-1">What was missing</p>
                  <p className="text-xs text-zinc-500">{comp.gap}</p>
                </div>
              </div>
            ))}

            {comparisonLoaded && comparisons.length === 0 && (
              <p className="text-xs text-zinc-600">Could not generate comparison for this interview.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => router.push(`/interview?company=${company}&category=${category}&difficulty=${difficulty}`)}
            className="flex-1 py-3.5 rounded-2xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:border-zinc-600 hover:text-zinc-200 transition-all"
          >
            Retry Same Interview
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3.5 rounded-2xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all active:scale-[0.99]"
          >
            New Interview
          </button>
        </div>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense>
      <Results />
    </Suspense>
  )
}
