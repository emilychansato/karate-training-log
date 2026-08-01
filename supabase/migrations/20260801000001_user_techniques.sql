create table user_techniques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  technique_id uuid references techniques(id) not null,
  nickname text,
  created_at timestamptz default now(),
  unique (user_id, technique_id)
);

alter table user_techniques enable row level security;

create policy "own bookmarks only" on user_techniques
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
