-- FIVES LEAGUE — suppression complète d'une ligue
-- Les participations sont déjà supprimées avec leurs matchs.

alter table public.matches drop constraint matches_league_id_fkey;

alter table public.matches
  add constraint matches_league_id_fkey
  foreign key (league_id)
  references public.leagues(id)
  on delete cascade;
