import type { Variants, Transition } from 'framer-motion'

/**
 * Shared motion language for the app: physical, springy, a little playful —
 * deliberately not the generic AI-app look (no glow/blur/gradient-driven
 * "vibe coded" motion). Every export here respects prefers-reduced-motion
 * via `useReducedMotionSafe` — consumers should read that instead of
 * hardcoding transitions when in doubt.
 */

export const springy: Transition = { type: 'spring', stiffness: 420, damping: 28, mass: 0.6 }
export const springyBouncy: Transition = { type: 'spring', stiffness: 380, damping: 18, mass: 0.7 }
export const snappy: Transition = { type: 'spring', stiffness: 500, damping: 34 }

/** A single item "falls" into place — used for list rows, cards, badges. */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: springy },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
}

/** Wrap a list container with this + apply `popIn` to each child. */
export function staggerContainer(staggerMs = 0.06, delayMs = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: staggerMs, delayChildren: delayMs },
    },
  }
}

/** Page-level entrance (route changes). */
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
}

/** Shared button/icon press feedback. */
export const pressable = {
  whileTap: { scale: 0.94 },
  whileHover: { scale: 1.02 },
  transition: snappy,
}

/** Shake for validation errors. */
export const shake: Variants = {
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.35 },
  },
}
