import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface RankEntry {
  id: string
  style: string
  rank: string
  achieved_date: string
  notes: string | null
  created_at: string
}

export function useRankHistory() {
  const [history, setHistory] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('rank_history')
      .select('*')
      .order('achieved_date', { ascending: false })
    setHistory((data ?? []) as RankEntry[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addRank(style: string, rank: string, achievedDate: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('rank_history')
      .insert({ user_id: userId, style, rank, achieved_date: achievedDate })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeRank(id: string) {
    const { error } = await supabase.from('rank_history').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { history, loading, addRank, removeRank }
}
