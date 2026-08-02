-- Karate BC publishes their events calendar as a public Google Calendar
-- (confirmed 2026-08-02: the "grid view" page on karatebc.org just embeds
-- calendar.google.com, which exposes a public iCal feed with no auth
-- needed). This table mirrors wkf_events' shape/RLS but adds a `kind`
-- column since this feed mixes real competitions (Championships,
-- Tournaments, Zone Qualifiers) with non-competitive events (seminars,
-- coaching courses, team training) - the two need to read differently in
-- the Upcoming timeline.
create table kbc_events (
  id uuid primary key default gen_random_uuid(),
  uid text not null unique, -- Google Calendar's own event UID, stable dedupe key
  name text not null,
  date_start date not null,
  date_end date,
  location text,
  description text,
  kind text not null check (kind in ('competition', 'event')),
  ingested_at timestamptz default now()
);

alter table kbc_events enable row level security;

create policy "kbc_events_readable" on kbc_events
  for select using (auth.role() = 'authenticated');

-- planned_competitions gains the same kind distinction (a user can plan to
-- attend a seminar, not just a competition), and a source pointer back to
-- whichever calendar row it was added from. The source pointer is what the
-- Upcoming timeline uses to know a raw calendar event has already been
-- added, instead of the ephemeral component-local state that caused the
-- "still says Add after adding" bug.
alter table planned_competitions
  add column kind text not null default 'competition' check (kind in ('competition', 'event')),
  add column source_type text check (source_type in ('wkf', 'kbc')),
  add column source_id text;

-- A user can only add the same calendar event once (partial index: manual
-- entries with no source are unconstrained).
create unique index planned_competitions_source_unique
  on planned_competitions (user_id, source_type, source_id)
  where source_type is not null;
