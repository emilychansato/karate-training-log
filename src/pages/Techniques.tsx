import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTechniques } from '../hooks/useTechniques'
import { useUserTechniques } from '../hooks/useUserTechniques'
import { classifyKumiteTechnique } from '../lib/techniqueClassification'
import { TechniquePortfolio } from '../components/techniques/TechniquePortfolio'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Icon } from '../components/ui/icon'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { SegmentedControl } from '../components/ui/segmented-control'

const CATEGORY_TABS: { value: 'kata' | 'kumite_combo'; label: string }[] = [
  { value: 'kata', label: 'KATA' },
  { value: 'kumite_combo', label: 'KUMITE' },
]

export function Techniques() {
  const { techniques, loading } = useTechniques()
  const { bookmarks, loading: bookmarksLoading, addBookmark, removeBookmark } =
    useUserTechniques()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'kata' | 'kumite_combo'>('kata')

  const bookmarkedIds = new Set(bookmarks.map((b) => b.technique_id))
  const filtered = techniques
    .filter((t) => t.category === category)
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <span className="label-caps mb-1 block text-aka">Karate OS</span>
        <h1 className="font-heading-hero text-4xl">Techniques</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="target" />
            Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SegmentedControl
            name="category"
            options={CATEGORY_TABS}
            value={category}
            onChange={setCategory}
            className="mb-4"
          />
          <div className="relative mb-4">
            <Icon
              name="search"
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search katas and kumite combos…"
              className="pl-8"
            />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {filtered.map((t) => {
                const bookmark = bookmarks.find((b) => b.technique_id === t.id)
                const isBookmarked = bookmarkedIds.has(t.id)
                const typeLabel =
                  t.category === 'kata' ? 'Kata' : classifyKumiteTechnique(t.name)
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0"
                  >
                    <Link to={`/techniques/${t.id}`} className="hover:underline">
                      <p>
                        {t.name}
                        {bookmark?.nickname ? ` (${bookmark.nickname})` : ''}
                      </p>
                      <p className="label-caps text-muted-foreground">{typeLabel}</p>
                    </Link>
                    <Button
                      variant={isBookmarked ? 'ghost' : 'outline'}
                      size="sm"
                      disabled={isBookmarked}
                      onClick={() => addBookmark(t.id)}
                    >
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No techniques match "{search}".
                </p>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="award" />
            Your bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TechniquePortfolio
            bookmarks={bookmarks}
            loading={bookmarksLoading}
            removeBookmark={removeBookmark}
          />
        </CardContent>
      </Card>
    </div>
  )
}
