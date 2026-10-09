-- Heure locale facultative du coup d'envoi pour les matchs programmés.
-- La colonne est nullable afin de préserver tous les matchs existants.
alter table public.matches
  add column if not exists kickoff_time time without time zone;
