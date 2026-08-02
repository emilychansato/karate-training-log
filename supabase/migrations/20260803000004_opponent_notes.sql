-- Lightweight opponent scouting notes, keyed by opponent name (matches
-- don't have a real opponent_id/opponents table yet - see the "Opponent
-- intelligence" idea in docs/future-ideas.md for the fuller version).
-- One free-text note per user per opponent name.
create table opponent_notes (
  user_id uuid references auth.users(id) not null,
  opponent_name text not null,
  notes text,
  updated_at timestamptz default now(),
  primary key (user_id, opponent_name)
);

alter table opponent_notes enable row level security;

create policy "opponent_notes_select" on opponent_notes
  for select using (auth.uid() = user_id);
create policy "opponent_notes_insert" on opponent_notes
  for insert with check (auth.uid() = user_id);
create policy "opponent_notes_update" on opponent_notes
  for update using (auth.uid() = user_id);
