-- FIVES LEAGUE — multi-ligues, saisons et suppression en cascade.

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 60),
  season text not null default concat(extract(year from current_date)::int, '-', extract(year from current_date)::int + 1),
  created_at timestamptz not null default now(),
  constraint leagues_season_consecutive_years check (season ~ '^[0-9]{4}-[0-9]{4}$' and substring(season from 1 for 4)::int + 1 = substring(season from 6 for 4)::int)
);

create table public.league_members (
  league_id uuid not null references public.leagues(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, player_id)
);

insert into public.leagues (name, season) values ('Fives Score', '2026-2027');
alter table public.matches add column league_id uuid references public.leagues(id) on delete cascade;
update public.matches set league_id = (select id from public.leagues where name = 'Fives Score') where league_id is null;
alter table public.matches alter column league_id set not null;
insert into public.league_members (league_id, player_id) select (select id from public.leagues where name = 'Fives Score'), id from public.players where active = true;

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
grant select on public.leagues, public.league_members to anon, authenticated;
grant insert, update, delete on public.leagues, public.league_members to authenticated;

create policy "lecture publique ligues" on public.leagues for select to anon, authenticated using (true);
create policy "admin gere ligues" on public.leagues for all to authenticated using ((select auth.jwt() ->> 'email') in ('juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com')) with check ((select auth.jwt() ->> 'email') in ('juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com'));
create policy "lecture publique membres de ligue" on public.league_members for select to anon, authenticated using (true);
create policy "admin gere membres de ligue" on public.league_members for all to authenticated using ((select auth.jwt() ->> 'email') in ('juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com')) with check ((select auth.jwt() ->> 'email') in ('juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com'));
