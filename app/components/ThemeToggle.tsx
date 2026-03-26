'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('praxis-theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('praxis-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-md border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
          <circle cx="8" cy="8" r="3.5" />
          <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.3 3.3l.7.7M12 12l.7.7M3.3 12.7l.7-.7M12 4l.7-.7" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M13.5 10.3A6 6 0 015.7 2.5 6 6 0 1013.5 10.3z" />
        </svg>
      )}
    </button>
  )
}
