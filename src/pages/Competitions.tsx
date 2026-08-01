import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CompetitionForm } from '../components/forms/CompetitionForm'
import { useCompetitionResults } from '../hooks/useCompetitionResults'
import { Icon } from '../components/ui/icon'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { popIn, staggerContainer, springy } from '../lib/motion'
import { CardSkeletonList } from '../components/ui/skeleton'
import { WinRateGauge } from '../components/dashboard/WinRateGauge'

export function Competitions() {
  const [showForm, setShowForm] = useState(false)
  const { results, loading } = useCompetitionResults()
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="label-caps mb-1 block text-aka">Karate OS</span>
          <h1 className="font-heading-hero text-4xl">Competitions</h1>
        </div>
        <div className="flex items-end gap-4">
          <WinRateGauge />
          <button
            onClick={() => setShowForm((v) => !v)}
            className="label-caps hidden text-muted-foreground hover:text-foreground md:block"
          >
            {showForm ? 'Cancel' : '+ New result'}
          </button>
        </div>
      </div>
      {showForm && <CompetitionForm onSuccess={() => setShowForm(false)} />}
      {loading && <CardSkeletonList />}
      {!loading && results.length === 0 && (
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
          <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
        </motion.div>
      )}
      <motion.ul
        className="flex flex-col gap-4"
        variants={reducedMotion ? undefined : staggerContainer()}
        initial={reducedMotion ? undefined : 'hidden'}
        animate={reducedMotion ? undefined : 'show'}
      >
        <AnimatePresence mode="popLayout">
          {results.map((r) => (
            <motion.li
              key={r.id}
              className="card-elevated border border-border bg-card p-5"
              variants={reducedMotion ? undefined : popIn}
              exit={reducedMotion ? undefined : 'exit'}
              layout={!reducedMotion}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              transition={springy}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <span
                    className={`label-caps mb-2 inline-block px-2 py-0.5 ${
                      r.discipline === 'kata' ? 'bg-ao text-white' : 'bg-aka text-white'
                    }`}
                  >
                    {r.discipline}
                  </span>
                  <h3 className="font-heading text-xl">{r.event}</h3>
                </div>
                <p className="label-caps text-muted-foreground">{r.date}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Icon name="trophy" className="size-4" />
                {r.placement ?? 'no placement recorded'}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <button
        onClick={() => setShowForm((v) => !v)}
        aria-label={showForm ? 'Cancel new result' : 'New result'}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center bg-aka text-white shadow-xl transition-transform active:scale-95 md:hidden"
      >
        <Icon name={showForm ? 'close' : 'add'} className="size-6" />
      </button>
    </div>
  )
}
