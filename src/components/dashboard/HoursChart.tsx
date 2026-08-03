import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { parseIso, toIso } from '../../lib/dateFormat'

const WEEKS_SHOWN = 10

/** Always builds a fixed trailing window of weeks (instead of only the
 * weeks that happen to have sessions) so a single recent session doesn't
 * render as one massive bar filling the whole chart - real training
 * frequency reads as a rhythm across ~2 months, not one huge block.
 *
 * Uses parseIso/toIso (local-date based) throughout rather than
 * new Date(dateString)/.toISOString() - date-only strings parse as UTC
 * midnight, and mixing that with local date arithmetic shifts week
 * boundaries by a day depending on timezone (same bug class fixed in
 * trainingStats.ts and dateFormat.todayIso()). */
function toWeeklyHours(sessions: { date: string; duration_min: number }[]) {
  const now = new Date()
  const byWeek = new Map<string, number>()
  for (const s of sessions) {
    const d = parseIso(s.date)
    if (!d) continue
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = toIso(weekStart)
    byWeek.set(key, (byWeek.get(key) ?? 0) + s.duration_min / 60)
  }

  return Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay() - (WEEKS_SHOWN - 1 - i) * 7)
    const key = toIso(d)
    const hours = byWeek.get(key) ?? 0
    return { week: key, hours: Math.round(hours * 10) / 10 }
  })
}

export function HoursChart() {
  const { sessions, loading } = useTrainingSessions()
  const data = toWeeklyHours(sessions)
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
              <XAxis dataKey="week" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} domain={isEmpty ? [0, 1] : undefined} />
              <Tooltip cursor={false} />
              <Bar
                dataKey="hours"
                fill="var(--aka)"
                activeBar={false}
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
