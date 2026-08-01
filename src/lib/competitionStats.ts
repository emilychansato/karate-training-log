import type { CompetitionResult } from '../hooks/useCompetitionResults'

export interface OpponentStat {
  opponentName: string
  matches: number
  wins: number
  losses: number
  draws: number
  avgPointsFor: number
  avgPointsAgainst: number
}

export interface PersonalRecords {
  longestWinStreak: number
  highestPointsInMatch: number | null
  bestKataTechnicalScore: number | null
  totalCompetitions: number
}

export interface DivisionEntry {
  division: string
  date: string
  discipline: 'kata' | 'kumite'
  placement: string | null
}

function outcome(r: CompetitionResult): 'win' | 'loss' | 'draw' {
  if (r.points_for! > r.points_against!) return 'win'
  if (r.points_for! < r.points_against!) return 'loss'
  return 'draw'
}

function isScoredKumiteMatch(
  r: CompetitionResult
): r is CompetitionResult & { points_for: number; points_against: number } {
  return r.discipline === 'kumite' && r.points_for != null && r.points_against != null
}

export function computeOpponentHistory(results: CompetitionResult[]): OpponentStat[] {
  const byOpponent = new Map<string, CompetitionResult[]>()

  for (const r of results) {
    if (!r.opponent_name || !isScoredKumiteMatch(r)) continue
    const existing = byOpponent.get(r.opponent_name) ?? []
    existing.push(r)
    byOpponent.set(r.opponent_name, existing)
  }

  return Array.from(byOpponent.entries()).map(([opponentName, matches]) => {
    const wins = matches.filter((m) => outcome(m) === 'win').length
    const losses = matches.filter((m) => outcome(m) === 'loss').length
    const draws = matches.filter((m) => outcome(m) === 'draw').length
    const avgPointsFor = matches.reduce((sum, m) => sum + m.points_for!, 0) / matches.length
    const avgPointsAgainst =
      matches.reduce((sum, m) => sum + m.points_against!, 0) / matches.length

    return {
      opponentName,
      matches: matches.length,
      wins,
      losses,
      draws,
      avgPointsFor,
      avgPointsAgainst,
    }
  })
}

export function computePersonalRecords(results: CompetitionResult[]): PersonalRecords {
  const kumiteMatches = results
    .filter(isScoredKumiteMatch)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  let longestWinStreak = 0
  let currentStreak = 0
  for (const m of kumiteMatches) {
    if (outcome(m) === 'win') {
      currentStreak += 1
      longestWinStreak = Math.max(longestWinStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  const highestPointsInMatch = kumiteMatches.length
    ? Math.max(...kumiteMatches.map((m) => m.points_for))
    : null

  const kataScores = results
    .filter((r) => r.discipline === 'kata' && r.kata_technical_score != null)
    .map((r) => r.kata_technical_score!)
  const bestKataTechnicalScore = kataScores.length ? Math.max(...kataScores) : null

  return {
    longestWinStreak,
    highestPointsInMatch,
    bestKataTechnicalScore,
    totalCompetitions: results.length,
  }
}

export function computeDivisionHistory(results: CompetitionResult[]): DivisionEntry[] {
  return results
    .filter((r): r is CompetitionResult & { division: string } => r.division != null)
    .map((r) => ({
      division: r.division,
      date: r.date,
      discipline: r.discipline,
      placement: r.placement,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
