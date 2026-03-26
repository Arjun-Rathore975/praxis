// Skill tree system — tracks mastery progression per topic

import { getHistory } from './storage'

const SKILLS_KEY = 'crucible-skills'

export interface SkillNode {
  id: string
  name: string
  category: string
  level: number // 0-5 (0=locked, 1=beginner, 2=familiar, 3=proficient, 4=advanced, 5=mastered)
  xp: number
  xpToNext: number
  attempts: number
  avgScore: number
  lastPracticed: string | null
}

export interface SkillTree {
  nodes: Record<string, SkillNode>
  totalXP: number
  rank: string
}

const SKILL_DEFINITIONS: { id: string; name: string; category: string }[] = [
  // DSA
  { id: 'arrays', name: 'Arrays & Hashing', category: 'DSA' },
  { id: 'linked-lists', name: 'Linked Lists', category: 'DSA' },
  { id: 'stacks-queues', name: 'Stacks & Queues', category: 'DSA' },
  { id: 'trees', name: 'Trees & BST', category: 'DSA' },
  { id: 'graphs', name: 'Graphs', category: 'DSA' },
  { id: 'dp', name: 'Dynamic Programming', category: 'DSA' },
  { id: 'sorting', name: 'Sorting & Searching', category: 'DSA' },
  { id: 'sliding-window', name: 'Sliding Window', category: 'DSA' },
  { id: 'heaps', name: 'Heaps', category: 'DSA' },
  { id: 'backtracking', name: 'Backtracking', category: 'DSA' },
  // System Design
  { id: 'load-balancing', name: 'Load Balancing', category: 'System Design' },
  { id: 'databases', name: 'Databases & Sharding', category: 'System Design' },
  { id: 'caching', name: 'Caching Strategies', category: 'System Design' },
  { id: 'distributed', name: 'Distributed Systems', category: 'System Design' },
  { id: 'messaging', name: 'Message Queues', category: 'System Design' },
  { id: 'cdn', name: 'CDN & Edge', category: 'System Design' },
  { id: 'microservices', name: 'Microservices', category: 'System Design' },
  // Behavioral
  { id: 'leadership', name: 'Leadership', category: 'Behavioral' },
  { id: 'conflict', name: 'Conflict Resolution', category: 'Behavioral' },
  { id: 'teamwork', name: 'Teamwork', category: 'Behavioral' },
  { id: 'ownership', name: 'Ownership', category: 'Behavioral' },
  { id: 'communication', name: 'Communication', category: 'Behavioral' },
  // API Design
  { id: 'rest', name: 'REST APIs', category: 'API Design' },
  { id: 'graphql', name: 'GraphQL', category: 'API Design' },
  { id: 'auth', name: 'Auth & Security', category: 'API Design' },
  { id: 'pagination', name: 'Pagination', category: 'API Design' },
  // OOD
  { id: 'solid', name: 'SOLID Principles', category: 'OOD' },
  { id: 'patterns', name: 'Design Patterns', category: 'OOD' },
  { id: 'composition', name: 'Composition', category: 'OOD' },
  { id: 'abstraction', name: 'Abstraction', category: 'OOD' },
]

const LEVEL_NAMES = ['Locked', 'Beginner', 'Familiar', 'Proficient', 'Advanced', 'Mastered']
const XP_PER_LEVEL = [0, 50, 150, 300, 500, 800]
const RANK_THRESHOLDS = [
  { xp: 0, rank: 'Novice' },
  { xp: 200, rank: 'Apprentice' },
  { xp: 500, rank: 'Practitioner' },
  { xp: 1000, rank: 'Engineer' },
  { xp: 2000, rank: 'Senior Engineer' },
  { xp: 4000, rank: 'Staff Engineer' },
  { xp: 7000, rank: 'Principal Engineer' },
  { xp: 10000, rank: 'Distinguished Engineer' },
]

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || 'Locked'
}

function createDefaultNode(def: { id: string; name: string; category: string }): SkillNode {
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    level: 0,
    xp: 0,
    xpToNext: XP_PER_LEVEL[1],
    attempts: 0,
    avgScore: 0,
    lastPracticed: null,
  }
}

export function getSkillTree(): SkillTree {
  if (typeof window === 'undefined') {
    return { nodes: {}, totalXP: 0, rank: 'Novice' }
  }

  const raw = localStorage.getItem(SKILLS_KEY)
  let tree: SkillTree

  if (raw) {
    try {
      tree = JSON.parse(raw)
    } catch {
      tree = { nodes: {}, totalXP: 0, rank: 'Novice' }
    }
  } else {
    tree = { nodes: {}, totalXP: 0, rank: 'Novice' }
  }

  // Ensure all skill definitions exist
  for (const def of SKILL_DEFINITIONS) {
    if (!tree.nodes[def.id]) {
      tree.nodes[def.id] = createDefaultNode(def)
    }
  }

  return tree
}

function save(tree: SkillTree): void {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(tree))
}

function getRank(totalXP: number): string {
  let rank = 'Novice'
  for (const t of RANK_THRESHOLDS) {
    if (totalXP >= t.xp) rank = t.rank
  }
  return rank
}

export function addXP(category: string, score: number): void {
  const tree = getSkillTree()

  // Find relevant skill nodes for this category
  const categoryNodes = Object.values(tree.nodes).filter(n => n.category === category)
  if (categoryNodes.length === 0) return

  // Distribute XP to the lowest-level node in this category (focus on weak areas)
  const target = categoryNodes.sort((a, b) => a.xp - b.xp)[0]
  const xpGained = Math.round(score * 10) // 10 XP per score point

  target.xp += xpGained
  target.attempts++
  target.avgScore = Math.round(((target.avgScore * (target.attempts - 1) + score) / target.attempts) * 10) / 10
  target.lastPracticed = new Date().toISOString()

  // Level up check
  while (target.level < 5 && target.xp >= XP_PER_LEVEL[target.level + 1]) {
    target.level++
  }
  target.xpToNext = target.level < 5 ? XP_PER_LEVEL[target.level + 1] - target.xp : 0

  tree.totalXP += xpGained
  tree.rank = getRank(tree.totalXP)

  save(tree)
}

export function getSkillsByCategory(): Record<string, SkillNode[]> {
  const tree = getSkillTree()
  const result: Record<string, SkillNode[]> = {}

  for (const node of Object.values(tree.nodes)) {
    if (!result[node.category]) result[node.category] = []
    result[node.category].push(node)
  }

  return result
}

export function buildSkillTreeFromHistory(): void {
  const history = getHistory()
  if (history.length === 0) return

  // Reset and rebuild from history
  const tree: SkillTree = { nodes: {}, totalXP: 0, rank: 'Novice' }
  for (const def of SKILL_DEFINITIONS) {
    tree.nodes[def.id] = createDefaultNode(def)
  }
  save(tree)

  for (const session of history.reverse()) {
    addXP(session.category, session.scores.overall)
  }
}

export { SKILL_DEFINITIONS, RANK_THRESHOLDS, XP_PER_LEVEL }
