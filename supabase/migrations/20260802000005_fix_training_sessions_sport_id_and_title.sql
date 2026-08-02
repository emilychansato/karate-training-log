-- training_sessions.sport_id has been NOT NULL since the original
-- multi-sport schema, but no insert path has ever set it (the app never
-- collects a sport - it's karate-only, and competitions/competition_matches
-- already dropped this same leftover column). Every session save has been
-- silently failing on this constraint ever since; SessionForm never
-- surfaced the resulting error to the user, so it just looked like nothing
-- happened. Dropping it to match the precedent already set on competitions.
alter table training_sessions drop column sport_id;

-- Lets a session be given a short nickname (e.g. "Brutal sparring night")
-- so past sessions are recognizable in the list instead of only showing
-- type + date.
alter table training_sessions add column title text;
