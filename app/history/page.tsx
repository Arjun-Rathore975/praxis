'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, getStats, deleteSession, InterviewSession } from '@/lib/storage'

const decisionColors: Record<string, string> = {
  'Strong Hire': 'text-[#00d4aa]',
  'Hire': 'text-[#00d4aa]',
  'Lean Hire': 'text-[#f5a623]',
  'Lean No Hire': 'text-[#f5a623]',
  'No Hire': 'text-[#ee5555]',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-white/10 rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-widest text-[#666666]">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#888888] mt-1">{sub}</p>}
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-[#00d4aa]' : score >= 6 ? 'bg-[#f5a623]' : 'bg-[#ee5555]'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#888888]">{label}</span>
        <span className="text-white font-medium tabular-nums">{score}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<InterviewSession[]>([])
  const [stats, setStats] = useState<ReturnType<typeof getStats>>(null)
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)

  useEffect(() => {
    setHistory(getHistory())
    setStats(getStats())
  }, [])

  function handleDelete(id: string) {
    deleteSession(id)
    setHistory(getHistory())
    setStats(getStats())
    if (selectedSession?.id === id) setSelectedSession(null)
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <main className="min-h-screen bg-black text-[#ededed]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-[#666666] hover:text-[#ededed] transition-colors duration-200 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-sm font-medium text-[#ededed]">Interview History</h1>
        </div>
        <span className="text-xs text-[#666666]">{history.length} interviews</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Stats Dashboard */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[#666666] mb-4">Your Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Interviews" value={stats.totalInterviews} />
              <StatCard
                label="Avg Score"
                value={`${stats.avgOverall}/10`}
                sub={stats.trend === 'improving' ? 'Improving' : stats.trend === 'declining' ? 'Declining' : stats.trend === 'stable' ? 'Stable' : undefined}
              />
              <StatCard label="Weakest Area" value={stats.weakest.name} sub={`Avg: ${stats.weakest.avg.toFixed(1)}`} />
              <StatCard label="Strongest Area" value={stats.strongest.name} sub={`Avg: ${stats.strongest.avg.toFixed(1)}`} />
            </div>

            {/* Score Breakdown */}
            <div className="border border-white/10 rounded-lg p-5 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-2">Average Scores</p>
              <ScoreBar label="Problem Solving" score={stats.avgProblemSolving} />
              <ScoreBar label="Communication" score={stats.avgCommunication} />
              <ScoreBar label="Technical Depth" score={stats.avgTechnicalDepth} />
            </div>

            {/* Decision Distribution */}
            <div className="mt-4 border border-white/10 rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-3">Hiring Decisions</p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(stats.decisions).map(([decision, count]) => (
                  <div key={decision} className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${decisionColors[decision] || 'text-[#888888]'}`}>{decision}</span>
                    <span className="text-xs text-[#666666]">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interview List */}
        {history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#888888] mb-4">No interviews yet. Start practicing!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors duration-200"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-[#666666] mb-4">Past Interviews</h2>
            <div className="space-y-2">
              {history.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-white/20 ${
                    selectedSession?.id === session.id ? 'border-white/30 bg-white/[0.02]' : 'border-white/10'
                  }`}
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">{session.company}</span>
                      <span className="text-[#666666]">/</span>
                      <span className="text-xs text-[#888888]">{session.category}</span>
                      <span className="text-[#666666]">/</span>
                      <span className="text-xs text-[#888888]">{session.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#666666] tabular-nums">{formatDuration(session.durationSeconds)}</span>
                      <span className={`text-xs font-medium ${decisionColors[session.decision] || 'text-[#888888]'}`}>
                        {session.decision}
                      </span>
                      <span className="text-sm font-semibold text-white tabular-nums">{session.scores.overall}/10</span>
                      <span className="text-xs text-[#666666]">{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {selectedSession?.id === session.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ScoreBar label="Problem Solving" score={session.scores.problem_solving} />
                        <ScoreBar label="Communication" score={session.scores.communication} />
                        <ScoreBar label="Technical Depth" score={session.scores.technical_depth} />
                        <ScoreBar label="Overall" score={session.scores.overall} />
                      </div>

                      <p className="text-sm text-[#888888]">{session.summary}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-2">Strengths</p>
                          {session.strengths.map((s, i) => (
                            <p key={i} className="text-xs text-[#00d4aa] mb-1 flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {s}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-2">Improve</p>
                          {session.improvements.map((s, i) => (
                            <p key={i} className="text-xs text-[#f5a623] mb-1 flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {s}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Transcript */}
                      <details className="group">
                        <summary className="text-xs text-[#666666] cursor-pointer hover:text-[#888888] transition-colors duration-200">
                          View Full Transcript ({session.transcript.length} messages)
                        </summary>
                        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                          {session.transcript.map((msg, i) => (
                            <div key={i} className={`text-xs p-2 rounded-md ${msg.role === 'user' ? 'bg-white/5 text-[#ededed] ml-8' : 'border border-white/10 text-[#888888] mr-8'}`}>
                              <span className="text-[#666666] font-mono">{msg.role === 'user' ? 'You' : 'Interviewer'}:</span>{' '}
                              {msg.content}
                            </div>
                          ))}
                        </div>
                      </details>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/interview?company=${session.company}&category=${session.category}&difficulty=${session.difficulty}`)
                          }}
                          className="text-xs px-3 py-1.5 rounded-md border border-white/10 text-[#888888] hover:text-[#ededed] hover:border-white/20 transition-all duration-200"
                        >
                          Retry
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(session.id)
                          }}
                          className="text-xs px-3 py-1.5 rounded-md border border-white/10 text-[#888888] hover:text-[#ee5555] hover:border-[#ee5555]/30 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
