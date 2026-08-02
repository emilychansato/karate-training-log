import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTrainingSessions } from './useTrainingSessions'
import { supabase } from '../lib/supabaseClient'

const { mockSession } = vi.hoisted(() => ({
  mockSession: {
    id: 's1',
    title: null,
    date: '2026-08-01',
    type: 'kumite',
    duration_min: 60,
    self_rating: 4,
    notes: 'Good pressure drills',
    improved: ['Timing'],
    struggled: ['Footwork'],
    created_at: '2026-08-01T10:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockSession], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn })),
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }),
      },
    },
  }
})

describe('useTrainingSessions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads sessions on mount', async () => {
    const { result } = renderHook(() => useTrainingSessions())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.sessions).toEqual([mockSession])
    expect(supabase.from).toHaveBeenCalledWith('training_sessions')
  })

  it('createSession inserts a row and returns no error on success', async () => {
    const { result } = renderHook(() => useTrainingSessions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.createSession({
        date: '2026-08-02',
        type: 'kata',
        duration_min: 45,
      })
    })
    expect(response.error).toBeNull()
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', date: '2026-08-02' })
    )
  })
})
