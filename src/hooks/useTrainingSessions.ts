import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface TrainingSession {
  id: string
  date: string
  type: string
  duration_min: number
  self_rating: number | null
  notes: string | null
  improved: string[]
  struggled: string[]
  created_at: string
}

export interface NewTrainingSession {
  date: string
  type: string
  duration_min: number
  self_rating?: number
  notes?: string
  improved?: string[]
  struggled?: string[]
}

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .order('date', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setSessions((data ?? []) as TrainingSession[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createSession(input: NewTrainingSession) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('training_sessions')
      .insert({ ...input, user_id: userId })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteSession(id: string) {
    const { error } = await supabase.from('training_sessions').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { sessions, loading, error, createSession, deleteSession }
}
