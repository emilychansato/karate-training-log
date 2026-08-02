import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { MONTH_NAMES } from '../../lib/dateFormat'

function monthHours(sessions: { date: string; duration_min: number }[], year: number, month: number): number {
  const total = sessions
    .filter((s) => {
      const [y, m] = s.date.split('-').map(Number)
      return y === year && m === month + 1
    })
    .reduce((sum, s) => sum + s.duration_min, 0)
  return Math.round((total / 60) * 10) / 10
}

export function MonthComparisonChart() {
  const { sessions, loading } = useTrainingSessions()

  const now = new Date()
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonthHours = monthHours(sessions, now.getFullYear(), now.getMonth())
  const lastMonthHours = monthHours(sessions, lastMonthDate.getFullYear(), lastMonthDate.getMonth())
  const delta = Math.round((thisMonthHours - lastMonthHours) * 10) / 10
  const isEmpty = !loading && thisMonthHours === 0 && lastMonthHours === 0

  const data = [
    { label: MONTH_NAMES[lastMonthDate.getMonth()].slice(0, 3), hours: lastMonthHours },
    { label: MONTH_NAMES[now.getMonth()].slice(0, 3), hours: thisMonthHours },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="monitoring" />
          This month vs. last month
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEmpty && (
          <p className="font-mono tabular-mono mb-2 text-2xl font-bold">
            <span className={delta >= 0 ? 'text-ao' : 'text-aka'}>
              {delta >= 0 ? '+' : ''}
              {delta}h
            </span>
            <span className="ml-2 text-sm font-normal text-muted-foreground">vs last month</span>
          </p>
        )}
        <div className="relative h-40 w-full">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide domain={isEmpty ? [0, 1] : undefined} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={40} />
              <Tooltip />
              <Bar
                dataKey="hours"
                fill="var(--ao)"
                activeBar={false}
                radius={0}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
                barSize={28}
              >
                {!isEmpty && (
                  <LabelList
                    dataKey="hours"
                    position="right"
                    formatter={(v: unknown) => (v != null ? `${v}h` : '')}
                    className="font-mono tabular-mono"
                    fill="var(--foreground)"
                    fontSize={11}
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
