-- ════════════════════════════════════════════════════════════════════════
-- Storage (fotos) + função de expiração para o cron diário.
-- ════════════════════════════════════════════════════════════════════════

-- Bucket público de leitura para as fotos dos casamentos.
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do nothing;

-- Qualquer um pode ler (site público). Upload/edição só do dono autenticado,
-- usando o id do usuário como primeira pasta do caminho (ex.: <uid>/capa.jpg).
create policy "wedding_photos_public_read" on storage.objects
  for select using (bucket_id = 'wedding-photos');

create policy "wedding_photos_owner_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "wedding_photos_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "wedding_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Expiração ──────────────────────────────────────────────────────────────
-- Marca como 'expired' os sites publicados cujo prazo já passou.
-- Chamada pelo Vercel Cron (/api/cron/expire) ou pelo pg_cron, se preferir.
create or replace function public.expire_weddings()
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  affected integer;
begin
  update public.weddings
     set status = 'expired'
   where status = 'published'
     and expires_at is not null
     and expires_at < now();
  get diagnostics affected = row_count;
  return affected;
end;
$$;
