import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Button } from '../ui/button'

export function SessionList() {
  const { sessions, loading, deleteSession } = useTrainingSessions()

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="flex flex-col gap-1 border border-border p-3 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{s.type}</span>
            <span className="text-muted-foreground font-mono tabular-mono">{s.date}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{s.duration_min} min</span>
            {s.self_rating && <span>Rating: {s.self_rating}/5</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="self-end text-destructive"
            onClick={() => deleteSession(s.id)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  )
}
