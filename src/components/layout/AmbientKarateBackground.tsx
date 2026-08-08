import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/** Simple pictogram-style marks (short hand-authored paths, in the same
 * flat/rounded visual language as Olympic sport pictograms) rather than
 * anything photorealistic - placeholder ambient motion until real
 * photography/licensed imagery replaces it. */
function KickMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="20" cy="14" r="6" fill="currentColor" />
      <path
        d="M20 20 L18 34 L8 44 M18 34 L30 38 L48 22"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StanceMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="12" r="6" fill="currentColor" />
      <path
        d="M32 18 L32 34 M32 22 L16 30 M32 22 L48 30 M32 34 L20 52 M32 34 L44 52"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StrikeArcMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M10 46 A28 28 0 0 1 46 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 8"
      />
      <circle cx="46" cy="10" r="4" fill="currentColor" />
    </svg>
  )
}

function BlockMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="24" cy="12" r="6" fill="currentColor" />
      <path
        d="M24 18 L24 40 M24 22 L44 16 M24 40 L14 56 M24 40 L36 56"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const MARKS = [KickMark, StanceMark, StrikeArcMark, BlockMark]

interface Placement {
  Mark: typeof MARKS[number]
  top: string
  left: string
  size: number
  color: string
  duration: number
  delay: number
  rotate: number
}

const PLACEMENTS: Placement[] = [
  { Mark: MARKS[0], top: '8%', left: '12%', size: 72, color: 'var(--foreground)', duration: 9, delay: 0, rotate: -8 },
  { Mark: MARKS[1], top: '18%', left: '78%', size: 90, color: 'var(--aka)', duration: 11, delay: 1.2, rotate: 6 },
  { Mark: MARKS[2], top: '68%', left: '8%', size: 60, color: 'var(--ao)', duration: 8, delay: 0.6, rotate: 0 },
  { Mark: MARKS[3], top: '78%', left: '82%', size: 80, color: 'var(--foreground)', duration: 10, delay: 2, rotate: 10 },
  { Mark: MARKS[2], top: '42%', left: '90%', size: 50, color: 'var(--foreground)', duration: 7.5, delay: 0.3, rotate: -14 },
  { Mark: MARKS[1], top: '86%', left: '46%', size: 64, color: 'var(--ao)', duration: 9.5, delay: 1.6, rotate: -4 },
]

/** Ambient, autoplay-only motion (no hover/touch trail - the app is
 * mobile-first and touch users would never discover a drag-triggered
 * effect on a login screen). Purely decorative, sits behind the form. */
export function AmbientKarateBackground() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PLACEMENTS.map(({ Mark, top, left, size, color, duration, delay, rotate }, i) => (
        <motion.div
          key={i}
          className="absolute opacity-20"
          style={{ top, left, width: size, height: size, color }}
          initial={reducedMotion ? undefined : { y: 0, rotate }}
          animate={
            reducedMotion
              ? undefined
              : { y: [0, -14, 0], rotate: [rotate, rotate + 4, rotate] }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration, delay, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Mark className="size-full" style={{ transform: reducedMotion ? `rotate(${rotate}deg)` : undefined }} />
        </motion.div>
      ))}
    </div>
  )
}
