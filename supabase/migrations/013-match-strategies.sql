-- Propositions tactiques pour les matchs à venir.
create table public.match_strategies (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  strategist_id uuid not null references public.players(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  title text not null default 'Proposition tactique' check (char_length(title) between 1 and 80),
  formation jsonb not null default '{}'::jsonb,
  note text not null default '' check (char_length(note) <= 600),
  created_at timestamptz not null default now()
);

create index match_strategies_match_team_created_idx
  on public.match_strategies (match_id, team, created_at desc);

alter table public.match_strategies enable row level security;

grant select, insert on public.match_strategies to anon;
grant select, insert, update, delete on public.match_strategies to authenticated;
grant select, insert, update, delete on public.match_strategies to service_role;

create policy "lecture publique strategies de match"
  on public.match_strategies for select to anon, authenticated
  using (true);

create policy "proposition liee a un participant"
  on public.match_strategies for insert to anon, authenticated
  with check (
    exists (
      select 1
      from public.participations participation
      join public.matches game on game.id = participation.match_id
      where participation.match_id = match_strategies.match_id
        and participation.player_id = match_strategies.strategist_id
        and participation.team = match_strategies.team
        and game.result = 'P'
    )
  );

create policy "admin gere strategies de match"
  on public.match_strategies for all to authenticated
  using ((select lower(auth.jwt() ->> 'email')) in ('juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com'))
  with check ((select lower(auth.jwt() ->> 'email')) in ('juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com'));
