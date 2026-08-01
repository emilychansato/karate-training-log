import { useState } from 'react'
import type { Competition, CompetitionReflection } from '../../hooks/useCompetitions'
import { Button } from '../ui/button'
import { Label } from '../ui/label'

const FIELDS: { key: keyof CompetitionReflection; label: string; placeholder: string }[] = [
  { key: 'what_went_well', label: 'What went well', placeholder: 'Technical/tactical wins from this competition' },
  { key: 'what_to_improve', label: 'What to improve', placeholder: 'Gaps this competition exposed' },
  { key: 'post_competition_feelings', label: 'How you felt afterwards', placeholder: 'The emotional read, separate from the technical one' },
  { key: 'goals_for_next_time', label: 'Goals for next time', placeholder: 'A concrete target for the next competition' },
  { key: 'coach_notes', label: "Coach's notes", placeholder: "Your coach's feedback" },
]

export function ReflectionForm({
  competition,
  updateCompetition,
  onSuccess,
}: {
  competition: Competition
  updateCompetition: (
    id: string,
    fields: CompetitionReflection
  ) => Promise<{ error: string | null }>
  onSuccess: () => void
}) {
  const [values, setValues] = useState<CompetitionReflection>({
    what_went_well: competition.what_went_well ?? '',
    what_to_improve: competition.what_to_improve ?? '',
    post_competition_feelings: competition.post_competition_feelings ?? '',
    goals_for_next_time: competition.goals_for_next_time ?? '',
    coach_notes: competition.coach_notes ?? '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await updateCompetition(competition.id, values)
    setSubmitting(false)
    if (!error) onSuccess()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-elevated flex w-full flex-col gap-4 border border-border bg-card p-5"
    >
      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <Label htmlFor={f.key}>{f.label}</Label>
          <textarea
            id={f.key}
            placeholder={f.placeholder}
            value={values[f.key] ?? ''}
            onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            className="min-h-16 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      ))}

      <Button type="submit" disabled={submitting} className="glow-primary w-full">
        {submitting ? 'Saving…' : 'Save reflection'}
      </Button>
    </form>
  )
}
