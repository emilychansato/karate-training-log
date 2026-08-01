import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export type WinMethod =
  | 'ippon'
  | 'waza-ari'
  | 'yuko'
  | 'hansoku'
  | 'kiken'
  | 'shikkaku'
  | 'hantei'

export interface CompetitionResult {
  id: string
  event: string
  date: string
  division: string | null
  placement: string | null
  discipline: 'kata' | 'kumite'
  kata_technical_score: number | null
  kata_athletic_score: number | null
  my_yuko: number
  my_waza_ari: number
  my_ippon: number
  opponent_yuko: number
  opponent_waza_ari: number
  opponent_ippon: number
  points_for: number | null
  points_against: number | null
  win_method: WinMethod | null
  opponent_name: string | null
  notes: string | null
  created_at: string
}

export interface NewCompetitionResult {
  event: string
  date: string
  division?: string
  placement?: string
  discipline: 'kata' | 'kumite'
  kata_technical_score?: number
  kata_athletic_score?: number
  my_yuko?: number
  my_waza_ari?: number
  my_ippon?: number
  opponent_yuko?: number
  opponent_waza_ari?: number
  opponent_ippon?: number
  win_method?: WinMethod
  opponent_name?: string
  notes?: string
}

function computePoints(input: NewCompetitionResult) {
  const points = (yuko = 0, wazaAri = 0, ippon = 0) => yuko * 1 + wazaAri * 2 + ippon * 3
  return {
    points_for: points(input.my_yuko, input.my_waza_ari, input.my_ippon),
    points_against: points(input.opponent_yuko, input.opponent_waza_ari, input.opponent_ippon),
  }
}

export function useCompetitionResults() {
  const [results, setResults] = useState<CompetitionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('competition_results')
      .select('*')
      .order('date', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setResults((data ?? []) as CompetitionResult[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createResult(input: NewCompetitionResult) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { points_for, points_against } = computePoints(input)
    const { error } = await supabase
      .from('competition_results')
      .insert({ ...input, user_id: userId, points_for, points_against })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteResult(id: string) {
    const { error } = await supabase.from('competition_results').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { results, loading, error, createResult, deleteResult }
}
