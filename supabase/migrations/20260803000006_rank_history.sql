-- Rank/belt progression tracking. Deliberately NOT a per-style requirement
-- checklist (every martial-arts app researched has one, but building that
-- honestly would need real requirement data per style/federation we don't
-- have - the Karate Canada Dan grading PDFs on the Resources page are the
-- closest real source, and they're documents, not structured data). This
-- is the honest v1: a dated history of ranks achieved, which is real and
-- immediately useful without fabricating requirement lists.
create table rank_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  style text not null,
  rank text not null,
  achieved_date date not null,
  notes text,
  created_at timestamptz default now()
);

alter table rank_history enable row level security;

create policy "rank_history_select" on rank_history
  for select using (auth.uid() = user_id);
create policy "rank_history_insert" on rank_history
  for insert with check (auth.uid() = user_id);
create policy "rank_history_delete" on rank_history
  for delete using (auth.uid() = user_id);
