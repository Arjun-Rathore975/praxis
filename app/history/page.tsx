'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, getStats, deleteSession, InterviewSession } from '@/lib/storage'
import { ThemeToggle } from '@/app/components'

const decisionColors: Record<string, string> = {
  'Strong Hire': 'text-[#00d4aa]',
  'Hire': 'text-[#00d4aa]',
  'Lean Hire': 'text-[#f5a623]',
  'Lean No Hire': 'text-[#f5a623]',
  'No Hire': 'text-[#ee5555]',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[var(--border)] rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
      <p className="text-2xl font-semibold mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>}
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-[#00d4aa]' : score >= 6 ? 'bg-[#f5a623]' : 'bg-[#ee5555]'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-medium tabular-nums">{score}</span>
      </div>
      <div className="h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
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
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <h1 className="text-sm font-medium">Interview History</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">{history.length} interviews</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {stats && (
          <div className="mb-12">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">Your Performance</h2>
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

            <div className="border border-[var(--border)] rounded-lg p-5 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Average Scores</p>
              <ScoreBar label="Problem Solving" score={stats.avgProblemSolving} />
              <ScoreBar label="Communication" score={stats.avgCommunication} />
              <ScoreBar label="Technical Depth" score={stats.avgTechnicalDepth} />
            </div>

            <div className="mt-4 border border-[var(--border)] rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Hiring Decisions</p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(stats.decisions).map(([decision, count]) => (
                  <div key={decision} className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${decisionColors[decision] || 'text-[var(--text-secondary)]'}`}>{decision}</span>
                    <span className="text-xs text-[var(--text-muted)]">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)] mb-4">No interviews yet. Start practicing!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-md text-sm font-medium hover:opacity-90 transition-colors duration-200"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">Past Interviews</h2>
            <div className="space-y-2">
              {history.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-[var(--border-hover)] ${
                    selectedSession?.id === session.id ? 'border-[var(--border-hover)] bg-[var(--bg-secondary)]' : 'border-[var(--border)]'
                  }`}
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{session.company}</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <span className="text-xs text-[var(--text-secondary)]">{session.category}</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <span className="text-xs text-[var(--text-secondary)]">{session.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">{formatDuration(session.durationSeconds)}</span>
                      <span className={`text-xs font-medium ${decisionColors[session.decision] || 'text-[var(--text-secondary)]'}`}>
                        {session.decision}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{session.scores.overall}/10</span>
                      <span className="text-xs text-[var(--text-muted)]">{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedSession?.id === session.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ScoreBar label="Problem Solving" score={session.scores.problem_solving} />
                        <ScoreBar label="Communication" score={session.scores.communication} />
                        <ScoreBar label="Technical Depth" score={session.scores.technical_depth} />
                        <ScoreBar label="Overall" score={session.scores.overall} />
                      </div>

                      <p className="text-sm text-[var(--text-secondary)]">{session.summary}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Strengths</p>
                          {session.strengths.map((s, i) => (
                            <p key={i} className="text-xs text-[#00d4aa] mb-1 flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {s}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Improve</p>
                          {session.improvements.map((s, i) => (
                            <p key={i} className="text-xs text-[#f5a623] mb-1 flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {s}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/replay?id=${session.id}`)
                          }}
                          className="text-xs px-3 py-1.5 rounded-md border border-blue-500/20 text-blue-400 hover:bg-blue-500/5 transition-all duration-200"
                        >
                          Full Replay
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/interview?company=${session.company}&category=${session.category}&difficulty=${session.difficulty}`)
                          }}
                          className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-all duration-200"
                        >
                          Retry
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(session.id)
                          }}
                          className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:border-[var(--accent-red)]/30 transition-all duration-200"
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
