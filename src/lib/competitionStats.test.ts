import { describe, it, expect } from 'vitest'
import {
  computeOpponentHistory,
  computePersonalRecords,
  computeDivisionHistory,
} from './competitionStats'
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

describe('computeOpponentHistory', () => {
  it('groups kumite matches by opponent, computing record and average points', () => {
    const results = [
      makeResult({
        id: 'r1',
        opponent_name: 'Alex Chen',
        points_for: 5,
        points_against: 2,
      }),
      makeResult({
        id: 'r2',
        opponent_name: 'Alex Chen',
        points_for: 1,
        points_against: 4,
      }),
      makeResult({
        id: 'r3',
        opponent_name: 'Jamie Lee',
        points_for: 3,
        points_against: 3,
      }),
    ]

    const history = computeOpponentHistory(results)

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

  it('ignores kata results, and kumite results missing an opponent name or points', () => {
    const results = [
      makeResult({ discipline: 'kata', opponent_name: 'Alex Chen', points_for: 5, points_against: 2 }),
      makeResult({ opponent_name: null, points_for: 5, points_against: 2 }),
      makeResult({ opponent_name: 'Alex Chen', points_for: null, points_against: 2 }),
    ]

    expect(computeOpponentHistory(results)).toEqual([])
  })
})

describe('computePersonalRecords', () => {
  it('computes the longest kumite win streak in chronological order', () => {
    const results = [
      makeResult({ id: 'a', date: '2026-01-01', points_for: 5, points_against: 2 }), // win
      makeResult({ id: 'b', date: '2026-01-08', points_for: 1, points_against: 4 }), // loss
      makeResult({ id: 'c', date: '2026-01-15', points_for: 5, points_against: 1 }), // win
      makeResult({ id: 'd', date: '2026-01-22', points_for: 6, points_against: 0 }), // win
      makeResult({ id: 'e', date: '2026-01-29', points_for: 3, points_against: 2 }), // win
    ]

    expect(computePersonalRecords(results).longestWinStreak).toBe(3)
  })

  it('finds the highest points scored in a single kumite match', () => {
    const results = [
      makeResult({ points_for: 4, points_against: 1 }),
      makeResult({ points_for: 9, points_against: 3 }),
      makeResult({ points_for: 2, points_against: 0 }),
    ]

    expect(computePersonalRecords(results).highestPointsInMatch).toBe(9)
  })

  it('finds the best kata technical score', () => {
    const results = [
      makeResult({ discipline: 'kata', kata_technical_score: 7.2 }),
      makeResult({ discipline: 'kata', kata_technical_score: 8.6 }),
      makeResult({ discipline: 'kata', kata_technical_score: 8.1 }),
    ]

    expect(computePersonalRecords(results).bestKataTechnicalScore).toBe(8.6)
  })

  it('counts total competitions logged and handles an empty list', () => {
    expect(computePersonalRecords([]).totalCompetitions).toBe(0)
    expect(computePersonalRecords([]).longestWinStreak).toBe(0)
    expect(computePersonalRecords([]).highestPointsInMatch).toBeNull()
    expect(computePersonalRecords([]).bestKataTechnicalScore).toBeNull()

    const results = [makeResult({}), makeResult({ discipline: 'kata' })]
    expect(computePersonalRecords(results).totalCompetitions).toBe(2)
  })
})

describe('computeDivisionHistory', () => {
  it('returns a chronological list of competitions that have a division set', () => {
    const results = [
      makeResult({ id: 'r2', date: '2026-03-01', division: '18-20, -68kg', placement: '2nd' }),
      makeResult({ id: 'r1', date: '2026-01-01', division: '16-17, -63kg', placement: '1st' }),
      makeResult({ id: 'r3', date: '2026-02-01', division: null }),
    ]

    expect(computeDivisionHistory(results)).toEqual([
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
