import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useResourcesAssistant } from './useResourcesAssistant'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => {
  const invoke = vi.fn().mockResolvedValue({
    data: {
      answer: 'A yuko is worth 1 point.',
      sources: [{ title: 'WKF Kumite Competition Rules 2026', url: 'https://example.com/kumite.pdf' }],
    },
    error: null,
  })
  return { supabase: { functions: { invoke } } }
})

describe('useResourcesAssistant', () => {
  beforeEach(() => vi.clearAllMocks())

  it('asks the ask-resources function and appends the answer to history', async () => {
    const { result } = renderHook(() => useResourcesAssistant())

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.ask('How many points is a yuko?')
    })

    expect(response.error).toBeNull()
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ask-resources', {
      body: { question: 'How many points is a yuko?' },
    })
    await waitFor(() => expect(result.current.history).toHaveLength(1))
    expect(result.current.history[0]).toEqual({
      question: 'How many points is a yuko?',
      answer: 'A yuko is worth 1 point.',
      sources: [{ title: 'WKF Kumite Competition Rules 2026', url: 'https://example.com/kumite.pdf' }],
    })
  })

  it('returns an error and does not add to history when the function errors', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: 'OPENAI_API_KEY not configured' },
    })
    const { result } = renderHook(() => useResourcesAssistant())

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.ask('anything')
    })

    expect(response.error).toBe('OPENAI_API_KEY not configured')
    expect(result.current.history).toHaveLength(0)
  })
})
