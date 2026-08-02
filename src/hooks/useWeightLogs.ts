import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface WeightLog {
  id: string
  date: string
  weight_kg: number
  created_at: string
}

export function useWeightLogs() {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .order('date', { ascending: false })
    setLogs((data ?? []) as WeightLog[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addLog(date: string, weightKg: number) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('weight_logs')
      .insert({ user_id: userId, date, weight_kg: weightKg })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeLog(id: string) {
    const { error } = await supabase.from('weight_logs').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { logs, loading, addLog, removeLog }
}
