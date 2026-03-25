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
    <main className="min-h-screen bg-black text-[#ededed]">
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#666666] hover:text-[#ededed] transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0a0a0a] text-xs text-[#888888]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
            Daily Challenge
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Today&apos;s Challenge
          </h1>
          <p className="text-[#888888] text-base">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="border border-white/10 rounded-lg p-5 text-center">
            <p className="text-3xl font-bold text-white tabular-nums">
              {streakData.currentStreak}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#666666] mt-1">Current Streak</p>
          </div>
          <div className="border border-white/10 rounded-lg p-5 text-center">
            <p className="text-3xl font-bold text-white tabular-nums">
              {streakData.bestStreak}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#666666] mt-1">Best Streak</p>
          </div>
          <div className="border border-white/10 rounded-lg p-5 text-center">
            <p className="text-3xl font-bold text-white tabular-nums">
              {streakData.completedDates.length}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#666666] mt-1">Total Days</p>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="border border-white/10 rounded-lg p-5 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[#666666]">Last 30 Days</h2>
            <div className="flex items-center gap-3 text-[10px] text-[#666666]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border border-white/10" />
                Missed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#00d4aa]/40 border border-[#00d4aa]/30" />
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
                  className={`aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors duration-200 ${
                    day.completed
                      ? 'bg-[#00d4aa]/20 border border-[#00d4aa]/30 text-[#00d4aa]'
                      : 'border border-white/10 text-[#666666]'
                  } ${isToday ? 'ring-1 ring-white/30' : ''}`}
                  title={`${day.date}${day.completed ? ' - Completed' : ''}`}
                >
                  {dayNum}
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Question */}
        <div className="border border-white/10 rounded-lg p-6 space-y-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full border border-white/10 text-xs text-[#888888]">
              {question.category}
            </span>
            <span className={`text-xs font-medium ${
              question.difficulty === 'Easy' ? 'text-[#00d4aa]' : question.difficulty === 'Medium' ? 'text-[#f5a623]' : 'text-[#ee5555]'
            }`}>
              {question.difficulty}
            </span>
            <span className="text-xs text-[#666666] ml-auto">
              {question.company.slice(0, 3).join(', ')}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-white">{question.title}</h3>
          <p className="text-sm text-[#888888] leading-relaxed">{question.description}</p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-[#666666]"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleStartChallenge}
            className={`w-full py-3.5 rounded-lg text-sm font-medium transition-all duration-200 mt-2 ${
              completedToday
                ? 'border border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/5'
                : 'bg-white text-black hover:bg-white/90 active:scale-[0.99]'
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
        <div className="border border-white/10 rounded-lg p-5 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-xs font-medium uppercase tracking-widest text-[#666666] mb-4">Weekly Schedule</h2>
          <div className="grid grid-cols-7 gap-2">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
              const cat = categorySchedule[day]
              const isToday = dayLabels[today.getDay()] === day || (day === 'Sun' && today.getDay() === 0)
              return (
                <div
                  key={day}
                  className={`rounded-md p-3 text-center transition-colors duration-200 ${
                    isToday
                      ? 'border border-white/30 bg-white/5'
                      : 'border border-white/10'
                  }`}
                >
                  <p className={`text-[10px] uppercase tracking-widest mb-1 ${isToday ? 'text-white' : 'text-[#666666]'}`}>
                    {day}
                  </p>
                  <p className={`text-[10px] font-medium leading-tight ${isToday ? 'text-[#ededed]' : 'text-[#888888]'}`}>
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
