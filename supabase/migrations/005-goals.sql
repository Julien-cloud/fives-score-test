-- À exécuter une seule fois dans Supabase > SQL Editor sur la base existante.
-- La commande conserve toutes les participations et initialise les buts à zéro.
alter table public.participations
  add column if not exists goals int not null default 0 check (goals >= 0);
