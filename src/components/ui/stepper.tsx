import { cn } from '@/lib/utils'
import { Icon } from './icon'

export function Stepper({
  label,
  value,
  onChange,
  accent = 'aka',
  id,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  accent?: 'aka' | 'ao'
  id?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="label-caps text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex size-6 items-center justify-center border border-border transition-colors duration-150 hover:bg-muted active:scale-90"
        >
          <Icon name="minus" className="size-3.5" />
        </button>
        <span
          id={id}
          className={cn(
            'font-mono tabular-mono w-5 text-center text-base font-bold',
            value > 0 && (accent === 'aka' ? 'text-aka' : 'text-ao')
          )}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="flex size-6 items-center justify-center border border-border transition-colors duration-150 hover:bg-muted active:scale-90"
        >
          <Icon name="add" className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
