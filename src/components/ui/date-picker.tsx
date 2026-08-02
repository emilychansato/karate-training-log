import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Icon } from './icon'
import { Button } from './button'
import { WEEKDAY_SHORT, MONTH_NAMES, parseIso, toIso, todayIso, formatFriendly } from '@/lib/dateFormat'
import { cn } from '@/lib/utils'

function buildGrid(viewYear: number, viewMonth: number): (Date | null)[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function DatePicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (iso: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = parseIso(value)
  const [viewDate, setViewDate] = useState(() => selected ?? new Date())

  function openPicker() {
    setViewDate(selected ?? new Date())
    setOpen(true)
  }

  const cells = buildGrid(viewDate.getFullYear(), viewDate.getMonth())
  const today = todayIso()

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        onClick={openPicker}
        aria-label="Date"
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 border border-input bg-input px-3 text-left text-sm text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          className
        )}
      >
        <span>{value ? formatFriendly(value) : 'Select date…'}</span>
        <Icon name="chevron_down" className="size-4 flex-shrink-0 text-muted-foreground" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} className="z-50">
          <Popover.Popup className="card-elevated w-72 border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <Icon name="chevron_down" className="size-4 rotate-90" />
              </button>
              <p className="font-heading text-sm">
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

            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_SHORT.map((d) => (
                <span key={d} className="label-caps text-center text-muted-foreground">
                  {d}
                </span>
              ))}
              {cells.map((cell, i) => {
                if (!cell) return <span key={i} />
                const iso = toIso(cell)
                const isSelected = iso === value
                const isToday = iso === today
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(iso)
                      setOpen(false)
                    }}
                    className={cn(
                      'font-mono tabular-mono flex size-8 items-center justify-center text-sm transition-colors duration-100',
                      isSelected
                        ? 'bg-aka text-white'
                        : isToday
                          ? 'border border-aka text-foreground'
                          : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {cell.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <button
                type="button"
                onClick={() => {
                  onChange(today)
                  setOpen(false)
                }}
                className="label-caps text-muted-foreground hover:text-foreground"
              >
                Today
              </button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
