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
  {
    label: 'Rising Stars',
    companies: ['Databricks', 'Palantir', 'Coinbase', 'Snowflake', 'Figma', 'Notion', 'Cloudflare', 'Datadog'],
  },
]

const categories = ['DSA', 'System Design', 'Behavioral', 'API Design', 'OOD']
const difficulties = ['Easy', 'Medium', 'Hard']

const categoryDescriptions: Record<string, string> = {
  DSA: 'Algorithms & Data Structures',
  'System Design': 'Architecture & Scalability',
  Behavioral: 'Leadership & Culture Fit',
  'API Design': 'REST, GraphQL & API Architecture',
  OOD: 'Design Patterns & SOLID Principles',
}

const categoryIcons: Record<string, string> = {
  DSA: '</>',
  'System Design': 'sys',
  Behavioral: 'beh',
  'API Design': 'api',
  OOD: 'ood',
}

// Minimal company accent dots (tiny colored indicator)
const companyDotColors: Record<string, string> = {
  Google: 'bg-blue-500',
  Meta: 'bg-blue-400',
  Amazon: 'bg-orange-500',
  Apple: 'bg-zinc-400',
  Netflix: 'bg-red-500',
  Microsoft: 'bg-cyan-500',
  NVIDIA: 'bg-green-500',
  Tesla: 'bg-red-400',
  Uber: 'bg-zinc-300',
  Airbnb: 'bg-pink-500',
  Stripe: 'bg-violet-500',
  Spotify: 'bg-emerald-500',
  Oracle: 'bg-red-600',
  Bloomberg: 'bg-orange-400',
  IBM: 'bg-blue-300',
  Databricks: 'bg-red-500',
  Palantir: 'bg-zinc-400',
  Coinbase: 'bg-blue-500',
  Snowflake: 'bg-sky-400',
  Figma: 'bg-purple-500',
  Notion: 'bg-zinc-300',
  Cloudflare: 'bg-orange-500',
  Datadog: 'bg-violet-400',
}

const difficultyConfig: Record<string, { desc: string }> = {
  Easy: { desc: '~30 min' },
  Medium: { desc: '~45 min' },
  Hard: { desc: '~60 min' },
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
    <main className="min-h-screen bg-black text-[#ededed]">
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-16">
        {/* Header */}
        <div className="text-center space-y-5 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0a0a0a] text-xs text-[#888888]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            AI-Powered Mock Interviews
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            praxis
          </h1>
          <p className="text-[#888888] text-base max-w-md mx-auto leading-relaxed">
            Practice real technical interviews with AI interviewers from Google, Meta, Amazon & more.
          </p>
          {streakData.currentStreak > 0 && (
            <button
              onClick={() => router.push('/daily')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-sm text-[#888888] hover:bg-white/5 transition-all duration-200 mt-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
              {streakData.currentStreak} day streak
            </button>
          )}
        </div>

        {/* Quick Stats */}
        {stats && stats.totalInterviews > 0 && (
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => router.push('/history')}
              className="w-full border border-white/10 rounded-lg p-5 flex items-center justify-between hover:bg-white/[0.02] transition-all duration-200 group"
            >
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-0.5">Sessions</p>
                  <p className="text-xl font-semibold tabular-nums text-white">{stats.totalInterviews}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-0.5">Avg Score</p>
                  <p className="text-xl font-semibold tabular-nums text-white">{stats.avgOverall}<span className="text-[#666666] text-sm">/10</span></p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-0.5">Trend</p>
                  <p className={`text-xl font-semibold ${stats.trend === 'improving' ? 'text-[#00d4aa]' : stats.trend === 'declining' ? 'text-[#ee5555]' : 'text-[#888888]'}`}>
                    {stats.trend === 'improving' ? '↑' : stats.trend === 'declining' ? '↓' : '→'}
                  </p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-0.5">Focus on</p>
                  <p className="text-sm font-medium text-[#f5a623]">{stats.weakest.name}</p>
                </div>
              </div>
              <span className="text-xs text-[#666666] group-hover:text-[#888888] transition-colors duration-200">
                View History &rarr;
              </span>
            </button>
          </div>
        )}

        {/* Nav Cards */}
        <div className="grid grid-cols-4 gap-4 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={() => router.push('/daily')}
            className="border border-white/10 rounded-lg p-5 text-left hover:bg-white/[0.02] transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-xs text-[#888888] mb-3 group-hover:border-white/20 transition-all duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
            </div>
            <p className="text-sm font-medium text-[#ededed]">Daily Challenge</p>
            <p className="text-xs text-[#666666] mt-1">Today&apos;s question &amp; streaks</p>
          </button>
          <button
            onClick={() => router.push('/questions')}
            className="border border-white/10 rounded-lg p-5 text-left hover:bg-white/[0.02] transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-xs font-mono text-[#888888] mb-3 group-hover:border-white/20 transition-all duration-200">Q</div>
            <p className="text-sm font-medium text-[#ededed]">Question Bank</p>
            <p className="text-xs text-[#666666] mt-1">Browse real questions</p>
          </button>
          <button
            onClick={() => router.push('/history')}
            className="border border-white/10 rounded-lg p-5 text-left hover:bg-white/[0.02] transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-xs font-mono text-[#888888] mb-3 group-hover:border-white/20 transition-all duration-200">H</div>
            <p className="text-sm font-medium text-[#ededed]">History</p>
            <p className="text-xs text-[#666666] mt-1">Track your progress</p>
          </button>
          <button
            onClick={() => router.push('/prep-plan')}
            className="border border-white/10 rounded-lg p-5 text-left hover:bg-white/[0.02] transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-xs font-mono text-[#888888] mb-3 group-hover:border-white/20 transition-all duration-200">P</div>
            <p className="text-sm font-medium text-[#ededed]">Prep Plan</p>
            <p className="text-xs text-[#666666] mt-1">Study schedule</p>
          </button>
        </div>

        {/* Company Selection */}
        <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[#666666]">01</span>
            <h2 className="text-sm font-medium text-[#ededed]">Choose Company</h2>
            {company && <span className="text-xs text-[#666666] ml-auto">{company}</span>}
          </div>

          <div className="space-y-5">
            {companyGroups.map((group) => (
              <div key={group.label} className="space-y-2.5">
                <p className="text-[10px] uppercase tracking-widest text-[#666666]">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.companies.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={`px-3.5 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center gap-2 ${
                        company === c
                          ? 'border-white/40 bg-white/5 text-white'
                          : 'border-white/10 text-[#888888] hover:border-white/20 hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${companyDotColors[c] || 'bg-zinc-500'}`} />
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[#666666]">02</span>
            <h2 className="text-sm font-medium text-[#ededed]">Interview Type</h2>
            {category && <span className="text-xs text-[#666666] ml-auto">{category}</span>}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`relative p-4 rounded-lg border text-left transition-all duration-200 ${
                  category === cat
                    ? 'border-white/40 bg-white/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <div className={`text-xs font-mono mb-2 ${category === cat ? 'text-white' : 'text-[#666666]'}`}>
                  {categoryIcons[cat]}
                </div>
                <p className={`text-sm font-medium ${category === cat ? 'text-white' : 'text-[#ededed]'}`}>{cat}</p>
                <p className={`text-[11px] mt-0.5 ${category === cat ? 'text-[#888888]' : 'text-[#666666]'}`}>
                  {categoryDescriptions[cat]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[#666666]">03</span>
            <h2 className="text-sm font-medium text-[#ededed]">Difficulty</h2>
            {difficulty && <span className="text-xs text-[#666666] ml-auto">{difficulty}</span>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                  difficulty === d
                    ? 'border-white/40 bg-white/5 text-white'
                    : 'border-white/10 text-[#888888] hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <p className={`text-sm font-medium ${difficulty === d ? 'text-white' : 'text-[#ededed]'}`}>{d}</p>
                <p className={`text-[11px] mt-0.5 ${difficulty === d ? 'text-[#888888]' : 'text-[#666666]'}`}>
                  {difficultyConfig[d].desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={startInterview}
            disabled={!ready}
            className={`w-full py-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              ready
                ? 'bg-white text-black hover:bg-white/90 active:scale-[0.99]'
                : 'bg-[#111111] text-[#666666] cursor-not-allowed border border-white/10'
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
              <span>Select company, type, and difficulty</span>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
