-- Adds ownership to techniques: null user_id = official seeded entry
-- (visible to everyone), set user_id = a user's private custom addition.
alter table techniques add column user_id uuid references auth.users(id);

alter table techniques enable row level security;

create policy "read official + own techniques" on techniques
  for select using (user_id is null or auth.uid() = user_id);

create policy "insert own techniques only" on techniques
  for insert with check (auth.uid() = user_id);

create policy "update own techniques only" on techniques
  for update using (auth.uid() = user_id);

create policy "delete own techniques only" on techniques
  for delete using (auth.uid() = user_id);
