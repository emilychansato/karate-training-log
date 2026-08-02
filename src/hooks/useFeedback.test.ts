import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFeedback } from './useFeedback'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => {
  const insert = vi.fn().mockResolvedValue({ error: null })
  return {
    supabase: {
      from: vi.fn(() => ({ insert })),
      auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }) },
    },
  }
})

describe('useFeedback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submitFeedback inserts the message scoped to the signed-in user', async () => {
    const { result } = renderHook(() => useFeedback())

    const response = await result.current.submitFeedback('Would love a dark mode toggle')
    expect(response.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('feedback')
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith({
      user_id: 'user-1',
      message: 'Would love a dark mode toggle',
    })
  })
})
