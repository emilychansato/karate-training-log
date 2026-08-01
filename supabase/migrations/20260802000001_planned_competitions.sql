-- Lightweight "upcoming competition" entries, filled in manually for now
-- (see docs/future-ideas.md for the sports-data auto-sourcing research).
-- No scores yet - just enough to show on an Upcoming tab.
create table planned_competitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  event text not null,
  date date not null,
  location text,
  division text,
  discipline text check (discipline in ('kata', 'kumite')),
  notes text,
  created_at timestamptz default now()
);

alter table planned_competitions enable row level security;

create policy "planned_competitions_select" on planned_competitions
  for select using (auth.uid() = user_id);
create policy "planned_competitions_insert" on planned_competitions
  for insert with check (auth.uid() = user_id);
create policy "planned_competitions_update" on planned_competitions
  for update using (auth.uid() = user_id);
create policy "planned_competitions_delete" on planned_competitions
  for delete using (auth.uid() = user_id);
