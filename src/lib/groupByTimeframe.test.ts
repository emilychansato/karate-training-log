import { describe, it, expect } from 'vitest'
import { groupByTimeframe } from './groupByTimeframe'

describe('groupByTimeframe', () => {
  const now = new Date(2026, 7, 6) // Thursday, Aug 6 2026

  it('buckets today, yesterday, this week, last week, and older months separately', () => {
    const items = [
      { date: '2026-08-06' }, // today
      { date: '2026-08-05' }, // yesterday
      { date: '2026-08-03' }, // this week (Sun Aug 2 - Sat Aug 8)
      { date: '2026-07-28' }, // last week
      { date: '2026-07-10' }, // earlier in July
      { date: '2025-12-01' }, // last year
    ]

    const groups = groupByTimeframe(items, (i) => i.date, now)

    expect(groups.map((g) => g.label)).toEqual([
      'Today',
      'Yesterday',
      'This week',
      'Last week',
      'July 2026',
      'December 2025',
    ])
    expect(groups.every((g) => g.items.length === 1)).toBe(true)
  })

  it('groups multiple items sharing a bucket together, preserving input order', () => {
    const items = [{ date: '2026-08-06' }, { date: '2026-08-06' }, { date: '2026-08-05' }]
    const groups = groupByTimeframe(items, (i) => i.date, now)

    expect(groups).toHaveLength(2)
    expect(groups[0]).toEqual({ label: 'Today', items: [items[0], items[1]] })
    expect(groups[1]).toEqual({ label: 'Yesterday', items: [items[2]] })
  })
})
