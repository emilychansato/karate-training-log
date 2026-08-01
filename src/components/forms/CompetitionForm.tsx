import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCompetitionResults,
  type WinMethod,
} from '../../hooks/useCompetitionResults'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const WIN_METHODS: WinMethod[] = [
  'ippon',
  'waza-ari',
  'yuko',
  'hansoku',
  'kiken',
  'shikkaku',
  'hantei',
]

const schema = z
  .object({
    event: z.string().min(1, 'Event is required'),
    date: z.string().min(1, 'Date is required'),
    division: z.string().optional(),
    placement: z.string().optional(),
    discipline: z.enum(['kata', 'kumite'], { message: 'Discipline is required' }),
    kata_technical_score: z.coerce.number().optional(),
    kata_athletic_score: z.coerce.number().optional(),
    my_yuko: z.coerce.number().optional(),
    my_waza_ari: z.coerce.number().optional(),
    my_ippon: z.coerce.number().optional(),
    opponent_yuko: z.coerce.number().optional(),
    opponent_waza_ari: z.coerce.number().optional(),
    opponent_ippon: z.coerce.number().optional(),
    win_method: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z.enum(WIN_METHODS as [WinMethod, ...WinMethod[]]).optional()
    ),
    opponent_name: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (v) => v.discipline !== 'kata' || v.kata_technical_score !== undefined,
    { message: 'Technical score is required for kata', path: ['kata_technical_score'] }
  )

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function CompetitionForm({ onSuccess }: { onSuccess: () => void }) {
  const { createResult } = useCompetitionResults()
  const [discipline, setDiscipline] = useState<'kata' | 'kumite' | ''>('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormOutput) {
    const { error } = await createResult(values)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
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
        <select
          id="discipline"
          {...register('discipline', {
            onChange: (e) => setDiscipline(e.target.value),
          })}
          className="h-9 border border-input bg-input px-3 text-sm text-foreground [color-scheme:dark]"
        >
          <option value="">Select discipline…</option>
          <option value="kata">Kata</option>
          <option value="kumite">Kumite</option>
        </select>
      </div>

      {discipline === 'kata' && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kata_technical_score">Technical score</Label>
            <Input
              id="kata_technical_score"
              type="number"
              step="0.1"
              {...register('kata_technical_score')}
            />
            {errors.kata_technical_score && (
              <p className="text-sm text-destructive">{errors.kata_technical_score.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kata_athletic_score">Athletic score</Label>
            <Input
              id="kata_athletic_score"
              type="number"
              step="0.1"
              {...register('kata_athletic_score')}
            />
          </div>
        </>
      )}

      {discipline === 'kumite' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my_yuko">My Yuko</Label>
              <Input id="my_yuko" type="number" {...register('my_yuko')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opponent_yuko">Opponent Yuko</Label>
              <Input id="opponent_yuko" type="number" {...register('opponent_yuko')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my_waza_ari">My Waza-ari</Label>
              <Input id="my_waza_ari" type="number" {...register('my_waza_ari')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opponent_waza_ari">Opponent Waza-ari</Label>
              <Input id="opponent_waza_ari" type="number" {...register('opponent_waza_ari')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my_ippon">My Ippon</Label>
              <Input id="my_ippon" type="number" {...register('my_ippon')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opponent_ippon">Opponent Ippon</Label>
              <Input id="opponent_ippon" type="number" {...register('opponent_ippon')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="win_method">Win method</Label>
            <select
              id="win_method"
              {...register('win_method')}
              className="h-9 border border-input bg-input px-3 text-sm text-foreground [color-scheme:dark]"
            >
              <option value="">Select…</option>
              {WIN_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opponent_name">Opponent name</Label>
        <Input id="opponent_name" {...register('opponent_name')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="placement">Placement</Label>
        <Input id="placement" {...register('placement')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving…' : 'Save result'}
      </Button>
    </form>
  )
}
