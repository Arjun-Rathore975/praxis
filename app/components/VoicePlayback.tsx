'use client'

import React from 'react'

// ---------------------------------------------------------------------------
// VoicePlayback — small inline play/pause button shown next to AI messages
// ---------------------------------------------------------------------------

interface VoicePlaybackProps {
  /** The text content of the AI message */
  text: string
  /** Index of this message in the messages array */
  index: number
  /** Index of the message currently being spoken (null if none) */
  speakingIndex: number | null
  /** Toggle play/pause for this message */
  onToggle: (text: string, index: number) => void
}

export function VoicePlayback({
  text,
  index,
  speakingIndex,
  onToggle,
}: VoicePlaybackProps) {
  const isPlaying = speakingIndex === index

  return (
    <button
      type="button"
      onClick={() => onToggle(text, index)}
      className={`
        inline-flex items-center justify-center
        w-7 h-7 rounded-lg transition-all
        ${
          isPlaying
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            : 'bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/60'
        }
      `}
      title={isPlaying ? 'Stop speaking' : 'Read aloud'}
      aria-label={isPlaying ? 'Stop speaking' : 'Read aloud'}
    >
      {isPlaying ? (
        // Pause icon
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        // Speaker icon
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="currentColor" stroke="none" />
          <path d="M11 5.5a3.5 3.5 0 010 5" />
          <path d="M13 3.5a6.5 6.5 0 010 9" />
        </svg>
      )}
    </button>
  )
}

export default VoicePlayback
