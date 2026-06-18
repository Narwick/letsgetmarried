-- Permite uma cor de destaque personalizada (quando theme = 'custom').
alter table public.weddings
  add column if not exists custom_accent text;
