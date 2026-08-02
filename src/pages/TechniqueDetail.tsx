import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTechniques } from '../hooks/useTechniques'
import { useUserTechniques } from '../hooks/useUserTechniques'
import { classifyKumiteTechnique } from '../lib/techniqueClassification'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function TechniqueDetail() {
  const { id } = useParams<{ id: string }>()
  const { techniques, loading: techniquesLoading } = useTechniques()
  const { bookmarks, loading: bookmarksLoading, addBookmark, updateNickname } =
    useUserTechniques()
  const [nickname, setNickname] = useState('')
  const [editingNickname, setEditingNickname] = useState(false)

  const technique = techniques.find((t) => t.id === id)
  const bookmark = bookmarks.find((b) => b.technique_id === id)

  if (techniquesLoading || bookmarksLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!technique) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Technique not found.</p>
        <Link to="/profile" className="label-caps text-aka transition-colors duration-150 hover:underline">← Profile</Link>
      </div>
    )
  }

  const categoryLabel =
    technique.category === 'kata' ? 'Kata' : classifyKumiteTechnique(technique.name)

  async function handleSaveNickname(e: React.FormEvent) {
    e.preventDefault()
    if (!bookmark) return
    const { error } = await updateNickname(bookmark.id, nickname)
    if (!error) setEditingNickname(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <Link to="/profile" className="label-caps mb-2 block text-muted-foreground hover:text-foreground">
          ← Profile
        </Link>
        <span className="label-caps mb-2 inline-block bg-ao px-2 py-0.5 text-white">
          {categoryLabel}
        </span>
        <h1 className="font-heading-hero text-4xl">{technique.name}</h1>
        {bookmark?.nickname && (
          <p className="mt-1 text-lg text-muted-foreground">"{bookmark.nickname}"</p>
        )}
      </div>

      {!bookmark ? (
        <Button className="glow-primary w-fit" onClick={() => addBookmark(technique.id)}>
          Bookmark this technique
        </Button>
      ) : editingNickname ? (
        <form onSubmit={handleSaveNickname} className="card-elevated flex flex-col gap-3 border border-border bg-card p-4">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. My bread and butter combo"
          />
          <div className="flex gap-2">
            <Button type="submit" className="glow-primary">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditingNickname(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => {
            setNickname(bookmark.nickname ?? '')
            setEditingNickname(true)
          }}
        >
          {bookmark.nickname ? 'Edit nickname' : '+ Add nickname'}
        </Button>
      )}

      <div className="card-elevated flex flex-col gap-2 border border-border bg-card p-5">
        <p className="label-caps text-muted-foreground">Coming soon</p>
        <p className="text-sm text-muted-foreground">
          Reference video and your own notes for this technique will live here.
        </p>
      </div>
    </div>
  )
}
