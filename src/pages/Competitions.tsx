import { useState } from 'react'
import { CompetitionForm } from '../components/forms/CompetitionForm'
import { useCompetitionResults } from '../hooks/useCompetitionResults'
import { Button } from '../components/ui/button'

export function Competitions() {
  const [showForm, setShowForm] = useState(false)
  const { results, loading } = useCompetitionResults()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg">Competitions</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New result'}
        </Button>
      </div>
      {showForm && <CompetitionForm onSuccess={() => setShowForm(false)} />}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
      )}
      <ul className="flex flex-col gap-3">
        {results.map((r) => (
          <li key={r.id} className="border border-border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.event}</span>
              <span className="text-muted-foreground font-mono tabular-mono">{r.date}</span>
            </div>
            <div className="text-muted-foreground">
              {r.discipline} · {r.placement ?? 'no placement recorded'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
