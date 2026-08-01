import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCompetitionStats } from './useCompetitionStats'
import { supabase } from '../lib/supabaseClient'

const { mockRow } = vi.hoisted(() => ({
  mockRow: {
    id: 'c1',
    event: 'BC Open',
    date: '2026-06-01',
    division: 'Senior -55kg',
    discipline: 'kumite',
    placement: '1st',
    notes: null,
    competition_matches: [
      {
        id: 'm1',
        opponent_name: 'Alex Chen',
        kata_technical_score: null,
        points_for: 5,
        points_against: 2,
      },
      {
        id: 'm2',
        opponent_name: 'Jamie Lee',
        kata_technical_score: null,
        points_for: 1,
        points_against: 4,
      },
    ],
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockRow], error: null })
  const select = vi.fn(() => ({ order }))
  return {
    supabase: {
      from: vi.fn(() => ({ select })),
    },
  }
})

describe('useCompetitionStats', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches competitions joined with their matches and flattens for the stats functions', async () => {
    const { result } = renderHook(() => useCompetitionStats())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(supabase.from).toHaveBeenCalledWith('competitions')
    expect(result.current.records.totalCompetitions).toBe(1)
    expect(result.current.opponents).toHaveLength(2)
    expect(result.current.divisionHistory).toEqual([
      { division: 'Senior -55kg', date: '2026-06-01', discipline: 'kumite', placement: '1st' },
    ])
  })
})
