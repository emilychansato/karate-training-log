import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { snappy } from '@/lib/motion'

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  className,
}: {
  options: { value: T; label: string }[]
  value: T | ''
  onChange: (value: T) => void
  name: string
  className?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn('flex border border-border bg-card p-1', className)}
    >
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'label-caps relative flex-1 py-2.5 transition-colors duration-150',
              isActive ? 'text-background' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`segmented-${name}`}
                className="glow-primary absolute inset-0 -z-10 bg-foreground"
                transition={snappy}
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
