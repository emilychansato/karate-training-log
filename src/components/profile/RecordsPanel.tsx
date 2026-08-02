import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCompetitionStats } from '../../hooks/useCompetitionStats'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { AnimatedNumber } from '../ui/animated-number'
import { CelebrationBurst } from '../ui/celebration-burst'
import { CardSkeletonList } from '../ui/skeleton'

export function RecordsPanel() {
  const { loading, records, opponents, divisionHistory } = useCompetitionStats()
  const hasStreak = records.longestWinStreak >= 3

  if (loading) return <CardSkeletonList count={3} />

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              No competitions logged yet.
            </motion.p>
          ) : (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="relative">
                {hasStreak && <CelebrationBurst />}
                <dt className="label-caps text-muted-foreground">Win streak</dt>
                <dd className="font-mono tabular-mono mt-1 text-2xl font-bold text-aka">
                  <AnimatedNumber value={records.longestWinStreak} />
                </dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Best match points</dt>
                <dd className="font-mono tabular-mono mt-1 text-2xl font-bold">
                  {records.highestPointsInMatch != null ? (
                    <AnimatedNumber value={records.highestPointsInMatch} />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Best kata score</dt>
                <dd className="font-mono tabular-mono mt-1 text-2xl font-bold text-ao">
                  {records.bestKataTechnicalScore != null ? (
                    <AnimatedNumber value={records.bestKataTechnicalScore} decimals={1} />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Total competitions</dt>
                <dd className="font-mono tabular-mono mt-1 text-2xl font-bold">
                  <AnimatedNumber value={records.totalCompetitions} />
                </dd>
              </div>
            </dl>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
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
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="layers" />
            Division progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          {divisionHistory.length === 0 ? (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              No divisions logged yet.
            </motion.p>
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
