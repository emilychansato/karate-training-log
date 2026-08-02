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
  location: string | null
  rank_at_time: string | null
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
  location?: string
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

    // Snapshot whatever rank was current as of the competition's date, so
    // a competition fought at green belt keeps showing green belt even
    // after later promotions - not user-entered, derived from rank_history.
    const { data: rankRow } = await supabase
      .from('rank_history')
      .select('rank, style')
      .lte('achieved_date', input.date)
      .order('achieved_date', { ascending: false })
      .limit(1)
      .maybeSingle()
    const rank_at_time = rankRow ? `${rankRow.rank} (${rankRow.style})` : null

    const { data, error } = await supabase
      .from('competitions')
      .insert({ ...input, user_id: userId, rank_at_time })
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
