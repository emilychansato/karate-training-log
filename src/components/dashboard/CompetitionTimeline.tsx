import { motion } from 'framer-motion'
import { useCompetitions } from '../../hooks/useCompetitions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

export function CompetitionTimeline() {
  const { competitions, loading } = useCompetitions()
  const reducedMotion = useReducedMotion()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="trophy" />
          Competition timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && competitions.length === 0 ? (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
          >
            No competitions logged yet.
          </motion.p>
        ) : (
          <ul className="flex flex-col gap-2">
            {competitions.map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span>{c.event}</span>
                <span className="text-muted-foreground">
                  {c.date} · {c.placement ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
