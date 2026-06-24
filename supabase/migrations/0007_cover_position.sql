-- ════════════════════════════════════════════════════════════════════════
-- Posicionamento (focal point) da foto de capa no hero do site.
-- Guarda um valor CSS object-position / background-position, ex: "50% 30%".
-- Default "center" mantém o comportamento atual dos sites já criados.
-- ════════════════════════════════════════════════════════════════════════

alter table public.weddings
  add column if not exists cover_position text not null default 'center';
