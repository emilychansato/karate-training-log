import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

export function RatingTrendChart() {
  const { sessions, loading } = useTrainingSessions()
  const rated = sessions
    .filter((s) => s.self_rating != null)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="monitoring" />
          Self-rating trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && rated.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ratings yet.</p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <LineChart data={rated}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="self_rating" stroke="var(--aka)" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
