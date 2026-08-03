import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCompetitionStats } from '../../hooks/useCompetitionStats'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { AnimatedNumber } from '../ui/animated-number'
import { CelebrationBurst } from '../ui/celebration-burst'
import { CardSkeletonList } from '../ui/skeleton'

type RecordDrill = 'streak' | 'points' | 'kata' | null

export function RecordsPanel() {
  const { loading, records, matches, winStreakMatches, opponents, divisionHistory } =
    useCompetitionStats()
  const hasStreak = records.longestWinStreak >= 3
  const [drill, setDrill] = useState<RecordDrill>(null)
  const [groupByDivision, setGroupByDivision] = useState(false)
  const reducedMotion = useReducedMotion()

  if (loading) return <CardSkeletonList count={3} />

  const bestPointsMatch = matches.find((m) => m.points_for === records.highestPointsInMatch)
  const bestKataMatch = matches.find(
    (m) => m.kata_technical_score === records.bestKataTechnicalScore
  )

  const divisionGroups = groupByDivision
    ? Array.from(
        divisionHistory.reduce((map, d) => {
          const list = map.get(d.division) ?? []
          list.push(d)
          map.set(d.division, list)
          return map
        }, new Map<string, typeof divisionHistory>())
      )
    : null

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="award" />
            Personal records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.totalCompetitions === 0 ? (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={reducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
            >
              No competitions logged yet.
            </motion.p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  type="button"
                  className={`group relative flex flex-col gap-1 border p-3 text-left transition-colors duration-150 ${
                    drill === 'streak' ? 'border-aka' : 'border-border hover:border-ring'
                  }`}
                  onClick={() => setDrill((d) => (d === 'streak' ? null : 'streak'))}
                >
                  {hasStreak && <CelebrationBurst />}
                  <dt className="label-caps flex items-center justify-between text-muted-foreground">
                    Win streak
                    <Icon
                      name="chevron_down"
                      className={`size-3.5 text-muted-foreground transition-transform duration-150 group-hover:text-foreground ${
                        drill === 'streak' ? 'rotate-180' : ''
                      }`}
                    />
                  </dt>
                  <dd className="font-mono tabular-mono text-2xl font-bold text-aka">
                    <AnimatedNumber value={records.longestWinStreak} />
                  </dd>
                </button>
                <button
                  type="button"
                  className={`flex flex-col gap-1 border p-3 text-left transition-colors duration-150 ${
                    drill === 'points' ? 'border-aka' : 'border-border hover:border-ring'
                  }`}
                  onClick={() => setDrill((d) => (d === 'points' ? null : 'points'))}
                >
                  <dt className="label-caps flex items-center justify-between text-muted-foreground">
                    Best match points
                    <Icon
                      name="chevron_down"
                      className={`size-3.5 transition-transform duration-150 ${
                        drill === 'points' ? 'rotate-180' : ''
                      }`}
                    />
                  </dt>
                  <dd className="font-mono tabular-mono text-2xl font-bold">
                    {records.highestPointsInMatch != null ? (
                      <AnimatedNumber value={records.highestPointsInMatch} />
                    ) : (
                      '—'
                    )}
                  </dd>
                </button>
                <button
                  type="button"
                  className={`flex flex-col gap-1 border p-3 text-left transition-colors duration-150 ${
                    drill === 'kata' ? 'border-aka' : 'border-border hover:border-ring'
                  }`}
                  onClick={() => setDrill((d) => (d === 'kata' ? null : 'kata'))}
                >
                  <dt className="label-caps flex items-center justify-between text-muted-foreground">
                    Best kata score
                    <Icon
                      name="chevron_down"
                      className={`size-3.5 transition-transform duration-150 ${
                        drill === 'kata' ? 'rotate-180' : ''
                      }`}
                    />
                  </dt>
                  <dd className="font-mono tabular-mono text-2xl font-bold text-ao">
                    {records.bestKataTechnicalScore != null ? (
                      <AnimatedNumber value={records.bestKataTechnicalScore} decimals={1} />
                    ) : (
                      '—'
                    )}
                  </dd>
                </button>
                <Link
                  to="/competitions"
                  className="flex flex-col gap-1 border border-border p-3 transition-colors duration-150 hover:border-ring"
                >
                  <dt className="label-caps text-muted-foreground">Total competitions</dt>
                  <dd className="font-mono tabular-mono text-2xl font-bold">
                    <AnimatedNumber value={records.totalCompetitions} />
                  </dd>
                </Link>
              </dl>

              {drill === 'streak' && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <p className="label-caps text-muted-foreground">
                    The {winStreakMatches.length}-match streak
                  </p>
                  {winStreakMatches.map((m) => (
                    <Link
                      key={m.matchId}
                      to={`/competitions/${m.competitionId}`}
                      className="flex justify-between text-sm hover:underline"
                    >
                      <span>{m.event}</span>
                      <span className="text-muted-foreground">
                        {m.date} · {m.points_for}–{m.points_against}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {drill === 'points' && bestPointsMatch && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <p className="label-caps text-muted-foreground">Where it happened</p>
                  <Link
                    to={`/competitions/${bestPointsMatch.competitionId}`}
                    className="flex justify-between text-sm hover:underline"
                  >
                    <span>{bestPointsMatch.event}</span>
                    <span className="text-muted-foreground">
                      {bestPointsMatch.date} · vs {bestPointsMatch.opponent_name ?? 'opponent'}
                    </span>
                  </Link>
                </div>
              )}

              {drill === 'kata' && bestKataMatch && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <p className="label-caps text-muted-foreground">Where it happened</p>
                  <Link
                    to={`/competitions/${bestKataMatch.competitionId}`}
                    className="flex justify-between text-sm hover:underline"
                  >
                    <span>{bestKataMatch.event}</span>
                    <span className="text-muted-foreground">{bestKataMatch.date}</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="users" />
            Opponent history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opponents.length === 0 ? (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={reducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
            >
              No scored kumite matches with an opponent name yet.
            </motion.p>
          ) : (
            <ul className="flex flex-col gap-3">
              {opponents.map((o) => (
                <li key={o.opponentName}>
                  <Link
                    to={`/profile/opponents/${encodeURIComponent(o.opponentName)}`}
                    className="flex items-center justify-between border border-border p-3 text-sm hover:border-ring"
                  >
                    <div>
                      <p className="font-medium">{o.opponentName}</p>
                      <p className="font-mono tabular-mono text-xs text-muted-foreground">
                        avg {o.avgPointsFor.toFixed(1)}–{o.avgPointsAgainst.toFixed(1)}
                      </p>
                    </div>
                    <p className="font-mono tabular-mono text-right">
                      <span className="text-ao">{o.wins}W</span>{' '}
                      <span className="text-aka">{o.losses}L</span>{' '}
                      <span className="text-muted-foreground">{o.draws}D</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Icon name="layers" />
              Division progression
            </CardTitle>
            {divisionHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setGroupByDivision((v) => !v)}
                className="label-caps text-muted-foreground hover:text-foreground"
              >
                {groupByDivision ? 'Timeline' : 'Group by division'}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {divisionHistory.length === 0 ? (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={reducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
            >
              No divisions logged yet.
            </motion.p>
          ) : groupByDivision && divisionGroups ? (
            <div className="flex flex-col gap-4">
              {divisionGroups.map(([division, entries]) => (
                <div key={division}>
                  <p className="label-caps mb-1 text-muted-foreground">
                    {division} ({entries.length})
                  </p>
                  <ul className="flex flex-col gap-1">
                    {entries.map((d, i) => (
                      <li key={`${d.date}-${i}`} className="flex justify-between text-sm">
                        <span>{d.discipline}</span>
                        <span className="text-muted-foreground">
                          {d.date} · {d.placement ?? '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {divisionHistory.map((d, i) => (
                <li key={`${d.date}-${i}`} className="flex justify-between text-sm">
                  <span>{d.division}</span>
                  <span className="text-muted-foreground">
                    {d.date} · {d.discipline} · {d.placement ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
