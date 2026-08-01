alter table competition_results
  add column my_yuko int default 0,
  add column my_waza_ari int default 0,
  add column my_ippon int default 0,
  add column opponent_yuko int default 0,
  add column opponent_waza_ari int default 0,
  add column opponent_ippon int default 0;

-- win_method broadened to cover real WKF outcomes (was a 5-value enum
-- comment only, not a DB constraint, so no migration needed for the
-- values themselves - documented here for the form's zod schema):
-- 'ippon' | 'waza-ari' | 'yuko' | 'hansoku' | 'kiken' | 'shikkaku' | 'hantei'
