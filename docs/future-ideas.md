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

## Post-session "what improved / what struggled" checklists

Structured checkboxes after each session (speed, timing, distance, power, accuracy, strategy /
fatigue, reaction time, footwork, confidence, technique consistency) instead of just a free-text
notes field. Over time this could surface real patterns (e.g. "scoring rate drops after minute 2
of kumite rounds") that a single 1-5 rating can't show.

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
