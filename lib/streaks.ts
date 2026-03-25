// Streak tracking using localStorage

const STREAK_KEY = 'praxis-streak-data'

export interface StreakData {
  completedDates: string[] // ISO date strings (YYYY-MM-DD)
  currentStreak: number
  bestStreak: number
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { completedDates: [], currentStreak: 0, bestStreak: 0 }
  }
  const raw = localStorage.getItem(STREAK_KEY)
  if (!raw) return { completedDates: [], currentStreak: 0, bestStreak: 0 }
  try {
    return JSON.parse(raw)
  } catch {
    return { completedDates: [], currentStreak: 0, bestStreak: 0 }
  }
}

function saveStreakData(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data))
}

export function markDayCompleted(date?: Date): void {
  const data = getStreakData()
  const dateStr = getDateString(date)

  if (data.completedDates.includes(dateStr)) return

  data.completedDates.push(dateStr)
  data.completedDates.sort()

  // Recalculate streaks
  const { current, best } = calculateStreaks(data.completedDates)
  data.currentStreak = current
  data.bestStreak = best

  saveStreakData(data)
}

function calculateStreaks(dates: string[]): { current: number; best: number } {
  if (dates.length === 0) return { current: 0, best: 0 }

  const uniqueSorted = [...new Set(dates)].sort()
  const today = getDateString()
  const yesterday = getDateString(new Date(Date.now() - 86400000))

  let best = 1
  let runLength = 1

  for (let i = 1; i < uniqueSorted.length; i++) {
    const prev = new Date(uniqueSorted[i - 1] + 'T00:00:00')
    const curr = new Date(uniqueSorted[i] + 'T00:00:00')
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) {
      runLength++
      if (runLength > best) best = runLength
    } else {
      runLength = 1
    }
  }

  // Current streak: must include today or yesterday
  const lastDate = uniqueSorted[uniqueSorted.length - 1]
  if (lastDate !== today && lastDate !== yesterday) {
    return { current: 0, best }
  }

  let current = 1
  for (let i = uniqueSorted.length - 2; i >= 0; i--) {
    const curr = new Date(uniqueSorted[i + 1] + 'T00:00:00')
    const prev = new Date(uniqueSorted[i] + 'T00:00:00')
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) {
      current++
    } else {
      break
    }
  }

  return { current, best: Math.max(best, current) }
}

export function hasCompletedToday(): boolean {
  const data = getStreakData()
  return data.completedDates.includes(getDateString())
}

export function getLast30DaysMap(): { date: string; completed: boolean }[] {
  const data = getStreakData()
  const days: { date: string; completed: boolean }[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = getDateString(d)
    days.push({
      date: dateStr,
      completed: data.completedDates.includes(dateStr),
    })
  }

  return days
}

// Deterministic daily question selection
export function getDailyCategory(date: Date = new Date()): string {
  const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ...
  const categoryMap: Record<number, string> = {
    0: 'Mixed',     // Sunday
    1: 'DSA',       // Monday
    2: 'System Design', // Tuesday
    3: 'Behavioral',    // Wednesday
    4: 'DSA',       // Thursday
    5: 'System Design', // Friday
    6: 'Behavioral',    // Saturday
  }
  return categoryMap[dayOfWeek]
}

export function getDailySeed(date: Date = new Date()): number {
  const dateStr = getDateString(date)
  // Simple deterministic hash from date string
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
