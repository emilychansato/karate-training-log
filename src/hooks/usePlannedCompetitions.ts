import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface PlannedCompetition {
  id: string
  event: string
  date: string
  location: string | null
  division: string | null
  discipline: 'kata' | 'kumite' | null
  notes: string | null
  created_at: string
}

export interface NewPlannedCompetition {
  event: string
  date: string
  location?: string
  division?: string
  discipline?: 'kata' | 'kumite'
  notes?: string
}

export function usePlannedCompetitions() {
  const [planned, setPlanned] = useState<PlannedCompetition[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('planned_competitions')
      .select('*')
      .order('date', { ascending: true })
    setPlanned((data ?? []) as PlannedCompetition[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addPlanned(input: NewPlannedCompetition) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('planned_competitions')
      .insert({ ...input, user_id: userId })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removePlanned(id: string) {
    const { error } = await supabase.from('planned_competitions').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { planned, loading, addPlanned, removePlanned }
}
