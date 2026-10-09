-- Autorise les rencontres planifiées sans score ni Homme du Match.
alter table public.matches drop constraint if exists matches_result_check;
alter table public.matches add constraint matches_result_check check (result in ('A','B','N','P'));
alter table public.matches alter column motm_id drop not null;

