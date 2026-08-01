import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCompetitions } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import { MatchForm } from '../components/forms/MatchForm'
import { Button } from '../components/ui/button'
import { Icon } from '../components/ui/icon'
import { CardSkeletonList } from '../components/ui/skeleton'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { popIn, staggerContainer, springy } from '../lib/motion'

export function CompetitionDetail() {
  const { id } = useParams<{ id: string }>()
  const { competitions, loading: competitionsLoading } = useCompetitions()
  const { matches, loading: matchesLoading, createMatch, deleteMatch } = useCompetitionMatches(id ?? '')
  const [showForm, setShowForm] = useState(false)
  const reducedMotion = useReducedMotion()

  const competition = competitions.find((c) => c.id === id)

  if (competitionsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!competition) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Competition not found.</p>
        <Link to="/competitions" className="label-caps text-aka">
          Back to competitions
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <Link to="/competitions" className="label-caps mb-2 block text-muted-foreground hover:text-foreground">
          ← Competitions
        </Link>
        <span
          className={`label-caps mb-2 inline-block px-2 py-0.5 ${
            competition.discipline === 'kata' ? 'bg-ao text-white' : 'bg-aka text-white'
          }`}
        >
          {competition.discipline}
        </span>
        <h1 className="font-heading-hero text-4xl">{competition.event}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {competition.date}
          {competition.division ? ` · ${competition.division}` : ''}
          {competition.placement ? ` · ${competition.placement}` : ''}
        </p>
        {competition.notes && <p className="mt-3 text-sm">{competition.notes}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg">Matches</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="label-caps text-muted-foreground hover:text-foreground"
        >
          {showForm ? 'Cancel' : '+ Add match'}
        </button>
      </div>

      {showForm && (
        <MatchForm
          discipline={competition.discipline}
          createMatch={createMatch}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {matchesLoading ? (
        <CardSkeletonList count={2} />
      ) : matches.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No matches logged yet.</p>
      ) : (
        <motion.ul
          className="flex flex-col gap-3"
          variants={reducedMotion ? undefined : staggerContainer()}
          initial={reducedMotion ? undefined : 'hidden'}
          animate={reducedMotion ? undefined : 'show'}
        >
          <AnimatePresence mode="popLayout">
            {matches.map((m) => (
              <motion.li
                key={m.id}
                className="card-elevated border border-border bg-card p-4"
                variants={reducedMotion ? undefined : popIn}
                exit={reducedMotion ? undefined : 'exit'}
                layout={!reducedMotion}
                transition={springy}
              >
                <div className="flex items-start justify-between">
                  <div>
                    {m.round_label && (
                      <p className="label-caps text-muted-foreground">{m.round_label}</p>
                    )}
                    <p className="font-heading text-lg">{m.opponent_name ?? 'Opponent'}</p>
                  </div>
                  {competition.discipline === 'kumite' && (
                    <p className="font-mono tabular-mono text-xl font-bold">
                      <span className="text-aka">{m.points_for ?? 0}</span>
                      {' – '}
                      <span className="text-ao">{m.points_against ?? 0}</span>
                    </p>
                  )}
                  {competition.discipline === 'kata' && m.kata_technical_score != null && (
                    <p className="font-mono tabular-mono text-xl font-bold">
                      {m.kata_technical_score}
                    </p>
                  )}
                </div>
                {m.win_method && (
                  <p className="label-caps mt-2 text-muted-foreground">
                    Won by {m.win_method}
                  </p>
                )}
                {m.notes && <p className="mt-2 text-sm">{m.notes}</p>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive"
                  onClick={() => deleteMatch(m.id)}
                >
                  <Icon name="close" className="size-3.5" />
                  Delete
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
