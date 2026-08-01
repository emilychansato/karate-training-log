import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCompetitionMatches, type WinMethod } from '../../hooks/useCompetitionMatches'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Stepper } from '../ui/stepper'
import { ToggleChip } from '../ui/toggle-chip'

const WIN_METHODS: WinMethod[] = [
  'ippon',
  'waza-ari',
  'yuko',
  'hansoku',
  'kiken',
  'shikkaku',
  'hantei',
]

const schema = z.object({
  round_label: z.string().optional(),
  opponent_name: z.string().optional(),
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
  notes: z.string().optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function MatchForm({
  competitionId,
  discipline,
  onSuccess,
}: {
  competitionId: string
  discipline: 'kata' | 'kumite'
  onSuccess: () => void
}) {
  const { createMatch } = useCompetitionMatches(competitionId)
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) })

  const winMethod = watch('win_method')

  async function onSubmit(values: FormOutput) {
    const { error } = await createMatch(values)
    if (!error) onSuccess()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card-elevated flex w-full flex-col gap-5 border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="round_label">Round</Label>
        <Input id="round_label" placeholder="e.g. Semifinal" {...register('round_label')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opponent_name">Opponent name</Label>
        <Input id="opponent_name" {...register('opponent_name')} />
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="glow-aka flex flex-col gap-3 border-l-2 border-l-aka bg-muted p-4">
              <span className="label-caps text-aka">AKA (my score)</span>
              <Controller
                name="my_yuko"
                control={control}
                render={({ field }) => (
                  <Stepper label="My Yuko" accent="aka" value={Number(field.value) || 0} onChange={field.onChange} />
                )}
              />
              <Controller
                name="my_waza_ari"
                control={control}
                render={({ field }) => (
                  <Stepper
                    label="My Waza-ari"
                    accent="aka"
                    value={Number(field.value) || 0}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="my_ippon"
                control={control}
                render={({ field }) => (
                  <Stepper label="My Ippon" accent="aka" value={Number(field.value) || 0} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex flex-col gap-3 border-l-2 border-l-ao bg-muted p-4">
              <span className="label-caps text-ao">AO (opponent)</span>
              <Controller
                name="opponent_yuko"
                control={control}
                render={({ field }) => (
                  <Stepper
                    label="Opponent Yuko"
                    accent="ao"
                    value={Number(field.value) || 0}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="opponent_waza_ari"
                control={control}
                render={({ field }) => (
                  <Stepper
                    label="Opponent Waza-ari"
                    accent="ao"
                    value={Number(field.value) || 0}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="opponent_ippon"
                control={control}
                render={({ field }) => (
                  <Stepper
                    label="Opponent Ippon"
                    accent="ao"
                    value={Number(field.value) || 0}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="label-caps text-muted-foreground">Win method</span>
            <div className="flex flex-wrap gap-2">
              {WIN_METHODS.map((m) => (
                <ToggleChip
                  key={m}
                  label={m.toUpperCase()}
                  selected={winMethod === m}
                  onClick={() => setValue('win_method', m)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="glow-primary w-full">
        {isSubmitting ? 'Saving…' : 'Save match'}
      </Button>
    </form>
  )
}
