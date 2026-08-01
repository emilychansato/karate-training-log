import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

function toWeeklyHours(sessions: { date: string; duration_min: number }[]) {
  const byWeek = new Map<string, number>()
  for (const s of sessions) {
    const d = new Date(s.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    byWeek.set(key, (byWeek.get(key) ?? 0) + s.duration_min / 60)
  }
  return Array.from(byWeek.entries())
    .map(([week, hours]) => ({ week, hours: Math.round(hours * 10) / 10 }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

export function HoursChart() {
  const { sessions, loading } = useTrainingSessions()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Hours per week</CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart data={toWeeklyHours(sessions)}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="currentColor" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
