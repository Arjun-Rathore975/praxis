'use client'

import React from 'react'
import { VoiceSettings } from './VoiceSettings'
import type { UseVoicePlaybackReturn } from '../hooks/useVoicePlayback'

// ---------------------------------------------------------------------------
// ConversationMode — toggle button + collapsible voice settings panel
//
// Drop this into the interview header or input bar. When toggled on it
// enables both TTS output and auto-mic (hands-free conversation loop).
// ---------------------------------------------------------------------------

interface ConversationModeProps {
  /** The full return value from useVoicePlayback */
  voice: UseVoicePlaybackReturn
  /** Whether the component should be visible (e.g. only after interview starts) */
  visible?: boolean
}

export function ConversationMode({ voice, visible = true }: ConversationModeProps) {
  if (!visible || !voice.supported) return null

  return (
    <div className="relative">
      {/* ---- Toggle Button ---- */}
      <button
        type="button"
        onClick={voice.toggleConversationMode}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
          border transition-all duration-200 select-none
          ${
            voice.conversationMode
              ? 'border-white/30 bg-white/5 text-white'
              : 'border-white/10 text-[#666666] hover:text-[#ededed] hover:border-white/20'
          }
        `}
        title={
          voice.conversationMode
            ? 'Disable Conversation Mode'
            : 'Enable Conversation Mode (voice in + out)'
        }
      >
        {/* Headphone / conversation icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 8a6 6 0 1112 0" />
          <path d="M2 8v4a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H2zM14 8v4a1 1 0 01-1 1h-1a1 1 0 01-1-1V9a1 1 0 011-1h2z" />
        </svg>
        <span>Conversation Mode</span>

        {/* Active indicator dot */}
        {voice.conversationMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
        )}
      </button>

      {/* ---- Settings gear (only visible when conversation mode is on) ---- */}
      {voice.conversationMode && (
        <button
          type="button"
          onClick={voice.toggleSettings}
          className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-[#666666] hover:text-[#ededed] transition-colors duration-200"
          title="Voice settings"
        >
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
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
          </svg>
        </button>
      )}

      {/* ---- Collapsible settings panel ---- */}
      {voice.conversationMode && voice.settingsOpen && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <VoiceSettings
            voices={voice.voices}
            preferences={voice.preferences}
            setPreference={voice.setPreference}
            onClose={voice.toggleSettings}
          />
        </div>
      )}
    </div>
  )
}

export default ConversationMode
