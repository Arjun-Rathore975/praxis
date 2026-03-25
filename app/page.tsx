'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStats } from '@/lib/storage'
import { getStreakData, type StreakData } from '@/lib/streaks'

const companyGroups = [
  {
    label: 'FAANG',
    companies: ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix'],
  },
  {
    label: 'Big Tech',
    companies: ['Microsoft', 'NVIDIA', 'Tesla', 'Uber'],
  },
  {
    label: 'Top Startups',
    companies: ['Airbnb', 'Stripe', 'Spotify'],
  },
  {
    label: 'Enterprise',
    companies: ['Oracle', 'Bloomberg', 'IBM'],
  },
]

const categories = ['DSA', 'System Design', 'Behavioral']
const difficulties = ['Easy', 'Medium', 'Hard']

const categoryDescriptions: Record<string, string> = {
  DSA: 'Algorithms & Data Structures',
  'System Design': 'Architecture & Scalability',
  Behavioral: 'Leadership & Culture Fit',
}

const categoryIcons: Record<string, string> = {
  DSA: '</>',
  'System Design': 'sys',
  Behavioral: 'beh',
}

const companyColors: Record<string, string> = {
  Google: 'border-blue-500/60 bg-blue-500/8 text-blue-400 hover:bg-blue-500/15 hover:border-blue-400',
  Meta: 'border-blue-400/60 bg-blue-400/8 text-blue-300 hover:bg-blue-400/15 hover:border-blue-300',
  Amazon: 'border-orange-500/60 bg-orange-500/8 text-orange-400 hover:bg-orange-500/15 hover:border-orange-400',
  Apple: 'border-gray-400/60 bg-gray-400/8 text-gray-300 hover:bg-gray-400/15 hover:border-gray-300',
  Netflix: 'border-red-500/60 bg-red-500/8 text-red-400 hover:bg-red-500/15 hover:border-red-400',
  Microsoft: 'border-cyan-500/60 bg-cyan-500/8 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-400',
  NVIDIA: 'border-green-500/60 bg-green-500/8 text-green-400 hover:bg-green-500/15 hover:border-green-400',
  Tesla: 'border-red-400/60 bg-red-400/8 text-red-300 hover:bg-red-400/15 hover:border-red-300',
  Uber: 'border-zinc-300/60 bg-zinc-300/8 text-zinc-200 hover:bg-zinc-300/15 hover:border-zinc-200',
  Airbnb: 'border-pink-500/60 bg-pink-500/8 text-pink-400 hover:bg-pink-500/15 hover:border-pink-400',
  Stripe: 'border-violet-500/60 bg-violet-500/8 text-violet-400 hover:bg-violet-500/15 hover:border-violet-400',
  Spotify: 'border-emerald-500/60 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-400',
  Oracle: 'border-red-600/60 bg-red-600/8 text-red-500 hover:bg-red-600/15 hover:border-red-500',
  Bloomberg: 'border-orange-400/60 bg-orange-400/8 text-orange-300 hover:bg-orange-400/15 hover:border-orange-300',
  IBM: 'border-blue-300/60 bg-blue-300/8 text-blue-200 hover:bg-blue-300/15 hover:border-blue-200',
}

const companySelectedColors: Record<string, string> = {
  Google: 'border-blue-500 bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30',
  Meta: 'border-blue-400 bg-blue-400/20 text-blue-200 ring-1 ring-blue-400/30',
  Amazon: 'border-orange-500 bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30',
  Apple: 'border-gray-400 bg-gray-400/20 text-gray-200 ring-1 ring-gray-400/30',
  Netflix: 'border-red-500 bg-red-500/20 text-red-300 ring-1 ring-red-500/30',
  Microsoft: 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30',
  NVIDIA: 'border-green-500 bg-green-500/20 text-green-300 ring-1 ring-green-500/30',
  Tesla: 'border-red-400 bg-red-400/20 text-red-200 ring-1 ring-red-400/30',
  Uber: 'border-zinc-300 bg-zinc-300/20 text-zinc-100 ring-1 ring-zinc-300/30',
  Airbnb: 'border-pink-500 bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/30',
  Stripe: 'border-violet-500 bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30',
  Spotify: 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
  Oracle: 'border-red-600 bg-red-600/20 text-red-400 ring-1 ring-red-600/30',
  Bloomberg: 'border-orange-400 bg-orange-400/20 text-orange-200 ring-1 ring-orange-400/30',
  IBM: 'border-blue-300 bg-blue-300/20 text-blue-100 ring-1 ring-blue-300/30',
}

const difficultyConfig: Record<string, { color: string; selected: string; desc: string }> = {
  Easy: {
    color: 'border-green-500/40 bg-green-500/5 text-green-400 hover:bg-green-500/10',
    selected: 'border-green-500 bg-green-500/20 text-green-300 ring-1 ring-green-500/30',
    desc: '~30 min',
  },
  Medium: {
    color: 'border-yellow-500/40 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10',
    selected: 'border-yellow-500 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30',
    desc: '~45 min',
  },
  Hard: {
    color: 'border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/10',
    selected: 'border-red-500 bg-red-500/20 text-red-300 ring-1 ring-red-500/30',
    desc: '~60 min',
  },
}

export default function Home() {
  const router = useRouter()
  const [company, setCompany] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [stats, setStats] = useState<ReturnType<typeof getStats>>(null)
  const [mounted, setMounted] = useState(false)
  const [streakData, setStreakData] = useState<StreakData>({ completedDates: [], currentStreak: 0, bestStreak: 0 })

  useEffect(() => {
    setStats(getStats())
    setStreakData(getStreakData())
    setMounted(true)
  }, [])

  const ready = company && category && difficulty

  function startInterview() {
    const params = new URLSearchParams({ company, category, difficulty })
    router.push(`/interview?${params.toString()}`)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Gradient background accent */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AI-Powered Mock Interviews
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            praxis
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">
            Theory is nothing. Practice is everything.
          </p>
          {streakData.currentStreak > 0 && (
            <button
              onClick={() => router.push('/daily')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-sm text-amber-400 hover:bg-amber-500/20 transition-colors mt-2"
            >
              <span role="img" aria-label="fire">&#x1F525;</span> {streakData.currentStreak} day streak
            </button>
          )}
        </div>

        {/* Quick Stats */}
        {stats && stats.totalInterviews > 0 && (
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => router.push('/history')}
              className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Sessions</p>
                  <p className="text-xl font-semibold tabular-nums">{stats.totalInterviews}</p>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Avg Score</p>
                  <p className="text-xl font-semibold tabular-nums">{stats.avgOverall}<span className="text-zinc-600 text-sm">/10</span></p>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Trend</p>
                  <p className={`text-xl font-semibold ${stats.trend === 'improving' ? 'text-green-400' : stats.trend === 'declining' ? 'text-red-400' : 'text-zinc-500'}`}>
                    {stats.trend === 'improving' ? '↑' : stats.trend === 'declining' ? '↓' : '→'}
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Focus on</p>
                  <p className="text-sm font-medium text-orange-400">{stats.weakest.name}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                View History &rarr;
              </span>
            </button>
          </div>
        )}

        {/* Nav Cards */}
        <div className="grid grid-cols-4 gap-3 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={() => router.push('/daily')}
            className="bg-zinc-900/50 border border-amber-500/20 rounded-2xl p-5 text-left hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs text-amber-400 mb-3 group-hover:bg-amber-500/20 transition-colors">
              <span role="img" aria-label="fire">&#x1F525;</span>
            </div>
            <p className="text-sm font-medium text-zinc-200">Daily Challenge</p>
            <p className="text-xs text-zinc-600 mt-1">Today&apos;s question &amp; streaks</p>
          </button>
          <button
            onClick={() => router.push('/questions')}
            className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 text-left hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 mb-3 group-hover:bg-zinc-700 transition-colors">Q</div>
            <p className="text-sm font-medium text-zinc-200">Question Bank</p>
            <p className="text-xs text-zinc-600 mt-1">Browse real questions with frequency data</p>
          </button>
          <button
            onClick={() => router.push('/history')}
            className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 text-left hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 mb-3 group-hover:bg-zinc-700 transition-colors">H</div>
            <p className="text-sm font-medium text-zinc-200">Interview History</p>
            <p className="text-xs text-zinc-600 mt-1">Track progress and review past sessions</p>
          </button>
          <button
            onClick={() => router.push('/prep-plan')}
            className="bg-zinc-900/50 border border-violet-500/20 rounded-2xl p-5 text-left hover:border-violet-500/40 hover:bg-zinc-900/80 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-xs font-mono text-violet-400 mb-3 group-hover:bg-violet-500/20 transition-colors">P</div>
            <p className="text-sm font-medium text-zinc-200">Prep Plan</p>
            <p className="text-xs text-zinc-600 mt-1">Company-specific study schedule</p>
          </button>
        </div>

        {/* Company Selection */}
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">1</div>
            <h2 className="text-sm font-semibold text-zinc-300">Choose Company</h2>
            {company && <span className="text-xs text-zinc-600 ml-auto">{company}</span>}
          </div>

          <div className="space-y-4">
            {companyGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-700 pl-1">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.companies.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        company === c
                          ? companySelectedColors[c]
                          : companyColors[c] || 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">2</div>
            <h2 className="text-sm font-semibold text-zinc-300">Interview Type</h2>
            {category && <span className="text-xs text-zinc-600 ml-auto">{category}</span>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
                  category === cat
                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className={`text-xs font-mono mb-2 ${category === cat ? 'text-purple-400' : 'text-zinc-600'}`}>
                  {categoryIcons[cat]}
                </div>
                <p className={`text-sm font-medium ${category === cat ? 'text-purple-300' : 'text-zinc-300'}`}>{cat}</p>
                <p className={`text-[11px] mt-0.5 ${category === cat ? 'text-purple-400/60' : 'text-zinc-600'}`}>
                  {categoryDescriptions[cat]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">3</div>
            <h2 className="text-sm font-semibold text-zinc-300">Difficulty</h2>
            {difficulty && <span className="text-xs text-zinc-600 ml-auto">{difficulty}</span>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  difficulty === d
                    ? difficultyConfig[d].selected
                    : difficultyConfig[d].color
                }`}
              >
                <p className="text-sm font-medium">{d}</p>
                <p className={`text-[11px] mt-0.5 ${difficulty === d ? 'opacity-60' : 'opacity-40'}`}>
                  {difficultyConfig[d].desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={startInterview}
            disabled={!ready}
            className={`w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
              ready
                ? 'bg-white text-zinc-950 hover:bg-zinc-100 glow-white active:scale-[0.99]'
                : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
            }`}
          >
            {ready ? (
              <span className="flex items-center justify-center gap-2">
                Start {company} {category} Interview
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                Select company, type, and difficulty
              </span>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
