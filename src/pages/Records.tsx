import { useCompetitionStats } from '../hooks/useCompetitionStats'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Icon } from '../components/ui/icon'

export function Records() {
  const { loading, records, opponents, divisionHistory } = useCompetitionStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <span className="label-caps mb-1 block text-aka">Karate OS</span>
        <h1 className="font-heading text-4xl">Records</h1>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Icon name="award" />
                Personal records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.totalCompetitions === 0 ? (
                <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
              ) : (
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <dt className="label-caps text-muted-foreground">Win streak</dt>
                    <dd className="font-mono tabular-mono mt-1 text-2xl font-bold text-aka">
                      {records.longestWinStreak}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">Best match points</dt>
                    <dd className="font-mono tabular-mono mt-1 text-2xl font-bold">
                      {records.highestPointsInMatch ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">Best kata score</dt>
                    <dd className="font-mono tabular-mono mt-1 text-2xl font-bold text-ao">
                      {records.bestKataTechnicalScore ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">Total competitions</dt>
                    <dd className="font-mono tabular-mono mt-1 text-2xl font-bold">
                      {records.totalCompetitions}
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
                <p className="text-sm text-muted-foreground">
                  No scored kumite matches with an opponent name yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {opponents.map((o) => (
                    <li
                      key={o.opponentName}
                      className="flex items-center justify-between border border-border p-3 text-sm"
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
                <p className="text-sm text-muted-foreground">No divisions logged yet.</p>
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
        </>
      )}
    </div>
  )
}
