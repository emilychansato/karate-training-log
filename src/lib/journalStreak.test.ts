import { describe, it, expect } from 'vitest'
import { computeJournalStreak } from './journalStreak'

describe('computeJournalStreak', () => {
  const now = new Date(2026, 7, 6) // Thursday, Aug 6 2026

  it('counts consecutive days ending today when today is checked in', () => {
    const entries = [
      { date: '2026-08-06' },
      { date: '2026-08-05' },
      { date: '2026-08-04' },
    ]
    expect(computeJournalStreak(entries, now)).toBe(3)
  })

  it('still counts the streak as alive if today has no entry yet but yesterday does', () => {
    const entries = [{ date: '2026-08-05' }, { date: '2026-08-04' }]
    expect(computeJournalStreak(entries, now)).toBe(2)
  })

  it('breaks the streak once a full day is missed', () => {
    const entries = [{ date: '2026-08-06' }, { date: '2026-08-04' }] // gap on the 5th
    expect(computeJournalStreak(entries, now)).toBe(1)
  })

  it('returns 0 for no entries', () => {
    expect(computeJournalStreak([], now)).toBe(0)
  })
})
