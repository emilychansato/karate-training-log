import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUsername, type UserMatch } from '../hooks/useUsername'
import { useFriends } from '../hooks/useFriends'
import { useClubs, type Club } from '../hooks/useClubs'
import { getCurrentUserId } from '../lib/getCurrentUserId'
import { SegmentedControl } from '../components/ui/segmented-control'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Icon } from '../components/ui/icon'

function UsernameSetup({ claimUsername }: { claimUsername: (name: string) => Promise<{ error: string | null }> }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const { error } = await claimUsername(name.trim())
    setError(error)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Pick a username</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Needed so other people can find you to add as a friend or invite to a club.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. emily_k"
            className="flex-1"
          />
          <Button type="submit" className="glow-primary flex-shrink-0">
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function FriendsTab() {
  const { friendships, loading, sendRequest, acceptRequest, removeFriend } = useFriends()
  const { searchUsers } = useUsername()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserMatch[]>([])
  const [searching, setSearching] = useState(false)

  const accepted = friendships.filter((f) => f.status === 'accepted')

  async function handleSearch(q: string) {
    setQuery(q)
    setSearching(true)
    setResults(await searchUsers(q))
    setSearching(false)
  }

  async function handleAdd(userId: string) {
    await sendRequest(userId)
    setResults([])
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Add a friend</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by username…"
          />
          {searching && <p className="text-sm text-muted-foreground">Searching…</p>}
          {results.length > 0 && (
            <ul className="flex flex-col gap-2">
              {results.map((r) => (
                <li key={r.user_id} className="flex items-center justify-between text-sm">
                  <span>{r.username}</span>
                  <Button size="sm" onClick={() => handleAdd(r.user_id)}>
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {!loading && friendships.filter((f) => f.status === 'pending').length > 0 && (
        <div>
          <p className="label-caps mb-2 text-muted-foreground">Requests</p>
          <ul className="flex flex-col gap-2">
            <PendingRequests friendships={friendships} acceptRequest={acceptRequest} removeFriend={removeFriend} />
          </ul>
        </div>
      )}

      <div>
        <p className="label-caps mb-2 text-muted-foreground">Friends</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : accepted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No friends yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {accepted.map((f) => (
              <li key={f.id} className="card-elevated flex items-center justify-between border border-border bg-card p-3">
                <span className="text-sm">{f.otherUsername ?? f.otherUserId}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFriend(f.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function PendingRequests({
  friendships,
  acceptRequest,
  removeFriend,
}: {
  friendships: ReturnType<typeof useFriends>['friendships']
  acceptRequest: ReturnType<typeof useFriends>['acceptRequest']
  removeFriend: ReturnType<typeof useFriends>['removeFriend']
}) {
  const [myId, setMyId] = useState<string | null>(null)
  useState(() => {
    getCurrentUserId().then(setMyId)
  })

  const pending = friendships.filter((f) => f.status === 'pending')

  return (
    <>
      {pending.map((f) => {
        const incoming = f.recipient_id === myId
        return (
          <li key={f.id} className="card-elevated flex items-center justify-between border border-border bg-card p-3">
            <span className="text-sm">
              {f.otherUsername ?? f.otherUserId} {incoming ? '(wants to be friends)' : '(pending)'}
            </span>
            <div className="flex gap-1">
              {incoming && (
                <Button size="sm" onClick={() => acceptRequest(f.id)}>
                  Accept
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => removeFriend(f.id)}>
                {incoming ? 'Decline' : 'Cancel'}
              </Button>
            </div>
          </li>
        )
      })}
    </>
  )
}

function ClubsTab() {
  const { myClubs, loading, createClub, searchClubs, joinClub, leaveClub } = useClubs()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Club[]>([])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const { error } = await createClub(name.trim(), description || undefined)
    if (!error) {
      setName('')
      setDescription('')
      setShowCreate(false)
    }
  }

  async function handleSearch(q: string) {
    setQuery(q)
    setResults(await searchClubs(q))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Find a club</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search club names…"
          />
          {results.length > 0 && (
            <ul className="flex flex-col gap-2">
              {results.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.name}</span>
                  <Button size="sm" onClick={() => joinClub(c.id)}>
                    Join
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="label-caps text-muted-foreground">My clubs</p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="label-caps text-muted-foreground hover:text-foreground"
        >
          {showCreate ? 'Cancel' : '+ Create club'}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="card-elevated flex flex-col gap-3 border border-border bg-card p-4"
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Club name" />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <Button type="submit" className="glow-primary">
            Create
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : myClubs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not in any clubs yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {myClubs.map((c) => (
            <li key={c.id} className="card-elevated border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/clubs/${c.id}`} className="font-heading text-lg hover:underline">
                    {c.name}
                  </Link>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => leaveClub(c.id)}>
                  Leave
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ClubsAndFriends() {
  const { username, loading: usernameLoading, claimUsername } = useUsername()
  const [tab, setTab] = useState<'clubs' | 'friends'>('clubs')

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <span className="label-caps mb-1 block text-aka">Karate OS</span>
        <h1 className="font-heading-hero flex items-center gap-2 text-4xl">
          <Icon name="users" className="size-8" />
          Clubs &amp; Friends
        </h1>
      </div>

      {!usernameLoading && !username && <UsernameSetup claimUsername={claimUsername} />}

      <SegmentedControl
        name="clubs-tab"
        options={[
          { value: 'clubs', label: 'CLUBS' },
          { value: 'friends', label: 'FRIENDS' },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-xs"
      />

      {tab === 'clubs' && <ClubsTab />}
      {tab === 'friends' && <FriendsTab />}
    </div>
  )
}
