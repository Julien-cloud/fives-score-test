-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Autorise les deux nouveaux profils sans modifier les joueurs existants.
alter table public.players drop constraint if exists players_position_check;
alter table public.players add constraint players_position_check
  check (position in ('attaque','milieu','defense','gardien','polyvalent'));
