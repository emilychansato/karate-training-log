import { motion } from 'framer-motion'
import { useCompetitionResults } from '../../hooks/useCompetitionResults'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'

export function CompetitionTimeline() {
  const { results, loading } = useCompetitionResults()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="trophy" />
          Competition timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && results.length === 0 ? (
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
            {results.map((r) => (
              <li key={r.id} className="flex justify-between text-sm">
                <span>{r.event}</span>
                <span className="text-muted-foreground">
                  {r.date} · {r.placement ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
