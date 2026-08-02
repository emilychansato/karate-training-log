-- Optional location tagging for training sessions and competitions (both
-- optional, per Emily's explicit "obvi optional tho").
alter table training_sessions add column location text;
alter table competitions add column location text;

-- Snapshot of the rank held on the competition's date, auto-computed from
-- rank_history at creation time (not user-entered) - so a competition
-- fought at green belt still shows green belt even after later promotions.
alter table competitions add column rank_at_time text;

-- Quick win/loss/draw capture for a match, independent of score entry -
-- lets a match be logged in one tap ("Win") right after it happens, with
-- full detail (opponent, scores, notes, favorite techniques) added later
-- via the existing edit-in-place flow. Also the only outcome signal for
-- kata matches, which don't have points_for/points_against.
alter table competition_matches
  add column outcome text check (outcome in ('win', 'loss', 'draw'));
