import { useState } from 'react'
import { SessionForm } from '../components/forms/SessionForm'
import { SessionList } from '../components/log/SessionList'
import { Icon } from '../components/ui/icon'

export function TrainingLog() {
  const [showForm, setShowForm] = useState(false)

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
      {showForm && <SessionForm onSuccess={() => setShowForm(false)} />}
      <SessionList />

      {/* FAB */}
      <button
        onClick={() => setShowForm((v) => !v)}
        aria-label={showForm ? 'Cancel new session' : 'New session'}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center bg-aka text-white shadow-xl transition-transform active:scale-95 md:hidden"
      >
        <Icon name={showForm ? 'close' : 'add'} className="size-6" />
      </button>
    </div>
  )
}
