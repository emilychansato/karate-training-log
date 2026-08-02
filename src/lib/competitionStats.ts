/** A single match flattened with its parent competition's fields — the
 * shape stats functions operate on, regardless of the fact that the data
 * lives in two tables (competitions + competition_matches). */
export interface CompetitionMatchRecord {
  competitionId: string
  matchId: string
  event: string
  date: string
  division: string | null
  placement: string | null
  discipline: 'kata' | 'kumite'
  kata_technical_score: number | null
  opponent_name: string | null
  points_for: number | null
  points_against: number | null
}

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

function outcome(m: CompetitionMatchRecord): 'win' | 'loss' | 'draw' {
  if (m.points_for! > m.points_against!) return 'win'
  if (m.points_for! < m.points_against!) return 'loss'
  return 'draw'
}

function isScoredKumiteMatch(
  m: CompetitionMatchRecord
): m is CompetitionMatchRecord & { points_for: number; points_against: number } {
  return m.discipline === 'kumite' && m.points_for != null && m.points_against != null
}

export function computeOpponentHistory(matches: CompetitionMatchRecord[]): OpponentStat[] {
  const byOpponent = new Map<string, CompetitionMatchRecord[]>()

  for (const m of matches) {
    if (!m.opponent_name || !isScoredKumiteMatch(m)) continue
    const existing = byOpponent.get(m.opponent_name) ?? []
    existing.push(m)
    byOpponent.set(m.opponent_name, existing)
  }

  return Array.from(byOpponent.entries()).map(([opponentName, opponentMatches]) => {
    const wins = opponentMatches.filter((m) => outcome(m) === 'win').length
    const losses = opponentMatches.filter((m) => outcome(m) === 'loss').length
    const draws = opponentMatches.filter((m) => outcome(m) === 'draw').length
    const avgPointsFor =
      opponentMatches.reduce((sum, m) => sum + m.points_for!, 0) / opponentMatches.length
    const avgPointsAgainst =
      opponentMatches.reduce((sum, m) => sum + m.points_against!, 0) / opponentMatches.length

    return {
      opponentName,
      matches: opponentMatches.length,
      wins,
      losses,
      draws,
      avgPointsFor,
      avgPointsAgainst,
    }
  })
}

export function computePersonalRecords(
  matches: CompetitionMatchRecord[],
  totalCompetitions: number
): PersonalRecords {
  const kumiteMatches = matches
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

  const kataScores = matches
    .filter((m) => m.discipline === 'kata' && m.kata_technical_score != null)
    .map((m) => m.kata_technical_score!)
  const bestKataTechnicalScore = kataScores.length ? Math.max(...kataScores) : null

  return {
    longestWinStreak,
    highestPointsInMatch,
    bestKataTechnicalScore,
    totalCompetitions,
  }
}

/** The actual matches making up the longest win streak (first occurrence,
 * if tied) - what "diving into" the win-streak stat shows. */
export function computeWinStreakMatches(matches: CompetitionMatchRecord[]): CompetitionMatchRecord[] {
  const kumiteMatches = matches
    .filter(isScoredKumiteMatch)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  let best: CompetitionMatchRecord[] = []
  let current: CompetitionMatchRecord[] = []
  for (const m of kumiteMatches) {
    if (outcome(m) === 'win') {
      current.push(m)
      if (current.length > best.length) best = current
    } else {
      current = []
    }
  }
  return best
}

export function computeDivisionHistory(
  competitions: { division: string | null; date: string; discipline: 'kata' | 'kumite'; placement: string | null }[]
): DivisionEntry[] {
  return competitions
    .filter(
      (c): c is typeof c & { division: string } => c.division != null
    )
    .map((c) => ({
      division: c.division,
      date: c.date,
      discipline: c.discipline,
      placement: c.placement,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
