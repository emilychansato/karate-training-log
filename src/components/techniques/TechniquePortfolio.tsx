import { Link } from 'react-router-dom'
import type { TechniqueBookmark } from '../../hooks/useUserTechniques'
import { Button } from '../ui/button'

export function TechniquePortfolio({
  bookmarks,
  loading,
  removeBookmark,
}: {
  bookmarks: TechniqueBookmark[]
  loading: boolean
  removeBookmark: (id: string) => Promise<{ error: string | null }>
}) {
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
          <Link to={`/techniques/${b.technique_id}`} className="font-medium hover:underline">
            {b.technique_name}
            {b.nickname ? ` (${b.nickname})` : ''}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => removeBookmark(b.id)}>
            Remove
          </Button>
        </li>
      ))}
    </ul>
  )
}
