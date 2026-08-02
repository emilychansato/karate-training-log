import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { usePlannedCompetitions } from '../../hooks/usePlannedCompetitions'
import { useWkfEvents } from '../../hooks/useWkfEvents'
import { useKbcEvents } from '../../hooks/useKbcEvents'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { DatePicker } from '../ui/date-picker'
import { Button } from '../ui/button'
import { ToggleChip } from '../ui/toggle-chip'
import { CardSkeletonList } from '../ui/skeleton'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { popIn, staggerContainer, springy } from '../../lib/motion'

type Kind = 'competition' | 'event'

interface DiscoverItem {
  key: string
  name: string
  date: string
  dateEnd: string | null
  location: string | null
  kind: Kind
  sourceType: 'wkf' | 'kbc'
  sourceId: string
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function UpcomingTimeline() {
  const { planned, loading: plannedLoading, addPlanned, removePlanned } = usePlannedCompetitions()
  const { events: wkfEvents, loading: wkfLoading, syncing: wkfSyncing, syncNow: syncWkf } = useWkfEvents()
  const { events: kbcEvents, loading: kbcLoading, syncing: kbcSyncing, syncNow: syncKbc } = useKbcEvents()
  const [showComps, setShowComps] = useState(true)
  const [showEvents, setShowEvents] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [event, setEvent] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const reducedMotion = useReducedMotion()

  const loading = plannedLoading || wkfLoading || kbcLoading
  const today = todayIso()

  const alreadyAdded = (sourceType: 'wkf' | 'kbc', sourceId: string) =>
    planned.some((p) => p.source_type === sourceType && p.source_id === sourceId)

  const mine = planned
    .filter((p) => p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  const wkfItems: DiscoverItem[] = wkfEvents
    .filter((e) => e.date_start >= today && !alreadyAdded('wkf', e.id))
    .map((e) => ({
      key: `wkf-${e.id}`,
      name: e.name,
      date: e.date_start,
      dateEnd: e.date_end,
      location: e.location,
      kind: 'competition',
      sourceType: 'wkf',
      sourceId: e.id,
    }))

  const kbcItems: DiscoverItem[] = kbcEvents
    .filter((e) => e.date_start >= today && !alreadyAdded('kbc', e.id))
    .map((e) => ({
      key: `kbc-${e.id}`,
      name: e.name,
      date: e.date_start,
      dateEnd: e.date_end,
      location: e.location,
      kind: e.kind,
      sourceType: 'kbc',
      sourceId: e.id,
    }))

  const discoverItems = [...wkfItems, ...kbcItems]
    .filter((i) => (i.kind === 'competition' ? showComps : showEvents))
    .sort((a, b) => a.date.localeCompare(b.date))

  async function handleAdd(item: DiscoverItem) {
    await addPlanned({
      event: item.name,
      date: item.date,
      location: item.location ?? undefined,
      kind: item.kind,
      source_type: item.sourceType,
      source_id: item.sourceId,
    })
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    const { error } = await addPlanned({ event, date, location: location || undefined })
    if (!error) {
      setEvent('')
      setDate('')
      setLocation('')
      setShowForm(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="label-caps text-muted-foreground">Your upcoming</span>
        {loading ? (
          <CardSkeletonList count={2} />
        ) : mine.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing saved yet — add your own below or grab one from Discover.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mine.map((p) => (
              <li
                key={p.id}
                className="card-elevated flex items-center justify-between gap-3 border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 size-2 flex-shrink-0 rounded-full ${
                      p.kind === 'competition' ? 'bg-aka' : 'bg-ao'
                    }`}
                  />
                  <div>
                    {p.kind === 'competition' ? (
                      <Link to={`/competitions/upcoming/${p.id}`} className="font-heading text-lg hover:underline">
                        {p.event}
                      </Link>
                    ) : (
                      <p className="font-heading text-lg">{p.event}</p>
                    )}
                    <p className="label-caps text-muted-foreground">
                      {p.date}
                      {p.location ? ` · ${p.location}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.kind === 'competition' && (
                    <Link to={`/competitions/upcoming/${p.id}`} className="label-caps text-aka hover:underline">
                      Prep
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removePlanned(p.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showForm ? (
          <form
            onSubmit={handleManualAdd}
            className="card-elevated flex flex-col gap-3 border border-border bg-card p-4"
          >
            <Input placeholder="Event name" value={event} onChange={(e) => setEvent(e.target.value)} required />
            <DatePicker value={date} onChange={setDate} />
            <Input
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" className="glow-primary">
                Save
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="label-caps self-start text-muted-foreground hover:text-foreground"
          >
            + Add your own
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="label-caps text-muted-foreground">Discover</span>
          <div className="flex gap-2">
            <ToggleChip label="Competitions" accent="aka" selected={showComps} onClick={() => setShowComps((v) => !v)} />
            <ToggleChip label="Events" accent="ao" selected={showEvents} onClick={() => setShowEvents((v) => !v)} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => syncWkf()}
              disabled={wkfSyncing}
              className="label-caps flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Icon name="monitoring" className="size-3.5" />
              {wkfSyncing ? 'Syncing WKF…' : 'Sync WKF'}
            </button>
            <button
              onClick={() => syncKbc()}
              disabled={kbcSyncing}
              className="label-caps flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Icon name="monitoring" className="size-3.5" />
              {kbcSyncing ? 'Syncing BC…' : 'Sync BC'}
            </button>
          </div>
        </div>

        {loading ? (
          <CardSkeletonList count={3} />
        ) : discoverItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing to discover yet — tap "Sync WKF" or "Sync BC" above.
          </p>
        ) : (
          <motion.ul
            className="flex flex-col gap-3"
            variants={reducedMotion ? undefined : staggerContainer()}
            initial={reducedMotion ? undefined : 'hidden'}
            animate={reducedMotion ? undefined : 'show'}
          >
            <AnimatePresence mode="popLayout">
              {discoverItems.map((item) => (
                <motion.li
                  key={item.key}
                  className="card-elevated flex items-center justify-between gap-3 border border-border bg-card p-4"
                  variants={reducedMotion ? undefined : popIn}
                  exit={reducedMotion ? undefined : 'exit'}
                  layout={!reducedMotion}
                  transition={springy}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 size-2 flex-shrink-0 rounded-full ${
                        item.kind === 'competition' ? 'bg-aka' : 'bg-ao'
                      }`}
                    />
                    <div>
                      <p className="font-heading text-lg">{item.name}</p>
                      <p className="label-caps text-muted-foreground">
                        {item.date}
                        {item.dateEnd ? ` – ${item.dateEnd}` : ''}
                        {item.location ? ` · ${item.location}` : ''}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleAdd(item)}>
                    Add
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  )
}
