-- Photo attachments for training sessions, competitions, and journal (diary)
-- entries. One private Storage bucket ("entry-photos") shared across all
-- three entry types, with a `photos` table tracking which entry each photo
-- belongs to (a session/competition/entry can have several photos - a
-- single storage-path column wouldn't support that).
--
-- Files are stored at `{user_id}/{entry_type}/{entry_id}/{filename}` so the
-- RLS policies below can restrict access using just the path, without a
-- join back to the photos table.

insert into storage.buckets (id, name, public)
values ('entry-photos', 'entry-photos', false)
on conflict (id) do nothing;

create policy "Users can upload their own entry photos"
  on storage.objects for insert
  with check (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own entry photos"
  on storage.objects for select
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own entry photos"
  on storage.objects for delete
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_type text not null check (entry_type in ('training_session', 'competition', 'journal_entry')),
  entry_id uuid not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index photos_entry_idx on photos (entry_type, entry_id);

alter table photos enable row level security;

create policy "Users can view their own photos"
  on photos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own photos"
  on photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own photos"
  on photos for delete
  using (auth.uid() = user_id);
