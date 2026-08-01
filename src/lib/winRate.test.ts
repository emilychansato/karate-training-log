import { describe, it, expect } from 'vitest'
import { computeWinRate } from './winRate'
import type { CompetitionMatchRecord } from './competitionStats'

function makeMatch(overrides: Partial<CompetitionMatchRecord>): CompetitionMatchRecord {
  return {
    competitionId: overrides.competitionId ?? 'comp1',
    matchId: overrides.matchId ?? 'match1',
    event: 'Test Open',
    date: '2026-01-01',
    division: null,
    placement: null,
    discipline: 'kumite',
    kata_technical_score: null,
    opponent_name: null,
    points_for: null,
    points_against: null,
    ...overrides,
  }
}

describe('computeWinRate', () => {
  it('computes wins, losses, draws, and win rate percent from scored kumite matches', () => {
    const matches = [
      makeMatch({ matchId: 'a', points_for: 5, points_against: 2 }), // win
      makeMatch({ matchId: 'b', points_for: 1, points_against: 4 }), // loss
      makeMatch({ matchId: 'c', points_for: 5, points_against: 1 }), // win
      makeMatch({ matchId: 'd', points_for: 3, points_against: 3 }), // draw
    ]

    expect(computeWinRate(matches)).toEqual({
      wins: 2,
      losses: 1,
      draws: 1,
      totalMatches: 4,
      winRatePercent: 50,
    })
  })

  it('ignores kata matches and matches missing a score', () => {
    const matches = [
      makeMatch({ discipline: 'kata', points_for: 5, points_against: 2 }),
      makeMatch({ points_for: null, points_against: 2 }),
    ]

    expect(computeWinRate(matches).totalMatches).toBe(0)
  })

  it('returns 0% win rate for an empty match list, not NaN', () => {
    expect(computeWinRate([]).winRatePercent).toBe(0)
  })
})
