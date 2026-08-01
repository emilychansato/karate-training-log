import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type WinMethod =
  | 'ippon'
  | 'waza-ari'
  | 'yuko'
  | 'hansoku'
  | 'kiken'
  | 'shikkaku'
  | 'hantei'

export interface CompetitionMatch {
  id: string
  competition_id: string
  round_label: string | null
  opponent_name: string | null
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
  notes: string | null
  created_at: string
}

export interface NewCompetitionMatch {
  round_label?: string
  opponent_name?: string
  kata_technical_score?: number
  kata_athletic_score?: number
  my_yuko?: number
  my_waza_ari?: number
  my_ippon?: number
  opponent_yuko?: number
  opponent_waza_ari?: number
  opponent_ippon?: number
  win_method?: WinMethod
  notes?: string
}

function computePoints(input: NewCompetitionMatch) {
  const points = (yuko = 0, wazaAri = 0, ippon = 0) => yuko * 1 + wazaAri * 2 + ippon * 3
  return {
    points_for: points(input.my_yuko, input.my_waza_ari, input.my_ippon),
    points_against: points(input.opponent_yuko, input.opponent_waza_ari, input.opponent_ippon),
  }
}

export function useCompetitionMatches(competitionId: string) {
  const [matches, setMatches] = useState<CompetitionMatch[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('competition_matches')
      .select('*')
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: true })
    setMatches((data ?? []) as CompetitionMatch[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    load()
  }, [load])

  async function createMatch(input: NewCompetitionMatch) {
    const { points_for, points_against } = computePoints(input)
    const { error } = await supabase.from('competition_matches').insert({
      ...input,
      competition_id: competitionId,
      points_for,
      points_against,
    })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteMatch(id: string) {
    const { error } = await supabase.from('competition_matches').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { matches, loading, createMatch, deleteMatch }
}
