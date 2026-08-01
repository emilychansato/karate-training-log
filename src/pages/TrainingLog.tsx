import { useState } from 'react'
import { motion } from 'framer-motion'
import { SessionForm } from '../components/forms/SessionForm'
import { SessionList } from '../components/log/SessionList'
import { Icon } from '../components/ui/icon'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTrainingSessions } from '../hooks/useTrainingSessions'
import { computeSessionStats } from '../lib/trainingStats'
import { springy } from '../lib/motion'

function StatStrip() {
  const { sessions } = useTrainingSessions()
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
        <p className="label-caps text-muted-foreground">Intensity</p>
        <p className="font-heading mt-1 text-2xl text-aka">
          {stats.intensityPercent != null ? `${stats.intensityPercent}%` : '—'}
        </p>
      </div>
    </div>
  )
}

export function TrainingLog() {
  const [showForm, setShowForm] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="label-caps mb-1 block text-aka">Karate OS</span>
          <h1 className="font-heading text-4xl">Training Logs</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="label-caps hidden text-muted-foreground hover:text-foreground md:block"
        >
          {showForm ? 'Cancel' : '+ New session'}
        </button>
      </div>
      <StatStrip />
      {showForm && <SessionForm onSuccess={() => setShowForm(false)} />}
      <SessionList />

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
