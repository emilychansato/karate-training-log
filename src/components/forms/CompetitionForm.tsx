import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCompetitions } from '../../hooks/useCompetitions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SegmentedControl } from '../ui/segmented-control'

const schema = z.object({
  event: z.string().min(1, 'Event is required'),
  date: z.string().min(1, 'Date is required'),
  division: z.string().optional(),
  discipline: z.enum(['kata', 'kumite'], { message: 'Discipline is required' }),
  placement: z.string().optional(),
  notes: z.string().optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

/** Logs the top-level competition (event/date/division/discipline/
 * placement/overall notes). Individual matches against opponents are
 * logged separately, inside the competition's detail page, via MatchForm -
 * one competition can have several matches (a kumite bracket especially). */
export function CompetitionForm({ onSuccess }: { onSuccess: (competitionId: string) => void }) {
  const { createCompetition } = useCompetitions()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormOutput) {
    const { error, id } = await createCompetition(values)
    if (!error && id) onSuccess(id)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card-elevated flex w-full flex-col gap-5 border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="event">Event</Label>
        <Input id="event" {...register('event')} />
        {errors.event && <p className="text-sm text-destructive">{errors.event.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="discipline">Discipline</Label>
        <Controller
          name="discipline"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              name="discipline"
              options={[
                { value: 'kata', label: 'KATA' },
                { value: 'kumite', label: 'KUMITE' },
              ]}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
        {errors.discipline && (
          <p className="text-sm text-destructive">{errors.discipline.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="division">Division</Label>
        <Input id="division" {...register('division')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="placement">Placement</Label>
        <Input id="placement" {...register('placement')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Overall notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="glow-primary w-full">
        {isSubmitting ? 'Saving…' : 'Save competition'}
      </Button>
    </form>
  )
}
