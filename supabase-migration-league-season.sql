-- FIVES LEAGUE — saison obligatoire pour chaque ligue
-- À exécuter après la migration qui crée public.leagues.

update public.leagues
set season = concat(extract(year from current_date)::int, '-', extract(year from current_date)::int + 1)
where season is null or season !~ '^[0-9]{4}-[0-9]{4}$';

alter table public.leagues
  alter column season set default concat(extract(year from current_date)::int, '-', extract(year from current_date)::int + 1),
  alter column season set not null;

alter table public.leagues
  add constraint leagues_season_consecutive_years
  check (
    season ~ '^[0-9]{4}-[0-9]{4}$'
    and substring(season from 1 for 4)::int + 1 = substring(season from 6 for 4)::int
  );
