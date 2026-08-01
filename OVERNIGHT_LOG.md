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
- [ ] Phase 1: Interactive primitives — Button/Input/Checkbox press+hover
      feedback, Card hover/tap
- [ ] Phase 2: Page & nav choreography — route transitions, Login card
      entrance + mode-toggle crossfade, AppShell nav active-indicator +
      FAB bounce
- [ ] Phase 3: List & data reveal — SessionList/Competitions staggered
      entrance + exit-on-delete, badge/tag pop-in
- [ ] Phase 4: Dashboard & Records "wow" moments — chart entrance easing,
      stat count-up, small celebration burst on a new personal record,
      friendly animated empty states
- [ ] Phase 5: QA pass — full test suite + build after every phase, verify
      mobile viewport, verify reduced-motion fallback, review bundle size

## Decisions made autonomously (safe-default judgment calls)

(appended as they happen)

## Status

In progress.
