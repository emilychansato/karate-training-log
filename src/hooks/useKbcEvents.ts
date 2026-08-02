import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface KbcEvent {
  id: string
  name: string
  date_start: string
  date_end: string | null
  location: string | null
  kind: 'competition' | 'event'
}

export function useKbcEvents() {
  const [events, setEvents] = useState<KbcEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('kbc_events')
      .select('id, name, date_start, date_end, location, kind')
      .order('date_start', { ascending: true })
    setEvents((data ?? []) as KbcEvent[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function syncNow() {
    setSyncing(true)
    const { error } = await supabase.functions.invoke('ingest-kbc-events')
    if (!error) await load()
    setSyncing(false)
    return { error: error?.message ?? null }
  }

  return { events, loading, syncing, syncNow }
}
