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
