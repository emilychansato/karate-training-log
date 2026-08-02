import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRankHistory } from './useRankHistory'
import { supabase } from '../lib/supabaseClient'

const { mockRank } = vi.hoisted(() => ({
  mockRank: {
    id: 'r1',
    style: 'Shotokan',
    rank: 'Green Belt (5th Kyu)',
    achieved_date: '2026-06-01',
    notes: null,
    created_at: '2026-06-01T00:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockRank], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn })),
      auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }) },
    },
  }
})

describe('useRankHistory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads rank history ordered by achieved date', async () => {
    const { result } = renderHook(() => useRankHistory())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.history).toEqual([mockRank])
    expect(supabase.from).toHaveBeenCalledWith('rank_history')
  })

  it('addRank inserts scoped to the signed-in user', async () => {
    const { result } = renderHook(() => useRankHistory())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.addRank('Shotokan', 'Brown Belt (2nd Kyu)', '2026-08-01')
    })
    expect(response.error).toBeNull()
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith({
      user_id: 'user-1',
      style: 'Shotokan',
      rank: 'Brown Belt (2nd Kyu)',
      achieved_date: '2026-08-01',
    })
  })
})
