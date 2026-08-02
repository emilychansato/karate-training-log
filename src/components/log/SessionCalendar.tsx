import { useState } from 'react'
import type { TrainingSession } from '../../hooks/useTrainingSessions'
import { WEEKDAY_SHORT, MONTH_NAMES, toIso } from '../../lib/dateFormat'
import { Icon } from '../ui/icon'

const TYPE_DOT: Record<string, string> = {
  kata: 'bg-ao',
  kumite: 'bg-aka',
  conditioning: 'bg-foreground',
  other: 'bg-muted-foreground',
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

export function SessionCalendar({ sessions }: { sessions: TrainingSession[] }) {
  const [viewDate, setViewDate] = useState(new Date())
  const sessionsByDate = new Map<string, TrainingSession[]>()
  for (const s of sessions) {
    const list = sessionsByDate.get(s.date) ?? []
    list.push(s)
    sessionsByDate.set(s.date, list)
  }

  const cells = buildGrid(viewDate.getFullYear(), viewDate.getMonth())

  return (
    <div className="card-elevated flex flex-col gap-4 border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <Icon name="chevron_down" className="size-4 rotate-90" />
        </button>
        <p className="font-heading text-base">
          {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <Icon name="chevron_down" className="size-4 -rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_SHORT.map((d) => (
          <span key={d} className="label-caps text-center text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={i} />
          const daySessions = sessionsByDate.get(toIso(cell)) ?? []
          return (
            <div
              key={i}
              className="flex aspect-square flex-col items-center justify-center gap-1 border border-border text-sm"
            >
              <span className="text-xs text-muted-foreground">{cell.getDate()}</span>
              {daySessions.length > 0 && (
                <div className="flex gap-0.5">
                  {daySessions.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className={`size-1.5 rounded-full ${TYPE_DOT[s.type] ?? TYPE_DOT.other}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
