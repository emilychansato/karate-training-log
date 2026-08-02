-- Adds pinpoint coordinates alongside the existing text `location` column,
-- so a location can be a map pin (lat/lng) as well as free text - both
-- optional, same as the location field itself.
alter table training_sessions add column latitude double precision;
alter table training_sessions add column longitude double precision;
alter table competitions add column latitude double precision;
alter table competitions add column longitude double precision;
