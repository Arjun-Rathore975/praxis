'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoicePreferences {
  voiceURI: string
  rate: number
  volume: number
}

export interface UseVoicePlaybackReturn {
  /** Whether the browser supports speech synthesis */
  supported: boolean
  /** Whether conversation mode is active (TTS + auto-mic) */
  conversationMode: boolean
  /** Toggle conversation mode on / off */
  toggleConversationMode: () => void
  /** Speak arbitrary text. Returns a promise that resolves when speech ends. */
  speak: (text: string) => Promise<void>
  /** Stop any in-progress speech */
  stop: () => void
  /** Whether the synthesiser is currently speaking */
  isSpeaking: boolean
  /** The message index currently being spoken (null if none) */
  speakingIndex: number | null
  /** Play/pause a specific message by index */
  toggleMessage: (text: string, index: number) => void
  /** Available system voices */
  voices: SpeechSynthesisVoice[]
  /** Current voice preferences */
  preferences: VoicePreferences
  /** Update a single preference key */
  setPreference: <K extends keyof VoicePreferences>(key: K, value: VoicePreferences[K]) => void
  /** Whether settings panel is open */
  settingsOpen: boolean
  /** Toggle settings panel */
  toggleSettings: () => void
  /** Callback to wire up: called when TTS finishes and conversation mode is on */
  onSpeechEnd: React.MutableRefObject<(() => void) | null>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'praxis-voice-preferences'
const PREFERRED_VOICES = [
  'Samantha',
  'Daniel',
  'Google UK English Female',
  'Google UK English Male',
  'Google US English',
  'Microsoft David',
  'Microsoft Zira',
]

function getDefaultPreferences(): VoicePreferences {
  return { voiceURI: '', rate: 1, volume: 1 }
}

function loadPreferences(): VoicePreferences {
  if (typeof window === 'undefined') return getDefaultPreferences()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<VoicePreferences>
      return {
        voiceURI: parsed.voiceURI ?? '',
        rate: parsed.rate ?? 1,
        volume: parsed.volume ?? 1,
      }
    }
  } catch {
    // ignore
  }
  return getDefaultPreferences()
}

function savePreferences(prefs: VoicePreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Pick the best default voice
// ---------------------------------------------------------------------------

function pickBestVoice(voices: SpeechSynthesisVoice[], savedURI: string): string {
  // If the saved voice still exists, keep it
  if (savedURI && voices.some((v) => v.voiceURI === savedURI)) return savedURI

  // Try preferred voices
  for (const name of PREFERRED_VOICES) {
    const match = voices.find(
      (v) => v.name.includes(name) && v.lang.startsWith('en'),
    )
    if (match) return match.voiceURI
  }

  // Fall back to any English voice
  const english = voices.find((v) => v.lang.startsWith('en'))
  if (english) return english.voiceURI

  // Last resort
  return voices[0]?.voiceURI ?? ''
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVoicePlayback(): UseVoicePlaybackReturn {
  const [supported, setSupported] = useState(false)
  const [conversationMode, setConversationMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [preferences, setPreferences] = useState<VoicePreferences>(getDefaultPreferences)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const onSpeechEnd = useRef<(() => void) | null>(null)

  // ------ Initialise speech synthesis & load voices ------
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const synth = window.speechSynthesis
    synthRef.current = synth
    setSupported(true)

    const loadVoices = () => {
      const available = synth.getVoices()
      if (available.length === 0) return
      setVoices(available)
      setPreferences((prev) => {
        const best = pickBestVoice(available, prev.voiceURI)
        if (best !== prev.voiceURI) {
          const next = { ...prev, voiceURI: best }
          savePreferences(next)
          return next
        }
        return prev
      })
    }

    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)

    // Load saved preferences once
    const saved = loadPreferences()
    setPreferences(saved)

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // ------ Persist preferences on change ------
  const setPreference = useCallback(
    <K extends keyof VoicePreferences>(key: K, value: VoicePreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value }
        savePreferences(next)
        return next
      })
    },
    [],
  )

  // ------ Core speak function ------
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise<void>((resolve) => {
        const synth = synthRef.current
        if (!synth) {
          resolve()
          return
        }

        // Cancel any current speech
        synth.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utteranceRef.current = utterance

        // Apply preferences
        const voice = voices.find((v) => v.voiceURI === preferences.voiceURI)
        if (voice) utterance.voice = voice
        utterance.rate = preferences.rate
        utterance.volume = preferences.volume
        utterance.lang = 'en-US'

        utterance.onstart = () => setIsSpeaking(true)

        utterance.onend = () => {
          setIsSpeaking(false)
          setSpeakingIndex(null)
          utteranceRef.current = null
          onSpeechEnd.current?.()
          resolve()
        }

        utterance.onerror = (e) => {
          // "interrupted" or "canceled" are expected when we call stop()
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('Speech synthesis error:', e.error)
          }
          setIsSpeaking(false)
          setSpeakingIndex(null)
          utteranceRef.current = null
          resolve()
        }

        synth.speak(utterance)

        // Chrome bug workaround: speech can pause after ~15s.
        // Periodically call resume() to keep it going.
        const keepAlive = setInterval(() => {
          if (synth.speaking) {
            synth.resume()
          } else {
            clearInterval(keepAlive)
          }
        }, 10000)

        utterance.onend = () => {
          clearInterval(keepAlive)
          setIsSpeaking(false)
          setSpeakingIndex(null)
          utteranceRef.current = null
          onSpeechEnd.current?.()
          resolve()
        }

        utterance.onerror = (e) => {
          clearInterval(keepAlive)
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('Speech synthesis error:', e.error)
          }
          setIsSpeaking(false)
          setSpeakingIndex(null)
          utteranceRef.current = null
          resolve()
        }
      })
    },
    [voices, preferences],
  )

  // ------ Stop ------
  const stop = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
    setSpeakingIndex(null)
    utteranceRef.current = null
  }, [])

  // ------ Toggle a specific message ------
  const toggleMessage = useCallback(
    (text: string, index: number) => {
      if (speakingIndex === index) {
        stop()
        return
      }
      setSpeakingIndex(index)
      speak(text)
    },
    [speakingIndex, stop, speak],
  )

  // ------ Toggle conversation mode ------
  const toggleConversationMode = useCallback(() => {
    setConversationMode((prev) => {
      const next = !prev
      if (!next) {
        // Turning off — stop any speech
        stop()
      }
      return next
    })
  }, [stop])

  // ------ Cleanup on unmount ------
  useEffect(() => {
    return () => {
      synthRef.current?.cancel()
    }
  }, [])

  return {
    supported,
    conversationMode,
    toggleConversationMode,
    speak,
    stop,
    isSpeaking,
    speakingIndex,
    toggleMessage,
    voices,
    preferences,
    setPreference,
    settingsOpen,
    toggleSettings: useCallback(() => setSettingsOpen((o) => !o), []),
    onSpeechEnd,
  }
}
