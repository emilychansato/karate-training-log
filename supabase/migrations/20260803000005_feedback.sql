-- User feedback submissions (bug reports, feature requests, general
-- comments) sent from the header's feedback button. Write-only from the
-- app's perspective - users can see their own past submissions but there's
-- no UI for that yet, just insert.
create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  message text not null,
  created_at timestamptz default now()
);

alter table feedback enable row level security;

create policy "feedback_select" on feedback
  for select using (auth.uid() = user_id);
create policy "feedback_insert" on feedback
  for insert with check (auth.uid() = user_id);
