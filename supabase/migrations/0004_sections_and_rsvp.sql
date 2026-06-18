-- ════════════════════════════════════════════════════════════════════════
-- Novas seções do site (história em timeline, save the date detalhado,
-- programação, mensagem final) + RSVP (confirmação de presença).
-- ════════════════════════════════════════════════════════════════════════

-- ── Novos campos em weddings ───────────────────────────────────────────────
alter table public.weddings
  add column if not exists monogram_left  text,
  add column if not exists monogram_right text,
  add column if not exists verse          text,
  add column if not exists verse_ref      text,
  add column if not exists dress_code     text,
  -- {local, endereco, horario, maps}
  add column if not exists ceremony       jsonb,
  add column if not exists reception      jsonb,
  add column if not exists show_reception boolean not null default false,
  -- [{ano, titulo, texto}]
  add column if not exists story_timeline jsonb not null default '[]'::jsonb,
  -- [{hora, evento}]
  add column if not exists schedule       jsonb not null default '[]'::jsonb,
  add column if not exists show_schedule  boolean not null default true;

-- ── RSVP ───────────────────────────────────────────────────────────────────
create table if not exists public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  name       text not null,
  attending  boolean not null default true,
  companions integer not null default 0,
  message    text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_wedding_idx on public.rsvps (wedding_id);

alter table public.rsvps enable row level security;

-- O casal lê as confirmações do próprio casamento (no painel).
drop policy if exists "rsvps_owner_read" on public.rsvps;
create policy "rsvps_owner_read" on public.rsvps
  for select
  using (
    exists (select 1 from public.weddings w
            where w.id = rsvps.wedding_id and w.owner_id = auth.uid())
  );

-- Convidados (anon) enviam RSVP somente via esta função, que valida se o site
-- está publicado. SECURITY DEFINER ignora RLS de forma controlada.
create or replace function public.submit_rsvp(
  p_wedding_id uuid,
  p_name       text,
  p_attending  boolean,
  p_companions integer,
  p_message    text
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.weddings w
     where w.id = p_wedding_id
       and w.status = 'published'
       and w.expires_at > now()
  ) then
    raise exception 'Site indisponível para confirmações.';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'Nome é obrigatório.';
  end if;

  insert into public.rsvps (wedding_id, name, attending, companions, message)
  values (
    p_wedding_id,
    left(trim(p_name), 120),
    coalesce(p_attending, true),
    greatest(0, least(coalesce(p_companions, 0), 20)),
    nullif(left(coalesce(trim(p_message), ''), 500), '')
  );
end;
$$;

grant execute on function public.submit_rsvp(uuid, text, boolean, integer, text)
  to anon, authenticated;
