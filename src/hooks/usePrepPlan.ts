import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type PrepPhase = 'technique_building' | 'pressure_rounds' | 'simulation_matches' | 'taper'

export interface PrepGoal {
  id: string
  discipline: 'kata' | 'kumite' | null
  goal: string
  created_at: string
}

export interface PrepTask {
  id: string
  phase: PrepPhase
  title: string
  done: boolean
  created_at: string
}

export function usePrepPlan(plannedCompetitionId: string) {
  const [goals, setGoals] = useState<PrepGoal[]>([])
  const [tasks, setTasks] = useState<PrepTask[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    // No competition selected yet (e.g. dashboard widget with no upcoming
    // competition) - skip the query entirely rather than filtering on an
    // empty string, which Postgres rejects as an invalid uuid (400).
    if (!plannedCompetitionId) {
      setGoals([])
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const [{ data: goalRows }, { data: taskRows }] = await Promise.all([
      supabase
        .from('prep_goals')
        .select('*')
        .eq('planned_competition_id', plannedCompetitionId)
        .order('created_at', { ascending: true }),
      supabase
        .from('prep_tasks')
        .select('*')
        .eq('planned_competition_id', plannedCompetitionId)
        .order('created_at', { ascending: true }),
    ])
    setGoals((goalRows ?? []) as PrepGoal[])
    setTasks((taskRows ?? []) as PrepTask[])
    setLoading(false)
  }, [plannedCompetitionId])

  useEffect(() => {
    load()
  }, [load])

  async function addGoal(goal: string, discipline?: 'kata' | 'kumite') {
    const { error } = await supabase
      .from('prep_goals')
      .insert({ planned_competition_id: plannedCompetitionId, goal, discipline: discipline ?? null })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeGoal(id: string) {
    const { error } = await supabase.from('prep_goals').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function addTask(phase: PrepPhase, title: string) {
    const { error } = await supabase
      .from('prep_tasks')
      .insert({ planned_competition_id: plannedCompetitionId, phase, title })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function toggleTask(id: string, done: boolean) {
    const { error } = await supabase.from('prep_tasks').update({ done }).eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeTask(id: string) {
    const { error } = await supabase.from('prep_tasks').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { goals, tasks, loading, addGoal, removeGoal, addTask, toggleTask, removeTask }
}
