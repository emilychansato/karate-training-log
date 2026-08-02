-- Tournament prep mode: once a competition is on the Upcoming timeline,
-- build a forward-looking prep plan for it - goals per discipline, and a
-- week-by-week checklist across the four standard prep phases (technique
-- building -> pressure rounds -> simulation matches -> taper). Distinct
-- from the after-the-fact reflection fields on `competitions`, which are
-- retrospective.

create table prep_goals (
  id uuid primary key default gen_random_uuid(),
  planned_competition_id uuid references planned_competitions(id) on delete cascade not null,
  discipline text check (discipline in ('kata', 'kumite')),
  goal text not null,
  created_at timestamptz default now()
);

create table prep_tasks (
  id uuid primary key default gen_random_uuid(),
  planned_competition_id uuid references planned_competitions(id) on delete cascade not null,
  phase text check (phase in ('technique_building', 'pressure_rounds', 'simulation_matches', 'taper')) not null,
  title text not null,
  done boolean default false not null,
  created_at timestamptz default now()
);

alter table prep_goals enable row level security;
alter table prep_tasks enable row level security;

create policy "prep_goals_select" on prep_goals
  for select using (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );
create policy "prep_goals_insert" on prep_goals
  for insert with check (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );
create policy "prep_goals_delete" on prep_goals
  for delete using (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );

create policy "prep_tasks_select" on prep_tasks
  for select using (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );
create policy "prep_tasks_insert" on prep_tasks
  for insert with check (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );
create policy "prep_tasks_update" on prep_tasks
  for update using (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );
create policy "prep_tasks_delete" on prep_tasks
  for delete using (
    planned_competition_id in (select id from planned_competitions where user_id = auth.uid())
  );
