import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useClubs, type ClubMember } from '../hooks/useClubs'

export function ClubDetail() {
  const { id } = useParams<{ id: string }>()
  const { myClubs, loading, getMembers } = useClubs()
  const [members, setMembers] = useState<ClubMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)

  const club = myClubs.find((c) => c.id === id)

  useEffect(() => {
    if (!id) return
    setMembersLoading(true)
    getMembers(id).then((m) => {
      setMembers(m)
      setMembersLoading(false)
    })
  }, [id, getMembers])

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (!club) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Club not found.</p>
        <Link to="/clubs" className="label-caps text-aka hover:underline">
          ← Clubs
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <Link to="/clubs" className="label-caps mb-2 block text-muted-foreground hover:text-foreground">
          ← Clubs
        </Link>
        <h1 className="font-heading-hero text-4xl">{club.name}</h1>
        {club.description && <p className="mt-2 text-sm text-muted-foreground">{club.description}</p>}
      </div>

      <div>
        <p className="label-caps mb-2 text-muted-foreground">
          Members ({members.length})
        </p>
        {membersLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="card-elevated flex items-center justify-between border border-border bg-card p-3"
              >
                <span className="text-sm">{m.username ?? m.user_id}</span>
                {m.role === 'admin' && (
                  <span className="label-caps text-aka">Admin</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
