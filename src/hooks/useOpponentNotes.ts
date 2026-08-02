import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export function useOpponentNotes(opponentName: string) {
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('opponent_notes')
      .select('notes')
      .eq('opponent_name', opponentName)
      .maybeSingle()
    setNotes(data?.notes ?? null)
    setLoading(false)
  }, [opponentName])

  useEffect(() => {
    load()
  }, [load])

  async function saveNotes(text: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('opponent_notes')
      .upsert(
        { user_id: userId, opponent_name: opponentName, notes: text },
        { onConflict: 'user_id,opponent_name' }
      )
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { notes, loading, saveNotes }
}
