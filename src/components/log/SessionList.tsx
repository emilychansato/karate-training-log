import { AnimatePresence, motion } from 'framer-motion'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { popIn, staggerContainer, springy } from '../../lib/motion'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'

const TYPE_STYLES: Record<string, string> = {
  kata: 'bg-ao text-white',
  kumite: 'bg-aka text-white',
  conditioning: 'bg-foreground text-background',
  other: 'bg-muted text-muted-foreground',
}

export function SessionList() {
  const { sessions, loading, deleteSession } = useTrainingSessions()
  const reducedMotion = useReducedMotion()

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-3 py-10 text-center"
      >
        <motion.div
          animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Icon name="sparkles" className="size-6 text-muted-foreground opacity-60" />
        </motion.div>
        <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
      </motion.div>
    )
  }

  return (
    <motion.ul
      className="flex flex-col gap-4"
      variants={reducedMotion ? undefined : staggerContainer()}
      initial={reducedMotion ? undefined : 'hidden'}
      animate={reducedMotion ? undefined : 'show'}
    >
      <AnimatePresence mode="popLayout">
        {sessions.map((s) => (
          <motion.li
            key={s.id}
            className="border border-border bg-card p-5"
            variants={reducedMotion ? undefined : popIn}
            exit={reducedMotion ? undefined : 'exit'}
            layout={!reducedMotion}
            whileHover={reducedMotion ? undefined : { y: -3 }}
            transition={springy}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span
                  className={`label-caps mb-2 inline-block px-2 py-0.5 ${TYPE_STYLES[s.type] ?? TYPE_STYLES.other}`}
                >
                  {s.type}
                </span>
                <h3 className="font-heading text-xl">
                  {s.notes || `${s.type[0]?.toUpperCase()}${s.type.slice(1)} session`}
                </h3>
              </div>
              <div className="text-right">
                <p className="label-caps text-muted-foreground opacity-60">{s.date}</p>
                <p className="font-mono tabular-mono mt-1 text-xs font-bold">
                  {s.duration_min} min
                </p>
              </div>
            </div>

            {s.improved.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {s.improved.map((tag) => (
                  <span
                    key={tag}
                    className="label-caps flex items-center gap-1.5 border border-border bg-muted px-2 py-1 text-foreground"
                  >
                    <span className="h-1 w-1 bg-ao" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Icon
                    key={n}
                    name="star"
                    filled={!!s.self_rating && n <= s.self_rating}
                    className={
                      !!s.self_rating && n <= s.self_rating
                        ? 'size-4 text-aka'
                        : 'size-4 text-border'
                    }
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteSession(s.id)}
              >
                Delete
              </Button>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
