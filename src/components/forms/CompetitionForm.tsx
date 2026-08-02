import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCompetitions } from '../../hooks/useCompetitions'
import { KATA_CATEGORIES, KUMITE_DIVISIONS } from '../../lib/competitionCategories'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SegmentedControl } from '../ui/segmented-control'
import { Select } from '../ui/select'
import { DatePicker } from '../ui/date-picker'
import { LocationPicker } from '../ui/location-picker'

const schema = z.object({
  event: z.string().min(1, 'Event is required'),
  date: z.string().min(1, 'Date is required'),
  division: z.string().optional(),
  discipline: z.enum(['kata', 'kumite'], { message: 'Discipline is required' }),
  placement: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) })

  const discipline = watch('discipline')
  const divisionOptions = discipline === 'kata' ? KATA_CATEGORIES : KUMITE_DIVISIONS

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
        <Controller
          name="division"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onChange={field.onChange}
              options={divisionOptions}
              placeholder={discipline ? 'Select division…' : 'Pick a discipline first'}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="placement">Placement</Label>
        <Input id="placement" {...register('placement')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="location"
            placeholder="e.g. Surrey, BC"
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
