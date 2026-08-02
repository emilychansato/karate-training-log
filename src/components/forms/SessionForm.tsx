import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { NewTrainingSession } from '../../hooks/useTrainingSessions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SegmentedControl } from '../ui/segmented-control'
import { ToggleChip } from '../ui/toggle-chip'

const SESSION_TYPES = ['kata', 'kumite', 'conditioning', 'other'] as const
const SESSION_TYPE_OPTIONS = SESSION_TYPES.map((t) => ({
  value: t,
  label: t.toUpperCase(),
}))
const IMPROVED_OPTIONS = ['Speed', 'Timing', 'Distance', 'Power', 'Accuracy', 'Strategy']
const STRUGGLED_OPTIONS = [
  'Fatigue',
  'Reaction time',
  'Footwork',
  'Confidence',
  'Technique consistency',
]

const schema = z.object({
  title: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(SESSION_TYPES, { message: 'Type is required' }),
  duration_min: z.coerce.number({ message: 'Duration is required' }).positive('Duration is required'),
  self_rating: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().min(1).max(5).optional()
  ),
  notes: z.string().optional(),
  improved: z.array(z.string()).default([]),
  struggled: z.array(z.string()).default([]),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function SessionForm({
  onSuccess,
  createSession,
}: {
  onSuccess: () => void
  createSession: (input: NewTrainingSession) => Promise<{ error: string | null }>
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { improved: [], struggled: [] },
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function onSubmit(values: FormOutput) {
    setSubmitError(null)
    const { error } = await createSession(values)
    if (error) setSubmitError(error)
    else onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-elevated flex w-full flex-col gap-5 border border-border bg-card p-5">
      {submitError && (
        <p className="border-l-2 border-l-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Nickname (optional)</Label>
        <Input id="title" placeholder="e.g. Brutal sparring night" {...register('title')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              name="type"
              options={SESSION_TYPE_OPTIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="duration_min">Duration (minutes)</Label>
        <Input id="duration_min" type="number" {...register('duration_min')} />
        {errors.duration_min && (
          <p className="text-sm text-destructive">{errors.duration_min.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="self_rating">Self-rating (1-5)</Label>
        <Input id="self_rating" type="number" min={1} max={5} {...register('self_rating')} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="label-caps text-muted-foreground">What improved?</legend>
        <div className="flex flex-wrap gap-2">
          {IMPROVED_OPTIONS.map((label) => (
            <Controller
              key={label}
              name="improved"
              control={control}
              render={({ field }) => (
                <ToggleChip
                  label={label}
                  accent="ao"
                  selected={!!field.value?.includes(label)}
                  onClick={() => {
                    const next = field.value?.includes(label)
                      ? (field.value ?? []).filter((v) => v !== label)
                      : [...(field.value ?? []), label]
                    field.onChange(next)
                  }}
                />
              )}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="label-caps text-muted-foreground">What struggled?</legend>
        <div className="flex flex-wrap gap-2">
          {STRUGGLED_OPTIONS.map((label) => (
            <Controller
              key={label}
              name="struggled"
              control={control}
              render={({ field }) => (
                <ToggleChip
                  label={label}
                  accent="aka"
                  selected={!!field.value?.includes(label)}
                  onClick={() => {
                    const next = field.value?.includes(label)
                      ? (field.value ?? []).filter((v) => v !== label)
                      : [...(field.value ?? []), label]
                    field.onChange(next)
                  }}
                />
              )}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="glow-primary w-full">
        {isSubmitting ? 'Saving…' : 'Save session'}
      </Button>
    </form>
  )
}
