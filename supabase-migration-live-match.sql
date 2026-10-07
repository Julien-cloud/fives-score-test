-- Mode match : mémorise l'instant du coup d'envoi pour restaurer le chrono après un rechargement.
alter table public.matches
  add column if not exists live_started_at timestamptz null;
