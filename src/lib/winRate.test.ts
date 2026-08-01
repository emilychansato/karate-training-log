import { describe, it, expect } from 'vitest'
import { computeWinRate } from './winRate'
import type { CompetitionResult } from '../hooks/useCompetitionResults'

function makeResult(overrides: Partial<CompetitionResult>): CompetitionResult {
  return {
    id: overrides.id ?? 'r1',
    event: 'Test Open',
    date: '2026-01-01',
    division: null,
    placement: null,
    discipline: 'kumite',
    kata_technical_score: null,
    kata_athletic_score: null,
    my_yuko: 0,
    my_waza_ari: 0,
    my_ippon: 0,
    opponent_yuko: 0,
    opponent_waza_ari: 0,
    opponent_ippon: 0,
    points_for: null,
    points_against: null,
    win_method: null,
    opponent_name: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('computeWinRate', () => {
  it('computes wins, losses, draws, and win rate percent from scored kumite matches', () => {
    const results = [
      makeResult({ id: 'a', points_for: 5, points_against: 2 }), // win
      makeResult({ id: 'b', points_for: 1, points_against: 4 }), // loss
      makeResult({ id: 'c', points_for: 5, points_against: 1 }), // win
      makeResult({ id: 'd', points_for: 3, points_against: 3 }), // draw
    ]

    expect(computeWinRate(results)).toEqual({
      wins: 2,
      losses: 1,
      draws: 1,
      totalMatches: 4,
      winRatePercent: 50,
    })
  })

  it('ignores kata results and matches missing a score', () => {
    const results = [
      makeResult({ discipline: 'kata', points_for: 5, points_against: 2 }),
      makeResult({ points_for: null, points_against: 2 }),
    ]

    expect(computeWinRate(results).totalMatches).toBe(0)
  })

  it('returns 0% win rate for an empty match list, not NaN', () => {
    expect(computeWinRate([]).winRatePercent).toBe(0)
  })
})
