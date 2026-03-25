// localStorage-based interview history

export interface InterviewSession {
  id: string
  date: string
  company: string
  category: string
  difficulty: string
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
  transcript: { role: 'user' | 'assistant'; content: string }[]
  durationSeconds: number
}

const STORAGE_KEY = 'faang-prep-history'

export function saveSession(session: InterviewSession): void {
  const history = getHistory()
  history.unshift(session)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function getHistory(): InterviewSession[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function getSessionById(id: string): InterviewSession | null {
  const history = getHistory()
  return history.find((s) => s.id === id) || null
}

export function deleteSession(id: string): void {
  const history = getHistory().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function getStats() {
  const history = getHistory()
  if (history.length === 0) return null

  const totalInterviews = history.length
  const avgOverall = history.reduce((sum, s) => sum + s.scores.overall, 0) / totalInterviews
  const avgProblemSolving = history.reduce((sum, s) => sum + s.scores.problem_solving, 0) / totalInterviews
  const avgCommunication = history.reduce((sum, s) => sum + s.scores.communication, 0) / totalInterviews
  const avgTechnicalDepth = history.reduce((sum, s) => sum + s.scores.technical_depth, 0) / totalInterviews

  const decisions = history.reduce((acc, s) => {
    acc[s.decision] = (acc[s.decision] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byCompany = history.reduce((acc, s) => {
    if (!acc[s.company]) acc[s.company] = { count: 0, totalScore: 0 }
    acc[s.company].count++
    acc[s.company].totalScore += s.scores.overall
    return acc
  }, {} as Record<string, { count: number; totalScore: number }>)

  const byCategory = history.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { count: 0, totalScore: 0 }
    acc[s.category].count++
    acc[s.category].totalScore += s.scores.overall
    return acc
  }, {} as Record<string, { count: number; totalScore: number }>)

  // Find weakest area
  const areas = [
    { name: 'Problem Solving', avg: avgProblemSolving },
    { name: 'Communication', avg: avgCommunication },
    { name: 'Technical Depth', avg: avgTechnicalDepth },
  ]
  const weakest = areas.sort((a, b) => a.avg - b.avg)[0]
  const strongest = areas.sort((a, b) => b.avg - a.avg)[0]

  // Score trend (last 5 vs previous 5)
  const recent5 = history.slice(0, 5)
  const previous5 = history.slice(5, 10)
  const recentAvg = recent5.reduce((s, h) => s + h.scores.overall, 0) / recent5.length
  const previousAvg = previous5.length > 0
    ? previous5.reduce((s, h) => s + h.scores.overall, 0) / previous5.length
    : null

  return {
    totalInterviews,
    avgOverall: Math.round(avgOverall * 10) / 10,
    avgProblemSolving: Math.round(avgProblemSolving * 10) / 10,
    avgCommunication: Math.round(avgCommunication * 10) / 10,
    avgTechnicalDepth: Math.round(avgTechnicalDepth * 10) / 10,
    decisions,
    byCompany,
    byCategory,
    weakest,
    strongest,
    recentAvg: Math.round(recentAvg * 10) / 10,
    previousAvg: previousAvg !== null ? Math.round(previousAvg * 10) / 10 : null,
    trend: previousAvg !== null ? (recentAvg > previousAvg ? 'improving' : recentAvg < previousAvg ? 'declining' : 'stable') : null,
  }
}
