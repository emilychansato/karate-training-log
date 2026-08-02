-- Optional profile info, deliberately NOT collected at sign-up (every
-- extra signup field costs conversions) - filled in later, here, if the
-- athlete wants to.
alter table profile_notes
  add column belt_rank text,
  add column club_name text,
  add column primary_discipline text check (primary_discipline in ('kata', 'kumite'));
