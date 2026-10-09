-- Fige le pronostic calculé avant le coup d'envoi afin de pouvoir le comparer
-- au résultat final. Les anciens matchs restent à NULL : aucun pronostic
-- historique n'est inventé après coup.
alter table public.matches
  add column if not exists prediction_a smallint;

alter table public.matches
  drop constraint if exists matches_prediction_a_check;

alter table public.matches
  add constraint matches_prediction_a_check
  check (prediction_a is null or prediction_a between 0 and 100);
