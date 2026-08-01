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

- Used Framer Motion (approved) for orchestrated/compositional animation
  (lists, page transitions, count-ups, celebration burst) but plain CSS
  transitions for Button/Input/Checkbox — wrapping Base UI's primitives in
  framer-motion's `motion()` ref-forwarding factory is riskier for
  low-level components than composing motion.div/li/ul around plain divs,
  and CSS spring-overshoot easing gets the same "poppy" feel with less risk.
- Celebration burst only fires at win streak >= 3, not on every logged
  competition — a streak of 1-2 isn't a real milestone, and firing an
  animation on every single save would get old fast and read as noisy
  rather than delightful.
- Did not install any literal 21st Dev/ReactBits component code (see MCP
  usage above) — used them for pattern validation only, kept everything
  hand-built and matched to our actual tokens.
- Dispatched Phase 3 and Phase 4 to background subagents in parallel
  because their file sets are fully disjoint (SessionList/Competitions/
  TrainingLog vs. Dashboard/Records/chart components) — did Phase 1/2
  (shared primitives, nav, Login) myself first since those establish
  conventions everything else depends on.
- Did NOT touch `main`, did NOT open/merge a PR beyond pushing to the
  existing `feature/mvp-step10` branch (PR #1 already open) — per explicit
  instruction, no merge without approval.

## Status

**Complete.** All 6 phases done, 4 commits pushed to `feature/mvp-step10`
(PR #1): `b406ee3`, `2b63338`, `22399bb`, `6f0705b`. Full test suite green
(30/30) and production build clean after every commit. Dev server verified
running cleanly on the expected port 5173.

### What to check when you wake up
- `/login` — card entrance, sign-in/sign-up toggle crossfade, error shake
  (try a wrong password to see it)
- Bottom nav / top nav — sliding active-tab indicator between pages
- `/log`, `/competitions` — cards fall into place staggered, delete a row
  to see the exit animation, empty state has a gently floating icon
- `/records` — stat numbers count up on load; log 3+ kumite wins in a row
  to see the celebration burst on the win-streak tile
- Dashboard — chart entrance animation, hero fade-in
- Try enabling "reduce motion" in your OS accessibility settings and
  reload — everything above should render instantly/statically instead,
  no crashes
- Still outstanding from earlier in the session: rotate the leaked
  Supabase CLI token at supabase.com/dashboard/account/tokens
- Nothing has been merged to `main` — PR #1 is ready for your review
  whenever you want to merge it yourself
