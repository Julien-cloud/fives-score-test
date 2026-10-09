-- ATON°PRIME : stockage public et sécurisé des photos de profil.
-- Cette migration est idempotente.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lecture publique avatars joueurs" on storage.objects;
create policy "lecture publique avatars joueurs" on storage.objects
for select using (bucket_id = 'player-avatars');

drop policy if exists "admin ajoute avatars joueurs" on storage.objects;
create policy "admin ajoute avatars joueurs" on storage.objects
for insert to authenticated with check (
  bucket_id = 'player-avatars'
  and lower(auth.jwt() ->> 'email') = any(array['juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com'])
);

drop policy if exists "admin modifie avatars joueurs" on storage.objects;
create policy "admin modifie avatars joueurs" on storage.objects
for update to authenticated
using (bucket_id = 'player-avatars' and lower(auth.jwt() ->> 'email') = any(array['juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com']))
with check (bucket_id = 'player-avatars');

drop policy if exists "admin supprime avatars joueurs" on storage.objects;
create policy "admin supprime avatars joueurs" on storage.objects
for delete to authenticated using (
  bucket_id = 'player-avatars'
  and lower(auth.jwt() ->> 'email') = any(array['juliencannoux@yahoo.com','juliiengravity350@gmail.com','rayanrahou51@gmail.com','lucas.nadreau@gmail.com'])
);
