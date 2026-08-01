import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Technique {
  id: string
  name: string
  category: string
}

export function useTechniques() {
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('techniques')
      .select('id, name, category')
      .order('name', { ascending: true })
    setTechniques((data ?? []) as Technique[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { techniques, loading }
}
