-- Composer is private by default. Administrators can opt in to visitor access.
alter table public.app_settings
  add column if not exists composer_for_visitors boolean not null default false;

update public.app_settings
  set composer_for_visitors = false
  where id = 'global' and composer_for_visitors is null;
