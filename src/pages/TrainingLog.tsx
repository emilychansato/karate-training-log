import { useState } from 'react'
import { motion } from 'framer-motion'
import { SessionForm } from '../components/forms/SessionForm'
import { SessionList } from '../components/log/SessionList'
import { SessionCalendar } from '../components/log/SessionCalendar'
import { HoursChart } from '../components/dashboard/HoursChart'
import { Icon } from '../components/ui/icon'
import { Input } from '../components/ui/input'
import { SegmentedControl } from '../components/ui/segmented-control'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTrainingSessions, type TrainingSession } from '../hooks/useTrainingSessions'
import { computeSessionStats } from '../lib/trainingStats'
import { springy } from '../lib/motion'
import { cn } from '@/lib/utils'

type LogView = 'list' | 'chart' | 'calendar'

const TYPE_FILTERS = [
  { value: 'all', label: 'ALL SESSIONS' },
  { value: 'kumite', label: 'KUMITE' },
  { value: 'kata', label: 'KATA' },
  { value: 'conditioning', label: 'CONDITIONING' },
]

function FilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
  typeFilter: string
  onTypeFilterChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-72">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sessions…"
          className="pl-8"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onTypeFilterChange(f.value)}
            className={cn(
              'label-caps whitespace-nowrap border px-3 py-1.5 transition-colors duration-150',
              typeFilter === f.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatStrip({ sessions }: { sessions: TrainingSession[] }) {
  const stats = computeSessionStats(sessions, new Date())

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      <div className="card-elevated flex min-w-[130px] flex-col justify-between border border-border bg-card p-4">
        <p className="label-caps text-muted-foreground">Sessions</p>
        <p className="font-heading mt-1 text-2xl">{stats.totalSessions}</p>
      </div>
      <div className="card-elevated flex min-w-[130px] flex-col justify-between border border-border bg-card p-4">
        <p className="label-caps text-muted-foreground">This week</p>
        <p className="font-heading mt-1 text-2xl text-ao">{stats.hoursThisWeek}h</p>
      </div>
      <div className="card-elevated flex min-w-[130px] flex-col justify-between border border-border bg-card p-4">
        <p className="label-caps text-muted-foreground">vs last month</p>
        <p
          className={`font-heading mt-1 text-2xl ${
            stats.monthHoursDelta != null && stats.monthHoursDelta < 0 ? 'text-aka' : 'text-ao'
          }`}
        >
          {stats.monthHoursDelta != null
            ? `${stats.monthHoursDelta >= 0 ? '+' : ''}${stats.monthHoursDelta}h`
            : '—'}
        </p>
      </div>
    </div>
  )
}

export function TrainingLog() {
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [view, setView] = useState<LogView>('list')
  const reducedMotion = useReducedMotion()
  const { sessions, loading, createSession, deleteSession } = useTrainingSessions()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="label-caps mb-1 block text-aka">Karate OS</span>
          <h1 className="font-heading-hero text-4xl">Training Logs</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="label-caps hidden text-muted-foreground hover:text-foreground md:block"
        >
          {showForm ? 'Cancel' : '+ New session'}
        </button>
      </div>
      <StatStrip sessions={sessions} />
      {showForm && (
        <SessionForm createSession={createSession} onSuccess={() => setShowForm(false)} />
      )}
      <SegmentedControl
        name="log-view"
        options={[
          { value: 'list', label: 'LIST' },
          { value: 'chart', label: 'CHART' },
          { value: 'calendar', label: 'CALENDAR' },
        ]}
        value={view}
        onChange={(v) => setView(v as LogView)}
        className="max-w-xs"
      />

      {view === 'list' && (
        <>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />
          <SessionList
            sessions={sessions}
            loading={loading}
            deleteSession={deleteSession}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
          />
        </>
      )}
      {view === 'chart' && <HoursChart />}
      {view === 'calendar' && <SessionCalendar sessions={sessions} />}

      {/* FAB */}
      <motion.button
        onClick={() => setShowForm((v) => !v)}
        aria-label={showForm ? 'Cancel new session' : 'New session'}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center bg-aka text-white shadow-xl active:scale-95 md:hidden"
        initial={reducedMotion ? undefined : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springy}
        whileTap={{ scale: 0.9 }}
      >
        <Icon name={showForm ? 'close' : 'add'} className="size-6" />
      </motion.button>
    </div>
  )
}
