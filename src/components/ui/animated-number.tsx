import { useEffect, useRef } from 'react'
import { useMotionValue, useTransform, animate } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Counts up from 0 to `value` on mount. Integers render plain; pass
 * `decimals` for fixed-decimal values like kata scores (e.g. 8.5).
 * Respects prefers-reduced-motion — renders the final value immediately.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 0.9,
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  className?: string
}) {
  const reducedMotion = useReducedMotion()
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => latest.toFixed(decimals))
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' })
    return () => controls.stop()
  }, [value, duration, reducedMotion, motionValue])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (spanRef.current) spanRef.current.textContent = latest
    })
    return unsubscribe
  }, [rounded])

  return <span ref={spanRef} className={className}>{value.toFixed(decimals)}</span>
}
