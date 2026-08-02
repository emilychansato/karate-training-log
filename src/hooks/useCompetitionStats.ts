import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  computeOpponentHistory,
  computePersonalRecords,
  computeDivisionHistory,
  type CompetitionMatchRecord,
} from '../lib/competitionStats'
import { computeWinRate } from '../lib/winRate'

interface RawMatchRow {
  id: string
  opponent_name: string | null
  kata_technical_score: number | null
  points_for: number | null
  points_against: number | null
}

interface RawCompetitionRow {
  id: string
  event: string
  date: string
  division: string | null
  discipline: 'kata' | 'kumite'
  placement: string | null
  competition_matches: RawMatchRow[]
}

export function useCompetitionStats() {
  const [competitions, setCompetitions] = useState<RawCompetitionRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('competitions')
      .select(
        'id, event, date, division, discipline, placement, competition_matches(id, opponent_name, kata_technical_score, points_for, points_against)'
      )
      .order('date', { ascending: false })
    setCompetitions((data ?? []) as unknown as RawCompetitionRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const flatMatches: CompetitionMatchRecord[] = competitions.flatMap((c) =>
    c.competition_matches.map((m) => ({
      competitionId: c.id,
      matchId: m.id,
      event: c.event,
      date: c.date,
      division: c.division,
      placement: c.placement,
      discipline: c.discipline,
      kata_technical_score: m.kata_technical_score,
      opponent_name: m.opponent_name,
      points_for: m.points_for,
      points_against: m.points_against,
    }))
  )

  return {
    loading,
    matches: flatMatches,
    records: computePersonalRecords(flatMatches, competitions.length),
    opponents: computeOpponentHistory(flatMatches),
    divisionHistory: computeDivisionHistory(competitions),
    winRate: computeWinRate(flatMatches),
  }
}
