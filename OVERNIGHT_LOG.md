# Overnight Animation/Polish Pass — Orchestration Log

Started: 2026-08-02 (overnight, unattended). Branch: `feature/mvp-step10` (PR #1).
Working directly + dispatching background subagents; orchestrator (me) reviews,
tests, and commits every change — no merge to `main` without explicit approval.

## Direction (confirmed by Emily before sleep)

- High-energy, playful, physically animated ("things popping out, falling into
  place") — NOT a flat/static app.
- Keep the dark theme, AKA/AO functional colors, sharp corners, Bodoni Moda /
  Inter / JetBrains Mono type system — those are not in question, only the
  amount of *motion* was.
- Explicitly avoid the generic "AI vibe-coded" look: no glow, no blurred
  gradient orbs, no glassmorphism. Motion should feel physical/springy, not
  hazy/decorative.
- Framer Motion approved as a new dependency.
- Pull technique/timing inspiration from 21st Dev / ReactBits MCPs where
  useful, adapted to our palette — not their literal visual style.
- Respect `prefers-reduced-motion` throughout (`useReducedMotion` hook).

## Phases

- [x] Phase 0: Foundation — `npm install framer-motion`, `src/lib/motion.ts`
      (shared variants/transitions), `src/hooks/useReducedMotion.ts`
- [x] Phase 1: Interactive primitives — Button/Input/Checkbox press+hover
      feedback (CSS spring-overshoot easing, not framer-motion, to avoid
      wrapping Base UI primitives' ref forwarding). Commit b406ee3 (folded
      into Phase 2 commit — see below).
- [x] Phase 2: Page & nav choreography — route transitions, Login card
      entrance + mode-toggle crossfade + error shake, AppShell shared-layout
      sliding active-tab indicator + icon tap feedback. Commit b406ee3.
- [x] Phase 3: List & data reveal — SessionList/Competitions staggered
      entrance (framer-motion `popIn` + `staggerContainer`) + exit-on-delete
      (`AnimatePresence`), floating-icon empty states, FAB scale-in.
      Dispatched to a background subagent (scope: SessionList.tsx,
      Competitions.tsx, TrainingLog.tsx). Commit 2b63338. Found and fixed a
      real pre-existing bug along the way: jsdom has no `matchMedia`, so
      `useReducedMotion()` crashed on mount in every test rendering a
      component that uses it — added a polyfill to test/setup.ts.
- [x] Phase 4: Dashboard & Records "wow" moments — chart entrance easing,
      `AnimatedNumber` stat count-up, `CelebrationBurst` (flat AKA/AO
      squares, no blur/glow) when win streak hits 3+, fade-in empty states,
      Dashboard hero entrance. Dispatched to a background subagent (scope:
      Dashboard.tsx, Records.tsx, the three dashboard chart components).
      Commit 22399bb.
- [x] Phase 5: QA pass — full test suite (30/30) + build green after every
      phase; reduced-motion respected everywhere via `useReducedMotion()`;
      bundle grew from ~993KB to ~1.13MB largely due to framer-motion (noted,
      not treated as a blocker — code-splitting is already a pre-existing
      backlog item).
- [x] Phase 6 (added): Loading skeletons — replaced plain "Loading…" text in
      SessionList/Competitions with pulsing skeleton cards so the app feels
      complete even with zero data on first load.

## MCP usage (21st Dev / ReactBits)

Tried both per Emily's instruction. ReactBits' search returned no results
for "button hover press interaction" (may need a different query shape or
just has nothing indexed there — not pursued further, low value given the
CSS-based press feedback already implemented and tested). 21st Dev's search
works and is free (metadata only — preview image, description, install
command), but the actual component *code* is fetched via
`npx shadcn add ".../r/...?api_key=$API_KEY_21ST"`, and no real 21st Dev API
key is configured in this environment (`.mcp.json` only references the env
var name, not a value) — so no literal external component code was
imported. Searched "animated stat card counter" and got back count-up
number-ticker patterns that independently validate the hand-built
`AnimatedNumber`/`CelebrationBurst` approach already implemented — same
idea, but built to match our actual color/type tokens instead of importing
a generic style that would need to be re-themed anyway.

## Decisions made autonomously (safe-default judgment calls)

(appended as they happen)

## Status

In progress.
