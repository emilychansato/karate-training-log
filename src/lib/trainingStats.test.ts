import { describe, it, expect, vi, afterEach } from 'vitest'
import { computeSessionStats } from './trainingStats'
import type { TrainingSession } from '../hooks/useTrainingSessions'

function makeSession(overrides: Partial<TrainingSession>): TrainingSession {
  return {
    id: overrides.id ?? 's1',
    date: '2026-08-01',
    type: 'kumite',
    duration_min: 60,
    self_rating: null,
    notes: null,
    improved: [],
    struggled: [],
    created_at: '2026-08-01T00:00:00Z',
    ...overrides,
  }
}

describe('computeSessionStats', () => {
  afterEach(() => vi.useRealTimers())

  it('counts total sessions', () => {
    const sessions = [makeSession({}), makeSession({ id: 's2' })]
    expect(computeSessionStats(sessions, new Date('2026-08-01')).totalSessions).toBe(2)
  })

  it('sums hours for sessions within the current week (Sun-Sat) only', () => {
    // "now" is Saturday 2026-08-01. Week runs Sun 2026-07-26 - Sat 2026-08-01.
    const sessions = [
      makeSession({ id: 'a', date: '2026-07-26', duration_min: 60 }), // in week (Sunday)
      makeSession({ id: 'b', date: '2026-08-01', duration_min: 90 }), // in week (Saturday)
      makeSession({ id: 'c', date: '2026-07-25', duration_min: 120 }), // last week
      makeSession({ id: 'd', date: '2026-08-02', duration_min: 30 }), // next week
    ]
    expect(computeSessionStats(sessions, new Date('2026-08-01')).hoursThisWeek).toBe(2.5)
  })

  it('computes average intensity as a percentage of the 1-5 rating scale', () => {
    const sessions = [
      makeSession({ id: 'a', self_rating: 5 }),
      makeSession({ id: 'b', self_rating: 3 }),
      makeSession({ id: 'c', self_rating: null }),
    ]
    // average of 5 and 3 = 4, 4/5 = 80%
    expect(computeSessionStats(sessions, new Date('2026-08-01')).intensityPercent).toBe(80)
  })

  it('returns null intensity and 0 hours/sessions for an empty list', () => {
    const stats = computeSessionStats([], new Date('2026-08-01'))
    expect(stats).toEqual({ totalSessions: 0, hoursThisWeek: 0, intensityPercent: null })
  })
})
