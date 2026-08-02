import { useState } from 'react'
import type { JournalEntry } from '../../hooks/useJournalEntries'
import { MOOD_EMOJI } from '../../lib/journalConstants'
import { WEEKDAY_SHORT, MONTH_NAMES, toIso } from '../../lib/dateFormat'
import { Icon } from '../ui/icon'

function buildGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

export function MonthOverview({ entries }: { entries: JournalEntry[] }) {
  const [viewDate, setViewDate] = useState(new Date())
  const entryByDate = new Map(entries.map((e) => [e.date, e]))

  const cells = buildGrid(viewDate.getFullYear(), viewDate.getMonth())

  const monthEntries = entries.filter((e) => {
    const [y, m] = e.date.split('-').map(Number)
    return y === viewDate.getFullYear() && m === viewDate.getMonth() + 1
  })
  const withMood = monthEntries.filter((e) => e.mood != null)
  const avgMood =
    withMood.length > 0
      ? Math.round((withMood.reduce((sum, e) => sum + (e.mood ?? 0), 0) / withMood.length) * 10) / 10
      : null

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

      <div>
        <p className="label-caps text-muted-foreground">Average mood</p>
        <p className="font-mono tabular-mono text-2xl font-bold">
          {avgMood != null ? `${avgMood} ${MOOD_EMOJI[Math.round(avgMood)]}` : '—'}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_SHORT.map((d) => (
          <span key={d} className="label-caps text-center text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={i} />
          const entry = entryByDate.get(toIso(cell))
          return (
            <div
              key={i}
              className="flex aspect-square items-center justify-center border border-border text-sm"
            >
              {entry?.mood ? MOOD_EMOJI[entry.mood] : <span className="text-xs text-muted-foreground">{cell.getDate()}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
