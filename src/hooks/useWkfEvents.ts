import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface WkfEvent {
  id: string
  name: string
  date_start: string
  date_end: string | null
  location: string | null
  category: string | null
}

export function useWkfEvents() {
  const [events, setEvents] = useState<WkfEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('wkf_events')
      .select('id, name, date_start, date_end, location, category')
      .order('date_start', { ascending: true })
    setEvents((data ?? []) as WkfEvent[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function syncNow() {
    setSyncing(true)
    const { error } = await supabase.functions.invoke('ingest-wkf-events')
    if (!error) await load()
    setSyncing(false)
    return { error: error?.message ?? null }
  }

  return { events, loading, syncing, syncNow }
}
