import { Link } from 'react-router-dom'
import { usePlannedCompetitions } from '../../hooks/usePlannedCompetitions'
import { usePrepPlan } from '../../hooks/usePrepPlan'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

export function NextCompetitionGoals() {
  const { planned, loading: plannedLoading } = usePlannedCompetitions()
  const today = new Date().toISOString().slice(0, 10)

  const next = planned
    .filter((p) => p.kind === 'competition' && p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const { goals, loading: goalsLoading } = usePrepPlan(next?.id ?? '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="target" />
          Prep goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plannedLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !next ? (
          <p className="text-sm text-muted-foreground">
            No upcoming competition saved yet — add one from the Competitions page.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-heading text-base">{next.event}</p>
              <p className="label-caps text-muted-foreground">{next.date}</p>
            </div>

            {goalsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals set yet for this one.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {goals.slice(0, 4).map((g) => (
                  <li key={g.id} className="flex items-start gap-1.5 text-sm">
                    {g.discipline && (
                      <span className={`label-caps ${g.discipline === 'kata' ? 'text-ao' : 'text-aka'}`}>
                        {g.discipline}
                      </span>
                    )}
                    <span>{g.goal}</span>
                  </li>
                ))}
              </ul>
            )}

            <Link to={`/competitions/upcoming/${next.id}`} className="label-caps text-aka hover:underline">
              Open prep plan →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
