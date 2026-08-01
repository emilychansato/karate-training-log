import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface Competition {
  id: string
  event: string
  date: string
  division: string | null
  discipline: 'kata' | 'kumite'
  placement: string | null
  notes: string | null
  coach_notes: string | null
  what_went_well: string | null
  what_to_improve: string | null
  post_competition_feelings: string | null
  goals_for_next_time: string | null
  created_at: string
}

export interface NewCompetition {
  event: string
  date: string
  division?: string
  discipline: 'kata' | 'kumite'
  placement?: string
  notes?: string
}

export interface CompetitionReflection {
  coach_notes?: string
  what_went_well?: string
  what_to_improve?: string
  post_competition_feelings?: string
  goals_for_next_time?: string
}

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .order('date', { ascending: false })
    setCompetitions((data ?? []) as Competition[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createCompetition(input: NewCompetition) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in', id: null }

    const { data, error } = await supabase
      .from('competitions')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (!error) await load()
    return { error: error?.message ?? null, id: (data?.id as string) ?? null }
  }

  async function updateCompetition(id: string, fields: CompetitionReflection) {
    const { error } = await supabase.from('competitions').update(fields).eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteCompetition(id: string) {
    const { error } = await supabase.from('competitions').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { competitions, loading, createCompetition, updateCompetition, deleteCompetition }
}
