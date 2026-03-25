'use client'

import React from 'react'
import type { VoicePreferences } from '../hooks/useVoicePlayback'

// ---------------------------------------------------------------------------
// VoiceSettings — collapsible panel for voice selection, speed, volume
// ---------------------------------------------------------------------------

interface VoiceSettingsProps {
  voices: SpeechSynthesisVoice[]
  preferences: VoicePreferences
  setPreference: <K extends keyof VoicePreferences>(
    key: K,
    value: VoicePreferences[K],
  ) => void
  onClose: () => void
}

export function VoiceSettings({
  voices,
  preferences,
  setPreference,
  onClose,
}: VoiceSettingsProps) {
  // Only show English voices, sorted with preferred ones first
  const englishVoices = voices
    .filter((v) => v.lang.startsWith('en'))
    .sort((a, b) => {
      const aScore = a.name.includes('Google') || a.name.includes('Samantha') || a.name.includes('Daniel') ? -1 : 0
      const bScore = b.name.includes('Google') || b.name.includes('Samantha') || b.name.includes('Daniel') ? -1 : 0
      return aScore - bScore || a.name.localeCompare(b.name)
    })

  // Fall back to all voices if no English ones found
  const displayVoices = englishVoices.length > 0 ? englishVoices : voices

  return (
    <div className="w-72 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Voice Settings
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      {/* Voice Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-zinc-500 block">Voice</label>
        <select
          value={preferences.voiceURI}
          onChange={(e) => setPreference('voiceURI', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-zinc-600 transition-colors"
        >
          {displayVoices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Speed Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-zinc-500">Speed</label>
          <span className="text-[11px] text-zinc-600 tabular-nums">
            {preferences.rate.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={preferences.rate}
          onChange={(e) => setPreference('rate', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
          "
        />
      </div>

      {/* Volume Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-zinc-500">Volume</label>
          <span className="text-[11px] text-zinc-600 tabular-nums">
            {Math.round(preferences.volume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={preferences.volume}
          onChange={(e) => setPreference('volume', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
          "
        />
      </div>
    </div>
  )
}

export default VoiceSettings
