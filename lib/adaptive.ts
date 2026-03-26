// Adaptive difficulty system — tracks performance by category/topic and recommends difficulty

const ADAPTIVE_KEY = 'crucible-adaptive-data'

export interface CategoryPerformance {
  category: string
  attempts: number
  totalScore: number
  avgScore: number
  lastDifficulty: string
  recommendedDifficulty: string
  recentScores: number[] // last 5 scores
}

export interface AdaptiveData {
  byCategory: Record<string, CategoryPerformance>
  weakAreas: string[]
  strongAreas: string[]
  overallLevel: 'Beginner' | 'Intermediate' | 'Advanced'
}

function getDefault(): AdaptiveData {
  return {
    byCategory: {},
    weakAreas: [],
    strongAreas: [],
    overallLevel: 'Beginner',
  }
}

export function getAdaptiveData(): AdaptiveData {
  if (typeof window === 'undefined') return getDefault()
  const raw = localStorage.getItem(ADAPTIVE_KEY)
  if (!raw) return getDefault()
  try {
    return JSON.parse(raw)
  } catch {
    return getDefault()
  }
}

function save(data: AdaptiveData): void {
  localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(data))
}

export function recordPerformance(category: string, difficulty: string, score: number): void {
  const data = getAdaptiveData()

  if (!data.byCategory[category]) {
    data.byCategory[category] = {
      category,
      attempts: 0,
      totalScore: 0,
      avgScore: 0,
      lastDifficulty: difficulty,
      recommendedDifficulty: difficulty,
      recentScores: [],
    }
  }

  const cat = data.byCategory[category]
  cat.attempts++
  cat.totalScore += score
  cat.avgScore = Math.round((cat.totalScore / cat.attempts) * 10) / 10
  cat.lastDifficulty = difficulty
  cat.recentScores = [...cat.recentScores.slice(-4), score]

  // Calculate recommended difficulty based on recent performance
  const recentAvg = cat.recentScores.reduce((a, b) => a + b, 0) / cat.recentScores.length

  if (difficulty === 'Easy') {
    cat.recommendedDifficulty = recentAvg >= 7 ? 'Medium' : 'Easy'
  } else if (difficulty === 'Medium') {
    if (recentAvg >= 8) cat.recommendedDifficulty = 'Hard'
    else if (recentAvg < 5) cat.recommendedDifficulty = 'Easy'
    else cat.recommendedDifficulty = 'Medium'
  } else {
    cat.recommendedDifficulty = recentAvg < 5 ? 'Medium' : 'Hard'
  }

  // Update weak/strong areas
  const categories = Object.values(data.byCategory).filter(c => c.attempts >= 2)
  if (categories.length > 0) {
    categories.sort((a, b) => a.avgScore - b.avgScore)
    data.weakAreas = categories.filter(c => c.avgScore < 6).map(c => c.category).slice(0, 3)
    data.strongAreas = categories.filter(c => c.avgScore >= 7).map(c => c.category).slice(0, 3)
  }

  // Update overall level
  const allAvg = categories.length > 0
    ? categories.reduce((sum, c) => sum + c.avgScore, 0) / categories.length
    : score
  if (allAvg >= 7.5) data.overallLevel = 'Advanced'
  else if (allAvg >= 5) data.overallLevel = 'Intermediate'
  else data.overallLevel = 'Beginner'

  save(data)
}

export function getRecommendedDifficulty(category: string): string {
  const data = getAdaptiveData()
  return data.byCategory[category]?.recommendedDifficulty || 'Easy'
}

export function getPercentile(score: number, category: string): number {
  // Simulated percentile distribution based on realistic interview score curves
  // These are calibrated to match typical FAANG interview score distributions
  const distributions: Record<string, number[]> = {
    DSA: [2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9],
    'System Design': [2.5, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7, 7.5, 8, 8.5],
    Behavioral: [3, 4, 5, 5.5, 6, 6.5, 7, 7, 7.5, 8, 8, 8.5, 9],
    'API Design': [3, 3.5, 4.5, 5, 5.5, 6, 6.5, 7, 7, 7.5, 8, 8.5, 9],
    OOD: [2.5, 3.5, 4, 5, 5.5, 6, 6.5, 7, 7, 7.5, 8, 8.5, 9],
  }

  const dist = distributions[category] || distributions.DSA
  const belowCount = dist.filter(s => s < score).length
  const percentile = Math.round((belowCount / dist.length) * 100)
  return Math.min(99, Math.max(1, percentile))
}
