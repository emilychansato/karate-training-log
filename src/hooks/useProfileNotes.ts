import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export function useProfileNotes() {
  const [whyITrain, setWhyITrain] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('profile_notes').select('why_i_train').maybeSingle()
    setWhyITrain(data?.why_i_train ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveWhyITrain(text: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('profile_notes')
      .upsert({ user_id: userId, why_i_train: text }, { onConflict: 'user_id' })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { whyITrain, loading, saveWhyITrain }
}
