import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
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

export function HoursChart() {
  const { sessions, loading } = useTrainingSessions()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="analytics" />
          Hours per week
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && sessions.length === 0 ? (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            No sessions logged yet.
          </motion.p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart data={toWeeklyHours(sessions)}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="hours"
                  fill="var(--aka)"
                  radius={0}
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
