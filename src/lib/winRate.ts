import type { CompetitionMatchRecord } from './competitionStats'

export interface WinRate {
  wins: number
  losses: number
  draws: number
  totalMatches: number
  winRatePercent: number
}

function isScoredKumiteMatch(
  m: CompetitionMatchRecord
): m is CompetitionMatchRecord & { points_for: number; points_against: number } {
  return m.discipline === 'kumite' && m.points_for != null && m.points_against != null
}

export function computeWinRate(matches: CompetitionMatchRecord[]): WinRate {
  const scored = matches.filter(isScoredKumiteMatch)

  const wins = scored.filter((m) => m.points_for > m.points_against).length
  const losses = scored.filter((m) => m.points_for < m.points_against).length
  const draws = scored.filter((m) => m.points_for === m.points_against).length

  return {
    wins,
    losses,
    draws,
    totalMatches: scored.length,
    winRatePercent: scored.length ? Math.round((wins / scored.length) * 100) : 0,
  }
}
