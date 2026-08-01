import { useUserTechniques } from '../../hooks/useUserTechniques'
import { Button } from '../ui/button'

export function TechniquePortfolio() {
  const { bookmarks, loading, removeBookmark } = useUserTechniques()

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (bookmarks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No techniques bookmarked yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {bookmarks.map((b) => (
        <li
          key={b.id}
          className="flex items-center justify-between border border-border p-3 text-sm"
        >
          <div>
            <p className="font-medium">{b.nickname ?? b.technique_name}</p>
            {b.nickname && (
              <p className="text-xs text-muted-foreground">{b.technique_name}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeBookmark(b.id)}>
            Remove
          </Button>
        </li>
      ))}
    </ul>
  )
}
