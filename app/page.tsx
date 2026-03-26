'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStats } from '@/lib/storage'
import { getStreakData, type StreakData } from '@/lib/streaks'
import { getAdaptiveData, getRecommendedDifficulty } from '@/lib/adaptive'
import { getBookmarkCount } from '@/lib/bookmarks'
import { getSkillTree } from '@/lib/skills'
import { ThemeToggle } from '@/app/components'

const companyGroups = [
  { label: 'FAANG', companies: ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix'] },
  { label: 'Big Tech', companies: ['Microsoft', 'NVIDIA', 'Tesla', 'Uber'] },
  { label: 'Top Startups', companies: ['Airbnb', 'Stripe', 'Spotify'] },
  { label: 'Enterprise', companies: ['Oracle', 'Bloomberg', 'IBM'] },
  { label: 'Rising Stars', companies: ['Databricks', 'Palantir', 'Coinbase', 'Snowflake', 'Figma', 'Notion', 'Cloudflare', 'Datadog'] },
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

const companyDotColors: Record<string, string> = {
  Google: 'bg-blue-500', Meta: 'bg-blue-400', Amazon: 'bg-orange-500',
  Apple: 'bg-zinc-400', Netflix: 'bg-red-500', Microsoft: 'bg-cyan-500',
  NVIDIA: 'bg-green-500', Tesla: 'bg-red-400', Uber: 'bg-zinc-300',
  Airbnb: 'bg-pink-500', Stripe: 'bg-violet-500', Spotify: 'bg-emerald-500',
  Oracle: 'bg-red-600', Bloomberg: 'bg-orange-400', IBM: 'bg-blue-300',
  Databricks: 'bg-red-500', Palantir: 'bg-zinc-400', Coinbase: 'bg-blue-500',
  Snowflake: 'bg-sky-400', Figma: 'bg-purple-500', Notion: 'bg-zinc-300',
  Cloudflare: 'bg-orange-500', Datadog: 'bg-violet-400',
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
  const [panelMode, setPanelMode] = useState(false)
  const [stats, setStats] = useState<ReturnType<typeof getStats>>(null)
  const [mounted, setMounted] = useState(false)
  const [streakData, setStreakData] = useState<StreakData>({ completedDates: [], currentStreak: 0, bestStreak: 0 })
  const [recommendedDiff, setRecommendedDiff] = useState('')
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [skillRank, setSkillRank] = useState('')
  const [weakAreas, setWeakAreas] = useState<string[]>([])

  useEffect(() => {
    setStats(getStats())
    setStreakData(getStreakData())
    setBookmarkCount(getBookmarkCount())
    const adaptive = getAdaptiveData()
    setWeakAreas(adaptive.weakAreas)
    const tree = getSkillTree()
    setSkillRank(tree.rank)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (category) {
      setRecommendedDiff(getRecommendedDifficulty(category))
    }
  }, [category])

  const ready = company && category && difficulty

  function startInterview() {
    const params = new URLSearchParams({ company, category, difficulty })
    if (panelMode) params.set('panel', 'true')
    router.push(`/interview?${params.toString()}`)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-16">
        {/* Header */}
        <div className="text-center space-y-5 animate-fadeIn">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
            AI-Powered Mock Interviews
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            praxis
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-md mx-auto leading-relaxed">
            Practice real technical interviews with AI interviewers from Google, Meta, Amazon & more.
          </p>
          {streakData.currentStreak > 0 && (
            <button
              onClick={() => router.push('/daily')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all duration-200 mt-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)]" />
              {streakData.currentStreak} day streak
            </button>
          )}
        </div>

        {/* Adaptive Insights */}
        {weakAreas.length > 0 && (
          <div className="border border-[var(--accent-yellow)]/20 bg-[var(--accent-yellow)]/5 rounded-lg p-4 animate-fadeIn" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)]" />
              <span className="text-xs font-medium text-[var(--accent-yellow)]">Focus Areas</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Based on your performance, practice more: <span className="text-[var(--text-primary)] font-medium">{weakAreas.join(', ')}</span>
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {stats && stats.totalInterviews > 0 && (
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => router.push('/history')}
              className="w-full border border-[var(--border)] rounded-lg p-5 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-all duration-200 group"
            >
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Sessions</p>
                  <p className="text-xl font-semibold tabular-nums">{stats.totalInterviews}</p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Avg Score</p>
                  <p className="text-xl font-semibold tabular-nums">{stats.avgOverall}<span className="text-[var(--text-muted)] text-sm">/10</span></p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Trend</p>
                  <p className={`text-xl font-semibold ${stats.trend === 'improving' ? 'text-[var(--accent-green)]' : stats.trend === 'declining' ? 'text-[var(--accent-red)]' : 'text-[var(--text-secondary)]'}`}>
                    {stats.trend === 'improving' ? '↑' : stats.trend === 'declining' ? '↓' : '→'}
                  </p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Focus on</p>
                  <p className="text-sm font-medium text-[var(--accent-yellow)]">{stats.weakest.name}</p>
                </div>
              </div>
              <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors duration-200">
                View History &rarr;
              </span>
            </button>
          </div>
        )}

        {/* Nav Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          {[
            { href: '/daily', icon: '●', label: 'Daily', sub: 'Challenge', color: 'bg-[var(--accent-yellow)]' },
            { href: '/questions', icon: 'Q', label: 'Questions', sub: `${bookmarkCount > 0 ? bookmarkCount + ' saved' : 'Browse'}`, color: '' },
            { href: '/history', icon: 'H', label: 'History', sub: 'Progress', color: '' },
            { href: '/prep-plan', icon: 'P', label: 'Prep Plan', sub: 'Schedule', color: '' },
            { href: '/skills', icon: '★', label: 'Skills', sub: skillRank || 'Tree', color: '' },
            { href: '/questions?bookmarks=true', icon: '♥', label: 'Saved', sub: `${bookmarkCount}`, color: '' },
          ].map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="border border-[var(--border)] rounded-lg p-4 text-left hover:bg-[var(--bg-secondary)] transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-md border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-secondary)] mb-2 group-hover:border-[var(--border-hover)] transition-all duration-200">
                {item.color ? <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} /> : item.icon}
              </div>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Company Selection */}
        <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">01</span>
            <h2 className="text-sm font-medium">Choose Company</h2>
            {company && <span className="text-xs text-[var(--text-muted)] ml-auto">{company}</span>}
          </div>

          <div className="space-y-5">
            {companyGroups.map((group) => (
              <div key={group.label} className="space-y-2.5">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.companies.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={`px-3.5 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center gap-2 ${
                        company === c
                          ? 'border-[var(--border-hover)] bg-[var(--bg-secondary)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]'
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
            <span className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">02</span>
            <h2 className="text-sm font-medium">Interview Type</h2>
            {category && <span className="text-xs text-[var(--text-muted)] ml-auto">{category}</span>}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {categories.map((cat) => {
              const isWeak = weakAreas.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`relative p-4 rounded-lg border text-left transition-all duration-200 ${
                    category === cat
                      ? 'border-[var(--border-hover)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {isWeak && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)]" title="Needs practice" />
                  )}
                  <div className={`text-xs font-mono mb-2 ${category === cat ? '' : 'text-[var(--text-muted)]'}`}>
                    {categoryIcons[cat]}
                  </div>
                  <p className="text-sm font-medium">{cat}</p>
                  <p className={`text-[11px] mt-0.5 ${category === cat ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                    {categoryDescriptions[cat]}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">03</span>
            <h2 className="text-sm font-medium">Difficulty</h2>
            {difficulty && <span className="text-xs text-[var(--text-muted)] ml-auto">{difficulty}</span>}
            {recommendedDiff && category && (
              <span className="text-[10px] text-[var(--accent-green)] ml-2">
                Recommended: {recommendedDiff}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                  difficulty === d
                    ? 'border-[var(--border-hover)] bg-[var(--bg-secondary)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]'
                } ${d === recommendedDiff && d !== difficulty ? 'ring-1 ring-[var(--accent-green)]/30' : ''}`}
              >
                <p className="text-sm font-medium">{d}</p>
                <p className={`text-[11px] mt-0.5 ${difficulty === d ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                  {difficultyConfig[d].desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Mode Toggle */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.32s' }}>
          <button
            onClick={() => setPanelMode(!panelMode)}
            className={`w-full p-4 rounded-lg border text-left transition-all duration-200 flex items-center gap-4 ${
              panelMode
                ? 'border-[var(--border-hover)] bg-[var(--bg-secondary)]'
                : 'border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)]">A1</div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)]">A2</div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Panel Interview</p>
              <p className="text-[11px] text-[var(--text-muted)]">2 interviewers with different styles — more realistic & challenging</p>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
              panelMode ? 'bg-[var(--accent-green)] justify-end' : 'bg-[var(--bg-tertiary)] justify-start'
            }`}>
              <div className="w-4 h-4 rounded-full bg-[var(--bg-primary)] mx-0.5 shadow-sm" />
            </div>
          </button>
        </div>

        {/* Start Button */}
        <div className="pt-2 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={startInterview}
            disabled={!ready}
            className={`w-full py-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              ready
                ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 active:scale-[0.99]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]'
            }`}
          >
            {ready ? (
              <span className="flex items-center justify-center gap-2">
                Start {company} {category} {panelMode ? 'Panel ' : ''}Interview
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
