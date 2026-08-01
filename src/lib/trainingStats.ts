import type { TrainingSession } from '../hooks/useTrainingSessions'

export interface SessionStats {
  totalSessions: number
  hoursThisWeek: number
  intensityPercent: number | null
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

  const ratings = sessions
    .map((s) => s.self_rating)
    .filter((r): r is number => r != null)

  const intensityPercent = ratings.length
    ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length / 5) * 100)
    : null

  return {
    totalSessions: sessions.length,
    hoursThisWeek: Math.round((minutesThisWeek / 60) * 10) / 10,
    intensityPercent,
  }
}
