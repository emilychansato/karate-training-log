import { useCompetitionStats } from '../../hooks/useCompetitionStats'

const RADIUS = 30
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function WinRateGauge() {
  const { winRate, loading } = useCompetitionStats()
  const { winRatePercent, totalMatches } = winRate

  if (loading || totalMatches === 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="label-caps text-muted-foreground">Win rate</span>
        <div className="relative mt-1 size-16">
          <svg className="size-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={RADIUS}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono tabular-mono text-xs text-muted-foreground">
            —
          </span>
        </div>
      </div>
    )
  }

  const offset = CIRCUMFERENCE - (winRatePercent / 100) * CIRCUMFERENCE

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="label-caps text-muted-foreground">Win rate</span>
      <div className="relative mt-1 size-16">
        <svg className="size-full -rotate-90">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="2" />
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke="var(--aka)"
            strokeWidth="2"
            strokeLinecap="square"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono tabular-mono text-sm font-bold">
          {winRatePercent}%
        </span>
      </div>
    </div>
  )
}
