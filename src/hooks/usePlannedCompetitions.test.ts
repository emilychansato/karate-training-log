import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePlannedCompetitions } from './usePlannedCompetitions'
import { supabase } from '../lib/supabaseClient'

const { mockPlanned } = vi.hoisted(() => ({
  mockPlanned: {
    id: 'p1',
    event: 'Nationals 2026',
    date: '2026-12-01',
    location: 'Toronto, Canada',
    division: null,
    discipline: null,
    notes: null,
    kind: 'competition',
    source_type: null,
    source_id: null,
    created_at: '2026-08-02T00:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockPlanned], error: null })
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

describe('usePlannedCompetitions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads planned competitions ordered by date', async () => {
    const { result } = renderHook(() => usePlannedCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.planned).toEqual([mockPlanned])
    expect(supabase.from).toHaveBeenCalledWith('planned_competitions')
  })

  it('addPlanned inserts with the signed-in user_id', async () => {
    const { result } = renderHook(() => usePlannedCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.addPlanned({ event: 'Worlds', date: '2027-01-01' })
    })
    expect(response.error).toBeNull()
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', event: 'Worlds' })
    )
  })
})
