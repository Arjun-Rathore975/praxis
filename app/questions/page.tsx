'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { filterQuestions, Question } from '@/lib/questions'
import { isBookmarked, toggleBookmark, getBookmarks } from '@/lib/bookmarks'
import { ThemeToggle } from '@/app/components'

const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'NVIDIA', 'Tesla', 'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Oracle', 'Bloomberg', 'IBM', 'Databricks', 'Palantir', 'Coinbase', 'Snowflake', 'Figma', 'Notion', 'Cloudflare', 'Datadog']
const categories = ['DSA', 'System Design', 'Behavioral', 'API Design', 'OOD']
const difficulties = ['Easy', 'Medium', 'Hard']

function FrequencyBadge({ frequency, company }: { frequency: number; company: string[] }) {
  const label = frequency >= 100 ? 'Very Common' : frequency >= 60 ? 'Common' : frequency >= 30 ? 'Moderate' : 'Rare'
  const color = frequency >= 100 ? 'text-[var(--accent-green)]' : frequency >= 60 ? 'text-[var(--accent-yellow)]' : 'text-[var(--text-muted)]'
  return (
    <span className={`text-xs tabular-nums ${color}`}>
      Asked {frequency}x at {company[0]}{company.length > 1 ? ` +${company.length - 1}` : ''}
    </span>
  )
}

function BookmarkButton({ questionId, onToggle }: { questionId: string; onToggle: () => void }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(questionId))
  }, [questionId])

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const nowSaved = toggleBookmark(questionId)
    setSaved(nowSaved)
    onToggle()
  }

  return (
    <button
      onClick={handleClick}
      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 ${
        saved
          ? 'text-[var(--accent-red)] hover:text-[var(--accent-red)]/70'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
      }`}
      title={saved ? 'Remove bookmark' : 'Bookmark this question'}
    >
      {saved ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z"/></svg>
      )}
    </button>
  )
}

function QuestionsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const showBookmarksParam = params.get('bookmarks') === 'true'

  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showBookmarks, setShowBookmarks] = useState(showBookmarksParam)
  const [bookmarkRefresh, setBookmarkRefresh] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const allQuestions = filterQuestions({
    company: selectedCompany || undefined,
    category: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    search: search || undefined,
  })

  // Filter to bookmarked only if toggle is on
  const bookmarkedIds = mounted ? new Set(getBookmarks().map(b => b.questionId)) : new Set<string>()
  const questions = showBookmarks
    ? allQuestions.filter(q => bookmarkedIds.has(q.id))
    : allQuestions

  function startPractice(q: Question) {
    const company = q.company[0]
    router.push(`/interview?company=${company}&category=${q.category}&difficulty=${q.difficulty}`)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <h1 className="text-sm font-medium">Question Bank</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">{questions.length} questions</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="mb-10 space-y-5">
          {/* Search + Bookmarks toggle */}
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, topics, tags..."
              className="flex-1 bg-transparent border border-[var(--border)] rounded-md px-4 py-3 text-sm placeholder-[var(--text-muted)] outline-none focus:border-[var(--border-hover)] transition-colors duration-200"
            />
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                showBookmarks
                  ? 'border-[var(--accent-red)]/30 text-[var(--accent-red)] bg-[var(--accent-red)]/5'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill={showBookmarks ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2"><path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z"/></svg>
              Saved ({bookmarkedIds.size})
            </button>
          </div>

          {/* Filter Chips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] w-16">Company</span>
              <button
                onClick={() => setSelectedCompany('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  !selectedCompany ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >All</button>
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCompany(selectedCompany === c ? '' : c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedCompany === c ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >{c}</button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] w-16">Category</span>
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  !selectedCategory ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >All</button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedCategory === c ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >{c}</button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] w-16">Difficulty</span>
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  !selectedDifficulty ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >All</button>
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedDifficulty === d ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >{d}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-medium truncate">{q.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] ${
                      q.difficulty === 'Easy' ? 'text-[var(--accent-green)]' : q.difficulty === 'Medium' ? 'text-[var(--accent-yellow)]' : 'text-[var(--accent-red)]'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-1">{q.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <FrequencyBadge frequency={q.frequency} company={q.company} />
                    <div className="w-px h-3 bg-[var(--border)]" />
                    <div className="flex gap-1.5">
                      {q.company.map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]">{c}</span>
                      ))}
                    </div>
                    <div className="w-px h-3 bg-[var(--border)]" />
                    <div className="flex gap-1.5">
                      {q.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {mounted && (
                    <BookmarkButton
                      questionId={q.id}
                      onToggle={() => setBookmarkRefresh(prev => prev + 1)}
                    />
                  )}
                  <button
                    onClick={() => startPractice(q)}
                    className="text-xs px-4 py-2 rounded-md border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--btn-primary-bg)] hover:text-[var(--btn-primary-text)] hover:border-transparent transition-all duration-200"
                  >
                    Practice
                  </button>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[var(--text-muted)] text-sm">
                {showBookmarks ? 'No bookmarked questions yet. Browse and save some!' : 'No questions match your filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function QuestionsPage() {
  return (
    <Suspense>
      <QuestionsContent />
    </Suspense>
  )
}
