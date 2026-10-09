-- Ajoute une carte FUT facultative à chaque joueur sans modifier les données existantes.
-- Les fichiers utilisent le bucket player-avatars déjà créé pour les photos de profil.
alter table public.players
  add column if not exists fut_card_url text;
