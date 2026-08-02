import { describe, it, expect, vi, afterEach } from 'vitest'
import { computeSessionStats } from './trainingStats'
import type { TrainingSession } from '../hooks/useTrainingSessions'

function makeSession(overrides: Partial<TrainingSession>): TrainingSession {
  return {
    id: overrides.id ?? 's1',
    title: null,
    date: '2026-08-01',
    type: 'kumite',
    duration_min: 60,
    self_rating: null,
    notes: null,
    location: null,
    latitude: null,
    longitude: null,
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

  it('computes the change in hours between this month and last month', () => {
    const sessions = [
      makeSession({ id: 'a', date: '2026-08-01', duration_min: 120 }), // this month: 2h
      makeSession({ id: 'b', date: '2026-07-15', duration_min: 60 }), // last month: 1h
    ]
    expect(computeSessionStats(sessions, new Date('2026-08-01')).monthHoursDelta).toBe(1)
  })

  it('returns null monthHoursDelta and 0 hours/sessions for an empty list', () => {
    const stats = computeSessionStats([], new Date('2026-08-01'))
    expect(stats).toEqual({ totalSessions: 0, hoursThisWeek: 0, monthHoursDelta: null })
  })
})
