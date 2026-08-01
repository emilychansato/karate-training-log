import { useCompetitionResults } from '../../hooks/useCompetitionResults'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export function CompetitionTimeline() {
  const { results, loading } = useCompetitionResults()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Competition timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((r) => (
              <li key={r.id} className="flex justify-between text-sm">
                <span>{r.event}</span>
                <span className="text-muted-foreground">
                  {r.date} · {r.placement ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
