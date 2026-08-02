-- Structured goal-setting: Training Frequency, Weight, Competition Placement,
-- and Rank/Belt goals all live in one table since they share the same
-- lifecycle (active/achieved/abandoned, optional deadline) even though each
-- type's target is shaped differently. Progress for each is computed at
-- read time from existing data (training_sessions, weight_logs, rank_history)
-- rather than duplicated/stored here, so it never drifts out of sync.
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_type text not null check (goal_type in ('training_frequency', 'weight', 'competition_placement', 'rank')),
  title text not null,
  target_value numeric,
  target_text text,
  target_date date,
  competition_id uuid references competitions (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'achieved', 'abandoned')),
  created_at timestamptz not null default now(),
  achieved_at timestamptz
);

create index goals_user_status_idx on goals (user_id, status);

alter table goals enable row level security;

create policy "Users can view their own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on goals for delete
  using (auth.uid() = user_id);
