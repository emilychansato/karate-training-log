import { parseIso, MONTH_NAMES } from './dateFormat'

export interface TimeframeGroup<T> {
  label: string
  items: T[]
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

/** Buckets already-date-sorted items into "Today" / "Yesterday" / "This
 * week" / "Last week" / "[Month Year]" groups, in chronological order.
 * Requires items to already be sorted (all existing hooks order by date),
 * so a single pass in order produces correctly grouped buckets without a
 * second sort. This replaces a flat "spreadsheet row per entry" list with
 * a real timeline rhythm - "how much did I train this week" reads at a
 * glance instead of requiring a manual scan/count. */
export function groupByTimeframe<T>(
  items: T[],
  getDate: (item: T) => string,
  now: Date = new Date()
): TimeframeGroup<T>[] {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisWeekStart = startOfWeek(today)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  function labelFor(dateStr: string): string {
    const d = parseIso(dateStr)
    if (!d) return dateStr
    if (d.getTime() === today.getTime()) return 'Today'
    if (d.getTime() === yesterday.getTime()) return 'Yesterday'
    if (d >= thisWeekStart) return 'This week'
    if (d >= lastWeekStart) return 'Last week'
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }

  const groups: TimeframeGroup<T>[] = []
  const indexByLabel = new Map<string, number>()

  for (const item of items) {
    const label = labelFor(getDate(item))
    const existingIndex = indexByLabel.get(label)
    if (existingIndex === undefined) {
      indexByLabel.set(label, groups.length)
      groups.push({ label, items: [item] })
    } else {
      groups[existingIndex].items.push(item)
    }
  }

  return groups
}
