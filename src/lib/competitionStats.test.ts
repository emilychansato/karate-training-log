import { describe, it, expect } from 'vitest'
import {
  computeOpponentHistory,
  computePersonalRecords,
  computeWinStreakMatches,
  computeDivisionHistory,
  type CompetitionMatchRecord,
} from './competitionStats'

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

describe('computeOpponentHistory', () => {
  it('groups kumite matches by opponent, computing record and average points', () => {
    const matches = [
      makeMatch({ matchId: 'r1', opponent_name: 'Alex Chen', points_for: 5, points_against: 2 }),
      makeMatch({ matchId: 'r2', opponent_name: 'Alex Chen', points_for: 1, points_against: 4 }),
      makeMatch({ matchId: 'r3', opponent_name: 'Jamie Lee', points_for: 3, points_against: 3 }),
    ]

    const history = computeOpponentHistory(matches)

    expect(history).toEqual(
      expect.arrayContaining([
        {
          opponentName: 'Alex Chen',
          matches: 2,
          wins: 1,
          losses: 1,
          draws: 0,
          avgPointsFor: 3,
          avgPointsAgainst: 3,
        },
        {
          opponentName: 'Jamie Lee',
          matches: 1,
          wins: 0,
          losses: 0,
          draws: 1,
          avgPointsFor: 3,
          avgPointsAgainst: 3,
        },
      ])
    )
  })

  it('ignores kata matches, and kumite matches missing an opponent name or points', () => {
    const matches = [
      makeMatch({ discipline: 'kata', opponent_name: 'Alex Chen', points_for: 5, points_against: 2 }),
      makeMatch({ opponent_name: null, points_for: 5, points_against: 2 }),
      makeMatch({ opponent_name: 'Alex Chen', points_for: null, points_against: 2 }),
    ]

    expect(computeOpponentHistory(matches)).toEqual([])
  })
})

describe('computePersonalRecords', () => {
  it('computes the longest kumite win streak in chronological order', () => {
    const matches = [
      makeMatch({ matchId: 'a', date: '2026-01-01', points_for: 5, points_against: 2 }), // win
      makeMatch({ matchId: 'b', date: '2026-01-08', points_for: 1, points_against: 4 }), // loss
      makeMatch({ matchId: 'c', date: '2026-01-15', points_for: 5, points_against: 1 }), // win
      makeMatch({ matchId: 'd', date: '2026-01-22', points_for: 6, points_against: 0 }), // win
      makeMatch({ matchId: 'e', date: '2026-01-29', points_for: 3, points_against: 2 }), // win
    ]

    expect(computePersonalRecords(matches, 5).longestWinStreak).toBe(3)
  })

  it('finds the highest points scored in a single kumite match', () => {
    const matches = [
      makeMatch({ points_for: 4, points_against: 1 }),
      makeMatch({ points_for: 9, points_against: 3 }),
      makeMatch({ points_for: 2, points_against: 0 }),
    ]

    expect(computePersonalRecords(matches, 3).highestPointsInMatch).toBe(9)
  })

  it('finds the best kata technical score', () => {
    const matches = [
      makeMatch({ discipline: 'kata', kata_technical_score: 7.2 }),
      makeMatch({ discipline: 'kata', kata_technical_score: 8.6 }),
      makeMatch({ discipline: 'kata', kata_technical_score: 8.1 }),
    ]

    expect(computePersonalRecords(matches, 3).bestKataTechnicalScore).toBe(8.6)
  })

  it('takes totalCompetitions as given and handles an empty list', () => {
    expect(computePersonalRecords([], 0).totalCompetitions).toBe(0)
    expect(computePersonalRecords([], 0).longestWinStreak).toBe(0)
    expect(computePersonalRecords([], 0).highestPointsInMatch).toBeNull()
    expect(computePersonalRecords([], 0).bestKataTechnicalScore).toBeNull()

    expect(computePersonalRecords([], 2).totalCompetitions).toBe(2)
  })
})

describe('computeWinStreakMatches', () => {
  it('returns the matches making up the longest streak, chronologically', () => {
    const matches = [
      makeMatch({ matchId: 'm1', date: '2026-01-01', points_for: 5, points_against: 2 }),
      makeMatch({ matchId: 'm2', date: '2026-01-02', points_for: 1, points_against: 4 }),
      makeMatch({ matchId: 'm3', date: '2026-01-03', points_for: 3, points_against: 1 }),
      makeMatch({ matchId: 'm4', date: '2026-01-04', points_for: 2, points_against: 1 }),
      makeMatch({ matchId: 'm5', date: '2026-01-05', points_for: 4, points_against: 0 }),
    ]

    const streak = computeWinStreakMatches(matches)
    expect(streak.map((m) => m.matchId)).toEqual(['m3', 'm4', 'm5'])
  })

  it('returns an empty list when there are no wins', () => {
    expect(computeWinStreakMatches([])).toEqual([])
  })
})

describe('computeDivisionHistory', () => {
  it('returns a chronological list of competitions that have a division set', () => {
    const competitions = [
      { division: '18-20, -68kg', date: '2026-03-01', discipline: 'kumite' as const, placement: '2nd' },
      { division: '16-17, -63kg', date: '2026-01-01', discipline: 'kumite' as const, placement: '1st' },
      { division: null, date: '2026-02-01', discipline: 'kumite' as const, placement: null },
    ]

    expect(computeDivisionHistory(competitions)).toEqual([
      {
        division: '16-17, -63kg',
        date: '2026-01-01',
        discipline: 'kumite',
        placement: '1st',
      },
      {
        division: '18-20, -68kg',
        date: '2026-03-01',
        discipline: 'kumite',
        placement: '2nd',
      },
    ])
  })
})
