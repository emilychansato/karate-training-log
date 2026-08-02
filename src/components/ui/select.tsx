import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Icon } from './icon'
import { cn } from '@/lib/utils'

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}) {
  return (
    <SelectPrimitive.Root
      value={value || null}
      onValueChange={(v) => onChange((v as string) ?? '')}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 border border-input bg-input px-3 text-left text-sm text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:border-ring',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <Icon name="chevron_down" className="size-4 flex-shrink-0 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={4} className="z-50">
          <SelectPrimitive.Popup className="card-elevated max-h-72 w-[var(--anchor-width)] overflow-y-auto border border-border bg-card py-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt}
                value={opt}
                className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted"
              >
                <SelectPrimitive.ItemText>{opt}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Icon name="check" className="size-3.5 flex-shrink-0 text-aka" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
