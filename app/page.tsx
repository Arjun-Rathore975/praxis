'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStats } from '@/lib/storage'
import { getStreakData, type StreakData } from '@/lib/streaks'
import { getRecommendedDifficulty } from '@/lib/adaptive'
import { ThemeToggle } from '@/app/components'

const allCompanies = [
  'Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'NVIDIA', 'Tesla',
  'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Oracle', 'Bloomberg', 'IBM',
  'Databricks', 'Palantir', 'Coinbase', 'Snowflake', 'Figma', 'Notion', 'Cloudflare', 'Datadog',
]

const categories = [
  { id: 'DSA', label: 'DSA' },
  { id: 'System Design', label: 'System Design' },
  { id: 'Behavioral', label: 'Behavioral' },
  { id: 'API Design', label: 'API Design' },
  { id: 'OOD', label: 'OOD' },
]

const difficulties = ['Easy', 'Medium', 'Hard']

export default function Home() {
  const router = useRouter()
  const [company, setCompany] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [panelMode, setPanelMode] = useState(false)
  const [companySearch, setCompanySearch] = useState('')
  const [stats, setStats] = useState<ReturnType<typeof getStats>>(null)
  const [mounted, setMounted] = useState(false)
  const [streakData, setStreakData] = useState<StreakData>({ completedDates: [], currentStreak: 0, bestStreak: 0 })
  const [recommendedDiff, setRecommendedDiff] = useState('')

  useEffect(() => {
    setStats(getStats())
    setStreakData(getStreakData())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (category) setRecommendedDiff(getRecommendedDifficulty(category))
  }, [category])

  const ready = company && category && difficulty

  const filteredCompanies = companySearch
    ? allCompanies.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()))
    : allCompanies

  function startInterview() {
    const params = new URLSearchParams({ company, category, difficulty })
    if (panelMode) params.set('panel', 'true')
    router.push(`/interview?${params.toString()}`)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <span className="text-sm font-semibold tracking-tight">praxis</span>
        <div className="flex items-center gap-5">
          {[
            { href: '/daily', label: 'Daily' },
            { href: '/questions', label: 'Questions' },
            { href: '/skills', label: 'Skills' },
            { href: '/history', label: 'History' },
            { href: '/prep-plan', label: 'Prep Plan' },
          ].map(link => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.label}
            </button>
          ))}
          {streakData.currentStreak > 0 && (
            <span className="text-xs text-[var(--accent-yellow)] tabular-nums">
              {streakData.currentStreak}d streak
            </span>
          )}
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-16 space-y-10">
        {/* Hero — minimal */}
        <div className="text-center space-y-3 animate-fadeIn">
          <h1 className="text-3xl font-bold tracking-tight">Start a mock interview</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Pick a company, category, and difficulty. An AI interviewer will take it from there.
          </p>
        </div>

        {/* Quick stats — only if they exist, compact */}
        {stats && stats.totalInterviews > 0 && (
          <button
            onClick={() => router.push('/history')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-all text-left animate-fadeIn"
          >
            <div className="flex items-center gap-6 text-sm">
              <span className="tabular-nums">{stats.totalInterviews} <span className="text-[var(--text-muted)]">sessions</span></span>
              <span className="tabular-nums">{stats.avgOverall}/10 <span className="text-[var(--text-muted)]">avg</span></span>
              <span className={stats.trend === 'improving' ? 'text-[var(--accent-green)]' : stats.trend === 'declining' ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}>
                {stats.trend === 'improving' ? '↑ improving' : stats.trend === 'declining' ? '↓ declining' : '→ stable'}
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">&rarr;</span>
          </button>
        )}

        {/* Company */}
        <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '0.05s' }}>
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Company</label>
          <input
            type="text"
            value={companySearch}
            onChange={(e) => { setCompanySearch(e.target.value); setCompany('') }}
            placeholder="Search companies..."
            className="w-full bg-transparent border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm placeholder-[var(--text-muted)] outline-none focus:border-[var(--border-hover)] transition-colors"
          />
          <div className="flex flex-wrap gap-1.5">
            {filteredCompanies.map((c) => (
              <button
                key={c}
                onClick={() => { setCompany(c); setCompanySearch('') }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  company === c
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Category</label>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Difficulty</label>
            {recommendedDiff && category && (
              <span className="text-[10px] text-[var(--accent-green)]">Recommended: {recommendedDiff}</span>
            )}
          </div>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  difficulty === d
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                } ${d === recommendedDiff && d !== difficulty ? 'ring-1 ring-[var(--accent-green)]/30' : ''}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Panel toggle — inline, simple */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setPanelMode(!panelMode)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">Panel mode</span>
              <span className="text-xs text-[var(--text-muted)]">2 interviewers</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-all flex items-center ${
              panelMode ? 'bg-[var(--accent-green)] justify-end' : 'bg-[var(--bg-tertiary)] justify-start'
            }`}>
              <div className="w-3 h-3 rounded-full bg-[var(--bg-primary)] mx-0.5" />
            </div>
          </button>
        </div>

        {/* Start */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <button
            onClick={startInterview}
            disabled={!ready}
            className={`w-full py-3.5 rounded-lg text-sm font-medium transition-all ${
              ready
                ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 active:scale-[0.99]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {ready ? `Start ${company} ${category} Interview` : 'Select all options above'}
          </button>
        </div>
      </div>
    </main>
  )
}
