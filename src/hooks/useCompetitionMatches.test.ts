import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCompetitionMatches } from './useCompetitionMatches'
import { supabase } from '../lib/supabaseClient'

const { mockMatch } = vi.hoisted(() => ({
  mockMatch: {
    id: 'm1',
    competition_id: 'c1',
    round_label: 'Semifinal',
    opponent_name: 'Sarah Tan',
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
    notes: null,
    created_at: '2026-06-01T10:00:00Z',
    match_techniques: [],
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockMatch], error: null })
  const eqSelect = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq: eqSelect }))
  const single = vi.fn().mockResolvedValue({ data: { id: 'new-match-id' }, error: null })
  const insertSelect = vi.fn(() => ({ single }))
  const matchInsert = vi.fn(() => ({ select: insertSelect }))
  const linkInsert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))

  const from = vi.fn((table: string) => {
    if (table === 'match_techniques') return { insert: linkInsert }
    return { select, insert: matchInsert, delete: deleteFn }
  })

  return {
    supabase: { from },
  }
})

describe('useCompetitionMatches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads matches scoped to the given competition, with favorite techniques flattened', async () => {
    const { result } = renderHook(() => useCompetitionMatches('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.matches).toEqual([{ ...mockMatch, favorite_techniques: [] }])
    expect(supabase.from).toHaveBeenCalledWith('competition_matches')
  })

  it('createMatch inserts with the competition_id and computed points, and returns no error', async () => {
    const { result } = renderHook(() => useCompetitionMatches('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.createMatch({
        opponent_name: 'Jamie Lee',
        my_yuko: 1,
        my_waza_ari: 1,
        my_ippon: 0,
        opponent_yuko: 0,
        opponent_waza_ari: 0,
        opponent_ippon: 1,
      })
    })
    expect(response.error).toBeNull()
    const matchesFrom = vi
      .mocked(supabase.from)
      .mock.results.find((r) => r.value.insert && r.value.select)
    expect(matchesFrom?.value.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        competition_id: 'c1',
        opponent_name: 'Jamie Lee',
        points_for: 3,
        points_against: 3,
      })
    )
  })

  it('createMatch links favoriteTechniqueIds into match_techniques', async () => {
    const { result } = renderHook(() => useCompetitionMatches('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createMatch({ opponent_name: 'Jamie Lee' }, ['t1', 't2'])
    })

    const linkCall = vi.mocked(supabase.from).mock.calls.find((c) => c[0] === 'match_techniques')
    expect(linkCall).toBeTruthy()
  })
})
