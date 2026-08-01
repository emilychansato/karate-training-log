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

export interface FavoriteTechnique {
  id: string
  name: string
}

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
  favorite_techniques: FavoriteTechnique[]
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

interface RawMatchRow {
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
  match_techniques: { technique_id: string; techniques: { name: string } }[]
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
      .select('*, match_techniques(technique_id, techniques(name))')
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: true })
    const rows = (data ?? []) as unknown as RawMatchRow[]
    setMatches(
      rows.map((r) => ({
        ...r,
        favorite_techniques: (r.match_techniques ?? []).map((mt) => ({
          id: mt.technique_id,
          name: mt.techniques.name,
        })),
      }))
    )
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    load()
  }, [load])

  async function createMatch(input: NewCompetitionMatch, favoriteTechniqueIds: string[] = []) {
    const { points_for, points_against } = computePoints(input)
    const { data, error } = await supabase
      .from('competition_matches')
      .insert({
        ...input,
        competition_id: competitionId,
        points_for,
        points_against,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    if (favoriteTechniqueIds.length > 0) {
      await supabase
        .from('match_techniques')
        .insert(favoriteTechniqueIds.map((technique_id) => ({ match_id: data.id, technique_id })))
    }

    await load()
    return { error: null }
  }

  async function deleteMatch(id: string) {
    const { error } = await supabase.from('competition_matches').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { matches, loading, createMatch, deleteMatch }
}
