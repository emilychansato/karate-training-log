import { usePlannedCompetitions } from '../../hooks/usePlannedCompetitions'
import { AnimatedNumber } from '../ui/animated-number'
import { todayIso, parseIso } from '../../lib/dateFormat'

function daysUntil(dateIso: string): number {
  const target = parseIso(dateIso)
  const today = parseIso(todayIso())
  if (!target || !today) return 0
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function CountdownStat() {
  const { planned, loading } = usePlannedCompetitions()
  const today = todayIso()

  const next = planned
    .filter((p) => p.kind === 'competition' && p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  if (loading) return null

  if (!next) {
    return (
      <div>
        <p className="label-caps text-muted-foreground">Next competition</p>
        <p className="mt-1 text-sm text-muted-foreground">None scheduled</p>
      </div>
    )
  }

  const days = daysUntil(next.date)

  return (
    <div>
      <p className="label-caps text-muted-foreground">
        {days === 0 ? 'Competing today' : days === 1 ? 'Tomorrow' : 'Next competition'}
      </p>
      <p className="font-mono tabular-mono mt-1 text-3xl font-bold text-aka">
        {days > 1 ? (
          <>
            <AnimatedNumber value={days} />
            <span className="text-base font-normal text-muted-foreground"> days</span>
          </>
        ) : (
          <span className="text-2xl">{days === 0 ? '🥋' : days === 1 ? '🥋' : '—'}</span>
        )}
      </p>
      <p className="mt-0.5 max-w-[10rem] truncate text-xs text-muted-foreground">{next.event}</p>
    </div>
  )
}
