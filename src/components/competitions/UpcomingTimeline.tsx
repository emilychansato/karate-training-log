import { useState } from 'react'
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

interface TimelineItem {
  key: string
  name: string
  date: string
  dateEnd: string | null
  location: string | null
  kind: Kind
  isMine: boolean
  plannedId?: string
  sourceType?: 'wkf' | 'kbc'
  sourceId?: string
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

  const mineItems: TimelineItem[] = planned
    .filter((p) => p.date >= today)
    .map((p) => ({
      key: `mine-${p.id}`,
      name: p.event,
      date: p.date,
      dateEnd: null,
      location: p.location,
      kind: p.kind,
      isMine: true,
      plannedId: p.id,
    }))

  const wkfItems: TimelineItem[] = wkfEvents
    .filter((e) => e.date_start >= today && !alreadyAdded('wkf', e.id))
    .map((e) => ({
      key: `wkf-${e.id}`,
      name: e.name,
      date: e.date_start,
      dateEnd: e.date_end,
      location: e.location,
      kind: 'competition',
      isMine: false,
      sourceType: 'wkf',
      sourceId: e.id,
    }))

  const kbcItems: TimelineItem[] = kbcEvents
    .filter((e) => e.date_start >= today && !alreadyAdded('kbc', e.id))
    .map((e) => ({
      key: `kbc-${e.id}`,
      name: e.name,
      date: e.date_start,
      dateEnd: e.date_end,
      location: e.location,
      kind: e.kind,
      isMine: false,
      sourceType: 'kbc',
      sourceId: e.id,
    }))

  const items = [...mineItems, ...wkfItems, ...kbcItems]
    .filter((i) => (i.kind === 'competition' ? showComps : showEvents))
    .sort((a, b) => a.date.localeCompare(b.date))

  async function handleAdd(item: TimelineItem) {
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nothing upcoming yet — sync the calendars above or add your own.
        </p>
      ) : (
        <motion.ul
          className="flex flex-col gap-3"
          variants={reducedMotion ? undefined : staggerContainer()}
          initial={reducedMotion ? undefined : 'hidden'}
          animate={reducedMotion ? undefined : 'show'}
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
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
                {item.isMine ? (
                  <Button variant="ghost" size="sm" onClick={() => removePlanned(item.plannedId!)}>
                    Remove
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleAdd(item)}>
                    Add
                  </Button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <span className="label-caps text-muted-foreground">Add your own</span>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="label-caps text-muted-foreground hover:text-foreground"
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showForm && (
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
            <Button type="submit" className="glow-primary">
              Save
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
