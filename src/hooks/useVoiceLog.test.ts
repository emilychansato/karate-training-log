import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useVoiceLog } from './useVoiceLog'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

let lastInstance: MockSpeechRecognition | null = null

class MockSpeechRecognition {
  lang = ''
  interimResults = false
  continuous = false
  onresult: ((event: unknown) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn()
  stop = vi.fn()

  constructor() {
    lastInstance = this
  }
}

describe('useVoiceLog', () => {
  let originalSpeechRecognition: unknown

  beforeEach(() => {
    vi.clearAllMocks()
    originalSpeechRecognition = (window as never as { SpeechRecognition?: unknown })
      .SpeechRecognition
    ;(window as never as { SpeechRecognition: unknown }).SpeechRecognition = MockSpeechRecognition
  })

  afterEach(() => {
    ;(window as never as { SpeechRecognition: unknown }).SpeechRecognition =
      originalSpeechRecognition
  })

  it('reports unsupported when no SpeechRecognition constructor exists', () => {
    ;(window as never as { SpeechRecognition: unknown }).SpeechRecognition = undefined
    const { result } = renderHook(() => useVoiceLog())
    expect(result.current.isSupported).toBe(false)
  })

  it('transcribes then calls parse-voice-log and stores the parsed result', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { type: 'kumite', duration_min: 45, notes: 'Worked footwork drills' },
      error: null,
    } as never)

    const { result } = renderHook(() => useVoiceLog())

    act(() => {
      result.current.start()
    })
    expect(result.current.state).toBe('listening')

    await act(async () => {
      lastInstance?.onresult?.({ results: [[{ transcript: 'kumite for 45 minutes' }]] })
    })

    await waitFor(() => expect(result.current.state).toBe('idle'))
    expect(result.current.parsed).toEqual({
      type: 'kumite',
      duration_min: 45,
      notes: 'Worked footwork drills',
    })
    expect(supabase.functions.invoke).toHaveBeenCalledWith('parse-voice-log', {
      body: { transcript: 'kumite for 45 minutes' },
    })
  })

  it('sets an error state when the edge function returns an error', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'boom' },
    } as never)

    const { result } = renderHook(() => useVoiceLog())
    act(() => {
      result.current.start()
    })

    await act(async () => {
      lastInstance?.onresult?.({ results: [[{ transcript: 'kumite for 45 minutes' }]] })
    })

    await waitFor(() => expect(result.current.state).toBe('error'))
    expect(result.current.error).toBe('boom')
  })

  it('shows an actionable message for a "network" recognition error', async () => {
    const { result } = renderHook(() => useVoiceLog())
    act(() => {
      result.current.start()
    })

    act(() => {
      lastInstance?.onerror?.({ error: 'network' })
    })

    expect(result.current.state).toBe('error')
    expect(result.current.error).toBe(
      'Voice recognition needs an internet connection to reach the speech service - check your connection and try again.'
    )
  })

  it('shows an actionable message for a "not-allowed" recognition error', async () => {
    const { result } = renderHook(() => useVoiceLog())
    act(() => {
      result.current.start()
    })

    act(() => {
      lastInstance?.onerror?.({ error: 'not-allowed' })
    })

    expect(result.current.error).toBe(
      'Microphone access is blocked for this site - check your browser/site settings and try again.'
    )
  })
})
