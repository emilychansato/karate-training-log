import type { TrainingSession } from '../hooks/useTrainingSessions'

export interface SessionStats {
  totalSessions: number
  hoursThisWeek: number
  monthHoursDelta: number | null
}

function monthHours(sessions: TrainingSession[], year: number, month: number): number {
  const total = sessions
    .filter((s) => {
      const [y, m] = s.date.split('-').map(Number)
      return y === year && m === month + 1
    })
    .reduce((sum, s) => sum + s.duration_min, 0)
  return Math.round((total / 60) * 10) / 10
}

// Date-only strings ("2026-08-01") parse as UTC midnight, so week
// boundaries must be computed in UTC too - mixing UTC parsing with
// local-time mutation shifts the window by a day depending on timezone.
function weekStart(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d
}

function weekEnd(date: Date): Date {
  const start = weekStart(date)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

export function computeSessionStats(sessions: TrainingSession[], now: Date): SessionStats {
  const start = weekStart(now)
  const end = weekEnd(now)

  const minutesThisWeek = sessions
    .filter((s) => {
      const d = new Date(s.date)
      return d >= start && d <= end
    })
    .reduce((sum, s) => sum + s.duration_min, 0)

  const lastMonthDate = new Date(now)
  lastMonthDate.setUTCMonth(lastMonthDate.getUTCMonth() - 1)
  const thisMonthHours = monthHours(sessions, now.getUTCFullYear(), now.getUTCMonth())
  const lastMonthHours = monthHours(
    sessions,
    lastMonthDate.getUTCFullYear(),
    lastMonthDate.getUTCMonth()
  )
  const monthHoursDelta =
    thisMonthHours === 0 && lastMonthHours === 0
      ? null
      : Math.round((thisMonthHours - lastMonthHours) * 10) / 10

  return {
    totalSessions: sessions.length,
    hoursThisWeek: Math.round((minutesThisWeek / 60) * 10) / 10,
    monthHoursDelta,
  }
}
