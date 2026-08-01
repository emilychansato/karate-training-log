import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const DOT_COUNT = 8
const COLORS = ['var(--aka)', 'var(--ao)']

/**
 * A subtle once-off celebration flourish: small sharp-edged squares burst
 * outward from behind the trigger element and fade. Not confetti — no
 * blur/glow, flat colors matching the AKA/AO functional palette.
 * Absolutely positioned; wrap the target in a `relative` container.
 */
export function CelebrationBurst() {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return null

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const angle = (i / DOT_COUNT) * Math.PI * 2
    const distance = 28 + (i % 3) * 6
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: COLORS[i % COLORS.length],
      size: 4 + (i % 2) * 2,
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute"
          style={{ width: dot.size, height: dot.size, backgroundColor: dot.color }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: dot.x, y: dot.y, scale: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
