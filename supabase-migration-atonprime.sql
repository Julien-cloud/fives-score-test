-- Migration ATON°PRIME : passes décisives, blessures et réglages partagés.
-- Idempotente : elle peut être exécutée plusieurs fois sans perdre de données.

alter table public.participations
  add column if not exists assists int not null default 0 check (assists >= 0);

alter table public.players
  add column if not exists injured boolean not null default false;

create table if not exists public.app_settings (
  id text primary key default 'global' check (id = 'global'),
  mystery_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, mystery_mode)
values ('global', false)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

grant select on public.app_settings to anon;
grant select, insert, update, delete on public.app_settings to authenticated;
grant select, insert, update, delete on public.app_settings to service_role;

drop policy if exists "lecture publique reglages" on public.app_settings;
create policy "lecture publique reglages" on public.app_settings
  for select using (true);

drop policy if exists "admin gere reglages" on public.app_settings;
create policy "admin gere reglages" on public.app_settings
  for all to authenticated
  using (lower(auth.jwt() ->> 'email') = any(array['juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com']))
  with check (lower(auth.jwt() ->> 'email') = any(array['juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com']));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_settings'
  ) then
    alter publication supabase_realtime add table public.app_settings;
  end if;
end $$;
