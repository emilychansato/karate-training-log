import { motion } from 'framer-motion'
import { useCompetitions } from '../../hooks/useCompetitions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

export function CompetitionTimeline() {
  const { competitions, loading } = useCompetitions()

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
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
