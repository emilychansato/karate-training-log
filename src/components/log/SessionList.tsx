import { AnimatePresence, motion } from 'framer-motion'
import type { TrainingSession } from '../../hooks/useTrainingSessions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { groupByTimeframe } from '../../lib/groupByTimeframe'
import { popIn, staggerContainer, springy } from '../../lib/motion'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { CardSkeletonList } from '../ui/skeleton'
import { PhotoGallery } from '../ui/photo-gallery'

const TYPE_STYLES: Record<string, string> = {
  kata: 'bg-ao text-white',
  kumite: 'bg-aka text-white',
  conditioning: 'bg-foreground text-background',
  other: 'bg-muted text-muted-foreground',
}

export function SessionList({
  sessions,
  loading,
  deleteSession,
  searchQuery = '',
  typeFilter = 'all',
}: {
  sessions: TrainingSession[]
  loading: boolean
  deleteSession: (id: string) => Promise<{ error: string | null }>
  searchQuery?: string
  typeFilter?: string
}) {
  const reducedMotion = useReducedMotion()

  if (loading) return <CardSkeletonList />

  const filtered = sessions.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const haystack = `${s.title ?? ''} ${s.notes ?? ''} ${s.type} ${s.improved.join(' ')} ${s.struggled.join(' ')}`
      if (!haystack.toLowerCase().includes(q)) return false
    }
    return true
  })

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

  if (filtered.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No sessions match your filters.</p>
  }

  const groups = groupByTimeframe(filtered, (s) => s.date)

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="label-caps text-foreground">{group.label}</span>
            <span className="font-mono tabular-mono text-xs text-muted-foreground">
              {group.items.length} session{group.items.length === 1 ? '' : 's'}
            </span>
          </div>

          <motion.ul
            className="relative flex flex-col gap-4 border-l border-border pl-5"
            variants={reducedMotion ? undefined : staggerContainer()}
            initial={reducedMotion ? undefined : 'hidden'}
            animate={reducedMotion ? undefined : 'show'}
          >
            <AnimatePresence mode="popLayout">
              {group.items.map((s) => (
                <motion.li
                  key={s.id}
                  className="card-elevated relative border border-border bg-card p-5"
                  variants={reducedMotion ? undefined : popIn}
                  exit={reducedMotion ? undefined : 'exit'}
                  layout={!reducedMotion}
                  whileHover={reducedMotion ? undefined : { y: -3 }}
                  transition={springy}
                >
                  <span
                    className={`absolute top-6 -left-[27px] size-2.5 rounded-full ${
                      s.type === 'kumite' ? 'bg-aka' : s.type === 'kata' ? 'bg-ao' : 'bg-muted-foreground'
                    }`}
                  />
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <span
                        className={`label-caps mb-2 inline-block px-2 py-0.5 ${TYPE_STYLES[s.type] ?? TYPE_STYLES.other}`}
                      >
                        {s.type}
                      </span>
                      <h3 className="font-heading text-xl">
                        {s.title || `${s.type[0]?.toUpperCase()}${s.type.slice(1)} session`}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="label-caps text-muted-foreground">{s.date}</p>
                      <p className="font-mono tabular-mono mt-1 text-xs font-bold">
                        {s.duration_min} min
                      </p>
                    </div>
                  </div>

                  {s.notes && <p className="mb-3 text-sm text-muted-foreground">{s.notes}</p>}

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

                  <div className="mb-3 border-t border-border pt-3">
                    <PhotoGallery entryType="training_session" entryId={s.id} />
                  </div>

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
        </div>
      ))}
    </div>
  )
}
