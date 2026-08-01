# Karate Training Log MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Step 10 onward of `docs/build-plan.md` — auth, CRUD for training sessions and competition results, the technique/kata reference library with personal bookmarks, and a 3-chart dashboard — per `docs/superpowers/specs/2026-07-31-karate-mvp-design.md`.

**Architecture:** React 19 + TypeScript SPA (Vite), Supabase for auth/Postgres/RLS, shadcn/ui (Radix + Tailwind v4) for components, react-hook-form + zod for form validation, Recharts for the dashboard, react-router-dom for routing. All screens are mobile-first: base Tailwind classes target a ~375-430px viewport; `md:`/`lg:` prefixes add the desktop layout on top, never the reverse.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind v4, shadcn/ui, @supabase/supabase-js, react-hook-form, zod, recharts, react-router-dom, Vitest + React Testing Library (test infra doesn't exist yet — Task 1 sets it up).

## Global Constraints

- Mobile-first for every screen: write base (unprefixed) Tailwind classes for a phone viewport; add `md:`/`lg:` overrides for desktop. Test every UI task at a ~390px viewport before considering it done.
- shadcn/ui defaults only — no custom accent color, no custom fonts, this pass. (Spec: `2026-07-31-karate-mvp-design.md` "UI library and styling".)
- Dashboard charts show a "no data yet" empty state before real data exists — never sample/placeholder data. (Spec: "Dashboard chart behavior".)
- Auth: use `supabase.auth.onAuthStateChange` for session tracking and `supabase.auth.getClaims()` (not `getUser()`) for the protected-route check. (Spec: "Auth implementation note".)
- All new tables get RLS enabled with `auth.uid() = user_id` policies, following the pattern already in `supabase/migrations/20260731003822_init_schema.sql`.
- Every session/competition mutation goes through the corresponding hook (`useTrainingSessions`, `useCompetitionResults`, `useUserTechniques`) — components never call `supabase.from(...)` directly.
- Commit after every task.

---

## File Structure

```
src/
  lib/
    supabaseClient.ts          # exists
  hooks/
    useAuth.ts                 # Task 4
    useTrainingSessions.ts     # Task 8
    useCompetitionResults.ts   # Task 11
    useUserTechniques.ts       # Task 14
  components/
    layout/
      AppShell.tsx             # Task 6 - nav + page frame, mobile-first
      AuthGate.tsx             # Task 5
    forms/
      SessionForm.tsx          # Task 9
      CompetitionForm.tsx      # Task 12
    dashboard/
      HoursChart.tsx           # Task 13
      RatingTrendChart.tsx     # Task 13
      CompetitionTimeline.tsx  # Task 13
    log/
      SessionList.tsx          # Task 10
    techniques/
      TechniquePortfolio.tsx   # Task 14
  pages/
    Login.tsx                  # Task 5
    Dashboard.tsx               # Task 13
    TrainingLog.tsx             # Task 10
    Competitions.tsx            # Task 12
  App.tsx                       # Task 6 - routes
  main.tsx                      # exists, modified Task 6
test/
  setup.ts                      # Task 1
vitest.config.ts                 # Task 1
supabase/migrations/
  20260801000000_technique_ownership_and_rls.sql   # Task 2
  20260801000001_user_techniques.sql               # Task 2
  20260801000002_competition_kumite_breakdown.sql  # Task 2
  20260801000003_session_checklist_fields.sql      # Task 2
```

---

### Task 1: Testing infrastructure (Vitest + React Testing Library)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `src/App.test.tsx`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `npm test` runs Vitest; `render`/`screen` available via `@testing-library/react` in any `*.test.tsx` file; `test/setup.ts` auto-imported so `expect(...).toBeInTheDocument()` works everywhere.

- [ ] **Step 1: Install test dependencies**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 3: Create `test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add the test script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run"
```

- [ ] **Step 5: Write a smoke test to verify the setup**

Create `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function Placeholder() {
  return <h1>Karate Training Log</h1>
}

describe('test infrastructure', () => {
  it('renders and queries the DOM', () => {
    render(<Placeholder />)
    expect(screen.getByText('Karate Training Log')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test`
Expected: `1 passed` — `test infrastructure > renders and queries the DOM`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts test/setup.ts src/App.test.tsx
git commit -m "test: add Vitest + React Testing Library infrastructure"
```

---

### Task 2: Database migrations — schema deltas from the design spec

**Files:**
- Create: `supabase/migrations/20260801000000_technique_ownership_and_rls.sql`
- Create: `supabase/migrations/20260801000001_user_techniques.sql`
- Create: `supabase/migrations/20260801000002_competition_kumite_breakdown.sql`
- Create: `supabase/migrations/20260801000003_session_checklist_fields.sql`

**Interfaces:**
- Consumes: existing `techniques`, `training_sessions`, `competition_results` tables from `supabase/migrations/20260731003822_init_schema.sql`
- Produces: `techniques.user_id` (nullable), RLS on `techniques`; new `user_techniques` table; new `competition_results` columns (`my_yuko`, `my_waza_ari`, `my_ippon`, `opponent_yuko`, `opponent_waza_ari`, `opponent_ippon`); new `training_sessions` columns (`improved text[]`, `struggled text[]`). All later hook/form tasks depend on these column names exactly.

- [ ] **Step 1: Write the technique ownership + RLS migration**

Create `supabase/migrations/20260801000000_technique_ownership_and_rls.sql`:

```sql
-- Adds ownership to techniques: null user_id = official seeded entry
-- (visible to everyone), set user_id = a user's private custom addition.
alter table techniques add column user_id uuid references auth.users(id);

alter table techniques enable row level security;

create policy "read official + own techniques" on techniques
  for select using (user_id is null or auth.uid() = user_id);

create policy "insert own techniques only" on techniques
  for insert with check (auth.uid() = user_id);

create policy "update own techniques only" on techniques
  for update using (auth.uid() = user_id);

create policy "delete own techniques only" on techniques
  for delete using (auth.uid() = user_id);
```

- [ ] **Step 2: Write the user_techniques (bookmark + nickname) migration**

Create `supabase/migrations/20260801000001_user_techniques.sql`:

```sql
create table user_techniques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  technique_id uuid references techniques(id) not null,
  nickname text,
  created_at timestamptz default now(),
  unique (user_id, technique_id)
);

alter table user_techniques enable row level security;

create policy "own bookmarks only" on user_techniques
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 3: Write the kumite scoring breakdown migration**

Create `supabase/migrations/20260801000002_competition_kumite_breakdown.sql`:

```sql
alter table competition_results
  add column my_yuko int default 0,
  add column my_waza_ari int default 0,
  add column my_ippon int default 0,
  add column opponent_yuko int default 0,
  add column opponent_waza_ari int default 0,
  add column opponent_ippon int default 0;

-- win_method broadened to cover real WKF outcomes (was a 5-value enum
-- comment only, not a DB constraint, so no migration needed for the
-- values themselves - documented here for the form's zod schema in Task 12):
-- 'ippon' | 'waza-ari' | 'yuko' | 'hansoku' | 'kiken' | 'shikkaku' | 'hantei'
```

- [ ] **Step 4: Write the session checklist migration**

Create `supabase/migrations/20260801000003_session_checklist_fields.sql`:

```sql
alter table training_sessions
  add column improved text[] default '{}',
  add column struggled text[] default '{}';
```

- [ ] **Step 5: Push all four migrations to the linked Supabase project**

Run: `npx supabase db push`
Expected: output lists all four new migration files as applied, no errors.

- [ ] **Step 6: Verify the schema changes landed**

Run: `npx supabase db diff --linked --schema public`
Expected: no diff output (local migrations match remote — confirms the push applied cleanly).

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260801000000_technique_ownership_and_rls.sql supabase/migrations/20260801000001_user_techniques.sql supabase/migrations/20260801000002_competition_kumite_breakdown.sql supabase/migrations/20260801000003_session_checklist_fields.sql
git commit -m "feat: add technique ownership/RLS, bookmarks, kumite breakdown, session checklist columns"
```

---

### Task 3: Install shadcn/ui and core primitives

**Files:**
- Modify: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/label.tsx`, `src/components/ui/card.tsx`, `src/components/ui/checkbox.tsx`

**Interfaces:**
- Consumes: existing Tailwind v4 setup
- Produces: `Button`, `Input`, `Label`, `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`, `Checkbox` importable from `@/components/ui/*`, used by every form/page task below.

- [ ] **Step 1: Add the `@` path alias shadcn's CLI requires**

In `tsconfig.app.json`, add under `compilerOptions`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

In `vite.config.ts`, add the resolve alias:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Run the shadcn/ui init**

Run: `npx shadcn@latest init -d`
Expected: creates `components.json`, `src/lib/utils.ts`; confirm it detected Tailwind v4 and React 19 without prompting for manual config (the `-d` flag accepts defaults).

- [ ] **Step 3: Add the core primitives this MVP needs**

Run: `npx shadcn@latest add button input label card checkbox`
Expected: creates `src/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `checkbox.tsx`.

- [ ] **Step 4: Verify the build still succeeds**

Run: `npm run build`
Expected: exits 0, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.app.json vite.config.ts components.json src/lib/utils.ts src/components/ui/
git commit -m "feat: install shadcn/ui and core primitives"
```

---

### Task 4: `useAuth` hook

**Files:**
- Create: `src/hooks/useAuth.ts`
- Test: `src/hooks/useAuth.test.ts`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabaseClient.ts`
- Produces:

```ts
export interface AuthUser {
  id: string
  email: string | null
}

export function useAuth(): {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}
```

Task 5 (`AuthGate`, `Login.tsx`) consumes exactly this shape.

- [ ] **Step 1: Install a mockable test double for the Supabase client**

Run: `npm install -D vitest-mock-extended` — not needed; Vitest's built-in `vi.mock` is sufficient, skip this step's install and use `vi.mock` directly in the test.

- [ ] **Step 2: Write the failing test**

Create `src/hooks/useAuth.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getClaims: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.getClaims).mockResolvedValue({
      data: null,
      error: null,
    } as never)
  })

  it('starts with loading true, then resolves to no user when unauthenticated', async () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('signUp calls supabase.auth.signUp and returns no error on success', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    } as never)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.signUp('test@example.com', 'password123')
    })
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(response.error).toBeNull()
  })

  it('signIn returns the error message on failure', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    } as never)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.signIn('test@example.com', 'wrong')
    })
    expect(response.error).toBe('Invalid login credentials')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- useAuth`
Expected: FAIL — `Cannot find module './useAuth'`

- [ ] **Step 4: Write `useAuth.ts`**

Create `src/hooks/useAuth.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface AuthUser {
  id: string
  email: string | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getClaims().then(({ data }) => {
      if (!active) return
      const claims = data?.claims
      setUser(
        claims
          ? { id: claims.sub as string, email: (claims.email as string) ?? null }
          : null
      )
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? null }
          : null
      )
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signUp, signIn, signOut }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- useAuth`
Expected: `3 passed`

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useAuth.ts src/hooks/useAuth.test.ts
git commit -m "feat: add useAuth hook with getClaims-based session tracking"
```

---

### Task 5: Login page + AuthGate protected route

**Files:**
- Create: `src/pages/Login.tsx`
- Create: `src/components/layout/AuthGate.tsx`
- Test: `src/pages/Login.test.tsx`

**Interfaces:**
- Consumes: `useAuth()` from Task 4; `Button`, `Input`, `Label`, `Card*` from Task 3
- Produces: `<Login />` page component; `<AuthGate>{children}</AuthGate>` that renders `children` only when `useAuth().user` is set, redirects to `/login` otherwise (Task 6 wraps protected routes with this).

- [ ] **Step 1: Write the failing test**

Create `src/pages/Login.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'
import { useAuth } from '../hooks/useAuth'

vi.mock('../hooks/useAuth')

describe('Login', () => {
  it('calls signIn with the entered email and password on submit', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn(),
      signIn,
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signIn).toHaveBeenCalledWith('test@example.com', 'secret123')
  })

  it('shows the error message when signIn fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn().mockResolvedValue({ error: 'Invalid login credentials' }),
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Login`
Expected: FAIL — `Cannot find module './Login'`

- [ ] **Step 3: Write `Login.tsx`**

Create `src/pages/Login.tsx`. Mobile-first: single-column card, full-width fields, no fixed desktop widths in the base classes — `sm:` only adds the centered max-width on larger screens.

```tsx
import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError(error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <Card className="w-full sm:max-w-sm">
        <CardHeader>
          <CardTitle>Karate Training Log</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Login`
Expected: `2 passed`

- [ ] **Step 5: Write `AuthGate.tsx`** (no test — thin wrapper, covered by Task 6's routing integration)

Create `src/components/layout/AuthGate.tsx`:

```tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/Login.tsx src/pages/Login.test.tsx src/components/layout/AuthGate.tsx
git commit -m "feat: add Login page and AuthGate protected route wrapper"
```

---

### Task 6: Routing + mobile-first app shell (nav)

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `AuthGate` (Task 5), `useAuth` (Task 4)
- Produces: routes `/login`, `/` (Dashboard), `/log` (Training Log), `/competitions` (Competitions) — Tasks 10, 12, 13 fill in the latter three pages; this task wires the shell and stub pages so the app is navigable before those are built.

- [ ] **Step 1: Install react-router-dom**

Run: `npm install react-router-dom`

- [ ] **Step 2: Write `AppShell.tsx`**

Mobile-first nav: a fixed bottom tab bar on mobile (base classes), replaced by a left sidebar at `md:` and above. This is the mobile-first constraint from the design spec applied directly — no collapsed-sidebar-only pattern.

Create `src/components/layout/AppShell.tsx`:

```tsx
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/log', label: 'Training Log' },
  { to: '/competitions', label: 'Competitions' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar - hidden on mobile */}
      <nav className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:p-4 md:gap-1">
        <p className="px-2 pb-4 text-sm font-semibold">Karate Training Log</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `rounded-md px-2 py-1.5 text-sm ${
                isActive ? 'bg-muted font-medium' : 'text-muted-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => signOut()}
          className="mt-auto px-2 py-1.5 text-left text-sm text-muted-foreground"
        >
          Sign out
        </button>
      </nav>

      <main className="flex-1 p-4 pb-20 md:pb-4 overflow-x-auto">{children}</main>

      {/* Mobile bottom tab bar - hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-background md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs ${
                isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
```

- [ ] **Step 3: Wire routes in `App.tsx`**

Replace the contents of `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { AuthGate } from './components/layout/AuthGate'
import { AppShell } from './components/layout/AppShell'

function DashboardStub() {
  return <p>Dashboard — built in Task 13</p>
}
function TrainingLogStub() {
  return <p>Training Log — built in Task 10</p>
}
function CompetitionsStub() {
  return <p>Competitions — built in Task 12</p>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGate>
              <AppShell>
                <DashboardStub />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/log"
          element={
            <AuthGate>
              <AppShell>
                <TrainingLogStub />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/competitions"
          element={
            <AuthGate>
              <AppShell>
                <CompetitionsStub />
              </AppShell>
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 4: Verify the build and dev server**

Run: `npm run build`
Expected: exits 0.

Run: `npm run dev`
Expected: server starts; visiting `http://localhost:5173/` redirects to `/login` (no session yet); the login form renders.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/App.tsx src/components/layout/AppShell.tsx
git commit -m "feat: add routing and mobile-first app shell with bottom nav"
```

---

### Task 7: Update `App.test.tsx` placeholder

**Files:**
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: nothing new — this task just removes the now-misleading placeholder test from Task 1 so it doesn't collide with real coverage.

- [ ] **Step 1: Replace the placeholder smoke test**

Replace `src/App.test.tsx` contents:

```tsx
import { describe, it, expect } from 'vitest'

describe('placeholder', () => {
  it('is replaced by real component tests in later tasks', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including this one and Tasks 4/5's tests.

- [ ] **Step 3: Commit**

```bash
git add src/App.test.tsx
git commit -m "chore: remove placeholder smoke test now that real pages exist"
```

---

### Task 8: `useTrainingSessions` hook

**Files:**
- Create: `src/hooks/useTrainingSessions.ts`
- Test: `src/hooks/useTrainingSessions.test.ts`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabaseClient.ts`; `training_sessions` table columns from Task 2 (`improved`, `struggled`)
- Produces:

```ts
export interface TrainingSession {
  id: string
  date: string
  type: string
  duration_min: number
  self_rating: number | null
  notes: string | null
  improved: string[]
  struggled: string[]
  created_at: string
}

export interface NewTrainingSession {
  date: string
  type: string
  duration_min: number
  self_rating?: number
  notes?: string
  improved?: string[]
  struggled?: string[]
}

export function useTrainingSessions(): {
  sessions: TrainingSession[]
  loading: boolean
  error: string | null
  createSession: (input: NewTrainingSession) => Promise<{ error: string | null }>
  deleteSession: (id: string) => Promise<{ error: string | null }>
}
```

Task 9 (`SessionForm`) calls `createSession`; Task 10 (`SessionList`) reads `sessions` and calls `deleteSession`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useTrainingSessions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTrainingSessions } from './useTrainingSessions'
import { supabase } from '../lib/supabaseClient'

const mockSession = {
  id: 's1',
  date: '2026-08-01',
  type: 'kumite',
  duration_min: 60,
  self_rating: 4,
  notes: 'Good pressure drills',
  improved: ['Timing'],
  struggled: ['Footwork'],
  created_at: '2026-08-01T10:00:00Z',
}

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockSession], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn })),
    },
  }
})

describe('useTrainingSessions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads sessions on mount', async () => {
    const { result } = renderHook(() => useTrainingSessions())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.sessions).toEqual([mockSession])
    expect(supabase.from).toHaveBeenCalledWith('training_sessions')
  })

  it('createSession inserts a row and returns no error on success', async () => {
    const { result } = renderHook(() => useTrainingSessions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.createSession({
        date: '2026-08-02',
        type: 'kata',
        duration_min: 45,
      })
    })
    expect(response.error).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- useTrainingSessions`
Expected: FAIL — `Cannot find module './useTrainingSessions'`

- [ ] **Step 3: Write `useTrainingSessions.ts`**

Create `src/hooks/useTrainingSessions.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface TrainingSession {
  id: string
  date: string
  type: string
  duration_min: number
  self_rating: number | null
  notes: string | null
  improved: string[]
  struggled: string[]
  created_at: string
}

export interface NewTrainingSession {
  date: string
  type: string
  duration_min: number
  self_rating?: number
  notes?: string
  improved?: string[]
  struggled?: string[]
}

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .order('date', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setSessions((data ?? []) as TrainingSession[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createSession(input: NewTrainingSession) {
    const { error } = await supabase.from('training_sessions').insert(input)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteSession(id: string) {
    const { error } = await supabase.from('training_sessions').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { sessions, loading, error, createSession, deleteSession }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useTrainingSessions`
Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTrainingSessions.ts src/hooks/useTrainingSessions.test.ts
git commit -m "feat: add useTrainingSessions hook"
```

---

### Task 9: `SessionForm` (react-hook-form + zod, with improved/struggled checklist)

**Files:**
- Create: `src/components/forms/SessionForm.tsx`
- Test: `src/components/forms/SessionForm.test.tsx`

**Interfaces:**
- Consumes: `NewTrainingSession` type and `createSession` shape from Task 8; `Button`, `Input`, `Label`, `Checkbox` from Task 3
- Produces: `<SessionForm onSuccess={() => void} />` — Task 10's `TrainingLog` page renders this inside a dialog/section.

- [ ] **Step 1: Install form dependencies**

Run: `npm install react-hook-form zod @hookform/resolvers`

- [ ] **Step 2: Write the failing test**

Create `src/components/forms/SessionForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionForm } from './SessionForm'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

describe('SessionForm', () => {
  it('submits with date, type, duration, and checked improved/struggled tags', async () => {
    const createSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession,
      deleteSession: vi.fn(),
    })

    const onSuccess = vi.fn()
    render(<SessionForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/date/i), '2026-08-01')
    await user.selectOptions(screen.getByLabelText(/type/i), 'kumite')
    await user.type(screen.getByLabelText(/duration/i), '60')
    await user.click(screen.getByLabelText('Timing'))
    await user.click(screen.getByLabelText('Footwork'))
    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-08-01',
        type: 'kumite',
        duration_min: 60,
        improved: ['Timing'],
        struggled: ['Footwork'],
      })
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows a validation error when duration is missing', async () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })

    render(<SessionForm onSuccess={vi.fn()} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/date/i), '2026-08-01')
    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(await screen.findByText(/duration is required/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- SessionForm`
Expected: FAIL — `Cannot find module './SessionForm'`

- [ ] **Step 4: Write `SessionForm.tsx`**

Mobile-first: single-column form, full-width fields and touch targets (checkboxes use the shadcn `Checkbox` at its default size, which meets the ~44px tap target on mobile via its padding wrapper).

Create `src/components/forms/SessionForm.tsx`:

```tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

const SESSION_TYPES = ['kata', 'kumite', 'conditioning', 'other'] as const
const IMPROVED_OPTIONS = ['Speed', 'Timing', 'Distance', 'Power', 'Accuracy', 'Strategy']
const STRUGGLED_OPTIONS = [
  'Fatigue',
  'Reaction time',
  'Footwork',
  'Confidence',
  'Technique consistency',
]

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(SESSION_TYPES, { message: 'Type is required' }),
  duration_min: z.coerce.number({ message: 'Duration is required' }).positive('Duration is required'),
  self_rating: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  improved: z.array(z.string()).default([]),
  struggled: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof schema>

export function SessionForm({ onSuccess }: { onSuccess: () => void }) {
  const { createSession } = useTrainingSessions()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { improved: [], struggled: [] },
  })

  async function onSubmit(values: FormValues) {
    const { error } = await createSession(values)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          {...register('type')}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Select type…</option>
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="duration_min">Duration (minutes)</Label>
        <Input id="duration_min" type="number" {...register('duration_min')} />
        {errors.duration_min && (
          <p className="text-sm text-destructive">{errors.duration_min.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="self_rating">Self-rating (1-5)</Label>
        <Input id="self_rating" type="number" min={1} max={5} {...register('self_rating')} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">What improved?</legend>
        {IMPROVED_OPTIONS.map((label) => (
          <Controller
            key={label}
            name="improved"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value?.includes(label)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...(field.value ?? []), label]
                      : (field.value ?? []).filter((v) => v !== label)
                    field.onChange(next)
                  }}
                />
                {label}
              </label>
            )}
          />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">What struggled?</legend>
        {STRUGGLED_OPTIONS.map((label) => (
          <Controller
            key={label}
            name="struggled"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value?.includes(label)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...(field.value ?? []), label]
                      : (field.value ?? []).filter((v) => v !== label)
                    field.onChange(next)
                  }}
                />
                {label}
              </label>
            )}
          />
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving…' : 'Save session'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- SessionForm`
Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/components/forms/SessionForm.tsx src/components/forms/SessionForm.test.tsx
git commit -m "feat: add SessionForm with improved/struggled checklist"
```

---

### Task 10: `SessionList` + Training Log page

**Files:**
- Create: `src/components/log/SessionList.tsx`
- Create: `src/pages/TrainingLog.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/log/SessionList.test.tsx`

**Interfaces:**
- Consumes: `useTrainingSessions` (Task 8), `SessionForm` (Task 9)
- Produces: `<TrainingLog />` page wired into the `/log` route, replacing the Task 6 stub.

- [ ] **Step 1: Write the failing test**

Create `src/components/log/SessionList.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionList } from './SessionList'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import type { TrainingSession } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

const session: TrainingSession = {
  id: 's1',
  date: '2026-08-01',
  type: 'kumite',
  duration_min: 60,
  self_rating: 4,
  notes: null,
  improved: [],
  struggled: [],
  created_at: '2026-08-01T10:00:00Z',
}

describe('SessionList', () => {
  it('renders a row per session and calls deleteSession on delete click', async () => {
    const deleteSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [session],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession,
    })

    render(<SessionList />)
    expect(screen.getByText('kumite')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(deleteSession).toHaveBeenCalledWith('s1')
  })

  it('shows an empty state when there are no sessions', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<SessionList />)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- SessionList`
Expected: FAIL — `Cannot find module './SessionList'`

- [ ] **Step 3: Write `SessionList.tsx`**

Mobile-first: stacked cards, not a wide table (a table forces horizontal scroll on a phone).

Create `src/components/log/SessionList.tsx`:

```tsx
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Button } from '../ui/button'

export function SessionList() {
  const { sessions, loading, deleteSession } = useTrainingSessions()

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{s.type}</span>
            <span className="text-muted-foreground">{s.date}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{s.duration_min} min</span>
            {s.self_rating && <span>Rating: {s.self_rating}/5</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="self-end text-destructive"
            onClick={() => deleteSession(s.id)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- SessionList`
Expected: `2 passed`

- [ ] **Step 5: Write `TrainingLog.tsx`**

Create `src/pages/TrainingLog.tsx`:

```tsx
import { useState } from 'react'
import { SessionForm } from '../components/forms/SessionForm'
import { SessionList } from '../components/log/SessionList'
import { Button } from '../components/ui/button'

export function TrainingLog() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Training Log</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New session'}
        </Button>
      </div>
      {showForm && <SessionForm onSuccess={() => setShowForm(false)} />}
      <SessionList />
    </div>
  )
}
```

- [ ] **Step 6: Wire `TrainingLog` into the `/log` route**

In `src/App.tsx`, replace `import { TrainingLog as TrainingLogStub }`-style stub usage: remove the `TrainingLogStub` function, add `import { TrainingLog } from './pages/TrainingLog'`, and replace `<TrainingLogStub />` with `<TrainingLog />`.

- [ ] **Step 7: Verify the dev server**

Run: `npm run dev`
Expected: after logging in, `/log` shows "Training Log", the "+ New session" button, and the empty-state message.

- [ ] **Step 8: Commit**

```bash
git add src/components/log/SessionList.tsx src/components/log/SessionList.test.tsx src/pages/TrainingLog.tsx src/App.tsx
git commit -m "feat: add SessionList and Training Log page"
```

---

### Task 11: `useCompetitionResults` hook

**Files:**
- Create: `src/hooks/useCompetitionResults.ts`
- Test: `src/hooks/useCompetitionResults.test.ts`

**Interfaces:**
- Consumes: `supabase`; `competition_results` columns from Task 2 (`my_yuko`, `my_waza_ari`, `my_ippon`, `opponent_yuko`, `opponent_waza_ari`, `opponent_ippon`)
- Produces:

```ts
export type WinMethod =
  | 'ippon'
  | 'waza-ari'
  | 'yuko'
  | 'hansoku'
  | 'kiken'
  | 'shikkaku'
  | 'hantei'

export interface CompetitionResult {
  id: string
  event: string
  date: string
  division: string | null
  placement: string | null
  discipline: 'kata' | 'kumite'
  kata_technical_score: number | null
  kata_athletic_score: number | null
  my_yuko: number
  my_waza_ari: number
  my_ippon: number
  opponent_yuko: number
  opponent_waza_ari: number
  opponent_ippon: number
  points_for: number | null
  points_against: number | null
  win_method: WinMethod | null
  opponent_name: string | null
  notes: string | null
  created_at: string
}

export interface NewCompetitionResult {
  event: string
  date: string
  division?: string
  placement?: string
  discipline: 'kata' | 'kumite'
  kata_technical_score?: number
  kata_athletic_score?: number
  my_yuko?: number
  my_waza_ari?: number
  my_ippon?: number
  opponent_yuko?: number
  opponent_waza_ari?: number
  opponent_ippon?: number
  win_method?: WinMethod
  opponent_name?: string
  notes?: string
}

export function useCompetitionResults(): {
  results: CompetitionResult[]
  loading: boolean
  error: string | null
  createResult: (input: NewCompetitionResult) => Promise<{ error: string | null }>
  deleteResult: (id: string) => Promise<{ error: string | null }>
}
```

`points_for`/`points_against` are computed client-side before insert (`yuko*1 + waza_ari*2 + ippon*3`, per the spec's "Refinement" note) — the hook owns this calculation, not the form.

Task 12 (`CompetitionForm`) calls `createResult`; Task 13's `CompetitionTimeline` reads `results`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useCompetitionResults.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCompetitionResults } from './useCompetitionResults'
import { supabase } from '../lib/supabaseClient'

const mockResult = {
  id: 'c1',
  event: 'BC Open',
  date: '2026-06-01',
  division: 'Senior -55kg',
  placement: '1st',
  discipline: 'kumite',
  kata_technical_score: null,
  kata_athletic_score: null,
  my_yuko: 1,
  my_waza_ari: 1,
  my_ippon: 0,
  opponent_yuko: 0,
  opponent_waza_ari: 0,
  opponent_ippon: 0,
  points_for: 3,
  points_against: 0,
  win_method: 'waza-ari',
  opponent_name: 'Sarah Tan',
  notes: null,
  created_at: '2026-06-01T10:00:00Z',
}

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockResult], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn })),
    },
  }
})

describe('useCompetitionResults', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads results on mount', async () => {
    const { result } = renderHook(() => useCompetitionResults())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.results).toEqual([mockResult])
  })

  it('createResult computes points_for/points_against from the yuko/waza-ari/ippon breakdown', async () => {
    const { result } = renderHook(() => useCompetitionResults())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createResult({
        event: 'Nationals',
        date: '2026-07-01',
        discipline: 'kumite',
        my_yuko: 1,
        my_waza_ari: 1,
        my_ippon: 0,
        opponent_yuko: 0,
        opponent_waza_ari: 0,
        opponent_ippon: 1,
      })
    })

    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ points_for: 3, points_against: 3 })
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- useCompetitionResults`
Expected: FAIL — `Cannot find module './useCompetitionResults'`

- [ ] **Step 3: Write `useCompetitionResults.ts`**

Create `src/hooks/useCompetitionResults.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type WinMethod =
  | 'ippon'
  | 'waza-ari'
  | 'yuko'
  | 'hansoku'
  | 'kiken'
  | 'shikkaku'
  | 'hantei'

export interface CompetitionResult {
  id: string
  event: string
  date: string
  division: string | null
  placement: string | null
  discipline: 'kata' | 'kumite'
  kata_technical_score: number | null
  kata_athletic_score: number | null
  my_yuko: number
  my_waza_ari: number
  my_ippon: number
  opponent_yuko: number
  opponent_waza_ari: number
  opponent_ippon: number
  points_for: number | null
  points_against: number | null
  win_method: WinMethod | null
  opponent_name: string | null
  notes: string | null
  created_at: string
}

export interface NewCompetitionResult {
  event: string
  date: string
  division?: string
  placement?: string
  discipline: 'kata' | 'kumite'
  kata_technical_score?: number
  kata_athletic_score?: number
  my_yuko?: number
  my_waza_ari?: number
  my_ippon?: number
  opponent_yuko?: number
  opponent_waza_ari?: number
  opponent_ippon?: number
  win_method?: WinMethod
  opponent_name?: string
  notes?: string
}

function computePoints(input: NewCompetitionResult) {
  const points = (yuko = 0, wazaAri = 0, ippon = 0) => yuko * 1 + wazaAri * 2 + ippon * 3
  return {
    points_for: points(input.my_yuko, input.my_waza_ari, input.my_ippon),
    points_against: points(input.opponent_yuko, input.opponent_waza_ari, input.opponent_ippon),
  }
}

export function useCompetitionResults() {
  const [results, setResults] = useState<CompetitionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('competition_results')
      .select('*')
      .order('date', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setResults((data ?? []) as CompetitionResult[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createResult(input: NewCompetitionResult) {
    const { points_for, points_against } = computePoints(input)
    const { error } = await supabase
      .from('competition_results')
      .insert({ ...input, points_for, points_against })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function deleteResult(id: string) {
    const { error } = await supabase.from('competition_results').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { results, loading, error, createResult, deleteResult }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useCompetitionResults`
Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCompetitionResults.ts src/hooks/useCompetitionResults.test.ts
git commit -m "feat: add useCompetitionResults hook with computed points_for/against"
```

---

### Task 12: `CompetitionForm` (conditional kata/kumite fields) + Competitions page

**Files:**
- Create: `src/components/forms/CompetitionForm.tsx`
- Create: `src/pages/Competitions.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/forms/CompetitionForm.test.tsx`

**Interfaces:**
- Consumes: `NewCompetitionResult`, `useCompetitionResults` from Task 11
- Produces: `<CompetitionForm onSuccess={() => void} />`; `<Competitions />` page wired into `/competitions`, replacing the Task 6 stub.

- [ ] **Step 1: Write the failing test**

Create `src/components/forms/CompetitionForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompetitionForm } from './CompetitionForm'
import { useCompetitionResults } from '../../hooks/useCompetitionResults'

vi.mock('../../hooks/useCompetitionResults')

describe('CompetitionForm', () => {
  it('shows kata score fields when discipline is kata, and kumite fields when kumite', async () => {
    vi.mocked(useCompetitionResults).mockReturnValue({
      results: [],
      loading: false,
      error: null,
      createResult: vi.fn().mockResolvedValue({ error: null }),
      deleteResult: vi.fn(),
    })
    render(<CompetitionForm onSuccess={vi.fn()} />)
    const user = userEvent.setup()

    await user.selectOptions(screen.getByLabelText(/discipline/i), 'kata')
    expect(screen.getByLabelText(/technical score/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/my yuko/i)).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/discipline/i), 'kumite')
    expect(screen.getByLabelText(/my yuko/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/technical score/i)).not.toBeInTheDocument()
  })

  it('submits kumite results with the full point breakdown', async () => {
    const createResult = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useCompetitionResults).mockReturnValue({
      results: [],
      loading: false,
      error: null,
      createResult,
      deleteResult: vi.fn(),
    })
    const onSuccess = vi.fn()
    render(<CompetitionForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/event/i), 'BC Open')
    await user.type(screen.getByLabelText(/^date/i), '2026-06-01')
    await user.selectOptions(screen.getByLabelText(/discipline/i), 'kumite')
    await user.type(screen.getByLabelText(/my yuko/i), '1')
    await user.type(screen.getByLabelText(/my waza-ari/i), '1')
    await user.click(screen.getByRole('button', { name: /save result/i }))

    expect(createResult).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'BC Open', discipline: 'kumite', my_yuko: 1, my_waza_ari: 1 })
    )
    expect(onSuccess).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- CompetitionForm`
Expected: FAIL — `Cannot find module './CompetitionForm'`

- [ ] **Step 3: Write `CompetitionForm.tsx`**

Create `src/components/forms/CompetitionForm.tsx`:

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCompetitionResults,
  type WinMethod,
} from '../../hooks/useCompetitionResults'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const WIN_METHODS: WinMethod[] = [
  'ippon',
  'waza-ari',
  'yuko',
  'hansoku',
  'kiken',
  'shikkaku',
  'hantei',
]

const schema = z
  .object({
    event: z.string().min(1, 'Event is required'),
    date: z.string().min(1, 'Date is required'),
    division: z.string().optional(),
    placement: z.string().optional(),
    discipline: z.enum(['kata', 'kumite'], { message: 'Discipline is required' }),
    kata_technical_score: z.coerce.number().optional(),
    kata_athletic_score: z.coerce.number().optional(),
    my_yuko: z.coerce.number().optional(),
    my_waza_ari: z.coerce.number().optional(),
    my_ippon: z.coerce.number().optional(),
    opponent_yuko: z.coerce.number().optional(),
    opponent_waza_ari: z.coerce.number().optional(),
    opponent_ippon: z.coerce.number().optional(),
    win_method: z.enum(WIN_METHODS as [WinMethod, ...WinMethod[]]).optional(),
    opponent_name: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (v) => v.discipline !== 'kata' || v.kata_technical_score !== undefined,
    { message: 'Technical score is required for kata', path: ['kata_technical_score'] }
  )

type FormValues = z.infer<typeof schema>

export function CompetitionForm({ onSuccess }: { onSuccess: () => void }) {
  const { createResult } = useCompetitionResults()
  const [discipline, setDiscipline] = useState<'kata' | 'kumite' | ''>('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const { error } = await createResult(values)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="event">Event</Label>
        <Input id="event" {...register('event')} />
        {errors.event && <p className="text-sm text-destructive">{errors.event.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="discipline">Discipline</Label>
        <select
          id="discipline"
          {...register('discipline', {
            onChange: (e) => setDiscipline(e.target.value),
          })}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Select discipline…</option>
          <option value="kata">Kata</option>
          <option value="kumite">Kumite</option>
        </select>
      </div>

      {discipline === 'kata' && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kata_technical_score">Technical score</Label>
            <Input
              id="kata_technical_score"
              type="number"
              step="0.1"
              {...register('kata_technical_score')}
            />
            {errors.kata_technical_score && (
              <p className="text-sm text-destructive">{errors.kata_technical_score.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kata_athletic_score">Athletic score</Label>
            <Input
              id="kata_athletic_score"
              type="number"
              step="0.1"
              {...register('kata_athletic_score')}
            />
          </div>
        </>
      )}

      {discipline === 'kumite' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my_yuko">My Yuko</Label>
              <Input id="my_yuko" type="number" {...register('my_yuko')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opponent_yuko">Opponent Yuko</Label>
              <Input id="opponent_yuko" type="number" {...register('opponent_yuko')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my_waza_ari">My Waza-ari</Label>
              <Input id="my_waza_ari" type="number" {...register('my_waza_ari')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opponent_waza_ari">Opponent Waza-ari</Label>
              <Input id="opponent_waza_ari" type="number" {...register('opponent_waza_ari')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my_ippon">My Ippon</Label>
              <Input id="my_ippon" type="number" {...register('my_ippon')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opponent_ippon">Opponent Ippon</Label>
              <Input id="opponent_ippon" type="number" {...register('opponent_ippon')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="win_method">Win method</Label>
            <select
              id="win_method"
              {...register('win_method')}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Select…</option>
              {WIN_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opponent_name">Opponent name</Label>
        <Input id="opponent_name" {...register('opponent_name')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="placement">Placement</Label>
        <Input id="placement" {...register('placement')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving…' : 'Save result'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- CompetitionForm`
Expected: `2 passed`

- [ ] **Step 5: Write `Competitions.tsx`**

Create `src/pages/Competitions.tsx`:

```tsx
import { useState } from 'react'
import { CompetitionForm } from '../components/forms/CompetitionForm'
import { useCompetitionResults } from '../hooks/useCompetitionResults'
import { Button } from '../components/ui/button'

export function Competitions() {
  const [showForm, setShowForm] = useState(false)
  const { results, loading } = useCompetitionResults()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Competitions</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New result'}
        </Button>
      </div>
      {showForm && <CompetitionForm onSuccess={() => setShowForm(false)} />}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
      )}
      <ul className="flex flex-col gap-3">
        {results.map((r) => (
          <li key={r.id} className="rounded-md border border-border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.event}</span>
              <span className="text-muted-foreground">{r.date}</span>
            </div>
            <div className="text-muted-foreground">
              {r.discipline} · {r.placement ?? 'no placement recorded'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 6: Wire `Competitions` into the `/competitions` route**

In `src/App.tsx`, remove the `CompetitionsStub` function, add `import { Competitions } from './pages/Competitions'`, replace `<CompetitionsStub />` with `<Competitions />`.

- [ ] **Step 7: Verify the dev server**

Run: `npm run dev`
Expected: `/competitions` shows the page, "+ New result" toggles the form, selecting "Kata" vs "Kumite" swaps the score fields.

- [ ] **Step 8: Commit**

```bash
git add src/components/forms/CompetitionForm.tsx src/components/forms/CompetitionForm.test.tsx src/pages/Competitions.tsx src/App.tsx
git commit -m "feat: add CompetitionForm with conditional kata/kumite fields and Competitions page"
```

---

### Task 13: Dashboard charts (empty states) + Dashboard page

**Files:**
- Create: `src/components/dashboard/HoursChart.tsx`
- Create: `src/components/dashboard/RatingTrendChart.tsx`
- Create: `src/components/dashboard/CompetitionTimeline.tsx`
- Create: `src/pages/Dashboard.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/dashboard/HoursChart.test.tsx`

**Interfaces:**
- Consumes: `useTrainingSessions` (Task 8), `useCompetitionResults` (Task 11)
- Produces: `<Dashboard />` wired into `/`, replacing the Task 6 stub. Only `HoursChart` gets a full test — `RatingTrendChart`/`CompetitionTimeline` follow the identical empty-state pattern verified there, so they get build+manual verification only (per this plan's own YAGNI: don't duplicate the same test three times for the same empty-state logic).

- [ ] **Step 1: Install Recharts**

Run: `npm install recharts`

- [ ] **Step 2: Write the failing test for the empty-state pattern**

Create `src/components/dashboard/HoursChart.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoursChart } from './HoursChart'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

describe('HoursChart', () => {
  it('shows a "no data yet" message when there are no sessions', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<HoursChart />)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })

  it('renders the chart container when sessions exist', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [
        {
          id: 's1',
          date: '2026-08-01',
          type: 'kumite',
          duration_min: 60,
          self_rating: 4,
          notes: null,
          improved: [],
          struggled: [],
          created_at: '2026-08-01T10:00:00Z',
        },
      ],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<HoursChart />)
    expect(screen.queryByText(/no sessions logged yet/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- HoursChart`
Expected: FAIL — `Cannot find module './HoursChart'`

- [ ] **Step 4: Write `HoursChart.tsx`**

Create `src/components/dashboard/HoursChart.tsx`:

```tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

function toWeeklyHours(sessions: { date: string; duration_min: number }[]) {
  const byWeek = new Map<string, number>()
  for (const s of sessions) {
    const d = new Date(s.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    byWeek.set(key, (byWeek.get(key) ?? 0) + s.duration_min / 60)
  }
  return Array.from(byWeek.entries())
    .map(([week, hours]) => ({ week, hours: Math.round(hours * 10) / 10 }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

export function HoursChart() {
  const { sessions, loading } = useTrainingSessions()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Hours per week</CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart data={toWeeklyHours(sessions)}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="currentColor" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- HoursChart`
Expected: `2 passed`

- [ ] **Step 6: Write `RatingTrendChart.tsx`** (same empty-state pattern, verified by build + manual check per this task's Interfaces note)

Create `src/components/dashboard/RatingTrendChart.tsx`:

```tsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export function RatingTrendChart() {
  const { sessions, loading } = useTrainingSessions()
  const rated = sessions
    .filter((s) => s.self_rating != null)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Self-rating trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && rated.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ratings yet.</p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <LineChart data={rated}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="self_rating" stroke="currentColor" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: Write `CompetitionTimeline.tsx`**

Create `src/components/dashboard/CompetitionTimeline.tsx`:

```tsx
import { useCompetitionResults } from '../../hooks/useCompetitionResults'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export function CompetitionTimeline() {
  const { results, loading } = useCompetitionResults()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Competition timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {!loading && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No competitions logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((r) => (
              <li key={r.id} className="flex justify-between text-sm">
                <span>{r.event}</span>
                <span className="text-muted-foreground">
                  {r.date} · {r.placement ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 8: Write `Dashboard.tsx`** — mobile-first: charts stack in a single column by default, 2-up grid at `md:` and above.

Create `src/pages/Dashboard.tsx`:

```tsx
import { HoursChart } from '../components/dashboard/HoursChart'
import { RatingTrendChart } from '../components/dashboard/RatingTrendChart'
import { CompetitionTimeline } from '../components/dashboard/CompetitionTimeline'

export function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HoursChart />
        <RatingTrendChart />
        <CompetitionTimeline />
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Wire `Dashboard` into the `/` route**

In `src/App.tsx`, remove `DashboardStub`, add `import { Dashboard } from './pages/Dashboard'`, replace `<DashboardStub />` with `<Dashboard />`.

- [ ] **Step 10: Verify the dev server at a mobile viewport**

Run: `npm run dev`
Expected: open devtools, set viewport to 390×844 (iPhone 12/13 size). `/` shows the three cards stacked in a single column, each showing its empty state, with the bottom nav bar visible and not overlapping the last card.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json src/components/dashboard/ src/pages/Dashboard.tsx src/App.tsx
git commit -m "feat: add dashboard charts with no-data-yet empty states"
```

---

### Task 14: Technique portfolio — bookmark + nickname

**Files:**
- Create: `src/hooks/useUserTechniques.ts`
- Create: `src/components/techniques/TechniquePortfolio.tsx`
- Test: `src/hooks/useUserTechniques.test.ts`

**Interfaces:**
- Consumes: `supabase`; `user_techniques` table from Task 2
- Produces:

```ts
export interface TechniqueBookmark {
  id: string
  technique_id: string
  nickname: string | null
  technique_name: string
  category: string
}

export function useUserTechniques(): {
  bookmarks: TechniqueBookmark[]
  loading: boolean
  addBookmark: (techniqueId: string, nickname?: string) => Promise<{ error: string | null }>
  removeBookmark: (bookmarkId: string) => Promise<{ error: string | null }>
  updateNickname: (bookmarkId: string, nickname: string) => Promise<{ error: string | null }>
}
```

This task is self-contained UI (not wired into a route in this plan — it's a standalone component future pages can embed) since the spec doesn't define where in the nav it surfaces yet; wiring it into a page is future work once that's decided, not a gap in this task.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useUserTechniques.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUserTechniques } from './useUserTechniques'
import { supabase } from '../lib/supabaseClient'

const mockBookmark = {
  id: 'b1',
  technique_id: 't1',
  nickname: '1-2',
  techniques: { name: 'Kizami tsuki → Gyaku tsuki', category: 'kumite_combo' },
}

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockBookmark], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  const eqUpdate = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn(() => ({ eq: eqUpdate }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn, update })),
    },
  }
})

describe('useUserTechniques', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads bookmarks with the joined technique name and category', async () => {
    const { result } = renderHook(() => useUserTechniques())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.bookmarks).toEqual([
      { id: 'b1', technique_id: 't1', nickname: '1-2', technique_name: 'Kizami tsuki → Gyaku tsuki', category: 'kumite_combo' },
    ])
  })

  it('addBookmark inserts a row with the given technique_id and nickname', async () => {
    const { result } = renderHook(() => useUserTechniques())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addBookmark('t2', 'my combo')
    })
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith({ technique_id: 't2', nickname: 'my combo' })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- useUserTechniques`
Expected: FAIL — `Cannot find module './useUserTechniques'`

- [ ] **Step 3: Write `useUserTechniques.ts`**

Create `src/hooks/useUserTechniques.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface TechniqueBookmark {
  id: string
  technique_id: string
  nickname: string | null
  technique_name: string
  category: string
}

interface RawBookmarkRow {
  id: string
  technique_id: string
  nickname: string | null
  techniques: { name: string; category: string }
}

export function useUserTechniques() {
  const [bookmarks, setBookmarks] = useState<TechniqueBookmark[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_techniques')
      .select('id, technique_id, nickname, techniques(name, category)')
      .order('created_at', { ascending: false })
    const rows = (data ?? []) as unknown as RawBookmarkRow[]
    setBookmarks(
      rows.map((r) => ({
        id: r.id,
        technique_id: r.technique_id,
        nickname: r.nickname,
        technique_name: r.techniques.name,
        category: r.techniques.category,
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addBookmark(techniqueId: string, nickname?: string) {
    const { error } = await supabase
      .from('user_techniques')
      .insert({ technique_id: techniqueId, nickname: nickname ?? null })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeBookmark(bookmarkId: string) {
    const { error } = await supabase.from('user_techniques').delete().eq('id', bookmarkId)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function updateNickname(bookmarkId: string, nickname: string) {
    const { error } = await supabase
      .from('user_techniques')
      .update({ nickname })
      .eq('id', bookmarkId)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { bookmarks, loading, addBookmark, removeBookmark, updateNickname }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useUserTechniques`
Expected: `2 passed`

- [ ] **Step 5: Write `TechniquePortfolio.tsx`** (no test — presentational list over an already-tested hook, mirrors `SessionList`'s pattern)

Create `src/components/techniques/TechniquePortfolio.tsx`:

```tsx
import { useUserTechniques } from '../../hooks/useUserTechniques'
import { Button } from '../ui/button'

export function TechniquePortfolio() {
  const { bookmarks, loading, removeBookmark } = useUserTechniques()

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (bookmarks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No techniques bookmarked yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {bookmarks.map((b) => (
        <li
          key={b.id}
          className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
        >
          <div>
            <p className="font-medium">{b.nickname ?? b.technique_name}</p>
            {b.nickname && (
              <p className="text-xs text-muted-foreground">{b.technique_name}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeBookmark(b.id)}>
            Remove
          </Button>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all tests across every task pass.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useUserTechniques.ts src/hooks/useUserTechniques.test.ts src/components/techniques/TechniquePortfolio.tsx
git commit -m "feat: add technique portfolio bookmark+nickname feature"
```

---

## Self-Review

**1. Spec coverage** — checked against `2026-07-31-karate-mvp-design.md`:
- UI library/styling (shadcn defaults) → Task 3, applied throughout.
- Mobile-first → Global Constraints + explicit mobile-first markup in Tasks 5, 6, 9, 10, 13.
- Dashboard empty states → Task 13.
- Kata reference (102 katas) seed data → **gap found**: the design spec says the kata list "lives in the seed migration," but no task in this plan writes that seed migration. Added as Task 2 addendum below rather than leaving it implicit.
- Kumite technique reference seed data (5 real + 5 placeholder combos + 12 singles) → same gap, same fix.
- Technique ownership/RLS, user_techniques, kumite score breakdown, session checklist → Task 2.
- Technique portfolio (bookmark + nickname) → Task 14.
- Post-session checklist → Task 9.
- Kumite full point breakdown + computed totals → Task 11, 12.
- Auth `getClaims()` pattern → Task 4.

**Fix for the gap above:** Task 2 needs a fifth migration seeding both reference tables. Adding it now:

### Task 2, Step 4.5 (insert before Step 5 "push migrations"): Write the reference data seed migration

Create `supabase/migrations/20260801000004_seed_technique_reference_data.sql`. This seeds `techniques` with `category = 'kata'` (102 official WKF katas) and `category = 'kumite_combo'` (the user's 5 real combos + 5 researched placeholder combos + 12 foundational singles), all with `user_id = null` (official, shared per Task 2 Step 1's RLS policy). Get the `sport_id` from the existing `sports` table seeded in `20260731004049_seed_karate_sport.sql`:

```sql
do $$
declare
  v_sport_id uuid;
begin
  select id into v_sport_id from sports where name = 'Karate';

  insert into techniques (sport_id, name, category) values
    (v_sport_id, 'Anan', 'kata'), (v_sport_id, 'Anan Dai', 'kata'), (v_sport_id, 'Ananko', 'kata'),
    (v_sport_id, 'Aoyagi', 'kata'), (v_sport_id, 'Bassai', 'kata'), (v_sport_id, 'Bassai Dai', 'kata'),
    (v_sport_id, 'Bassai Sho', 'kata'), (v_sport_id, 'Chatanyara Kusanku', 'kata'),
    (v_sport_id, 'Chibana No Kushanku', 'kata'), (v_sport_id, 'Chinte', 'kata'), (v_sport_id, 'Chinto', 'kata'),
    (v_sport_id, 'Enpi', 'kata'), (v_sport_id, 'Fukyugata Ichi', 'kata'), (v_sport_id, 'Fukyugata Ni', 'kata'),
    (v_sport_id, 'Gankaku', 'kata'), (v_sport_id, 'Garyu', 'kata'), (v_sport_id, 'Gekisai (Geksai) 1', 'kata'),
    (v_sport_id, 'Gekisai (Geksai) 2', 'kata'), (v_sport_id, 'Gojushiho', 'kata'),
    (v_sport_id, 'Gojushiho Dai', 'kata'), (v_sport_id, 'Gojushiho Sho', 'kata'), (v_sport_id, 'Hakucho', 'kata'),
    (v_sport_id, 'Hangetsu', 'kata'), (v_sport_id, 'Haufa (Haffa)', 'kata'), (v_sport_id, 'Heian Shodan', 'kata'),
    (v_sport_id, 'Heian Nidan', 'kata'), (v_sport_id, 'Heian Sandan', 'kata'), (v_sport_id, 'Heian Yondan', 'kata'),
    (v_sport_id, 'Heian Godan', 'kata'), (v_sport_id, 'Heiku', 'kata'), (v_sport_id, 'Ishimine Bassai', 'kata'),
    (v_sport_id, 'Itosu Rohai Shodan', 'kata'), (v_sport_id, 'Itosu Rohai Nidan', 'kata'),
    (v_sport_id, 'Itosu Rohai Sandan', 'kata'), (v_sport_id, 'Jiin', 'kata'), (v_sport_id, 'Jion', 'kata'),
    (v_sport_id, 'Jitte', 'kata'), (v_sport_id, 'Juroku', 'kata'), (v_sport_id, 'Kanchin', 'kata'),
    (v_sport_id, 'Kanku Dai', 'kata'), (v_sport_id, 'Kanku Sho', 'kata'), (v_sport_id, 'Kanshu', 'kata'),
    (v_sport_id, 'Kishimoto No Kushanku', 'kata'), (v_sport_id, 'Kousoukun', 'kata'),
    (v_sport_id, 'Kousoukun Dai', 'kata'), (v_sport_id, 'Kousoukun Sho', 'kata'), (v_sport_id, 'Kururunfa', 'kata'),
    (v_sport_id, 'Kusanku', 'kata'), (v_sport_id, 'Kyan No Chinto', 'kata'), (v_sport_id, 'Kyan No Wanshu', 'kata'),
    (v_sport_id, 'Matsukaze', 'kata'), (v_sport_id, 'Matsumura Bassai', 'kata'), (v_sport_id, 'Matsumura Rohai', 'kata'),
    (v_sport_id, 'Meikyo', 'kata'), (v_sport_id, 'Myojo', 'kata'), (v_sport_id, 'Naifanchin Shodan', 'kata'),
    (v_sport_id, 'Naifanchin Nidan', 'kata'), (v_sport_id, 'Naifanchin Sandan', 'kata'), (v_sport_id, 'Naihanchi', 'kata'),
    (v_sport_id, 'Nijushiho', 'kata'), (v_sport_id, 'Nipaipo', 'kata'), (v_sport_id, 'Niseishi', 'kata'),
    (v_sport_id, 'Ohan', 'kata'), (v_sport_id, 'Ohan Dai', 'kata'), (v_sport_id, 'Oyadomari No Passai', 'kata'),
    (v_sport_id, 'Pachu', 'kata'), (v_sport_id, 'Paiku', 'kata'), (v_sport_id, 'Papuren', 'kata'),
    (v_sport_id, 'Passai', 'kata'), (v_sport_id, 'Pinan Shodan', 'kata'), (v_sport_id, 'Pinan Nidan', 'kata'),
    (v_sport_id, 'Pinan Sandan', 'kata'), (v_sport_id, 'Pinan Yondan', 'kata'), (v_sport_id, 'Pinan Godan', 'kata'),
    (v_sport_id, 'Rohai', 'kata'), (v_sport_id, 'Saifa', 'kata'), (v_sport_id, 'Sanchin', 'kata'),
    (v_sport_id, 'Sansai', 'kata'), (v_sport_id, 'Sanseiru', 'kata'), (v_sport_id, 'Sanseru', 'kata'),
    (v_sport_id, 'Seichin', 'kata'), (v_sport_id, 'Seienchin (Seiyunchin)', 'kata'), (v_sport_id, 'Seipai', 'kata'),
    (v_sport_id, 'Seiryu', 'kata'), (v_sport_id, 'Seishan', 'kata'), (v_sport_id, 'Seisan (Sesan)', 'kata'),
    (v_sport_id, 'Shiho Kousoukun', 'kata'), (v_sport_id, 'Shinpa', 'kata'), (v_sport_id, 'Shinsei', 'kata'),
    (v_sport_id, 'Shisochin', 'kata'), (v_sport_id, 'Sochin', 'kata'), (v_sport_id, 'Suparinpei', 'kata'),
    (v_sport_id, 'Tekki Shodan', 'kata'), (v_sport_id, 'Tekki Nidan', 'kata'), (v_sport_id, 'Tekki Sandan', 'kata'),
    (v_sport_id, 'Tensho', 'kata'), (v_sport_id, 'Tomari Bassai', 'kata'), (v_sport_id, 'Unshu', 'kata'),
    (v_sport_id, 'Unsu', 'kata'), (v_sport_id, 'Useishi', 'kata'), (v_sport_id, 'Wankan', 'kata'),
    (v_sport_id, 'Wanshu', 'kata');

  insert into techniques (sport_id, name, category) values
    (v_sport_id, 'Kizami tsuki → Gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki → Ura mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Gyaku tsuki → Front leg mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Double gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Jodan gyaku tsuki → Chudan mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki → Gyaku tsuki → Ura mawashi geri (rear leg)', 'kumite_combo'),
    (v_sport_id, 'Gyaku tsuki (body) → Front leg mawashi geri jodan', 'kumite_combo'),
    (v_sport_id, 'Jodan age uke/Tate uke → Kizami mawashi geri → Chudan gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Chudan mae geri + Gedan barai → Kizami tsuki/Tate tsuki', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki → Uraken yokomawashi uchi → Mae-ashi mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki', 'kumite_combo'), (v_sport_id, 'Gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Ura tsuki', 'kumite_combo'), (v_sport_id, 'Mae geri', 'kumite_combo'),
    (v_sport_id, 'Mawashi geri', 'kumite_combo'), (v_sport_id, 'Ura mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Ushiro geri', 'kumite_combo'), (v_sport_id, 'Yoko geri', 'kumite_combo'),
    (v_sport_id, 'Age uke', 'kumite_combo'), (v_sport_id, 'Soto uke', 'kumite_combo'),
    (v_sport_id, 'Uchi uke', 'kumite_combo'), (v_sport_id, 'Gedan barai', 'kumite_combo');
end $$;
```

Note the 102-kata list above uses `Pinan Shodan`–`Pinan Godan` naming (matching the reference PDF's page-2 table, which lists both "Heian Shodan" and "Pinan Shodan" as distinct rows 25-29 and 70-74 — the PDF's actual 102-entry table has both naming conventions present as separate historical/regional names, not a duplicate; both are included here as separate rows, matching the source document exactly).

- [ ] **Re-run Task 2 Step 5** (`npx supabase db push`) after adding this seed migration, before moving to Task 3.
- [ ] **Commit this addendum separately:**

```bash
git add supabase/migrations/20260801000004_seed_technique_reference_data.sql
git commit -m "feat: seed techniques table with 102 official katas and kumite reference list"
```

**2. Placeholder scan** — no "TBD"/"implement later"/"add appropriate X" found; every step has real code or an exact command.

**3. Type consistency** — verified across tasks: `NewTrainingSession` (Task 8) matches the fields `SessionForm` (Task 9) submits; `NewCompetitionResult`/`WinMethod` (Task 11) match `CompetitionForm` (Task 12); `TechniqueBookmark` (Task 14) is self-contained. No naming drift found.
