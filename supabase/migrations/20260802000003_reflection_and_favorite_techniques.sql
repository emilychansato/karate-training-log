-- Comprehensive competition logging: distinct reflection fields on the
-- competition (not blended into one "notes" blob) and a join table linking
-- matches to the techniques the athlete favored/leaned on in that match.

alter table competitions
  add column coach_notes text,
  add column what_went_well text,
  add column what_to_improve text,
  add column post_competition_feelings text,
  add column goals_for_next_time text;

create table match_techniques (
  match_id uuid references competition_matches(id) on delete cascade not null,
  technique_id uuid references techniques(id) not null,
  primary key (match_id, technique_id)
);

alter table match_techniques enable row level security;

create policy "match_techniques_select" on match_techniques
  for select using (
    match_id in (
      select cm.id from competition_matches cm
      join competitions c on c.id = cm.competition_id
      where c.user_id = auth.uid()
    )
  );
create policy "match_techniques_insert" on match_techniques
  for insert with check (
    match_id in (
      select cm.id from competition_matches cm
      join competitions c on c.id = cm.competition_id
      where c.user_id = auth.uid()
    )
  );
create policy "match_techniques_delete" on match_techniques
  for delete using (
    match_id in (
      select cm.id from competition_matches cm
      join competitions c on c.id = cm.competition_id
      where c.user_id = auth.uid()
    )
  );
