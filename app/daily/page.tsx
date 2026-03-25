'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questionBank, type Question } from '@/lib/questions'
import {
  getStreakData,
  hasCompletedToday,
  getLast30DaysMap,
  getDailyCategory,
  getDailySeed,
  markDayCompleted,
  type StreakData,
} from '@/lib/streaks'

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const categorySchedule: Record<string, string> = {
  Mon: 'DSA',
  Tue: 'System Design',
  Wed: 'Behavioral',
  Thu: 'DSA',
  Fri: 'System Design',
  Sat: 'Behavioral',
  Sun: 'Mixed',
}

function getDailyQuestion(date: Date = new Date()): Question {
  const category = getDailyCategory(date)
  const seed = getDailySeed(date)

  let pool: Question[]
  if (category === 'Mixed') {
    pool = questionBank
  } else {
    pool = questionBank.filter((q) => q.category === category)
  }

  if (pool.length === 0) pool = questionBank
  const index = seed % pool.length
  return pool[index]
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'DSA':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    case 'System Design':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    case 'Behavioral':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    default:
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  }
}

function getDifficultyColor(diff: string): string {
  switch (diff) {
    case 'Easy':
      return 'text-green-400'
    case 'Medium':
      return 'text-yellow-400'
    case 'Hard':
      return 'text-red-400'
    default:
      return 'text-zinc-400'
  }
}

export default function DailyChallengePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [streakData, setStreakData] = useState<StreakData>({
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
  })
  const [completedToday, setCompletedToday] = useState(false)
  const [heatmap, setHeatmap] = useState<{ date: string; completed: boolean }[]>([])

  const today = new Date()
  const question = getDailyQuestion(today)
  const dailyCategory = getDailyCategory(today)
  const dayName = dayLabels[today.getDay()]

  useEffect(() => {
    setMounted(true)
    setStreakData(getStreakData())
    setCompletedToday(hasCompletedToday())
    setHeatmap(getLast30DaysMap())
  }, [])

  function handleStartChallenge() {
    // Mark today as completed when starting the challenge
    markDayCompleted()
    setCompletedToday(true)
    setStreakData(getStreakData())

    const params = new URLSearchParams({
      company: question.company[0],
      category: question.category,
      difficulty: question.difficulty,
    })
    router.push(`/interview?${params.toString()}`)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Gradient background accent */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/[0.03] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-16 space-y-10">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center space-y-3 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs text-amber-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Daily Challenge
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Today&apos;s Challenge
          </h1>
          <p className="text-zinc-500 text-base">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-amber-400">
              <span role="img" aria-label="fire">&#x1F525;</span> {streakData.currentStreak}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">Current Streak</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-orange-400">
              {streakData.bestStreak}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">Best Streak</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-zinc-300">
              {streakData.completedDates.length}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">Total Days</p>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Last 30 Days</h2>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-700/50" />
                Missed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-500/60 border border-green-500/30" />
                Practiced
              </span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {heatmap.map((day) => {
              const d = new Date(day.date + 'T00:00:00')
              const dayNum = d.getDate()
              const isToday = day.date === today.toISOString().split('T')[0]
              return (
                <div
                  key={day.date}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-colors ${
                    day.completed
                      ? 'bg-green-500/30 border border-green-500/40 text-green-300'
                      : 'bg-zinc-800/50 border border-zinc-800 text-zinc-600'
                  } ${isToday ? 'ring-1 ring-amber-500/50' : ''}`}
                  title={`${day.date}${day.completed ? ' - Completed' : ''}`}
                >
                  {dayNum}
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Question */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${getCategoryColor(question.category)}`}>
              {question.category}
            </span>
            <span className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="text-xs text-zinc-600 ml-auto">
              {question.company.slice(0, 3).join(', ')}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-white">{question.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{question.description}</p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-zinc-800/60 border border-zinc-700/50 text-[11px] text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleStartChallenge}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 mt-2 ${
              completedToday
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                : 'bg-amber-500 text-zinc-950 hover:bg-amber-400 active:scale-[0.99]'
            }`}
          >
            {completedToday ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Completed! Practice Again
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Start Today&apos;s Challenge
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Weekly Schedule</h2>
          <div className="grid grid-cols-7 gap-2">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
              const cat = categorySchedule[day]
              const isToday = dayLabels[today.getDay()] === day || (day === 'Sun' && today.getDay() === 0)
              return (
                <div
                  key={day}
                  className={`rounded-xl p-3 text-center transition-colors ${
                    isToday
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-zinc-800/30 border border-zinc-800/50'
                  }`}
                >
                  <p className={`text-[10px] uppercase tracking-widest mb-1 ${isToday ? 'text-amber-400' : 'text-zinc-600'}`}>
                    {day}
                  </p>
                  <p className={`text-[10px] font-medium leading-tight ${isToday ? 'text-amber-300' : 'text-zinc-500'}`}>
                    {cat === 'System Design' ? 'Sys Design' : cat}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
