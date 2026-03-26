// Bookmark system for saving questions to revisit later

const BOOKMARK_KEY = 'praxis-bookmarks'

export interface Bookmark {
  questionId: string
  addedAt: string
  note?: string
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(BOOKMARK_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function addBookmark(questionId: string, note?: string): void {
  const bookmarks = getBookmarks()
  if (bookmarks.some(b => b.questionId === questionId)) return
  bookmarks.unshift({ questionId, addedAt: new Date().toISOString(), note })
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks))
}

export function removeBookmark(questionId: string): void {
  const bookmarks = getBookmarks().filter(b => b.questionId !== questionId)
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks))
}

export function isBookmarked(questionId: string): boolean {
  return getBookmarks().some(b => b.questionId === questionId)
}

export function toggleBookmark(questionId: string): boolean {
  if (isBookmarked(questionId)) {
    removeBookmark(questionId)
    return false
  } else {
    addBookmark(questionId)
    return true
  }
}

export function getBookmarkCount(): number {
  return getBookmarks().length
}
