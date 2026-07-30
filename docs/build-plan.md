# Karate Training Log — Expanded Build Plan

Expansion of the original brainstorm. Original scope, pitch, and stack decisions unchanged — this adds the missing layer between "idea" and "can start coding today": verified competitive gaps, exact schema, file structure, screen specs, and a day-by-day timeline.

## 1. Competitive positioning — what "depth not breadth" actually means

Checked the two named competitors directly instead of assuming. Here's what each does, as of now:

**Dojo App (Martial Arts Tracker)** — belt/rank checklists per generic system (Learning → Practiced → Confident → Test-Ready status per requirement), class logging with type/duration/instructor, sparring journal with partner + tactical notes, competition tracking as a premium/AI add-on. Data stays local, syncs via iCloud, no social layer. Built for "a training journal," not sport-specific competition analysis.

**Martial Profile** — spans 60 disciplines (BJJ, Muay Thai, calisthenics, karate, etc.), workout tracker, timer, AI-generated routines, "combat simulations," and a social layer for finding training partners nearby. It's a fitness-and-community app that happens to include karate as one of 60 tags, not a karate-specific tool.

Neither encodes anything from actual WKF/Karate Canada competition structure. Specifically, neither has:

- **Kata's real scoring split** — WKF judges kata 70% technical (stances, techniques, transitional movements, timing, breathing, focus, conformance) and 30% athletic (strength, speed, balance), across a 7-judge panel. A generic "placement" field throws this away.
- **Kumite's point-category structure** — Ippon (3 pts, head kicks / techniques on a fallen opponent), Waza-ari (2 pts, body kicks), Yuko (1 pt, punches/strikes) — with an 8-point gap or Senshu (first-score tiebreak) as win conditions. "Won/lost" loses all of this.
- **Division/weight-class continuity** — tracking the same opponents across tournaments as you move up divisions.

This is the concrete, defensible version of "depth not breadth": it's not a vibe, it's specific fields in the schema that a 60-discipline app structurally can't add without breaking its generic model. Section 2 below builds `CompetitionResult` around this directly — kata gets technical/athletic sub-scores, kumite gets a point tally and win method, both nullable so the form only shows what's relevant.

## 2. Technical build spec

### 2.1 Schema (Postgres / Supabase, with RLS)

```sql
-- Reference data: ships with one row (Karate). RLS = readable by any authenticated
-- user, writable by no one from the client (seed via migration/dashboard only).
create table sports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_types text[] not null default '{}',
  created_at timestamptz default now()
);

create table techniques (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid references sports(id) not null,
  name text not null,
  category text -- 'kata' | 'kumite_combo' | 'conditioning'
);

-- User data
create table training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  sport_id uuid references sports(id) not null,
  date date not null,
  type text not null, -- kata / kumite drills / conditioning / sparring
  duration_min int not null,
  self_rating int check (self_rating between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

create table session_techniques ( -- stretch feature: technique tagging
  session_id uuid references training_sessions(id) on delete cascade,
  technique_id uuid references techniques(id),
  primary key (session_id, technique_id)
);

create table competition_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  sport_id uuid references sports(id) not null,
  event text not null,
  date date not null,
  division text,
  placement text,
  discipline text check (discipline in ('kata','kumite')),
  -- kata only
  kata_technical_score numeric,
  kata_athletic_score numeric,
  -- kumite only
  points_for int,
  points_against int,
  win_method text, -- 'ippon' | 'waza-ari' | 'yuko' | 'decision' | '8-point-gap'
  opponent_name text,
  opponent_notes text,
  notes text,
  created_at timestamptz default now()
);
```

RLS — every user table locked to `auth.uid()`:

```sql
alter table training_sessions enable row level security;

create policy "own sessions select" on training_sessions
  for select using (auth.uid() = user_id);
create policy "own sessions insert" on training_sessions
  for insert with check (auth.uid() = user_id);
create policy "own sessions update" on training_sessions
  for update using (auth.uid() = user_id);
create policy "own sessions delete" on training_sessions
  for delete using (auth.uid() = user_id);

-- repeat all four for competition_results
```

**Supabase-specific gotcha worth knowing going in:** aggregation views don't inherit RLS from their base tables unless you explicitly set `security_invoker = true`. Without it, a view silently leaks every user's data to every other user. Example — the dashboard's weekly-hours aggregation:

```sql
create view weekly_training_hours
  with (security_invoker = true) as
select user_id, date_trunc('week', date) as week, sum(duration_min) as total_minutes
from training_sessions
group by user_id, date_trunc('week', date);
```

This is a real thing to be able to explain in an interview if someone asks "how did you handle authorization" — it's a one-line fix, but only if you know to look for it.

### 2.2 File structure

```
src/
  lib/
    supabaseClient.ts
  hooks/
    useAuth.ts
    useTrainingSessions.ts
    useCompetitionResults.ts
  components/
    layout/
      NavBar.tsx
      AuthGate.tsx
    forms/
      SessionForm.tsx
      CompetitionForm.tsx      # conditionally renders kata vs. kumite fields
    dashboard/
      HoursChart.tsx
      RatingTrendChart.tsx
      CompetitionTimeline.tsx
      TechniqueFrequency.tsx   # stretch
    log/
      SessionList.tsx
      SessionRow.tsx
  pages/
    Login.tsx
    Dashboard.tsx
    TrainingLog.tsx
    Competitions.tsx
  App.tsx
  main.tsx
```

### 2.3 Screens

1. **Login** — Supabase email/password auth, redirect to Dashboard on session.
2. **Dashboard** — three Recharts widgets pulling from the views/tables above: hours/week bar chart (`weekly_training_hours`), self-rating trend line (`training_sessions` ordered by date), competition timeline (`competition_results` plotted by date with placement as the marker label).
3. **Training Log** — list of sessions, filterable by type/date range, "+ New Session" opens `SessionForm`.
4. **Competitions** — list of results, "+ New Result" opens `CompetitionForm`; discipline toggle (kata/kumite) swaps which score fields show.
5. **(Stretch) Technique frequency** — bar chart from `session_techniques`, counts per technique over a selected date range.

## 3. Week-by-week timeline (4 weeks)

**Week 1 — setup + auth + schema**
Day 1–2: Vite + React + Tailwind scaffold, Supabase project, run schema migration + RLS policies, seed the Karate `sports` row and your real technique list. Day 3–4: Auth flow (signup/login/logout), protected routes via `useAuth`. Day 5–7: Nav/layout shell, deploy skeleton (Vercel/Netlify) so there's a live URL from week one. Start logging real sessions from training this week — even via the Supabase table editor if the form isn't built yet, so the data history starts now, not at the end.

**Week 2 — core CRUD**
Day 8–10: `SessionForm` + `SessionList`, full create/read/update/delete. Day 11–13: `CompetitionForm` + list, conditional kata/kumite fields. Day 14: loading/error/empty states across both.

**Week 3 — dashboard**
Day 15–17: `weekly_training_hours` view + `HoursChart`. Day 18–19: `RatingTrendChart`. Day 20–21: `CompetitionTimeline`, dashboard layout polish.

**Week 4 — stretch + polish**
Day 22–24: technique tagging (`session_techniques`) + frequency chart, plus one more stretch pick (pilot invite to 1–2 teammates, or CSV/PDF export). Day 25–26: mobile responsiveness pass, basic accessibility pass (labels, contrast, focus states). Day 27–28: README, screenshots, build log writeup. Day 29–30: buffer for bugs, final deploy check.

**Commit cadence:** commit every session you touch code, minimum every 1–2 days. Message bodies should explain *why*, not just *what changed* — that's what turns commit history into build-log material instead of noise.

## 4. Stretch feature: AI training insight (OpenAI API)

Both named competitors already have "AI" bolted on (Dojo App's premium tier, Martial Profile's AI routines/simulations) — generic motivational filler. The differentiated version: use it to read *your* structured data against WKF criteria, not to generate a workout.

**What it does:** on the Dashboard, a "Get insight" button sends your last N sessions (type, duration, self-rating, notes) and recent competition results to a short prompt, gets back 2–3 sentences flagging a pattern — e.g. "Self-rating on kumite drills has dropped 3 sessions running, and your notes mention timing issues on the entry, not the technique itself." That's a real coaching-style read, not a summary restating what you already logged.

**Why this can't live in the browser:** an OpenAI key embedded in a Vite client bundle is public the moment you ship — anyone can pull it from devtools and run up your bill. It has to sit behind a server. Since there's no backend in this stack, use a **Supabase Edge Function** (Deno, deploys alongside the DB) as a thin proxy: browser → edge function → OpenAI → response. The key lives only in Supabase's function secrets, never in client code.

`supabase/functions/generate-insight/index.ts`

Rough shape: function receives the authenticated user's JWT (Supabase passes this automatically), queries their last N `training_sessions` + `competition_results` rows using the service role key server-side, builds a short prompt, calls OpenAI's chat completions endpoint, returns the text. No new table required for MVP — treat the insight as ephemeral (regenerate on click) rather than storing it, so this stays a half-day add, not a new feature surface.

Scope this **after** the core MVP (weeks 1–3) and the first stretch pick — it depends on having real logged data to be worth calling at all, and it's the one piece of the plan touching a paid third-party API, so it should be the last thing added, not the thing you get stuck on first.

## 5. Step-by-step: zero to running app

This is the literal sequence for Week 1, Days 1–7 — do these in order, each one should leave you with something visibly working before you move on. Everything past step 11 is just Section 3's Week 1 Day 3 onward.

**Step 1 — accounts (5 min).** Make sure you have: a GitHub account, a Supabase account (free tier), Node.js installed (`node -v` should print something ≥ 18), and VS Code with the Claude Code extension (Cmd/Ctrl+Shift+X → search "Claude Code" → Install; sign in with any Claude subscription — no separate API key needed for this part). Don't set up OpenAI yet — that's Section 4, last thing you build, not first.

**Step 2 — create the GitHub repo first.** On github.com: New repository → `karate-training-log` → do *not* initialize with a README (you'll push local code into it). Keep the empty repo URL handy.

**Step 3 — scaffold the app locally.**

```bash
npm create vite@latest karate-training-log -- --template react-ts
cd karate-training-log
npm install
npm run dev
```

Open the localhost URL it prints — you should see the default Vite/React starter page. That's your first checkpoint.

**Step 4 — install Tailwind (v4 — the plugin-based setup, not the old `init -p` config file method).**

```bash
npm install tailwindcss @tailwindcss/vite
```

In `vite.config.ts`, add the plugin:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

In `src/index.css`, replace the contents with:

```css
@import "tailwindcss";
```

Add a Tailwind class to something in `App.tsx` (e.g. `className="text-3xl font-bold"`), restart `npm run dev`, confirm it's actually styled — not just present in the JSX.

**Step 5 — connect git and push the scaffold.**

```bash
git init
git add -A
git commit -m "scaffold: vite + react + tailwind v4"
git branch -M main
git remote add origin https://github.com/<you>/karate-training-log.git
git push -u origin main
```

Refresh the GitHub page — files should be there. This is commit #1 of the "real commits over time" requirement.

**Step 6 — create the Supabase project.** In the Supabase dashboard: New Project → name it, set a DB password (save it somewhere — you won't see it again), pick a region, wait ~2 minutes for provisioning. Once it's up, go to Settings → API and copy the **Project URL** and the **anon public key**.

**Step 7 — wire up env vars.**

```bash
npm install @supabase/supabase-js
```

Create `.env.local` in the repo root:

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Check `.gitignore` already has `*.local` in it (Vite's default template includes this) — if not, add `.env.local` explicitly, *before* you commit anything else. Then create `src/lib/supabaseClient.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Step 8 — install the Supabase CLI and link the project.** Use `npx supabase <command>` if you don't want a global install, or `brew install supabase/tap/supabase` on Mac.

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref <your-ref>
```

The project ref is the subdomain in your Project URL from step 6.

**Step 9 — write and push the schema.**

```bash
npx supabase migration new init_schema
```

This creates an empty `.sql` file under `supabase/migrations/`. Paste in the full schema from Section 2.1 (tables + RLS policies), then:

```bash
npx supabase db push
```

Check the Supabase dashboard's Table Editor — all five tables should now exist. Manually insert one row into `sports` (name: "Karate", session_types: your list) to seed it — faster than scripting a seed for one row.

**Step 10 — build auth as your first real feature.** In Supabase: Authentication → Providers, confirm Email is enabled (it is by default). Build `useAuth.ts` and `Login.tsx` per the file structure in Section 2.2 — sign-up/sign-in calling `supabase.auth.signUp` / `signInWithPassword`, a session listener, and a protected route wrapper. Test it by signing up with your real email; confirm the user shows up under Authentication → Users in the dashboard. **This is the point where the app stops being a scaffold and starts being your app** — commit here.

**Step 11 — deploy a skeleton so there's a live URL from week one.** Push to GitHub (step 5 pattern), then on Vercel: Import Project → select the repo → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the project settings → Deploy. Confirm the live URL loads and login works against production, not just localhost.

**From here:** you're at Week 1, Day 5–7 in Section 3 — nav/layout shell, then straight into Week 2's CRUD forms. Point Claude Code at this file directly (drop it in the repo as `docs/build-plan.md`) so sessions work off the exact schema and sequence above instead of re-explaining scope each time.

**Env vars — two different trust levels, don't mix them up:** `.env.local` values (`VITE_` prefix) ship to the browser — fine for the Supabase URL/anon key, which are meant to be public. The OpenAI key from Section 4 is different — it goes in Supabase Edge Function secrets (`supabase secrets set OPENAI_API_KEY=sk-...`), never in a `VITE_` var, because that would put it in the public bundle.

## Non-negotiables (unchanged from original)

- Real GitHub repo, real commits over time.
- Running build log with actual reasoning.
- Be able to explain every function if someone points at it.
