alter table public.matches
  add column if not exists address text check (char_length(address) <= 200);
