import type { CompetitionResult } from '../hooks/useCompetitionResults'

export interface WinRate {
  wins: number
  losses: number
  draws: number
  totalMatches: number
  winRatePercent: number
}

function isScoredKumiteMatch(
  r: CompetitionResult
): r is CompetitionResult & { points_for: number; points_against: number } {
  return r.discipline === 'kumite' && r.points_for != null && r.points_against != null
}

export function computeWinRate(results: CompetitionResult[]): WinRate {
  const matches = results.filter(isScoredKumiteMatch)

  const wins = matches.filter((m) => m.points_for > m.points_against).length
  const losses = matches.filter((m) => m.points_for < m.points_against).length
  const draws = matches.filter((m) => m.points_for === m.points_against).length

  return {
    wins,
    losses,
    draws,
    totalMatches: matches.length,
    winRatePercent: matches.length ? Math.round((wins / matches.length) * 100) : 0,
  }
}
