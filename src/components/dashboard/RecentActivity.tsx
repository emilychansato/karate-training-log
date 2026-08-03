import { motion } from 'framer-motion'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon, type IconName } from '../ui/icon'

const TYPE_ICON: Record<string, IconName> = {
  kata: 'target',
  kumite: 'sports_martial_arts',
  conditioning: 'dumbbell',
  other: 'sparkles',
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1) return `${diffDays}d ago`
  return dateStr
}

export function RecentActivity() {
  const { sessions, loading } = useTrainingSessions()
  const recent = sessions.slice(0, 5)
  const reducedMotion = useReducedMotion()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="event_note" />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && recent.length === 0 ? (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
          >
            No sessions logged yet.
          </motion.p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center border border-border bg-muted">
                    <Icon name={TYPE_ICON[s.type] ?? 'sparkles'} className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {s.notes || `${s.type[0]?.toUpperCase()}${s.type.slice(1)} session`}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.duration_min} min</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {s.self_rating != null && (
                    <div className="flex items-center gap-1">
                      <span className="font-mono tabular-mono text-sm font-bold text-aka">
                        {s.self_rating}
                      </span>
                      <Icon name="star" filled className="size-3.5 text-aka" />
                    </div>
                  )}
                  <span className="label-caps text-muted-foreground">
                    {relativeDate(s.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
