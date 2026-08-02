import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export type GoalType = 'training_frequency' | 'weight' | 'competition_placement' | 'rank'
export type GoalStatus = 'active' | 'achieved' | 'abandoned'

export interface Goal {
  id: string
  goal_type: GoalType
  title: string
  target_value: number | null
  target_text: string | null
  target_date: string | null
  competition_id: string | null
  status: GoalStatus
  created_at: string
  achieved_at: string | null
}

export interface NewGoal {
  goal_type: GoalType
  title: string
  target_value?: number
  target_text?: string
  target_date?: string
  competition_id?: string
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    setGoals((data ?? []) as Goal[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createGoal(input: NewGoal) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('goals').insert({ ...input, user_id: userId })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function markAchieved(id: string) {
    const { error } = await supabase
      .from('goals')
      .update({ status: 'achieved', achieved_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function abandonGoal(id: string) {
    const { error } = await supabase.from('goals').update({ status: 'abandoned' }).eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { goals, loading, createGoal, markAchieved, abandonGoal, deleteGoal }
}
