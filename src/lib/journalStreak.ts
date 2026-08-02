import { toIso } from './dateFormat'

/** Consecutive days with a journal entry, counting back from today. A
 * missed *today* doesn't break the streak yet (matches the standard
 * streak UX every journaling app in the research report uses) - it only
 * breaks once a full day passes with no entry. */
export function computeJournalStreak(
  entries: { date: string }[],
  now: Date = new Date()
): number {
  const dates = new Set(entries.map((e) => e.date))
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)

  if (!dates.has(toIso(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (dates.has(toIso(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
