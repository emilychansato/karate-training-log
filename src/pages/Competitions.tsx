import { useState } from 'react'
import { CompetitionForm } from '../components/forms/CompetitionForm'
import { useCompetitionResults } from '../hooks/useCompetitionResults'
import { Icon } from '../components/ui/icon'

export function Competitions() {
  const [showForm, setShowForm] = useState(false)
  const { results, loading } = useCompetitionResults()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="label-caps mb-1 block text-aka">Karate OS</span>
          <h1 className="font-heading text-4xl">Competitions</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="label-caps hidden text-muted-foreground hover:text-foreground md:block"
        >
          {showForm ? 'Cancel' : '+ New result'}
        </button>
      </div>
      {showForm && <CompetitionForm onSuccess={() => setShowForm(false)} />}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
      )}
      <ul className="flex flex-col gap-4">
        {results.map((r) => (
          <li key={r.id} className="border border-border bg-card p-5">
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
              <p className="label-caps text-muted-foreground opacity-60">{r.date}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="trophy" className="size-4" />
              {r.placement ?? 'no placement recorded'}
            </div>
          </li>
        ))}
      </ul>

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
