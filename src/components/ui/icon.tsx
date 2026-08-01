import {
  LayoutDashboard,
  NotebookPen,
  Trophy,
  Swords,
  Plus,
  X,
  BarChart3,
  TrendingUp,
  Star,
  Award,
  Users,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = {
  dashboard: LayoutDashboard,
  event_note: NotebookPen,
  trophy: Trophy,
  sports_martial_arts: Swords,
  add: Plus,
  close: X,
  analytics: BarChart3,
  monitoring: TrendingUp,
  star: Star,
  award: Award,
  users: Users,
  layers: Layers,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

export function Icon({
  name,
  filled = false,
  className,
}: {
  name: IconName
  filled?: boolean
  className?: string
}) {
  const Component = ICONS[name]
  return (
    <Component
      className={cn('size-5', className)}
      fill={filled ? 'currentColor' : 'none'}
      strokeWidth={filled ? 1.5 : 2}
      aria-hidden="true"
    />
  )
}
