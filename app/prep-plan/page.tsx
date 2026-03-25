'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'
type Category = 'DSA' | 'System Design' | 'Behavioral'
type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface PlanDay {
  dayNumber: number
  date: string
  category: Category
  topic: string
  difficulty: Difficulty
  isRestDay: boolean
}

interface PrepPlanConfig {
  company: string
  interviewDate: string
  skillLevel: SkillLevel
}

// ── Constants ──────────────────────────────────────────────────────────

const COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Apple', 'Netflix',
  'Microsoft', 'NVIDIA', 'Tesla', 'Uber',
  'Airbnb', 'Stripe', 'Spotify',
  'Oracle', 'Bloomberg', 'IBM',
]

const COMPANY_GROUPS = [
  { label: 'FAANG', companies: ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix'] },
  { label: 'Big Tech', companies: ['Microsoft', 'NVIDIA', 'Tesla', 'Uber'] },
  { label: 'Top Startups', companies: ['Airbnb', 'Stripe', 'Spotify'] },
  { label: 'Enterprise', companies: ['Oracle', 'Bloomberg', 'IBM'] },
]

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced']

const COMPANY_WEIGHTS: Record<string, { DSA: number; 'System Design': number; Behavioral: number }> = {
  Google:    { DSA: 0.50, 'System Design': 0.30, Behavioral: 0.20 },
  Amazon:    { DSA: 0.30, 'System Design': 0.30, Behavioral: 0.40 },
  Meta:      { DSA: 0.45, 'System Design': 0.35, Behavioral: 0.20 },
  Bloomberg: { DSA: 0.55, 'System Design': 0.30, Behavioral: 0.15 },
}

const DEFAULT_WEIGHTS = { DSA: 0.35, 'System Design': 0.35, Behavioral: 0.30 }

const DSA_TOPICS = [
  'Arrays & Hash Maps',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & BST',
  'Graphs & BFS/DFS',
  'Dynamic Programming',
  'Sorting & Searching',
  'Sliding Window & Two Pointers',
  'Heaps & Priority Queues',
  'Tries & String Algorithms',
  'Backtracking & Recursion',
  'Greedy Algorithms',
  'Bit Manipulation',
  'Union Find',
  'Intervals & Sweep Line',
]

const SYSTEM_DESIGN_TOPICS = [
  'Load Balancers & Caching',
  'Database Design & Sharding',
  'Distributed Systems Basics',
  'URL Shortener Design',
  'Chat System Design',
  'News Feed Design',
  'Rate Limiter Design',
  'Notification System',
  'Search Autocomplete',
  'Video Streaming Architecture',
  'API Design & REST',
  'Microservices vs Monolith',
  'Message Queues & Pub/Sub',
  'CDN & Edge Computing',
  'Consistency & CAP Theorem',
]

const BEHAVIORAL_TOPICS = [
  'Tell Me About Yourself',
  'Leadership & Ownership',
  'Conflict Resolution',
  'Handling Failure',
  'Cross-Team Collaboration',
  'Prioritization & Trade-offs',
  'Customer Obsession',
  'Innovation & Creativity',
  'Mentorship & Growth',
  'Disagreement with Manager',
  'Ambiguity & Problem Solving',
  'Delivering Results Under Pressure',
  'Technical Decision Making',
  'Project Impact & Metrics',
  'Diversity & Inclusion',
]

const TOPIC_POOL: Record<Category, string[]> = {
  DSA: DSA_TOPICS,
  'System Design': SYSTEM_DESIGN_TOPICS,
  Behavioral: BEHAVIORAL_TOPICS,
}

const COMPANY_COLORS: Record<string, { border: string; bg: string; text: string; accent: string }> = {
  Google:    { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-400', accent: 'blue' },
  Meta:      { border: 'border-blue-400', bg: 'bg-blue-400', text: 'text-blue-300', accent: 'blue' },
  Amazon:    { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-400', accent: 'orange' },
  Apple:     { border: 'border-gray-400', bg: 'bg-gray-400', text: 'text-gray-300', accent: 'gray' },
  Netflix:   { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-400', accent: 'red' },
  Microsoft: { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', accent: 'cyan' },
  NVIDIA:    { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-400', accent: 'green' },
  Tesla:     { border: 'border-red-400', bg: 'bg-red-400', text: 'text-red-300', accent: 'red' },
  Uber:      { border: 'border-zinc-300', bg: 'bg-zinc-300', text: 'text-zinc-200', accent: 'zinc' },
  Airbnb:    { border: 'border-pink-500', bg: 'bg-pink-500', text: 'text-pink-400', accent: 'pink' },
  Stripe:    { border: 'border-violet-500', bg: 'bg-violet-500', text: 'text-violet-400', accent: 'violet' },
  Spotify:   { border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-400', accent: 'emerald' },
  Oracle:    { border: 'border-red-600', bg: 'bg-red-600', text: 'text-red-500', accent: 'red' },
  Bloomberg: { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-300', accent: 'orange' },
  IBM:       { border: 'border-blue-300', bg: 'bg-blue-300', text: 'text-blue-200', accent: 'blue' },
}

const COMPANY_BUTTON_COLORS: Record<string, string> = {
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

const COMPANY_SELECTED_COLORS: Record<string, string> = {
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

const CATEGORY_COLORS: Record<Category, { dot: string; bg: string; text: string; border: string }> = {
  DSA:              { dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'System Design':  { dot: 'bg-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Behavioral:       { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
}

const STORAGE_KEY = 'praxis-prep-plan'
const COMPLETED_KEY = 'praxis-prep-completed'

// ── Plan Generation ────────────────────────────────────────────────────

function getDaysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay))
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getDifficultyForDay(dayIndex: number, totalDays: number, skillLevel: SkillLevel): Difficulty {
  const progress = dayIndex / totalDays

  if (skillLevel === 'Beginner') {
    if (progress < 0.4) return 'Easy'
    if (progress < 0.75) return 'Medium'
    return 'Hard'
  }
  if (skillLevel === 'Intermediate') {
    if (progress < 0.25) return 'Easy'
    if (progress < 0.6) return 'Medium'
    return 'Hard'
  }
  // Advanced
  if (progress < 0.15) return 'Medium'
  return 'Hard'
}

function generatePlan(config: PrepPlanConfig): PlanDay[] {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(config.interviewDate + 'T00:00:00')
  const totalDays = getDaysBetween(startDate, endDate)

  const weights = COMPANY_WEIGHTS[config.company] || DEFAULT_WEIGHTS
  const categories: Category[] = ['DSA', 'System Design', 'Behavioral']

  // Determine plan structure based on total days
  const isIntensive = totalDays <= 7
  const isBalanced = totalDays > 7 && totalDays <= 14
  // 3-4 weeks or more: comprehensive

  const plan: PlanDay[] = []
  const topicCounters: Record<Category, number> = { DSA: 0, 'System Design': 0, Behavioral: 0 }

  for (let i = 0; i < totalDays; i++) {
    const dayDate = new Date(startDate)
    dayDate.setDate(dayDate.getDate() + i)
    const dateStr = formatDate(dayDate)
    const dayOfWeek = dayDate.getDay() // 0=Sun, 6=Sat

    // Rest day logic
    let isRestDay = false
    if (isBalanced && dayOfWeek === 0) {
      isRestDay = true
    }
    if (!isIntensive && !isBalanced && (dayOfWeek === 0 || (dayOfWeek === 3 && totalDays > 21))) {
      isRestDay = true
    }

    if (isRestDay) {
      plan.push({
        dayNumber: i + 1,
        date: dateStr,
        category: 'Behavioral',
        topic: 'Rest & Review',
        difficulty: 'Easy',
        isRestDay: true,
      })
      continue
    }

    // Weighted category selection using a cycling approach
    const activeDayIndex = plan.filter(d => !d.isRestDay).length
    const categoryScores = categories.map(cat => {
      const targetRatio = weights[cat]
      const currentCount = topicCounters[cat]
      const total = Object.values(topicCounters).reduce((a, b) => a + b, 0) || 1
      const currentRatio = currentCount / total
      return { cat, deficit: targetRatio - currentRatio }
    })
    categoryScores.sort((a, b) => b.deficit - a.deficit)
    const selectedCategory = categoryScores[0].cat

    const topicIndex = topicCounters[selectedCategory] % TOPIC_POOL[selectedCategory].length
    const topic = TOPIC_POOL[selectedCategory][topicIndex]
    topicCounters[selectedCategory]++

    const difficulty = getDifficultyForDay(activeDayIndex, totalDays, config.skillLevel)

    plan.push({
      dayNumber: i + 1,
      date: dateStr,
      category: selectedCategory,
      topic,
      difficulty,
      isRestDay: false,
    })
  }

  return plan
}

// ── Component ──────────────────────────────────────────────────────────

export default function PrepPlanPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Config form state
  const [company, setCompany] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('')

  // Plan state
  const [plan, setPlan] = useState<PlanDay[] | null>(null)
  const [planConfig, setPlanConfig] = useState<PrepPlanConfig | null>(null)
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<Category | 'All'>('All')

  useEffect(() => {
    setMounted(true)
    // Load saved plan
    const savedPlan = localStorage.getItem(STORAGE_KEY)
    const savedCompleted = localStorage.getItem(COMPLETED_KEY)
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan) as { config: PrepPlanConfig; plan: PlanDay[] }
        setPlanConfig(parsed.config)
        setPlan(parsed.plan)
        setCompany(parsed.config.company)
        setInterviewDate(parsed.config.interviewDate)
        setSkillLevel(parsed.config.skillLevel)
      } catch { /* ignore */ }
    }
    if (savedCompleted) {
      try {
        setCompletedDays(new Set(JSON.parse(savedCompleted)))
      } catch { /* ignore */ }
    }
  }, [])

  const savePlan = useCallback((config: PrepPlanConfig, planData: PlanDay[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, plan: planData }))
  }, [])

  const saveCompleted = useCallback((completed: Set<number>) => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed]))
  }, [])

  function handleGenerate() {
    if (!company || !interviewDate || !skillLevel) return
    const config: PrepPlanConfig = { company, interviewDate, skillLevel }
    const newPlan = generatePlan(config)
    setPlan(newPlan)
    setPlanConfig(config)
    setCompletedDays(new Set())
    savePlan(config, newPlan)
    saveCompleted(new Set())
  }

  function handleReset() {
    setPlan(null)
    setPlanConfig(null)
    setCompletedDays(new Set())
    setCompany('')
    setInterviewDate('')
    setSkillLevel('')
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(COMPLETED_KEY)
  }

  function toggleDay(dayNumber: number) {
    setCompletedDays(prev => {
      const next = new Set(prev)
      if (next.has(dayNumber)) {
        next.delete(dayNumber)
      } else {
        next.add(dayNumber)
      }
      saveCompleted(next)
      return next
    })
  }

  function startSession(day: PlanDay) {
    const params = new URLSearchParams({
      company: planConfig?.company || '',
      category: day.category,
      difficulty: day.difficulty,
    })
    router.push(`/interview?${params.toString()}`)
  }

  // Derived
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = formatDate(minDate)

  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 28)
  const maxDateStr = formatDate(maxDate)

  const totalActiveDays = plan ? plan.filter(d => !d.isRestDay).length : 0
  const completedCount = plan ? plan.filter(d => !d.isRestDay && completedDays.has(d.dayNumber)).length : 0
  const progressPct = totalActiveDays > 0 ? Math.round((completedCount / totalActiveDays) * 100) : 0

  const filteredPlan = plan
    ? filter === 'All'
      ? plan
      : plan.filter(d => d.isRestDay || d.category === filter)
    : null

  const companyColor = company ? COMPANY_COLORS[company] : null

  const daysUntil = interviewDate
    ? getDaysBetween(new Date(), new Date(interviewDate + 'T00:00:00'))
    : 0

  const planType = daysUntil <= 7 ? 'Intensive' : daysUntil <= 14 ? 'Balanced' : 'Comprehensive'

  const ready = company && interviewDate && skillLevel

  if (!mounted) return null

  // ── Plan View ──────────────────────────────────────────────────────

  if (plan && planConfig) {
    const cc = COMPANY_COLORS[planConfig.company]

    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between animate-fadeIn">
            <button
              onClick={() => router.push('/')}
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              &larr; Home
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-600 hover:text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              New Plan
            </button>
          </div>

          {/* Plan Summary */}
          <div className="animate-fadeIn space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${cc?.bg || 'bg-zinc-500'}`} />
              <h1 className="text-2xl font-bold tracking-tight">
                {planConfig.company} Prep Plan
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-500">
                {planType}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <span>{planConfig.skillLevel} Level</span>
              <span className="w-px h-4 bg-zinc-800" />
              <span>{daysUntil} days until interview</span>
              <span className="w-px h-4 bg-zinc-800" />
              <span>{totalActiveDays} study days</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-400 font-medium">
                {completedCount}/{totalActiveDays} days completed
              </span>
              <span className={`font-semibold tabular-nums ${progressPct === 100 ? 'text-green-400' : cc?.text || 'text-zinc-400'}`}>
                {progressPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${cc?.bg || 'bg-zinc-500'}`}
                style={{ width: `${progressPct}%`, opacity: 0.7 }}
              />
            </div>
          </div>

          {/* Category distribution */}
          <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            {(['DSA', 'System Design', 'Behavioral'] as Category[]).map(cat => {
              const count = plan.filter(d => !d.isRestDay && d.category === cat).length
              const catCompleted = plan.filter(d => !d.isRestDay && d.category === cat && completedDays.has(d.dayNumber)).length
              const catColor = CATEGORY_COLORS[cat]
              return (
                <div
                  key={cat}
                  className={`p-3 rounded-xl border ${catColor.border} ${catColor.bg}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${catColor.dot}`} />
                    <span className={`text-xs font-medium ${catColor.text}`}>{cat}</span>
                  </div>
                  <p className="text-lg font-semibold text-zinc-200 tabular-nums">
                    {catCompleted}<span className="text-zinc-600 text-sm">/{count}</span>
                  </p>
                </div>
              )
            })}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
            {(['All', 'DSA', 'System Design', 'Behavioral'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'text-zinc-600 hover:text-zinc-400 border border-transparent hover:border-zinc-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {filteredPlan?.map((day, idx) => {
              const isCompleted = completedDays.has(day.dayNumber)
              const catColor = CATEGORY_COLORS[day.category]
              const isToday = day.date === formatDate(new Date())

              if (day.isRestDay) {
                return (
                  <div
                    key={day.dayNumber}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30"
                  >
                    <div className="w-8 text-xs text-zinc-700 font-mono tabular-nums">
                      D{day.dayNumber}
                    </div>
                    <div className="w-px h-6 bg-zinc-800/50" />
                    <span className="text-xs text-zinc-700">{formatDisplayDate(day.date)}</span>
                    <span className="text-xs text-zinc-700 ml-auto italic">Rest & Review</span>
                  </div>
                )
              }

              return (
                <div
                  key={day.dayNumber}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                    isToday
                      ? `${cc?.border || 'border-zinc-700'} bg-zinc-900/80 ring-1 ${cc?.border ? cc.border.replace('border-', 'ring-') + '/20' : 'ring-zinc-700/20'}`
                      : isCompleted
                        ? 'border-zinc-800/50 bg-zinc-900/30'
                        : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDay(day.dayNumber)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted
                        ? `${cc?.bg || 'bg-zinc-500'} ${cc?.border || 'border-zinc-500'} text-white`
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {isCompleted && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {/* Day number */}
                  <div className={`w-8 text-xs font-mono tabular-nums ${isToday ? (cc?.text || 'text-zinc-300') : 'text-zinc-600'}`}>
                    D{day.dayNumber}
                  </div>

                  <div className="w-px h-6 bg-zinc-800/50" />

                  {/* Date */}
                  <span className={`text-xs w-28 flex-shrink-0 ${isToday ? 'text-zinc-300 font-medium' : 'text-zinc-600'}`}>
                    {formatDisplayDate(day.date)}
                    {isToday && <span className={`ml-1.5 text-[10px] ${cc?.text || 'text-zinc-400'}`}>TODAY</span>}
                  </span>

                  {/* Category badge */}
                  <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md ${catColor.bg} ${catColor.text} ${catColor.border} border flex-shrink-0`}>
                    {day.category === 'System Design' ? 'Sys Design' : day.category}
                  </span>

                  {/* Topic */}
                  <span className={`text-sm flex-1 min-w-0 truncate ${isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                    {day.topic}
                  </span>

                  {/* Difficulty */}
                  <span className={`text-[10px] uppercase tracking-wider font-medium flex-shrink-0 ${DIFFICULTY_COLORS[day.difficulty]}`}>
                    {day.difficulty}
                  </span>

                  {/* Start Session */}
                  <button
                    onClick={() => startSession(day)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'border-zinc-800 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500'
                        : `border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/50`
                    }`}
                  >
                    {isCompleted ? 'Redo' : 'Start'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </main>
    )
  }

  // ── Config Form View ───────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Header */}
        <div className="animate-fadeIn">
          <button
            onClick={() => router.push('/')}
            className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors mb-8 block"
          >
            &larr; Home
          </button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Company-Specific Prep Plans
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Build Your Prep Plan
            </h1>
            <p className="text-zinc-500 text-base max-w-md mx-auto leading-relaxed">
              Get a structured, day-by-day study plan tailored to your target company and timeline.
            </p>
          </div>
        </div>

        {/* Step 1: Company */}
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">1</div>
            <h2 className="text-sm font-semibold text-zinc-300">Target Company</h2>
            {company && <span className="text-xs text-zinc-600 ml-auto">{company}</span>}
          </div>
          <div className="space-y-4">
            {COMPANY_GROUPS.map(group => (
              <div key={group.label} className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-700 pl-1">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.companies.map(c => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        company === c
                          ? COMPANY_SELECTED_COLORS[c]
                          : COMPANY_BUTTON_COLORS[c]
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

        {/* Step 2: Interview Date */}
        <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">2</div>
            <h2 className="text-sm font-semibold text-zinc-300">Interview Date</h2>
            {interviewDate && (
              <span className="text-xs text-zinc-600 ml-auto">
                {formatDisplayDate(interviewDate)} ({daysUntil} days away)
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="date"
              value={interviewDate}
              onChange={e => setInterviewDate(e.target.value)}
              min={minDateStr}
              max={maxDateStr}
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all [color-scheme:dark]"
            />
          </div>
          {interviewDate && (
            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <span className={`px-2 py-0.5 rounded-md border ${
                daysUntil <= 7 ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : daysUntil <= 14 ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                    : 'border-green-500/30 bg-green-500/10 text-green-400'
              }`}>
                {planType} Plan
              </span>
              <span>
                {daysUntil <= 7
                  ? 'Daily focused sessions, no rest days'
                  : daysUntil <= 14
                    ? 'Balanced pace with weekly rest days'
                    : 'Comprehensive coverage with gradual ramp-up'}
              </span>
            </div>
          )}
        </div>

        {/* Step 3: Skill Level */}
        <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">3</div>
            <h2 className="text-sm font-semibold text-zinc-300">Current Skill Level</h2>
            {skillLevel && <span className="text-xs text-zinc-600 ml-auto">{skillLevel}</span>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SKILL_LEVELS.map(level => {
              const levelConfig: Record<SkillLevel, { desc: string; color: string; selected: string }> = {
                Beginner: {
                  desc: 'New to coding interviews',
                  color: 'border-green-500/40 bg-green-500/5 text-green-400 hover:bg-green-500/10',
                  selected: 'border-green-500 bg-green-500/20 text-green-300 ring-1 ring-green-500/30',
                },
                Intermediate: {
                  desc: 'Some interview experience',
                  color: 'border-yellow-500/40 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10',
                  selected: 'border-yellow-500 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30',
                },
                Advanced: {
                  desc: 'Experienced candidate',
                  color: 'border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/10',
                  selected: 'border-red-500 bg-red-500/20 text-red-300 ring-1 ring-red-500/30',
                },
              }
              const cfg = levelConfig[level]
              return (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    skillLevel === level ? cfg.selected : cfg.color
                  }`}
                >
                  <p className="text-sm font-medium">{level}</p>
                  <p className={`text-[11px] mt-0.5 ${skillLevel === level ? 'opacity-60' : 'opacity-40'}`}>
                    {cfg.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Company weight preview */}
        {company && (
          <div className="animate-fadeIn space-y-3" style={{ animationDelay: '0.25s' }}>
            <p className="text-xs text-zinc-600">
              {company} interview focus distribution:
            </p>
            <div className="flex gap-2 h-2 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800">
              {(['DSA', 'System Design', 'Behavioral'] as Category[]).map(cat => {
                const weight = (COMPANY_WEIGHTS[company] || DEFAULT_WEIGHTS)[cat]
                const catColor = CATEGORY_COLORS[cat]
                return (
                  <div
                    key={cat}
                    className={`${catColor.dot} rounded-full opacity-60`}
                    style={{ width: `${weight * 100}%` }}
                    title={`${cat}: ${Math.round(weight * 100)}%`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600">
              {(['DSA', 'System Design', 'Behavioral'] as Category[]).map(cat => {
                const weight = (COMPANY_WEIGHTS[company] || DEFAULT_WEIGHTS)[cat]
                return (
                  <span key={cat} className={CATEGORY_COLORS[cat].text} style={{ opacity: 0.6 }}>
                    {cat} {Math.round(weight * 100)}%
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleGenerate}
            disabled={!ready}
            className={`w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
              ready
                ? 'bg-white text-zinc-950 hover:bg-zinc-100 glow-white active:scale-[0.99]'
                : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
            }`}
          >
            {ready ? (
              <span className="flex items-center justify-center gap-2">
                Generate {company} Prep Plan
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                Select company, date, and skill level
              </span>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
