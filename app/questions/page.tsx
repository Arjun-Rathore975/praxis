'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { filterQuestions, Question } from '@/lib/questions'

const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'NVIDIA', 'Tesla', 'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Oracle', 'Bloomberg', 'IBM', 'Databricks', 'Palantir', 'Coinbase', 'Snowflake', 'Figma', 'Notion', 'Cloudflare', 'Datadog']
const categories = ['DSA', 'System Design', 'Behavioral', 'API Design', 'OOD']
const difficulties = ['Easy', 'Medium', 'Hard']

function FrequencyBadge({ frequency }: { frequency: number }) {
  const label = frequency >= 100 ? 'Very Common' : frequency >= 60 ? 'Common' : frequency >= 30 ? 'Moderate' : 'Rare'
  return (
    <span className="text-xs text-[#666666] tabular-nums">
      {label} &middot; {frequency}
    </span>
  )
}

export default function QuestionsPage() {
  const router = useRouter()
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [search, setSearch] = useState('')

  const questions = filterQuestions({
    company: selectedCompany || undefined,
    category: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    search: search || undefined,
  })

  function startPractice(q: Question) {
    const company = q.company[0]
    router.push(`/interview?company=${company}&category=${q.category}&difficulty=${q.difficulty}`)
  }

  return (
    <main className="min-h-screen bg-black text-[#ededed]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-[#666666] hover:text-[#ededed] transition-colors duration-200 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-sm font-medium text-[#ededed]">Question Bank</h1>
        </div>
        <span className="text-xs text-[#666666]">{questions.length} questions</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="mb-10 space-y-5">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, topics, tags..."
            className="w-full bg-transparent border border-white/10 rounded-md px-4 py-3 text-sm text-[#ededed] placeholder-[#666666] outline-none focus:border-white/20 transition-colors duration-200"
          />

          {/* Filter Chips */}
          <div className="space-y-3">
            {/* Company */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-[#666666] w-16">Company</span>
              <button
                onClick={() => setSelectedCompany('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  !selectedCompany ? 'bg-white text-black border-white' : 'border-white/10 text-[#888888] hover:border-white/20'
                }`}
              >
                All
              </button>
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCompany(selectedCompany === c ? '' : c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedCompany === c ? 'bg-white text-black border-white' : 'border-white/10 text-[#888888] hover:border-white/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-[#666666] w-16">Category</span>
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  !selectedCategory ? 'bg-white text-black border-white' : 'border-white/10 text-[#888888] hover:border-white/20'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedCategory === c ? 'bg-white text-black border-white' : 'border-white/10 text-[#888888] hover:border-white/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-[#666666] w-16">Difficulty</span>
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  !selectedDifficulty ? 'bg-white text-black border-white' : 'border-white/10 text-[#888888] hover:border-white/20'
                }`}
              >
                All
              </button>
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedDifficulty === d ? 'bg-white text-black border-white' : 'border-white/10 text-[#888888] hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-white/10 rounded-lg p-4 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-medium text-white truncate">{q.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border border-white/10 ${
                      q.difficulty === 'Easy' ? 'text-[#00d4aa]' : q.difficulty === 'Medium' ? 'text-[#f5a623]' : 'text-[#ee5555]'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[#888888] mb-2 line-clamp-1">{q.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <FrequencyBadge frequency={q.frequency} />
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex gap-1.5">
                      {q.company.map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#888888]">{c}</span>
                      ))}
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex gap-1.5">
                      {q.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#666666]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startPractice(q)}
                  className="text-xs px-4 py-2 rounded-md border border-white/10 text-[#888888] font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-200 shrink-0"
                >
                  Practice
                </button>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#666666] text-sm">No questions match your filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
