import { useState } from 'react'
import type { GoalType, NewGoal } from '../../hooks/useGoals'
import type { Competition } from '../../hooks/useCompetitions'
import { SegmentedControl } from '../ui/segmented-control'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { DatePicker } from '../ui/date-picker'

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'training_frequency', label: 'FREQUENCY' },
  { value: 'weight', label: 'WEIGHT' },
  { value: 'competition_placement', label: 'PLACEMENT' },
  { value: 'rank', label: 'RANK' },
]

export function GoalForm({
  competitions,
  createGoal,
  onSuccess,
}: {
  competitions: Competition[]
  createGoal: (input: NewGoal) => Promise<{ error: string | null }>
  onSuccess: () => void
}) {
  const [goalType, setGoalType] = useState<GoalType>('training_frequency')
  const [targetValue, setTargetValue] = useState('')
  const [targetText, setTargetText] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [competitionLabel, setCompetitionLabel] = useState('')
  const competitionLabelFor = (c: Competition) => `${c.event} — ${c.date}`
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    let input: NewGoal
    if (goalType === 'training_frequency') {
      const value = Number(targetValue)
      if (!value) return setSubmitError('Enter a target number of sessions')
      input = { goal_type: goalType, title: `Train ${value}x/week`, target_value: value }
    } else if (goalType === 'weight') {
      const value = Number(targetValue)
      if (!value) return setSubmitError('Enter a target weight')
      input = { goal_type: goalType, title: `Reach ${value} kg`, target_value: value }
    } else if (goalType === 'competition_placement') {
      const comp = competitions.find((c) => competitionLabelFor(c) === competitionLabel)
      if (!comp) return setSubmitError('Pick a competition')
      input = {
        goal_type: goalType,
        title: `Place well at ${comp.event}`,
        competition_id: comp.id,
        target_text: targetText || undefined,
      }
    } else {
      if (!targetText) return setSubmitError('Enter a target rank/belt')
      input = { goal_type: goalType, title: `Reach ${targetText}`, target_text: targetText }
    }

    if (targetDate) input.target_date = targetDate

    const { error } = await createGoal(input)
    if (error) setSubmitError(error)
    else onSuccess()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-elevated flex w-full flex-col gap-4 border border-border bg-card p-5"
    >
      {submitError && (
        <p className="border-l-2 border-l-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Goal type</Label>
        <SegmentedControl
          name="goal-type"
          options={GOAL_TYPE_OPTIONS}
          value={goalType}
          onChange={(v) => setGoalType(v as GoalType)}
        />
      </div>

      {(goalType === 'training_frequency' || goalType === 'weight') && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="target_value">
            {goalType === 'training_frequency' ? 'Sessions per week' : 'Target weight (kg)'}
          </Label>
          <Input
            id="target_value"
            type="number"
            step={goalType === 'weight' ? '0.1' : '1'}
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>
      )}

      {goalType === 'competition_placement' && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="competition">Competition</Label>
            <Select
              value={competitionLabel}
              onChange={setCompetitionLabel}
              options={competitions.map(competitionLabelFor)}
              placeholder="Select a competition…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="target_text">Target (optional)</Label>
            <Input
              id="target_text"
              placeholder="e.g. Top 3"
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
            />
          </div>
        </>
      )}

      {goalType === 'rank' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="target_text">Target rank/belt</Label>
          <Input
            id="target_text"
            placeholder="e.g. Brown Belt"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="target_date">Deadline (optional)</Label>
        <DatePicker value={targetDate} onChange={setTargetDate} />
      </div>

      <Button type="submit" className="glow-primary w-full">
        Set goal
      </Button>
    </form>
  )
}
