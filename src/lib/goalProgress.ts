import type { Goal } from '../hooks/useGoals'
import type { TrainingSession } from '../hooks/useTrainingSessions'
import type { WeightLog } from '../hooks/useWeightLogs'
import type { Competition } from '../hooks/useCompetitions'

export interface GoalProgress {
  /** 0-1, clamped. */
  fraction: number
  /** Human-readable current-state label, e.g. "3 of 4 sessions this week". */
  label: string
}

function startOfWeekIso(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function computeTrainingFrequencyProgress(
  goal: Goal,
  sessions: TrainingSession[]
): GoalProgress {
  const target = goal.target_value ?? 1
  const weekStart = startOfWeekIso(new Date())
  // Compare date-only ISO strings lexicographically - avoids UTC-vs-local
  // timezone drift that Date object comparisons hit near midnight.
  const count = sessions.filter((s) => s.date >= weekStart).length
  return {
    fraction: Math.min(1, count / target),
    label: `${count} of ${target} sessions this week`,
  }
}

export function computeWeightProgress(goal: Goal, logs: WeightLog[]): GoalProgress {
  const target = goal.target_value ?? 0
  const latest = logs[0]
  if (!latest) return { fraction: 0, label: 'No weight logged yet' }

  const starting = logs[logs.length - 1].weight_kg
  const totalDistance = Math.abs(starting - target)
  const remaining = Math.abs(latest.weight_kg - target)
  const fraction = totalDistance === 0 ? 1 : Math.min(1, 1 - remaining / totalDistance)

  return {
    fraction: Math.max(0, fraction),
    label: `${latest.weight_kg} kg → ${target} kg target`,
  }
}

export function computeCompetitionPlacementProgress(
  goal: Goal,
  competitions: Competition[]
): GoalProgress {
  const target = goal.competition_id
    ? competitions.find((c) => c.id === goal.competition_id)
    : undefined

  if (!target) return { fraction: 0, label: goal.target_text ?? 'No result yet' }
  if (!target.placement) return { fraction: 0, label: 'Awaiting result' }

  return {
    fraction: 1,
    label: `Placed ${target.placement}`,
  }
}

export function computeRankProgress(goal: Goal, currentRank: string | null): GoalProgress {
  if (!currentRank) return { fraction: 0, label: `Target: ${goal.target_text ?? '—'}` }
  const achieved = goal.target_text ? currentRank.includes(goal.target_text) : false
  return {
    fraction: achieved ? 1 : 0,
    label: achieved ? `Reached ${goal.target_text}` : `Currently ${currentRank}`,
  }
}
