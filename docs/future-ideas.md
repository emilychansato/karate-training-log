# Future Ideas (not scoped, not scheduled)

Ideas captured for later — not part of the current build-plan.md timeline. Revisit after MVP (weeks 1-3) and after evaluating against real usage.

## Kata video comparison + AI feedback

Record your own kata on camera, then compare it side-by-side against a reference video —
either a pasted YouTube link or a video you upload yourself — of the same kata. AI assists by
analyzing the two side by side and giving feedback: timing differences, stance/technique gaps,
areas where your performance diverges from the reference.

Rough shape (unscoped, needs real design later):
- Video capture/upload in-browser (or mobile camera).
- A reference video source — either a YouTube embed or an uploaded file.
- Side-by-side playback, probably synced.
- AI analysis layer — likely computer vision / pose estimation (not just an LLM reading text,
  since this is comparing physical movement), which is a meaningfully different and heavier
  build than the OpenAI text-insight stretch feature in build-plan.md Section 4.
- Related prior art found during GitHub research: aud10pilot/kata-analysis (Python/Flask +
  MediaPipe pose-detection on kata video) — different stack than this app (React/TS), but
  worth a look for how pose-comparison is approached if this gets built out.

Not scoped for effort, storage cost (video is expensive to store/serve), or which AI/CV
approach to use. Bigger lift than anything currently in build-plan.md — treat as a distinct
future project phase, not a stretch pick to slot into Week 4.

## Technique mastery levels + rep tracking

Turn each technique/kata from a plain list into a "profile": mastery level (practicing /
developing / competition-ready), total reps trained, sessions trained, last-trained date,
self-rated success score, competition usage count, and a chronological timeline of session
notes tied to that specific technique. Makes the technique library something worth filling
out, not just a tag list.

## Tournament prep mode

A structured countdown view tied to an upcoming competition: goals per discipline (e.g. target
kata score, kumite tactical goals), broken into a week-by-week plan (technique building →
pressure rounds → simulation matches → taper). Distinct from just logging a competition result
after the fact — this would be forward-looking prep, not a retrospective log.

## Per-kata analytics pages

A dedicated page per kata (not just a name in a dropdown): difficulty rating, key concepts/focus
areas, personal best/average competition score, common deduction categories, and eventually
attached training clips. Builds on the 102-kata reference table already seeded.

## Coach dashboard / multi-athlete view

A separate view for a coach account to see multiple athletes' training consistency, weak areas,
and competition-readiness at a glance. Implies real auth/permissions work (coach-to-athlete
relationships, not just per-user RLS) — a genuinely different feature, not a UI tweak.

## Split techniques into kata_details / kumite_details tables

Currently `techniques` is one table for kata, kumite combos, and conditioning, distinguished only
by a `category` text column. If kata-specific fields (WKF rank/style, difficulty) or kumite-specific
fields (attack type, stance, distance, counter relationships) are ever needed, split into
`kata_details` / `kumite_details` tables keyed off `technique_id` rather than adding a growing set of
nullable columns to one table. Not needed for MVP — the flat `techniques` table is sufficient for
name + category + tagging.

## Opponent intelligence / fight scouting

Digitize competitive scouting: a per-opponent profile with head-to-head record, match history
(result, score breakdown, notes, optional video link), known techniques with a personal threat
rating, and free-text strengths/weaknesses/strategy notes. A "prepare for opponent" view before a
tournament would summarize head-to-head record, the opponent's primary attacks, and what's worked
against them before — a pre-fight briefing rather than a raw log.

This is a meaningfully different feature from anything else in this list — it's about the
*opponent*, not the athlete's own training/competition history — and privacy matters here more
than elsewhere (scouting notes are private-by-default, never a social/shared feature).

Rough schema shape (not final, sketched so future work has somewhere to attach rather than
retrofitting):

```sql
create table opponents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  country text,
  club text,
  division text,
  notes text
);

create table opponent_matches (
  id uuid primary key default gen_random_uuid(),
  opponent_id uuid references opponents(id) not null,
  competition_result_id uuid references competition_results(id), -- link to the real result row, don't duplicate score data
  video_url text,
  notes text
);

create table opponent_techniques (
  opponent_id uuid references opponents(id) not null,
  technique_id uuid references techniques(id) not null,
  threat_rating int check (threat_rating between 1 and 5),
  notes text,
  primary key (opponent_id, technique_id)
);
```

Note: `competition_results` already has `opponent_name`/`opponent_notes` text fields per
build-plan.md — this feature would eventually replace those free-text fields with a proper
`opponent_id` foreign key once an `opponents` table exists, rather than duplicating the concept.

## Karate journey timeline

A narrative timeline separate from the raw data tables — key life milestones (e.g. "started
karate," "first medal," "made national team") alongside the stats, so the app tells the story of
the athlete's career, not just charts.

## Training Log / Competitions layout redesign (flagged 2026-08-02)

Emily's words: it "looks so ugly" and "very Google Calendar-like," and filtering through a flat
list "no one wants to go through." Not fixed in this session (the search/filter bar added
2026-08-02 is a stopgap, not the real answer) — the actual fix is a different layout concept
entirely, not more filters bolted onto a list. Worth a proper design pass referencing whatever
visual inspiration Emily brings next, rather than guessing at a new layout here.

## Competition timeline (past/upcoming) + per-competition memory

Split `/competitions` into past and upcoming, presented as a timeline rather than a flat list.
For **past** competitions specifically:
- A coach's notes field (`competition_results.coach_notes text` — separate from the athlete's own
  `notes` column, since it's a different author/voice).
- Photo attachments per competition, framed as a "visual memory vlog," not just a data log.
  Needs Supabase Storage (a bucket + `competition_photos` table: `id`, `competition_result_id`,
  `storage_path`, `caption`, `created_at`, RLS scoped through the parent competition's `user_id`
  same as every other table here).

For **upcoming** competitions: this requires competitions to exist as rows *before* a result is
logged (today `competition_results` only exists post-hoc, one row per finished result). Likely
needs a lighter-weight `planned_competitions` table (event name, date, division, discipline —
no scores yet) that a real result can later attach to or convert from.

### Future memory (explicitly not to build yet, just remember): AI highlight reel / collage maker

Once photos/videos are attached to competitions (above), a later feature: feed a competition's
photo/video dump into an AI video editor or a Retro-style collage maker to auto-produce
highlight reels and collages. This depends entirely on the photo/video attachment feature
landing first, and is a heavy build (media processing, storage cost, likely a third-party
video-gen API) — explicitly parked, not scoped, per Emily's request to just note it for later.

## Connecting Competitions to real sport/tournament data (question asked 2026-08-02, answered inline, logged here for reference)

Emily asked how this would work. Short answer: there's no single "give me all karate
tournaments" API — WKF and most national federations don't publish open calendars as
structured data. Realistic paths, roughly in order of effort:
1. **Manual entry** (simplest, ships now): the `planned_competitions` table above, filled in by
   the athlete/coach by hand. Not "connected to sport data" but unblocks the upcoming-competitions
   UI immediately without any external dependency.
2. **Scrape a specific federation's public calendar page** (e.g. a national federation site or
   WKF's event listing) — fragile (breaks when their HTML changes), and scraping ToS should be
   checked per-site before building this.
3. **A real sports-data API** if one exists for karate specifically (most sports-data APIs
   Emily may have heard of — e.g. those covering football/basketball/tennis — do not cover
   karate; this would need active research to find a legitimate karate-specific or
   multi-martial-arts events API, and likely a paid tier).
Recommendation when this gets picked up: build (1) first since it's real, ships fast, and needs
no external dependency; treat (2)/(3) as a later enhancement layered on top of the same table
rather than a blocker.

**Update 2026-08-02** — Emily found a real, concrete source:
`sportdata.org/karate/set-online/eventnews_main.php?active_menu=eventnews`. This is
sportdata.org's karate event-management platform, which many national federations actually use
to run their tournament registration, so this is a genuinely promising lead, better than a
generic "does an API exist" guess. Checked it: the page sits behind active bot-verification
(a Cloudflare-style "verifying you are not a robot" challenge), so a plain fetch can't see the
actual event list or find the country-filter mechanism (dropdown vs URL query param — unknown
from here). Two implications for whoever picks this up: (a) it needs a real browser (headed or
headless) to get past the challenge and inspect the actual filter UI/URL structure, not a script
fetch; (b) if it does turn out to be scrapable, it's more fragile than a typical static page
scrape specifically because of that bot protection — sessions/cookies from the challenge may
need to be carried through. Worth a manual look (open it in an actual browser, use devtools to
watch the network request when picking a country) before writing any scraping code.

**Update 2026-08-02 — approach comparison (Emily asked how other sites do this):**
Four real patterns exist: (1) official API/feed — doesn't exist for karate; (2) scrape one
known site (sportdata.org, a federation page) — brittle, and sportdata.org specifically is
behind Cloudflare bot-check, raising this from "simple script" to "needs a headless browser
that can pass the challenge"; (3) manual/crowdsourced entry — what `planned_competitions`
already is; (4) an AI-driven loop — periodic search-API calls (e.g. "karate tournaments Canada
2026") feeding results to an LLM to extract structured fields. Important nuance on (4): it does
NOT avoid scraping — the LLM still has to read the same underlying pages the search turns up,
it just automates *which* pages to look at instead of hardcoding one source. Real tradeoffs:
per-run cost (search API + LLM calls, unlike a free-after-built fixed scraper), hallucination
risk (a wrong date/misread page — needs a human review/approval queue before anything
auto-publishes, never blind auto-insert), and it needs a scheduled-job runner this app doesn't
have yet (Supabase Edge Functions + `pg_cron`, or a scheduled GitHub Actions workflow, writing
into `planned_competitions`). Upside of (4) over (2): generalizes to "any country" without
hand-coding each federation's HTML, which matches the actual want (broad/country-filterable
coverage) better than one hardcoded source would. Recommendation when this is picked up: (3)
ships immediately with zero dependency (already being built 2026-08-02); if/when auto-sourcing
gets built, lean toward (4) over (2) for coverage, gated behind a review queue.

**Update 2026-08-02 — built, real, working:** WKF's own calendar (wkf.net/calendar) turned
out to be plain server-rendered HTML with no bot protection (unlike sportdata.org) - the
"Next Events" carousel on that page is a clean repeated block with name/location/date-range/
category per event. Built a real ingestion pipeline:
- `supabase/functions/ingest-wkf-events/index.ts` - a Deno Edge Function that fetches the
  calendar page, regex-parses the carousel (verified against the real downloaded HTML before
  deploying), and upserts into a new `wkf_events` table (shared reference data, dedup'd via a
  `source_hash` of name+date+location, same RLS pattern as `sports`/official `techniques` rows
  — readable by any authenticated user).
- `useWkfEvents` hook: loads events, and a `syncNow()` that invokes the Edge Function on demand.
- Competitions page → Upcoming tab: shows the synced WKF events with a "Sync now" button and a
  per-event "Add" button that copies it into the user's own `planned_competitions` (no filter
  UI, per instruction — just the raw list).

**Still open — weekly auto-sync (`pg_cron`):** wiring the Edge Function to run automatically
every week needs a scheduled Postgres job that calls the function's HTTPS endpoint with an
auth header. That auth value is a secret and must never go into a committed migration file.
Safe path when this gets picked up: enable the `pg_cron` and `pg_net` extensions, store the
service-role key (or a dedicated function-invoke secret) in Supabase Vault via the dashboard
SQL editor (a one-off manual step, not a migration), then schedule
`select cron.schedule('wkf-weekly-sync', '0 6 * * 1', $$ select net.http_post(...) $$)`
referencing the vaulted secret via `vault.decrypted_secrets` rather than a literal key in the
SQL. Until this is set up, "Sync now" in the UI is the real, working way to refresh the list.

## Technique detail page (video + notes + kata competition-order planner)

Two related asks bundled into "click into a technique":

**Detail view**: clicking a technique (from the `/techniques` catalog) opens a page with an
embedded reference video (YouTube — needs a `video_url` column on `techniques`, official rows
would need this populated as a data task, not just a schema change), basic info (name, category,
WKF grouping if applicable), and a personal notes field scoped to *that user's bookmark*
(`user_techniques.notes text` — separate from the existing `nickname` column).

**Kata competition-order planner**: WKF kata competitions are elimination rounds — you perform
one kata per round, advance if you win, and typically can't repeat the same kata twice in one
tournament, so competitors pre-plan an ordered list of katas by round (1st round, 2nd round,
final, etc.), sometimes with a backup depending on the draw. This is a genuinely different
feature from a bookmark list — it's a per-competition (or per-season "go-to rotation") ordered
plan, not a property of the technique itself. Rough shape: a `kata_plans` table (`id`, `user_id`,
name e.g. "Nationals 2026 rotation", optionally `competition_id` if tied to a specific planned
competition) plus `kata_plan_entries` (`plan_id`, `round_label` e.g. "Round 1"/"Semifinal"/"Final",
`technique_id`, `position`). Depends on `techniques` already existing (it does) and optionally on
the planned-competitions table above if tying a plan to a specific upcoming event.

## Records page drill-down (flagged 2026-08-02, needs clarification before scoping)

Emily wants Personal Records, Opponent History, and Division Progression to each be clickable
into more detail. Before this can be scoped properly, need to know *what* "more detail" means
per section, since it's genuinely different data in each case:
- **Personal records** — the four stat tiles (win streak, best match points, best kata score,
  total competitions) are already single numbers; there's nothing "under" a number except the
  competitions that produced it. Likely: clicking "win streak" shows the actual streak of
  competitions that made it up.
- **Opponent history** — already has real per-opponent rows; "diving in" naturally means a
  per-opponent detail page: full match history against that one opponent, not just the
  aggregate W/L/D + averages currently shown.
- **Division progression** — already a chronological list; diving in could mean grouping
  by division (show every competition within one division together) rather than one flat
  timeline.
Ask Emily which of these (or something else) she actually means before building — don't guess
three different interaction patterns and build the wrong one.

## Mental health / reflection journal ("mental diary" — name TBD, brainstorm better ones)

A private, separate section for free-form reflection — nervousness before a competition, how
training is affecting mood, general thoughts — distinct from the factual training/competition
logs. Emily's own framing: "spit out your thoughts," not a structured form. Name candidates to
revisit with her: "Headspace" (taken by an app), "Mindset Log," "Athlete Journal," "Clarity,"
"The Locker Room" (private/personal connotation), or just "Journal."

Rough shape: a `journal_entries` table (`id`, `user_id`, `date`/`created_at`, `mood` — maybe a
simple 1-5 or emoji-scale rather than a required field, `entry text`, optionally
`linked_session_id`/`linked_competition_id` if she ever wants an entry tied to a specific
event). RLS identical to every other table here (`user_id = auth.uid()`), and this one
especially should never be a shared/social feature — treat as more private than training data,
not less.

**Explicitly future (per Emily, not this phase):** an AI layer that reads entries and responds
with comfort/advice, referencing apps like Daimon for tone. This depends on the journal existing
first, and raises real product questions before it's just "add an LLM call" — how much should
it initiate vs. only respond, what tone avoids sounding clinical/hollow, and whether responses
should ever reference patterns across entries (which raises different privacy stakes than a
one-off reply). Worth a dedicated design conversation when the journal itself is built, not
bolted on as an afterthought.

## Comprehensive competition logging (flagged 2026-08-02)

Current `competition_results` covers the factual/scoring side well (event, date, division,
discipline, full kumite point breakdown, kata sub-scores, placement, opponent name, one free
`notes` field) but Emily wants the *reflective* side to be real, not an afterthought — matching
how seriously the app already treats the data side. Concretely, she wants separate places for:
- **Coach's notes** — already logged above under the competition-timeline idea
  (`coach_notes text`), different author/voice than the athlete's own reflection.
- **What went well / what to improve** — two distinct fields, not one blended `notes` blob,
  since they serve different re-read purposes (reinforcing vs. correcting).
- **How you felt afterwards** — the emotional read on the result, separate from the technical
  self-assessment above (a bad technical performance and a good emotional recovery from a loss
  are both worth capturing, and conflating them loses information).
- **Note to future self** — explicitly forward-looking, meant to be re-read before the *next*
  competition, not a retrospective field.
Rough shape: extend `competition_results` with `coach_notes text`, `what_went_well text`,
`what_to_improve text`, `post_competition_feelings text`, `note_to_future_self text` — all
nullable, all optional at submit time (a quick log right after a match shouldn't force five
essay fields before it saves). The existing `CompetitionForm`/`Competitions` page would need a
genuinely different layout to hold this much reflective content without becoming a wall of
textareas — likely a expandable "reflection" section separate from the score-entry section,
matching how this session already separated AKA/AO score columns from everything else.
