import { describe, it, expect } from 'vitest'
import {
  computeTrainingFrequencyProgress,
  computeWeightProgress,
  computeCompetitionPlacementProgress,
  computeRankProgress,
} from './goalProgress'
import type { Goal } from '../hooks/useGoals'
import type { TrainingSession } from '../hooks/useTrainingSessions'
import type { WeightLog } from '../hooks/useWeightLogs'
import type { Competition } from '../hooks/useCompetitions'

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g1',
    goal_type: 'training_frequency',
    title: 'Test goal',
    target_value: null,
    target_text: null,
    target_date: null,
    competition_id: null,
    status: 'active',
    created_at: '2026-08-01T00:00:00Z',
    achieved_at: null,
    ...overrides,
  }
}

function makeSession(date: string): TrainingSession {
  return {
    id: `s-${date}`,
    title: null,
    date,
    type: 'kumite',
    duration_min: 60,
    self_rating: null,
    notes: null,
    location: null,
    latitude: null,
    longitude: null,
    improved: [],
    struggled: [],
    created_at: `${date}T00:00:00Z`,
  }
}

describe('computeTrainingFrequencyProgress', () => {
  it('counts sessions from this week against the target', () => {
    const now = new Date()
    const todayIso = now.toISOString().slice(0, 10)
    const goal = makeGoal({ goal_type: 'training_frequency', target_value: 4 })
    const sessions = [makeSession(todayIso), makeSession(todayIso)]
    const progress = computeTrainingFrequencyProgress(goal, sessions)
    expect(progress.fraction).toBe(0.5)
    expect(progress.label).toBe('2 of 4 sessions this week')
  })

  it('clamps fraction at 1 when the target is exceeded', () => {
    const todayIso = new Date().toISOString().slice(0, 10)
    const goal = makeGoal({ goal_type: 'training_frequency', target_value: 2 })
    const sessions = [makeSession(todayIso), makeSession(todayIso), makeSession(todayIso)]
    expect(computeTrainingFrequencyProgress(goal, sessions).fraction).toBe(1)
  })
})

describe('computeWeightProgress', () => {
  const logs: WeightLog[] = [
    { id: 'w2', date: '2026-08-01', weight_kg: 58, created_at: '2026-08-01T00:00:00Z' },
    { id: 'w1', date: '2026-07-01', weight_kg: 60, created_at: '2026-07-01T00:00:00Z' },
  ]

  it('computes fraction of distance covered toward the target weight', () => {
    const goal = makeGoal({ goal_type: 'weight', target_value: 55 })
    const progress = computeWeightProgress(goal, logs)
    // starting 60kg, target 55kg (distance 5), latest 58kg (remaining 3) -> covered 2/5
    expect(progress.fraction).toBeCloseTo(0.4)
    expect(progress.label).toBe('58 kg → 55 kg target')
  })

  it('returns 0 with a no-data label when no logs exist', () => {
    const goal = makeGoal({ goal_type: 'weight', target_value: 55 })
    expect(computeWeightProgress(goal, [])).toEqual({ fraction: 0, label: 'No weight logged yet' })
  })
})

describe('computeCompetitionPlacementProgress', () => {
  const competition: Competition = {
    id: 'c1',
    event: 'Provincials',
    date: '2026-08-01',
    division: null,
    discipline: 'kumite',
    placement: '2nd',
    notes: null,
    location: null,
    latitude: null,
    longitude: null,
    rank_at_time: null,
    coach_notes: null,
    what_went_well: null,
    what_to_improve: null,
    post_competition_feelings: null,
    goals_for_next_time: null,
    created_at: '2026-08-01T00:00:00Z',
  }

  it('reports full progress once the linked competition has a placement', () => {
    const goal = makeGoal({ goal_type: 'competition_placement', competition_id: 'c1' })
    expect(computeCompetitionPlacementProgress(goal, [competition])).toEqual({
      fraction: 1,
      label: 'Placed 2nd',
    })
  })

  it('reports awaiting result when the competition has no placement yet', () => {
    const goal = makeGoal({ goal_type: 'competition_placement', competition_id: 'c1' })
    const noPlacement = { ...competition, placement: null }
    expect(computeCompetitionPlacementProgress(goal, [noPlacement]).label).toBe('Awaiting result')
  })
})

describe('computeRankProgress', () => {
  it('reports achieved once the current rank matches the target text', () => {
    const goal = makeGoal({ goal_type: 'rank', target_text: 'Brown Belt' })
    expect(computeRankProgress(goal, 'Brown Belt (1st Kyu)')).toEqual({
      fraction: 1,
      label: 'Reached Brown Belt',
    })
  })

  it('shows current rank when the target has not been reached', () => {
    const goal = makeGoal({ goal_type: 'rank', target_text: 'Brown Belt' })
    expect(computeRankProgress(goal, 'Green Belt')).toEqual({
      fraction: 0,
      label: 'Currently Green Belt',
    })
  })
})
