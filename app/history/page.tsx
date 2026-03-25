'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, getStats, deleteSession, InterviewSession } from '@/lib/storage'

const decisionColors: Record<string, string> = {
  'Strong Hire': 'text-green-400',
  'Hire': 'text-green-300',
  'Lean Hire': 'text-yellow-400',
  'Lean No Hire': 'text-orange-400',
  'No Hire': 'text-red-400',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{score}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <span className="text-gray-600">|</span>
          <h1 className="text-sm font-medium">Interview History</h1>
        </div>
        <span className="text-xs text-gray-500">{history.length} interviews</span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        {stats && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Your Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Interviews" value={stats.totalInterviews} />
              <StatCard
                label="Avg Score"
                value={`${stats.avgOverall}/10`}
                sub={stats.trend === 'improving' ? '↑ Improving' : stats.trend === 'declining' ? '↓ Declining' : stats.trend === 'stable' ? '→ Stable' : undefined}
              />
              <StatCard label="Weakest Area" value={stats.weakest.name} sub={`Avg: ${stats.weakest.avg.toFixed(1)}`} />
              <StatCard label="Strongest Area" value={stats.strongest.name} sub={`Avg: ${stats.strongest.avg.toFixed(1)}`} />
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Average Scores</p>
              <ScoreBar label="Problem Solving" score={stats.avgProblemSolving} />
              <ScoreBar label="Communication" score={stats.avgCommunication} />
              <ScoreBar label="Technical Depth" score={stats.avgTechnicalDepth} />
            </div>

            {/* Decision Distribution */}
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Hiring Decisions</p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(stats.decisions).map(([decision, count]) => (
                  <div key={decision} className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${decisionColors[decision] || 'text-gray-400'}`}>{decision}</span>
                    <span className="text-xs text-gray-500">×{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interview List */}
        {history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No interviews yet. Start practicing!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-white text-gray-950 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Past Interviews</h2>
            <div className="space-y-3">
              {history.map((session) => (
                <div
                  key={session.id}
                  className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-600 ${
                    selectedSession?.id === session.id ? 'border-gray-500' : 'border-gray-800'
                  }`}
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{session.company}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-400">{session.category}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-400">{session.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{formatDuration(session.durationSeconds)}</span>
                      <span className={`text-xs font-medium ${decisionColors[session.decision] || 'text-gray-400'}`}>
                        {session.decision}
                      </span>
                      <span className="text-sm font-semibold text-white">{session.scores.overall}/10</span>
                      <span className="text-xs text-gray-600">{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {selectedSession?.id === session.id && (
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ScoreBar label="Problem Solving" score={session.scores.problem_solving} />
                        <ScoreBar label="Communication" score={session.scores.communication} />
                        <ScoreBar label="Technical Depth" score={session.scores.technical_depth} />
                        <ScoreBar label="Overall" score={session.scores.overall} />
                      </div>

                      <p className="text-sm text-gray-300">{session.summary}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-2">Strengths</p>
                          {session.strengths.map((s, i) => (
                            <p key={i} className="text-xs text-green-400 mb-1">✓ {s}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-2">Improve</p>
                          {session.improvements.map((s, i) => (
                            <p key={i} className="text-xs text-orange-400 mb-1">→ {s}</p>
                          ))}
                        </div>
                      </div>

                      {/* Transcript */}
                      <details className="group">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                          View Full Transcript ({session.transcript.length} messages)
                        </summary>
                        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                          {session.transcript.map((msg, i) => (
                            <div key={i} className={`text-xs p-2 rounded-lg ${msg.role === 'user' ? 'bg-gray-800 text-gray-300 ml-8' : 'bg-gray-850 text-gray-400 mr-8'}`}>
                              <span className="text-gray-600 font-mono">{msg.role === 'user' ? 'You' : 'Interviewer'}:</span>{' '}
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
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                        >
                          Retry
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(session.id)
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500 transition-all"
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
