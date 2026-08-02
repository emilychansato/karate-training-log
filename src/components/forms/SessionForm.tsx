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
import { DatePicker } from '../ui/date-picker'
import { LocationPicker } from '../ui/location-picker'
import { todayIso } from '@/lib/dateFormat'

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
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  improved: z.array(z.string()).default([]),
  struggled: z.array(z.string()).default([]),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function SessionForm({
  onSuccess,
  createSession,
  initialValues,
}: {
  onSuccess: () => void
  createSession: (input: NewTrainingSession) => Promise<{ error: string | null }>
  /** Prefills the form (e.g. from a parsed voice log) - still requires
   * the user to review/edit and hit Save, never auto-submitted. */
  initialValues?: Partial<NewTrainingSession>
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: todayIso(),
      improved: [],
      struggled: [],
      ...(initialValues as Partial<FormInput>),
    },
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
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker value={field.value ?? ''} onChange={field.onChange} />
          )}
        />
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="location"
            placeholder="e.g. North Shore Karate"
            {...register('location')}
            className="flex-1"
          />
          <Controller
            name="latitude"
            control={control}
            render={({ field: latField }) => (
              <Controller
                name="longitude"
                control={control}
                render={({ field: lngField }) => (
                  <LocationPicker
                    value={
                      latField.value != null && lngField.value != null
                        ? {
                            label: watch('location') ?? '',
                            latitude: latField.value,
                            longitude: lngField.value,
                          }
                        : null
                    }
                    onChange={(picked) => {
                      setValue('location', picked.label)
                      latField.onChange(picked.latitude)
                      lngField.onChange(picked.longitude)
                    }}
                  />
                )}
              />
            )}
          />
        </div>
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
