import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

const SESSION_TYPES = ['kata', 'kumite', 'conditioning', 'other'] as const
const IMPROVED_OPTIONS = ['Speed', 'Timing', 'Distance', 'Power', 'Accuracy', 'Strategy']
const STRUGGLED_OPTIONS = [
  'Fatigue',
  'Reaction time',
  'Footwork',
  'Confidence',
  'Technique consistency',
]

const schema = z.object({
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

export function SessionForm({ onSuccess }: { onSuccess: () => void }) {
  const { createSession } = useTrainingSessions()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { improved: [], struggled: [] },
  })

  async function onSubmit(values: FormOutput) {
    const { error } = await createSession(values)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          {...register('type')}
          className="h-9 border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Select type…</option>
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
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
        <legend className="text-sm font-medium">What improved?</legend>
        {IMPROVED_OPTIONS.map((label) => (
          <Controller
            key={label}
            name="improved"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value?.includes(label)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...(field.value ?? []), label]
                      : (field.value ?? []).filter((v) => v !== label)
                    field.onChange(next)
                  }}
                />
                {label}
              </label>
            )}
          />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">What struggled?</legend>
        {STRUGGLED_OPTIONS.map((label) => (
          <Controller
            key={label}
            name="struggled"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value?.includes(label)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...(field.value ?? []), label]
                      : (field.value ?? []).filter((v) => v !== label)
                    field.onChange(next)
                  }}
                />
                {label}
              </label>
            )}
          />
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 border border-input bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving…' : 'Save session'}
      </Button>
    </form>
  )
}
