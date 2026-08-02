import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCompetitionStats } from '../hooks/useCompetitionStats'
import { useOpponentNotes } from '../hooks/useOpponentNotes'
import { Button } from '../components/ui/button'

export function OpponentDetail() {
  const { name } = useParams<{ name: string }>()
  const opponentName = decodeURIComponent(name ?? '')
  const { matches, opponents, loading: statsLoading } = useCompetitionStats()
  const { notes, loading: notesLoading, saveNotes } = useOpponentNotes(opponentName)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const stat = opponents.find((o) => o.opponentName === opponentName)
  const opponentMatches = matches
    .filter((m) => m.opponent_name === opponentName)
    .sort((a, b) => b.date.localeCompare(a.date))

  async function handleSave() {
    const { error } = await saveNotes(text)
    if (!error) setEditing(false)
  }

  if (statsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!stat) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">No matches found against this opponent.</p>
        <Link to="/profile" className="label-caps text-aka">← Profile</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <Link to="/profile" className="label-caps mb-2 block text-muted-foreground hover:text-foreground">
          ← Profile
        </Link>
        <h1 className="font-heading-hero text-4xl">{opponentName}</h1>
        <p className="mt-1 font-mono tabular-mono text-sm">
          <span className="text-ao">{stat.wins}W</span>{' '}
          <span className="text-aka">{stat.losses}L</span>{' '}
          <span className="text-muted-foreground">{stat.draws}D</span>
          <span className="ml-2 text-muted-foreground">
            avg {stat.avgPointsFor.toFixed(1)}–{stat.avgPointsAgainst.toFixed(1)}
          </span>
        </p>
      </div>

      <div className="card-elevated flex flex-col gap-3 border border-border bg-card p-5">
        <p className="font-heading text-lg">Notes</p>
        {notesLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tendencies, favorite techniques, what's worked against them before…"
              className="min-h-24 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <Button size="sm" className="glow-primary" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : notes ? (
          <div className="flex flex-col gap-2">
            <p className="whitespace-pre-wrap text-sm">{notes}</p>
            <Button
              size="sm"
              variant="ghost"
              className="w-fit"
              onClick={() => {
                setText(notes)
                setEditing(true)
              }}
            >
              Edit
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-fit"
            onClick={() => {
              setText('')
              setEditing(true)
            }}
          >
            + Add notes
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="label-caps text-muted-foreground">Match history</p>
        <ul className="flex flex-col gap-3">
          {opponentMatches.map((m) => (
            <li key={m.matchId}>
              <Link
                to={`/competitions/${m.competitionId}`}
                className="card-elevated flex items-center justify-between border border-border bg-card p-4 hover:border-ring"
              >
                <div>
                  <p className="font-heading text-lg">{m.event}</p>
                  <p className="label-caps text-muted-foreground">
                    {m.date}
                    {m.division ? ` · ${m.division}` : ''}
                  </p>
                </div>
                <p className="font-mono tabular-mono text-xl font-bold">
                  <span className="text-ao">{m.points_for}</span>
                  {' – '}
                  <span className="text-aka">{m.points_against}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
