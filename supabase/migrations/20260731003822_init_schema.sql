-- Reference data: ships with one row (Karate). RLS = readable by any authenticated
-- user, writable by no one from the client (seed via migration/dashboard only).
create table sports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_types text[] not null default '{}',
  created_at timestamptz default now()
);

create table techniques (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid references sports(id) not null,
  name text not null,
  category text -- 'kata' | 'kumite_combo' | 'conditioning'
);

-- User data
create table training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  sport_id uuid references sports(id) not null,
  date date not null,
  type text not null, -- kata / kumite drills / conditioning / sparring
  duration_min int not null,
  self_rating int check (self_rating between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

create table session_techniques ( -- stretch feature: technique tagging
  session_id uuid references training_sessions(id) on delete cascade,
  technique_id uuid references techniques(id),
  primary key (session_id, technique_id)
);

create table competition_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  sport_id uuid references sports(id) not null,
  event text not null,
  date date not null,
  division text,
  placement text,
  discipline text check (discipline in ('kata','kumite')),
  -- kata only
  kata_technical_score numeric,
  kata_athletic_score numeric,
  -- kumite only
  points_for int,
  points_against int,
  win_method text, -- 'ippon' | 'waza-ari' | 'yuko' | 'decision' | '8-point-gap'
  opponent_name text,
  opponent_notes text,
  notes text,
  created_at timestamptz default now()
);

-- RLS: reference tables readable by any authenticated user, not writable from the client
alter table sports enable row level security;
create policy "sports readable by authenticated users" on sports
  for select using (auth.role() = 'authenticated');

alter table techniques enable row level security;
create policy "techniques readable by authenticated users" on techniques
  for select using (auth.role() = 'authenticated');

-- RLS: every user table locked to auth.uid()
alter table training_sessions enable row level security;

create policy "own sessions select" on training_sessions
  for select using (auth.uid() = user_id);
create policy "own sessions insert" on training_sessions
  for insert with check (auth.uid() = user_id);
create policy "own sessions update" on training_sessions
  for update using (auth.uid() = user_id);
create policy "own sessions delete" on training_sessions
  for delete using (auth.uid() = user_id);

alter table competition_results enable row level security;

create policy "own results select" on competition_results
  for select using (auth.uid() = user_id);
create policy "own results insert" on competition_results
  for insert with check (auth.uid() = user_id);
create policy "own results update" on competition_results
  for update using (auth.uid() = user_id);
create policy "own results delete" on competition_results
  for delete using (auth.uid() = user_id);

-- session_techniques: access follows the parent session's ownership
alter table session_techniques enable row level security;

create policy "own session_techniques select" on session_techniques
  for select using (
    exists (
      select 1 from training_sessions
      where training_sessions.id = session_techniques.session_id
      and training_sessions.user_id = auth.uid()
    )
  );
create policy "own session_techniques insert" on session_techniques
  for insert with check (
    exists (
      select 1 from training_sessions
      where training_sessions.id = session_techniques.session_id
      and training_sessions.user_id = auth.uid()
    )
  );
create policy "own session_techniques delete" on session_techniques
  for delete using (
    exists (
      select 1 from training_sessions
      where training_sessions.id = session_techniques.session_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- Dashboard aggregation view. security_invoker = true is required here --
-- without it, this view would silently leak every user's data to every
-- other user, since views don't inherit RLS from their base tables by default.
create view weekly_training_hours
  with (security_invoker = true) as
select user_id, date_trunc('week', date) as week, sum(duration_min) as total_minutes
from training_sessions
group by user_id, date_trunc('week', date);
