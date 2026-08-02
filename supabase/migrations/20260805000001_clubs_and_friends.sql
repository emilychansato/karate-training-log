-- Clubs + 1:1 friends. Usernames live in their own small table (not on
-- profile_notes) so search can safely be readable by every signed-in user
-- without exposing profile_notes' private fields (why_i_train etc).

create table usernames (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table usernames enable row level security;

create policy "Any signed-in user can search usernames"
  on usernames for select
  to authenticated
  using (true);

create policy "Users can set their own username"
  on usernames for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own username"
  on usernames for update
  using (auth.uid() = user_id);

-- Friends: independent of clubs - two people can connect without ever
-- sharing a club. A single row per pair, requester -> recipient, with a
-- status that flips to 'accepted' once the recipient responds.
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  constraint friendships_no_self check (requester_id <> recipient_id),
  constraint friendships_unique_pair unique (requester_id, recipient_id)
);

alter table friendships enable row level security;

create policy "Users can view friendships they're part of"
  on friendships for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Users can send friend requests"
  on friendships for insert
  with check (auth.uid() = requester_id);

create policy "Recipients can accept a friend request"
  on friendships for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create policy "Either side can remove a friendship"
  on friendships for delete
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- Clubs: any signed-in user can create one and see the roster of clubs
-- they belong to. Club existence/name is discoverable by all signed-in
-- users (for search-to-join); membership rows are only visible to
-- members of that same club.
create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table clubs enable row level security;

create policy "Any signed-in user can browse clubs"
  on clubs for select
  to authenticated
  using (true);

create policy "Any signed-in user can create a club"
  on clubs for insert
  with check (auth.uid() = created_by);

create table club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (club_id, user_id)
);

alter table club_members enable row level security;

-- A select policy on club_members that queries club_members itself would
-- recurse (Postgres re-applies the policy to the inner query). A
-- security definer function runs with the privileges of its owner,
-- bypassing RLS internally, so the membership check doesn't loop.
create function is_club_member(target_club_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from club_members
    where club_id = target_club_id and user_id = target_user_id
  );
$$;

create policy "Members can view the roster of their own clubs"
  on club_members for select
  using (
    user_id = auth.uid()
    or is_club_member(club_id, auth.uid())
  );

create policy "Users can join a club themselves"
  on club_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave a club themselves"
  on club_members for delete
  using (auth.uid() = user_id);
