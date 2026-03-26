'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSkillTree,
  getSkillsByCategory,
  getLevelName,
  buildSkillTreeFromHistory,
  XP_PER_LEVEL,
  RANK_THRESHOLDS,
  type SkillNode,
  type SkillTree,
} from '@/lib/skills'

const levelColors = [
  'border-[var(--border)] text-[var(--text-muted)]',          // 0 Locked
  'border-blue-500/30 text-blue-400 bg-blue-500/5',           // 1 Beginner
  'border-green-500/30 text-green-400 bg-green-500/5',        // 2 Familiar
  'border-yellow-500/30 text-yellow-400 bg-yellow-500/5',     // 3 Proficient
  'border-purple-500/30 text-purple-400 bg-purple-500/5',     // 4 Advanced
  'border-[#00d4aa]/30 text-[#00d4aa] bg-[#00d4aa]/5',       // 5 Mastered
]

const categoryColors: Record<string, string> = {
  DSA: 'text-blue-400',
  'System Design': 'text-purple-400',
  Behavioral: 'text-yellow-400',
  'API Design': 'text-cyan-400',
  OOD: 'text-pink-400',
}

function SkillNodeCard({ node }: { node: SkillNode }) {
  const pct = node.level < 5 && XP_PER_LEVEL[node.level + 1] > 0
    ? Math.min(100, Math.round((node.xp / XP_PER_LEVEL[node.level + 1]) * 100))
    : node.level === 5 ? 100 : 0

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${levelColors[node.level]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{node.name}</span>
        <span className="text-[10px] uppercase tracking-wider opacity-70">
          {getLevelName(node.level)}
        </span>
      </div>

      {/* XP bar */}
      <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-current transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] opacity-60">
        <span>{node.xp} XP</span>
        {node.attempts > 0 && (
          <span>Avg: {node.avgScore}/10 &middot; {node.attempts} sessions</span>
        )}
      </div>
    </div>
  )
}

export default function SkillsPage() {
  const router = useRouter()
  const [tree, setTree] = useState<SkillTree | null>(null)
  const [byCategory, setByCategory] = useState<Record<string, SkillNode[]>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Build from history if no skill data exists
    const existing = getSkillTree()
    if (existing.totalXP === 0) {
      buildSkillTreeFromHistory()
    }
    setTree(getSkillTree())
    setByCategory(getSkillsByCategory())
  }, [])

  if (!mounted || !tree) return null

  const nextRank = RANK_THRESHOLDS.find(r => r.xp > tree.totalXP)
  const currentRankThreshold = [...RANK_THRESHOLDS].reverse().find(r => tree.totalXP >= r.xp)
  const progressToNext = nextRank && currentRankThreshold
    ? Math.round(((tree.totalXP - currentRankThreshold.xp) / (nextRank.xp - currentRankThreshold.xp)) * 100)
    : 100

  const totalNodes = Object.values(tree.nodes).length
  const unlockedNodes = Object.values(tree.nodes).filter(n => n.level > 0).length
  const masteredNodes = Object.values(tree.nodes).filter(n => n.level === 5).length

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <h1 className="text-sm font-medium">Skill Tree</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Rank Card */}
        <div className="border border-[var(--border)] rounded-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Current Rank</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{tree.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Total XP</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">{tree.totalXP}</p>
            </div>
          </div>

          {nextRank && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>{tree.rank}</span>
                <span>{nextRank.rank}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center">
                {nextRank.xp - tree.totalXP} XP to {nextRank.rank}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="border border-[var(--border)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{unlockedNodes}<span className="text-sm text-[var(--text-muted)]">/{totalNodes}</span></p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Skills Unlocked</p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-[#00d4aa]">{masteredNodes}</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Mastered</p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">
              {Object.values(tree.nodes).reduce((sum, n) => sum + n.attempts, 0)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Total Sessions</p>
          </div>
        </div>

        {/* Skill Trees by Category */}
        {Object.entries(byCategory).map(([category, nodes], catIdx) => (
          <div key={category} className="space-y-4 animate-fadeIn" style={{ animationDelay: `${0.15 + catIdx * 0.05}s` }}>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-medium ${categoryColors[category] || 'text-[var(--text-primary)]'}`}>
                {category}
              </h2>
              <span className="text-[10px] text-[var(--text-muted)]">
                {nodes.filter(n => n.level > 0).length}/{nodes.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {nodes.map(node => (
                <SkillNodeCard key={node.id} node={node} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
