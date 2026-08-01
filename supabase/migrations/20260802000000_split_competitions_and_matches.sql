-- A single competition (event) can have multiple matches - kumite brackets
-- especially can run 3-5 matches against different opponents. The old
-- competition_results table conflated "the event" and "one match" into a
-- single row, which only worked for a single-match event. Split into a
-- top-level competitions table (event/date/division/discipline/placement/
-- notes) and a competition_matches table underneath it (per-opponent
-- kumite breakdown, or per-round kata scores).

create table competitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  event text not null,
  date date not null,
  division text,
  discipline text check (discipline in ('kata', 'kumite')) not null,
  placement text,
  notes text,
  created_at timestamptz default now()
);

create table competition_matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade not null,
  round_label text,
  opponent_name text,
  kata_technical_score numeric,
  kata_athletic_score numeric,
  my_yuko int default 0,
  my_waza_ari int default 0,
  my_ippon int default 0,
  opponent_yuko int default 0,
  opponent_waza_ari int default 0,
  opponent_ippon int default 0,
  points_for int,
  points_against int,
  win_method text,
  notes text,
  created_at timestamptz default now()
);

alter table competitions enable row level security;
alter table competition_matches enable row level security;

create policy "competitions_select" on competitions
  for select using (auth.uid() = user_id);
create policy "competitions_insert" on competitions
  for insert with check (auth.uid() = user_id);
create policy "competitions_update" on competitions
  for update using (auth.uid() = user_id);
create policy "competitions_delete" on competitions
  for delete using (auth.uid() = user_id);

create policy "competition_matches_select" on competition_matches
  for select using (
    competition_id in (select id from competitions where user_id = auth.uid())
  );
create policy "competition_matches_insert" on competition_matches
  for insert with check (
    competition_id in (select id from competitions where user_id = auth.uid())
  );
create policy "competition_matches_update" on competition_matches
  for update using (
    competition_id in (select id from competitions where user_id = auth.uid())
  );
create policy "competition_matches_delete" on competition_matches
  for delete using (
    competition_id in (select id from competitions where user_id = auth.uid())
  );

-- Carry forward existing data: every old competition_results row becomes
-- one competition with exactly one match (the shape it was already in).
do $$
declare
  r record;
  new_competition_id uuid;
begin
  for r in select * from competition_results loop
    insert into competitions (user_id, event, date, division, discipline, placement, notes, created_at)
    values (r.user_id, r.event, r.date, r.division, r.discipline, r.placement, r.notes, r.created_at)
    returning id into new_competition_id;

    insert into competition_matches (
      competition_id, opponent_name, kata_technical_score, kata_athletic_score,
      my_yuko, my_waza_ari, my_ippon, opponent_yuko, opponent_waza_ari, opponent_ippon,
      points_for, points_against, win_method, created_at
    )
    values (
      new_competition_id, r.opponent_name, r.kata_technical_score, r.kata_athletic_score,
      r.my_yuko, r.my_waza_ari, r.my_ippon, r.opponent_yuko, r.opponent_waza_ari, r.opponent_ippon,
      r.points_for, r.points_against, r.win_method, r.created_at
    );
  end loop;
end $$;

drop table competition_results;
