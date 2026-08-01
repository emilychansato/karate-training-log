import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CompetitionForm } from '../components/forms/CompetitionForm'
import { useCompetitions } from '../hooks/useCompetitions'
import { usePlannedCompetitions } from '../hooks/usePlannedCompetitions'
import { Icon } from '../components/ui/icon'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { SegmentedControl } from '../components/ui/segmented-control'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { popIn, staggerContainer, springy } from '../lib/motion'
import { CardSkeletonList } from '../components/ui/skeleton'
import { WinRateGauge } from '../components/dashboard/WinRateGauge'

function UpcomingTab() {
  const { planned, loading, addPlanned, removePlanned } = usePlannedCompetitions()
  const [showForm, setShowForm] = useState(false)
  const [event, setEvent] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await addPlanned({ event, date, location: location || undefined })
    if (!error) {
      setEvent('')
      setDate('')
      setLocation('')
      setShowForm(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="label-caps self-start text-muted-foreground hover:text-foreground"
      >
        {showForm ? 'Cancel' : '+ Add upcoming competition'}
      </button>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="card-elevated flex flex-col gap-3 border border-border bg-card p-4"
        >
          <Input placeholder="Event name" value={event} onChange={(e) => setEvent(e.target.value)} required />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button type="submit" className="glow-primary">
            Save
          </Button>
        </form>
      )}

      {loading ? (
        <CardSkeletonList count={2} />
      ) : planned.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No upcoming competitions yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {planned.map((p) => (
            <li key={p.id} className="card-elevated flex items-center justify-between border border-border bg-card p-4">
              <div>
                <p className="font-heading text-lg">{p.event}</p>
                <p className="label-caps text-muted-foreground">
                  {p.date}
                  {p.location ? ` · ${p.location}` : ''}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removePlanned(p.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Competitions() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'past' | 'upcoming'>('past')
  const { competitions, loading } = useCompetitions()
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
            {showForm ? 'Cancel' : '+ New competition'}
          </button>
        </div>
      </div>

      {showForm && (
        <CompetitionForm
          onSuccess={(id) => {
            setShowForm(false)
            navigate(`/competitions/${id}`)
          }}
        />
      )}

      <SegmentedControl
        name="tab"
        options={[
          { value: 'past', label: 'PAST' },
          { value: 'upcoming', label: 'UPCOMING' },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-xs"
      />

      {tab === 'upcoming' ? (
        <UpcomingTab />
      ) : (
        <>
          {loading && <CardSkeletonList />}
          {!loading && competitions.length === 0 && (
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
              {competitions.map((c) => (
                <motion.li
                  key={c.id}
                  variants={reducedMotion ? undefined : popIn}
                  exit={reducedMotion ? undefined : 'exit'}
                  layout={!reducedMotion}
                  whileHover={reducedMotion ? undefined : { y: -3 }}
                  transition={springy}
                >
                  <Link
                    to={`/competitions/${c.id}`}
                    className="card-elevated block border border-border bg-card p-5"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <span
                          className={`label-caps mb-2 inline-block px-2 py-0.5 ${
                            c.discipline === 'kata' ? 'bg-ao text-white' : 'bg-aka text-white'
                          }`}
                        >
                          {c.discipline}
                        </span>
                        <h3 className="font-heading text-xl">{c.event}</h3>
                      </div>
                      <p className="label-caps text-muted-foreground">{c.date}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Icon name="trophy" className="size-4" />
                        {c.placement ?? 'no placement recorded'}
                      </div>
                      <span className="label-caps flex items-center gap-1">
                        View matches
                        <Icon name="add" className="size-3" />
                      </span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </>
      )}

      <button
        onClick={() => setShowForm((v) => !v)}
        aria-label={showForm ? 'Cancel new competition' : 'New competition'}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center bg-aka text-white shadow-xl transition-transform active:scale-95 md:hidden"
      >
        <Icon name={showForm ? 'close' : 'add'} className="size-6" />
      </button>
    </div>
  )
}
