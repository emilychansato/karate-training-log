-- Shared reference data ingested from wkf.net/calendar (like sports/
-- techniques' official rows) - not user-owned, readable by any
-- authenticated user, written only by the ingest Edge Function
-- (service role, bypasses RLS on write).
create table wkf_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_start date not null,
  date_end date,
  location text,
  category text,
  source_hash text not null unique, -- dedupe key: hash of name+date_start+location
  ingested_at timestamptz default now()
);

alter table wkf_events enable row level security;

create policy "wkf_events_readable" on wkf_events
  for select using (auth.role() = 'authenticated');
