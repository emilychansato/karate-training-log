import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCompetitionResults } from './useCompetitionResults'
import { supabase } from '../lib/supabaseClient'

const { mockResult } = vi.hoisted(() => ({
  mockResult: {
    id: 'c1',
    event: 'BC Open',
    date: '2026-06-01',
    division: 'Senior -55kg',
    placement: '1st',
    discipline: 'kumite',
    kata_technical_score: null,
    kata_athletic_score: null,
    my_yuko: 1,
    my_waza_ari: 1,
    my_ippon: 0,
    opponent_yuko: 0,
    opponent_waza_ari: 0,
    opponent_ippon: 0,
    points_for: 3,
    points_against: 0,
    win_method: 'waza-ari',
    opponent_name: 'Sarah Tan',
    notes: null,
    created_at: '2026-06-01T10:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockResult], error: null })
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

describe('useCompetitionResults', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads results on mount', async () => {
    const { result } = renderHook(() => useCompetitionResults())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.results).toEqual([mockResult])
  })

  it('createResult computes points_for/points_against from the yuko/waza-ari/ippon breakdown', async () => {
    const { result } = renderHook(() => useCompetitionResults())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createResult({
        event: 'Nationals',
        date: '2026-07-01',
        discipline: 'kumite',
        my_yuko: 1,
        my_waza_ari: 1,
        my_ippon: 0,
        opponent_yuko: 0,
        opponent_waza_ari: 0,
        opponent_ippon: 1,
      })
    })

    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', points_for: 3, points_against: 3 })
    )
  })
})
