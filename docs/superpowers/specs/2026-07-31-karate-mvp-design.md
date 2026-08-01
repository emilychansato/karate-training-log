# Karate Training Log — MVP Design

Design spec for the "build the MVP in one prompt" pass, covering everything confirmed since `docs/build-plan.md` (Steps 1–9 already built: scaffold, Supabase, schema, RLS). This doc adds the decisions made in the follow-up interview — UI library, styling baseline, chart empty-state behavior, and the two seeded reference tables (kata, kumite techniques) — and reconciles them against the existing schema.

## Scope

Full MVP in one pass: auth (Step 10 onward) + CRUD for training sessions and competition results + dashboard with 3 charts. Matches `build-plan.md` Weeks 1–3. Stretch features (technique frequency chart, AI insight) and everything in `docs/future-ideas.md` are explicitly out of scope for this pass.

## UI library and styling

- **shadcn/ui** is adopted as the component library (Radix + Tailwind), not plain Tailwind components. Reference: `satnaing/shadcn-admin` (12.8k★, MIT) for the sidebar/route-shell pattern — read for structure, not copied wholesale.
- **Styling baseline: shadcn/ui defaults** (neutral grays, system font, no custom accent color). Real visual identity is deferred to a later Stitch-driven restyle phase — this pass prioritizes working functionality over visual polish.
- Form validation: `react-hook-form` + `zod`, used for `SessionForm` and `CompetitionForm`'s conditional kata/kumite fields (`.refine()` for "kata fields required only if discipline=kata" logic).
- Auth pattern: structurally informed by `jlumbroso/supabase-react-example` (Apache-2.0) for `useAuth.ts` and protected routes — not copy-pasted, written fresh against this app's schema.

### Auth implementation note (cross-checked against current Supabase docs, 2026-07-31)

`jlumbroso`'s repo hasn't been touched since 2022, so its structural pattern was cross-checked against Supabase's current JS client docs before relying on it:

- **Still valid, no drift:** `supabase.auth.onAuthStateChange(callback)` inside a `useEffect`, with `subscription.unsubscribe()` in the cleanup, is still the current recommended pattern for tracking session state in React. Event types (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`) are unchanged. `createClient(url, anonKey)` is unchanged (already matches this project's `supabaseClient.ts`).
- **One real API improvement since 2022:** use `getClaims()` rather than `getUser()` for the protected-route "is someone logged in" check. `getClaims()` verifies the JWT locally against cached public keys instead of hitting the Auth server on every call — a meaningful performance win for something that runs on every protected page load. `getSession()`/`getUser()` are not deprecated, but `getClaims()` is now the preferred method for this specific check.
- **Build `useAuth.ts` as:** the `onAuthStateChange` subscribe/unsubscribe skeleton from the `jlumbroso` pattern, but swap in `getClaims()` where the reference repo would have used `getUser()`.

## Dashboard chart behavior

Before any real data exists, all 3 dashboard charts (hours/week, self-rating trend, competition timeline) show a **"no data yet" empty state**, not sample/placeholder data. Rationale: placeholder data on a personal tracker risks being mistaken for real numbers, and "no data yet" is a truthful, simple state to design for.

## Reference tables (seeded, editable)

Both tables use the existing `techniques` table (`category: 'kata' | 'kumite_combo' | 'conditioning'`) — no schema change needed here, only seed data.

### Kata reference (`techniques` where `category = 'kata'`)

Seeded with **all 102 official WKF katas** (from `references/KATA NAME ORDER 2026 Karate 1.pdf`), not a dojo-specific subset — e.g. Anan, Anan Dai, Bassai, Bassai Dai, Bassai Sho, Heian Shodan–Godan, Gojushiho, Gojushiho Dai, Gojushiho Sho, Nijushiho, Sochin, Unsu, Wankan, Wanshu, ... through all 102. Full list lives in the seed migration, sourced directly from the PDF — not retyped here.

### Kumite techniques reference (`techniques` where `category = 'kumite_combo'`)

Hybrid approach: seeded with a starter set (global, visible to all users), and users can add their own custom entries on top that are **private to them** — requires a nullable `user_id` column on `techniques` (`null` = official seeded entry visible to everyone; set = that user's personal addition, visible only to them via RLS). This is a schema delta from the current `build-plan.md` §2.1 definition, which has no `user_id` on `techniques`:

```sql
alter table techniques add column user_id uuid references auth.users(id);

alter table techniques enable row level security;
create policy "read official + own" on techniques
  for select using (user_id is null or auth.uid() = user_id);
create policy "insert own only" on techniques
  for insert with check (auth.uid() = user_id);
```

Seed set:
- User's real dojo combos (5): Kizami tsuki→Gyaku tsuki; Kizami tsuki→Ura mawashi geri; Gyaku tsuki→Front leg mawashi geri; Double gyaku tsuki; Jodan gyaku tsuki→Chudan mawashi geri.
- Additional common WKF combos (5, from web research, sourced in `project_karate_build_status.md` memory): Kizami tsuki→Gyaku tsuki→Ura mawashi geri (rear leg); Gyaku tsuki (body)→Front leg mawashi geri jodan (sliding entry); Jodan age uke/Tate uke→Kizami mawashi geri→Chudan gyaku tsuki; Chudan mae geri+Gedan barai→Kizami tsuki/Tate tsuki; Kizami tsuki→Uraken yokomawashi uchi→Mae-ashi mawashi geri.
- Foundational singles (12): Kizami tsuki, Gyaku tsuki, Ura tsuki, Mae geri, Mawashi geri, Ura mawashi geri, Ushiro geri, Yoko geri, Age uke, Soto uke, Uchi uke, Gedan barai. (Explicitly excludes Oi tsuki and Uraken as standalone entries, per user direction.)

## Session logging

- **Self-rating: single 1-5 scale** per session (already matches `training_sessions.self_rating int check (between 1 and 5)` in the existing schema — no change needed). Not split into separate technique/intensity ratings.
- Session technique tagging (`session_techniques` join table) already exists in the schema and applies to both kata and kumite_combo categories.
- **Correction, for the record:** an external review of this doc claimed `duration_minutes`, `session_type`, and a notes field were missing from the schema. They're not — `training_sessions` already has `duration_min int not null`, `type text not null` (kata/kumite drills/conditioning/sparring), and `notes text` per `build-plan.md` §2.1. No schema change needed for any of these three.

## Technique portfolio (bookmark + nickname)

New feature, confirmed 2026-07-31: users can bookmark any technique from the library (official seeded kata/kumite entries, or their own custom additions) into a personal list, with a custom nickname — e.g. bookmark "Kizami tsuki → Gyaku tsuki" and nickname it "1-2". This is a separate concept from the private custom-technique-add flow above: bookmarking doesn't create a new technique, it labels an existing one for personal use. The full shared library stays intact underneath.

New join table:

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

`nickname` is nullable — bookmarking without a nickname just pins the technique to the user's personal list (e.g. "techniques I'm currently drilling"), same UX gap the external review's "technique aliases" suggestion was pointing at.

## Post-session "what improved / what struggled" checklist

Moved into scope 2026-07-31 (was previously logged as a future idea). Structured checkboxes on the session form, in addition to the existing free-text `notes` field — not replacing it. Two checkbox groups:

- **What improved:** Speed, Timing, Distance, Power, Accuracy, Strategy
- **What struggled:** Fatigue, Reaction time, Footwork, Confidence, Technique consistency

Both are optional multi-select (zero or more checked), stored as text arrays on `training_sessions`:

```sql
alter table training_sessions
  add column improved text[] default '{}',
  add column struggled text[] default '{}';
```

The checkbox label sets above are fixed (not user-editable) for this pass — a controlled vocabulary, not free tags, so the values stay queryable for future analytics (e.g. "which struggle tag correlates with lower self-ratings") without dealing with typo-variant free text.

## Competition scoring — schema delta required

The existing `competition_results` schema (see `build-plan.md` §2.1) has `kata_technical_score` / `kata_athletic_score` (kata) and `points_for` / `points_against` / `win_method` (kumite). The interview confirmed:

- **Kata: technical + athletic sub-scores** — already matches the existing schema exactly. No change needed.
- **Kumite: full point breakdown** — Yuko/Waza-ari/Ippon counts for *both* athletes, not just an aggregate `points_for`/`points_against`. This is more granular than the current schema and requires new columns, e.g.:

```sql
alter table competition_results
  add column my_yuko int default 0,
  add column my_waza_ari int default 0,
  add column my_ippon int default 0,
  add column opponent_yuko int default 0,
  add column opponent_waza_ari int default 0,
  add column opponent_ippon int default 0;
```

**Refinement:** keep `points_for`/`points_against` rather than dropping them, but compute them once at write time (e.g. a trigger, or set them in the same insert/update from the UI) rather than recalculating `yuko*1 + waza_ari*2 + ippon*3` on every analytics query. This keeps aggregate queries (average points scored per match, win rate when scoring first) cheap while the granular breakdown still exists for detail views.

`win_method` should also account for the real WKF disqualification/decision types confirmed via the rules PDF: `ippon` | `waza-ari` | `yuko` (point-gap win) | `hansoku` | `kiken` | `shikkaku` | `hantei` (judges' decision) — a broader enum than the plan's original 5 values.

## Out of scope for this pass

Everything in `docs/future-ideas.md`: kata video comparison + AI feedback, technique mastery levels/rep tracking, tournament prep mode, per-kata analytics pages, coach dashboard, opponent intelligence/fight scouting, splitting `techniques` into `kata_details`/`kumite_details`, karate journey timeline. None of these are touched in this build.

## Self-review notes

- Custom kumite technique visibility (private vs. shared) is resolved above — private to the adding user, via nullable `user_id` + RLS.
- No other placeholders, contradictions, or scope ambiguity found on review.
