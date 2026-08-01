alter table training_sessions
  add column improved text[] default '{}',
  add column struggled text[] default '{}';
