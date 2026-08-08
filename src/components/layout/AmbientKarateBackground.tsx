import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import kickOutdoor from '../../assets/login-bg/kick-outdoor.jpg'
import goldenHour from '../../assets/login-bg/golden-hour.jpg'
import gymMartialArts from '../../assets/login-bg/gym-martial-arts.jpg'
import twoMenTrees from '../../assets/login-bg/two-men-trees.jpg'
import womanGi from '../../assets/login-bg/woman-gi.jpg'

// Free, real photos under the Unsplash License (commercial use allowed,
// no attribution required) - not WKF's own copyrighted photography, and
// not the earlier placeholder pictogram silhouettes.
const IMAGES = [kickOutdoor, goldenHour, gymMartialArts, twoMenTrees, womanGi]

interface Orbit {
  src: string
  size: number
  ampX: number
  ampY: number
  period: number
  phase: number
}

const ORBITS: Orbit[] = [
  { src: IMAGES[0], size: 96, ampX: 34, ampY: 16, period: 16, phase: 0 },
  { src: IMAGES[1], size: 80, ampX: 30, ampY: 14, period: 19, phase: 1.4 },
  { src: IMAGES[2], size: 88, ampX: 32, ampY: 15, period: 14, phase: 3.1 },
  { src: IMAGES[3], size: 72, ampX: 26, ampY: 12, period: 21, phase: 4.6 },
  { src: IMAGES[4], size: 84, ampX: 30, ampY: 14, period: 17, phase: 5.5 },
]

const ANCHORS = [
  { top: '10%', left: '18%' },
  { top: '16%', left: '76%' },
  { top: '62%', left: '10%' },
  { top: '72%', left: '80%' },
  { top: '88%', left: '46%' },
]

/** Each photo travels a figure-eight (lemniscate) path around its anchor
 * point via requestAnimationFrame, rather than framer-motion keyframes -
 * a figure-eight needs x/y driven together from one continuously
 * advancing angle (x = sin(t), y = sin(t)*cos(t)), which keyframe arrays
 * can't express as a smooth continuous loop. Autoplay only (no
 * hover/touch trail - the app is mobile-first and a drag-triggered
 * effect would go undiscovered on a login screen). */
export function AmbientKarateBackground() {
  const reducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [, forceRender] = useState(0)
  const offsetsRef = useRef<{ x: number; y: number }[]>(ORBITS.map(() => ({ x: 0, y: 0 })))

  useEffect(() => {
    if (reducedMotion) return

    let frameId: number
    const start = performance.now()

    function tick(now: number) {
      const elapsed = (now - start) / 1000
      ORBITS.forEach((orbit, i) => {
        const t = (elapsed / orbit.period) * Math.PI * 2 + orbit.phase
        offsetsRef.current[i] = {
          x: Math.sin(t) * orbit.ampX,
          y: Math.sin(t) * Math.cos(t) * orbit.ampY,
        }
      })
      if (containerRef.current) {
        const marks = containerRef.current.querySelectorAll<HTMLElement>('[data-mark]')
        marks.forEach((el, i) => {
          const { x, y } = offsetsRef.current[i]
          el.style.transform = `translate(${x}px, ${y}px)`
        })
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [reducedMotion])

  useEffect(() => {
    // Reduced-motion: render once, statically, at the anchor point.
    if (reducedMotion) forceRender((n) => n + 1)
  }, [reducedMotion])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {ORBITS.map((orbit, i) => (
        <div
          key={i}
          data-mark
          className="absolute rounded-full opacity-25 shadow-lg"
          style={{
            top: ANCHORS[i].top,
            left: ANCHORS[i].left,
            width: orbit.size,
            height: orbit.size,
          }}
        >
          <img
            src={orbit.src}
            alt=""
            className="size-full rounded-full border border-white/10 object-cover"
          />
        </div>
      ))}
    </div>
  )
}
