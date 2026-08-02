-- "Unfiltered" - private mood/reflection journal, distinct from and never
-- shown alongside training/competition data. Deliberately no AI-response
-- layer yet (explicitly deferred - see docs/future-ideas.md).
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  mood int check (mood between 1 and 5), -- 1 = rough, 5 = great
  emotions text[] default '{}', -- tag chips, e.g. 'anxious', 'proud'
  notes text,
  created_at timestamptz default now(),
  unique (user_id, date) -- one check-in per day; re-checking in updates it
);

alter table journal_entries enable row level security;

create policy "journal_entries_select" on journal_entries
  for select using (auth.uid() = user_id);
create policy "journal_entries_insert" on journal_entries
  for insert with check (auth.uid() = user_id);
create policy "journal_entries_update" on journal_entries
  for update using (auth.uid() = user_id);
create policy "journal_entries_delete" on journal_entries
  for delete using (auth.uid() = user_id);

-- "Why I do it" - a single persistent note per user, meant to be written
-- once (and revised occasionally) then re-read on low-motivation days,
-- not a dated log entry like the journal above.
create table profile_notes (
  user_id uuid primary key references auth.users(id),
  why_i_train text,
  updated_at timestamptz default now()
);

alter table profile_notes enable row level security;

create policy "profile_notes_select" on profile_notes
  for select using (auth.uid() = user_id);
create policy "profile_notes_insert" on profile_notes
  for insert with check (auth.uid() = user_id);
create policy "profile_notes_update" on profile_notes
  for update using (auth.uid() = user_id);

-- Weight log, relevant here specifically because kumite competition
-- divisions are weight-based (see competitionCategories.ts) - a simple
-- dated log, not tied to any single competition.
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  weight_kg numeric not null,
  created_at timestamptz default now()
);

alter table weight_logs enable row level security;

create policy "weight_logs_select" on weight_logs
  for select using (auth.uid() = user_id);
create policy "weight_logs_insert" on weight_logs
  for insert with check (auth.uid() = user_id);
create policy "weight_logs_delete" on weight_logs
  for delete using (auth.uid() = user_id);
