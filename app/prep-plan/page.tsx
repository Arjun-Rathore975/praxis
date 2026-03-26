'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/app/components'

// ── Types ──────────────────────────────────────────────────────────────

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'
type Category = 'DSA' | 'System Design' | 'Behavioral' | 'API Design' | 'OOD'
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

const COMPANY_WEIGHTS: Record<string, Record<Category, number>> = {
  Google:    { DSA: 0.40, 'System Design': 0.25, Behavioral: 0.15, 'API Design': 0.10, OOD: 0.10 },
  Amazon:    { DSA: 0.25, 'System Design': 0.25, Behavioral: 0.30, 'API Design': 0.05, OOD: 0.15 },
  Meta:      { DSA: 0.35, 'System Design': 0.30, Behavioral: 0.15, 'API Design': 0.10, OOD: 0.10 },
  Bloomberg: { DSA: 0.45, 'System Design': 0.25, Behavioral: 0.10, 'API Design': 0.05, OOD: 0.15 },
}

const DEFAULT_WEIGHTS: Record<Category, number> = { DSA: 0.30, 'System Design': 0.25, Behavioral: 0.20, 'API Design': 0.13, OOD: 0.12 }

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

const API_DESIGN_TOPICS = [
  'REST API Fundamentals',
  'GraphQL API Design',
  'API Versioning & Compatibility',
  'Pagination & Filtering',
  'Authentication & Authorization',
  'Rate Limiting & Throttling',
  'Webhook Design & Delivery',
  'Error Handling & Status Codes',
  'Idempotency & Retry Logic',
  'API Gateway & Routing',
]

const OOD_TOPICS = [
  'SOLID Principles',
  'Design Patterns: Creational',
  'Design Patterns: Structural',
  'Design Patterns: Behavioral',
  'Class Hierarchies & Inheritance',
  'Composition vs Inheritance',
  'State Machines & Workflows',
  'Observer & Event Systems',
  'Strategy & Command Patterns',
  'Factory & Builder Patterns',
]

const TOPIC_POOL: Record<Category, string[]> = {
  DSA: DSA_TOPICS,
  'System Design': SYSTEM_DESIGN_TOPICS,
  Behavioral: BEHAVIORAL_TOPICS,
  'API Design': API_DESIGN_TOPICS,
  OOD: OOD_TOPICS,
}

// Minimal company dot colors
const COMPANY_DOT_COLORS: Record<string, string> = {
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
}

const CATEGORY_LABELS: Record<Category, string> = {
  DSA: 'DSA',
  'System Design': 'Sys Design',
  Behavioral: 'Behavioral',
  'API Design': 'API',
  OOD: 'OOD',
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'text-[#00d4aa]',
  Medium: 'text-[#f5a623]',
  Hard: 'text-[#ee5555]',
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
  const topicCounters: Record<Category, number> = { DSA: 0, 'System Design': 0, Behavioral: 0, 'API Design': 0, OOD: 0 }

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

  const daysUntil = interviewDate
    ? getDaysBetween(new Date(), new Date(interviewDate + 'T00:00:00'))
    : 0

  const planType = daysUntil <= 7 ? 'Intensive' : daysUntil <= 14 ? 'Balanced' : 'Comprehensive'

  const ready = company && interviewDate && skillLevel

  if (!mounted) return null

  // ── Plan View ──────────────────────────────────────────────────────

  if (plan && planConfig) {
    return (
      <main className="min-h-screen bg-black text-[#ededed]">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between animate-fadeIn">
            <button
              onClick={() => router.push('/')}
              className="text-[#666666] hover:text-[#ededed] text-sm transition-colors duration-200 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Home
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-[#666666] hover:text-[#ededed] px-3 py-1.5 rounded-md border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              New Plan
            </button>
          </div>

          {/* Plan Summary */}
          <div className="animate-fadeIn space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${COMPANY_DOT_COLORS[planConfig.company] || 'bg-zinc-500'}`} />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {planConfig.company} Prep Plan
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-white/10 text-[#888888]">
                {planType}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#888888]">
              <span>{planConfig.skillLevel}</span>
              <div className="w-px h-4 bg-white/10" />
              <span>{daysUntil} days until interview</span>
              <div className="w-px h-4 bg-white/10" />
              <span>{totalActiveDays} study days</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#888888]">
                {completedCount}/{totalActiveDays} days completed
              </span>
              <span className={`font-medium tabular-nums ${progressPct === 100 ? 'text-[#00d4aa]' : 'text-white'}`}>
                {progressPct}%
              </span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Category distribution */}
          <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            {(['DSA', 'System Design', 'Behavioral'] as Category[]).map(cat => {
              const count = plan.filter(d => !d.isRestDay && d.category === cat).length
              const catCompleted = plan.filter(d => !d.isRestDay && d.category === cat && completedDays.has(d.dayNumber)).length
              return (
                <div
                  key={cat}
                  className="border border-white/10 rounded-lg p-3"
                >
                  <span className="text-xs text-[#888888]">{cat}</span>
                  <p className="text-lg font-semibold text-white tabular-nums mt-1">
                    {catCompleted}<span className="text-[#666666] text-sm">/{count}</span>
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
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'text-[#666666] hover:text-[#ededed] border border-transparent hover:border-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-1.5 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {filteredPlan?.map((day, idx) => {
              const isCompleted = completedDays.has(day.dayNumber)
              const isToday = day.date === formatDate(new Date())

              if (day.isRestDay) {
                return (
                  <div
                    key={day.dayNumber}
                    className="flex items-center gap-4 px-4 py-3 rounded-md border border-white/5"
                  >
                    <div className="w-8 text-xs text-[#666666] font-mono tabular-nums">
                      D{day.dayNumber}
                    </div>
                    <div className="w-px h-5 bg-white/5" />
                    <span className="text-xs text-[#666666]">{formatDisplayDate(day.date)}</span>
                    <span className="text-xs text-[#666666] ml-auto italic">Rest & Review</span>
                  </div>
                )
              }

              return (
                <div
                  key={day.dayNumber}
                  className={`flex items-center gap-4 px-4 py-3 rounded-md border transition-all duration-200 ${
                    isToday
                      ? 'border-white/30 bg-white/[0.03]'
                      : isCompleted
                        ? 'border-white/5'
                        : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDay(day.dayNumber)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-white border-white text-black'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {isCompleted && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {/* Day number */}
                  <div className={`w-8 text-xs font-mono tabular-nums ${isToday ? 'text-white' : 'text-[#666666]'}`}>
                    D{day.dayNumber}
                  </div>

                  <div className="w-px h-5 bg-white/10" />

                  {/* Date */}
                  <span className={`text-xs w-28 flex-shrink-0 ${isToday ? 'text-white font-medium' : 'text-[#666666]'}`}>
                    {formatDisplayDate(day.date)}
                    {isToday && <span className="ml-1.5 text-[10px] text-white/60">TODAY</span>}
                  </span>

                  {/* Category badge */}
                  <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border border-white/10 text-[#888888] flex-shrink-0">
                    {CATEGORY_LABELS[day.category] || day.category}
                  </span>

                  {/* Topic */}
                  <span className={`text-sm flex-1 min-w-0 truncate ${isCompleted ? 'text-[#666666] line-through' : 'text-[#ededed]'}`}>
                    {day.topic}
                  </span>

                  {/* Difficulty */}
                  <span className={`text-[10px] uppercase tracking-wider font-medium flex-shrink-0 ${DIFFICULTY_COLORS[day.difficulty]}`}>
                    {day.difficulty}
                  </span>

                  {/* Start Session */}
                  <button
                    onClick={() => startSession(day)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-all duration-200 flex-shrink-0 ${
                      isCompleted
                        ? 'border-white/5 text-[#666666] hover:border-white/10 hover:text-[#888888]'
                        : 'border-white/10 text-[#888888] hover:text-white hover:border-white/20'
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
    <main className="min-h-screen bg-black text-[#ededed]">
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-16">
        {/* Header */}
        <div className="animate-fadeIn">
          <button
            onClick={() => router.push('/')}
            className="text-[#666666] hover:text-[#ededed] text-sm transition-colors duration-200 mb-10 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>

          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0a0a0a] text-xs text-[#888888]">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              Company-Specific Prep Plans
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Build Your Prep Plan
            </h1>
            <p className="text-[#888888] text-base max-w-md mx-auto leading-relaxed">
              Get a structured, day-by-day study plan tailored to your target company and timeline.
            </p>
          </div>
        </div>

        {/* Step 1: Company */}
        <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[#666666]">01</span>
            <h2 className="text-sm font-medium text-[#ededed]">Target Company</h2>
            {company && <span className="text-xs text-[#666666] ml-auto">{company}</span>}
          </div>
          <div className="space-y-5">
            {COMPANY_GROUPS.map(group => (
              <div key={group.label} className="space-y-2.5">
                <p className="text-[10px] uppercase tracking-widest text-[#666666]">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.companies.map(c => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={`px-3.5 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center gap-2 ${
                        company === c
                          ? 'border-white/40 bg-white/5 text-white'
                          : 'border-white/10 text-[#888888] hover:border-white/20 hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${COMPANY_DOT_COLORS[c] || 'bg-zinc-500'}`} />
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Interview Date */}
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[#666666]">02</span>
            <h2 className="text-sm font-medium text-[#ededed]">Interview Date</h2>
            {interviewDate && (
              <span className="text-xs text-[#666666] ml-auto">
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
              className="w-full px-4 py-3 rounded-md border border-white/10 bg-transparent text-[#ededed] text-sm focus:outline-none focus:border-white/20 transition-all duration-200 [color-scheme:dark]"
            />
          </div>
          {interviewDate && (
            <div className="flex items-center gap-3 text-xs text-[#666666]">
              <span className="px-2.5 py-0.5 rounded-full border border-white/10 text-[#888888]">
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
        <div className="space-y-5 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-widest text-[#666666]">03</span>
            <h2 className="text-sm font-medium text-[#ededed]">Current Skill Level</h2>
            {skillLevel && <span className="text-xs text-[#666666] ml-auto">{skillLevel}</span>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SKILL_LEVELS.map(level => {
              const levelDescs: Record<SkillLevel, string> = {
                Beginner: 'New to coding interviews',
                Intermediate: 'Some interview experience',
                Advanced: 'Experienced candidate',
              }
              return (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                    skillLevel === level
                      ? 'border-white/40 bg-white/5 text-white'
                      : 'border-white/10 text-[#888888] hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <p className={`text-sm font-medium ${skillLevel === level ? 'text-white' : 'text-[#ededed]'}`}>{level}</p>
                  <p className={`text-[11px] mt-0.5 ${skillLevel === level ? 'text-[#888888]' : 'text-[#666666]'}`}>
                    {levelDescs[level]}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Company weight preview */}
        {company && (
          <div className="animate-fadeIn space-y-3" style={{ animationDelay: '0.25s' }}>
            <p className="text-xs text-[#666666]">
              {company} interview focus distribution:
            </p>
            <div className="flex gap-1 h-1 rounded-full overflow-hidden bg-white/5">
              {(['DSA', 'System Design', 'Behavioral'] as Category[]).map(cat => {
                const weight = (COMPANY_WEIGHTS[company] || DEFAULT_WEIGHTS)[cat]
                return (
                  <div
                    key={cat}
                    className="bg-white/30 rounded-full"
                    style={{ width: `${weight * 100}%` }}
                    title={`${cat}: ${Math.round(weight * 100)}%`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[#666666]">
              {(['DSA', 'System Design', 'Behavioral'] as Category[]).map(cat => {
                const weight = (COMPANY_WEIGHTS[company] || DEFAULT_WEIGHTS)[cat]
                return (
                  <span key={cat}>
                    {cat} {Math.round(weight * 100)}%
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleGenerate}
            disabled={!ready}
            className={`w-full py-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              ready
                ? 'bg-white text-black hover:bg-white/90 active:scale-[0.99]'
                : 'bg-[#111111] text-[#666666] cursor-not-allowed border border-white/10'
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
              <span>Select company, date, and skill level</span>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
