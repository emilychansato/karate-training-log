import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

function placeholderDays() {
  const now = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (4 - i))
    return { date: d.toISOString().slice(0, 10), self_rating: 3 }
  })
}

export function RatingTrendChart() {
  const { sessions, loading } = useTrainingSessions()
  const rated = sessions
    .filter((s) => s.self_rating != null)
    .map((s) => ({ date: s.date, self_rating: s.self_rating as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
  const isEmpty = !loading && rated.length === 0
  const data = isEmpty ? placeholderDays() : rated

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="monitoring" />
          Self-rating trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 w-full">
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="self_rating"
                stroke={isEmpty ? 'var(--border)' : 'var(--aka)'}
                dot={!isEmpty}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
          {isEmpty && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No ratings yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
