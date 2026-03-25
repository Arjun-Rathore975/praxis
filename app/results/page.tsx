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

const decisionConfig: Record<string, { color: string; border: string }> = {
  'Strong Hire': { color: 'text-[#00d4aa]', border: 'border-[#00d4aa]/30' },
  'Hire': { color: 'text-[#00d4aa]', border: 'border-[#00d4aa]/20' },
  'Lean Hire': { color: 'text-[#f5a623]', border: 'border-[#f5a623]/20' },
  'Lean No Hire': { color: 'text-[#f5a623]', border: 'border-[#f5a623]/20' },
  'No Hire': { color: 'text-[#ee5555]', border: 'border-[#ee5555]/20' },
}

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const [width, setWidth] = useState(0)
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-[#00d4aa]' : score >= 6 ? 'bg-[#f5a623]' : 'bg-[#ee5555]'

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100 + delay)
    return () => clearTimeout(timer)
  }, [pct, delay])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#888888]">{label}</span>
        <span className="text-white font-medium tabular-nums">{score}<span className="text-[#666666] font-normal">/10</span></span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full score-bar-fill`}
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
      <main className="min-h-screen bg-black text-[#ededed] flex items-center justify-center">
        <div className="text-center space-y-4 animate-fadeIn">
          <p className="text-[#888888]">No results found.</p>
          <button onClick={() => router.push('/')} className="text-white underline underline-offset-4 text-sm hover:text-[#888888] transition-colors duration-200">
            Start a new interview
          </button>
        </div>
      </main>
    )
  }

  const config = decisionConfig[scorecard.decision] || { color: 'text-[#888888]', border: 'border-white/10' }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-black text-[#ededed]">
      <div className="max-w-2xl mx-auto px-6 py-20 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 animate-fadeIn">
          <p className="text-xs text-[#666666] uppercase tracking-widest">{company} / {category} / {difficulty}</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Interview Complete</h1>
        </div>

        {/* Decision Card */}
        <div className={`border ${config.border} rounded-lg p-8 text-center animate-slideUp`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mb-3">Hiring Decision</p>
          <p className={`text-3xl font-bold ${config.color}`}>{scorecard.decision}</p>
          <p className="text-sm text-[#888888] mt-4 max-w-md mx-auto leading-relaxed">{scorecard.summary}</p>
        </div>

        {/* Scores */}
        <div className="border border-white/10 rounded-lg p-6 space-y-5 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xs font-medium uppercase tracking-widest text-[#666666]">Performance Breakdown</h2>
          <ScoreBar label="Problem Solving" score={scorecard.scores.problem_solving} delay={0} />
          <ScoreBar label="Communication" score={scorecard.scores.communication} delay={100} />
          <ScoreBar label="Technical Depth" score={scorecard.scores.technical_depth} delay={200} />
          <div className="pt-4 border-t border-white/10">
            <ScoreBar label="Overall" score={scorecard.scores.overall} delay={300} />
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="border border-white/10 rounded-lg p-5 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[#00d4aa]/70">Strengths</h2>
            <ul className="space-y-2.5">
              {scorecard.strengths.map((s, i) => (
                <li key={i} className="text-sm text-[#ededed] flex gap-2.5 leading-relaxed">
                  <span className="text-[#00d4aa] mt-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/10 rounded-lg p-5 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[#f5a623]/70">To Improve</h2>
            <ul className="space-y-2.5">
              {scorecard.improvements.map((s, i) => (
                <li key={i} className="text-sm text-[#ededed] flex gap-2.5 leading-relaxed">
                  <span className="text-[#f5a623] mt-1 shrink-0">
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
          <div className="border border-white/10 rounded-lg p-6 space-y-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-[#888888]">Your Answer vs. Strong Hire</h2>
              {loadingComparison && (
                <span className="text-xs text-[#666666] animate-breathe">Analyzing...</span>
              )}
            </div>

            {loadingComparison && comparisons.length === 0 && (
              <div className="space-y-3">
                <div className="h-24 animate-shimmer rounded-lg" />
                <div className="h-24 animate-shimmer rounded-lg" />
              </div>
            )}

            {comparisons.map((comp, i) => (
              <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                <div className="bg-white/[0.02] px-4 py-2.5">
                  <p className="text-xs text-[#888888] font-medium">Q: {comp.question}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-white/10">
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#f5a623]/60 mb-2">Your Answer</p>
                    <p className="text-xs text-[#888888] leading-relaxed">{comp.yourAnswer}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#00d4aa]/60 mb-2">Strong Hire Answer</p>
                    <p className="text-xs text-[#ededed] leading-relaxed">{comp.idealAnswer}</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] px-4 py-2.5 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-1">What was missing</p>
                  <p className="text-xs text-[#888888]">{comp.gap}</p>
                </div>
              </div>
            ))}

            {comparisonLoaded && comparisons.length === 0 && (
              <p className="text-xs text-[#666666]">Could not generate comparison for this interview.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => router.push(`/interview?company=${company}&category=${category}&difficulty=${difficulty}`)}
            className="flex-1 py-3.5 rounded-lg border border-white/10 text-[#888888] text-sm font-medium hover:border-white/20 hover:text-[#ededed] transition-all duration-200"
          >
            Retry Same Interview
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-200 active:scale-[0.99]"
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
