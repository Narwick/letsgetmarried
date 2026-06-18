-- Agenda a expiração diária dos sites direto no Supabase (pg_cron), sem depender
-- de cron externo (Vercel). Chama a função public.expire_weddings() todo dia 03:00 UTC.
--
-- Pré-requisito: a extensão pg_cron precisa estar habilitada. No Supabase:
--   Dashboard → Database → Extensions → habilite "pg_cron"
-- (ou rode o create extension abaixo, que requer privilégio adequado).

create extension if not exists pg_cron;

-- Remove agendamento anterior (se existir) para poder rodar este script de novo.
do $$
begin
  perform cron.unschedule('expire-weddings');
exception when others then
  null;
end $$;

select cron.schedule(
  'expire-weddings',
  '0 3 * * *',
  $$ select public.expire_weddings(); $$
);
