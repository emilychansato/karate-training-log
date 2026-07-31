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

## Karate journey timeline

A narrative timeline separate from the raw data tables — key life milestones (e.g. "started
karate," "first medal," "made national team") alongside the stats, so the app tells the story of
the athlete's career, not just charts.
