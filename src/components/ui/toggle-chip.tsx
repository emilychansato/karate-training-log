import { cn } from '@/lib/utils'

export function ToggleChip({
  label,
  selected,
  onClick,
  accent = 'aka',
}: {
  label: string
  selected: boolean
  onClick: () => void
  accent?: 'aka' | 'ao'
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'label-caps border-l-2 bg-muted px-3 py-2 transition-colors duration-150',
        selected
          ? cn('text-foreground', accent === 'aka' ? 'border-l-aka' : 'border-l-ao')
          : 'border-l-border text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}
