'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { filterQuestions, Question } from '@/lib/questions'

const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'NVIDIA', 'Tesla', 'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Oracle', 'Bloomberg', 'IBM']
const categories = ['DSA', 'System Design', 'Behavioral']
const difficulties = ['Easy', 'Medium', 'Hard']

const difficultyColors: Record<string, string> = {
  Easy: 'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function FrequencyBadge({ frequency }: { frequency: number }) {
  const heat = frequency >= 100 ? 'text-red-400' : frequency >= 60 ? 'text-orange-400' : frequency >= 30 ? 'text-yellow-400' : 'text-gray-400'
  const label = frequency >= 100 ? '🔥 Very Common' : frequency >= 60 ? 'Common' : frequency >= 30 ? 'Moderate' : 'Rare'
  return (
    <span className={`text-xs ${heat}`}>
      {label} · {frequency} reports
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
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <span className="text-gray-600">|</span>
          <h1 className="text-sm font-medium">Question Bank</h1>
        </div>
        <span className="text-xs text-gray-500">{questions.length} questions</span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, topics, tags..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600 transition-colors"
          />

          {/* Filter Chips */}
          <div className="space-y-3">
            {/* Company */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 w-16">Company</span>
              <button
                onClick={() => setSelectedCompany('')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  !selectedCompany ? 'bg-white text-gray-950 border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                All
              </button>
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCompany(selectedCompany === c ? '' : c)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedCompany === c ? 'bg-white text-gray-950 border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 w-16">Category</span>
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  !selectedCategory ? 'bg-white text-gray-950 border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedCategory === c ? 'bg-white text-gray-950 border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 w-16">Difficulty</span>
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  !selectedDifficulty ? 'bg-white text-gray-950 border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                All
              </button>
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedDifficulty === d ? 'bg-white text-gray-950 border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-medium text-white truncate">{q.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColors[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{q.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <FrequencyBadge frequency={q.frequency} />
                    <span className="text-xs text-gray-600">|</span>
                    <div className="flex gap-1.5">
                      {q.company.map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{c}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">|</span>
                    <div className="flex gap-1.5">
                      {q.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startPractice(q)}
                  className="text-xs px-4 py-2 rounded-lg bg-white text-gray-950 font-medium hover:bg-gray-100 transition-colors shrink-0"
                >
                  Practice
                </button>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No questions match your filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
