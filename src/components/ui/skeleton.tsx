import { cn } from '@/lib/utils'

/** Pulsing placeholder block for loading states — flat, no shimmer/glow. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-muted', className)} />
}

/** A stand-in for a session/competition card while data loads. */
export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
