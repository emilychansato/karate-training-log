import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

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

/** Flat zero-height placeholder weeks so the axes still render with structure
 * before any data exists, instead of the chart flashing in and out. */
function placeholderWeeks() {
  const now = new Date()
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (3 - i) * 7)
    return { week: d.toISOString().slice(0, 10), hours: 0 }
  })
}

export function HoursChart() {
  const { sessions, loading } = useTrainingSessions()
  const data = sessions.length > 0 ? toWeeklyHours(sessions) : placeholderWeeks()
  const isEmpty = !loading && sessions.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="analytics" />
          Hours per week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 w-full">
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={isEmpty ? [0, 1] : undefined} />
              <Tooltip />
              <Bar
                dataKey="hours"
                fill="var(--aka)"
                radius={0}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
              >
                {!isEmpty && (
                  <LabelList
                    dataKey="hours"
                    position="top"
                    formatter={(v: unknown) => (v != null ? `${v}H` : '')}
                    className="font-mono tabular-mono"
                    fill="var(--foreground)"
                    fontSize={10}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {isEmpty && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No sessions logged yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
