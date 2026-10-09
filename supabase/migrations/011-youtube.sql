-- Ajoute un lien YouTube facultatif à chaque match sans modifier l'historique.
alter table public.matches
  add column if not exists youtube_url text;
