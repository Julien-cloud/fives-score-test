-- Droits explicites requis par la Data API Supabase à partir du 30 octobre 2026.
-- Cette migration est idempotente et ne modifie ni les données ni les politiques RLS.

grant select
on public.players,
   public.matches,
   public.participations,
   public.app_settings,
   public.leagues,
   public.league_members
to anon;

grant select, insert, update, delete
on public.players,
   public.matches,
   public.participations,
   public.app_settings,
   public.leagues,
   public.league_members
to authenticated;

grant select, insert, update, delete
on public.players,
   public.matches,
   public.participations,
   public.app_settings,
   public.leagues,
   public.league_members
to service_role;
