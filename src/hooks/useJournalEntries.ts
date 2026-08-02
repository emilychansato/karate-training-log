import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface JournalEntry {
  id: string
  date: string
  mood: number | null
  emotions: string[]
  notes: string | null
  created_at: string
}

export interface JournalCheckIn {
  date: string
  mood?: number
  emotions?: string[]
  notes?: string
}

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
    setEntries((data ?? []) as JournalEntry[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function checkIn(input: JournalCheckIn) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('journal_entries')
      .upsert({ ...input, user_id: userId }, { onConflict: 'user_id,date' })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { entries, loading, checkIn }
}
