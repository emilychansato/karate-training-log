import { useState } from 'react'
import { SessionForm } from '../components/forms/SessionForm'
import { SessionList } from '../components/log/SessionList'
import { Button } from '../components/ui/button'

export function TrainingLog() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg">Training Log</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New session'}
        </Button>
      </div>
      {showForm && <SessionForm onSuccess={() => setShowForm(false)} />}
      <SessionList />
    </div>
  )
}
