-- ════════════════════════════════════════════════════════════════════════
-- Schema inicial: profiles, weddings, gifts, payments + RLS
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- ════════════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────────────
create type wedding_status as enum ('draft', 'published', 'expired');
create type pix_key_type   as enum ('cpf', 'cnpj', 'email', 'phone', 'random');
create type payment_status as enum ('pending', 'paid', 'failed');

-- ── profiles (espelha auth.users) ─────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- Cria o profile automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── weddings ───────────────────────────────────────────────────────────────
create table public.weddings (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles (id) on delete cascade,
  slug               text not null unique,
  couple_names       text,
  story              text,
  event_date         timestamptz,
  event_location     text,
  event_details      text,
  cover_photo_url    text,
  theme              text not null default 'classic',
  pix_key            text,
  pix_key_type       pix_key_type,
  pix_recipient_name text,
  pix_city           text,
  status             wedding_status not null default 'draft',
  published_at       timestamptz,
  expires_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index weddings_owner_idx on public.weddings (owner_id);
create index weddings_slug_idx  on public.weddings (slug);

-- Garante 1 site por casal no MVP (remova se quiser permitir vários).
create unique index weddings_one_per_owner on public.weddings (owner_id);

-- ── gifts ────────────────────────────────────────────────────────────────
create table public.gifts (
  id                uuid primary key default gen_random_uuid(),
  wedding_id        uuid not null references public.weddings (id) on delete cascade,
  title             text not null,
  description       text,
  image_url         text,
  suggested_amount  integer,            -- em centavos; null = valor livre
  is_honeymoon_fund boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

create index gifts_wedding_idx on public.gifts (wedding_id);

-- ── payments (assinatura anual via AbacatePay) ─────────────────────────────
create table public.payments (
  id                    uuid primary key default gen_random_uuid(),
  wedding_id            uuid not null references public.weddings (id) on delete cascade,
  abacatepay_billing_id text unique,
  amount                integer not null,  -- em centavos
  status                payment_status not null default 'pending',
  paid_at               timestamptz,
  created_at            timestamptz not null default now()
);

create index payments_wedding_idx on public.payments (wedding_id);

-- ── updated_at automático em weddings ──────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger weddings_touch_updated_at
  before update on public.weddings
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.gifts    enable row level security;
alter table public.payments enable row level security;

-- profiles: cada um lê/edita o próprio
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- weddings: o dono tem acesso total ao próprio registro.
-- (A leitura pública do site usa o service-role no servidor, não estas policies.)
create policy "weddings_owner_all" on public.weddings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- gifts: o dono do casamento gerencia os próprios presentes.
create policy "gifts_owner_all" on public.gifts
  for all
  using (
    exists (select 1 from public.weddings w
            where w.id = gifts.wedding_id and w.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.weddings w
            where w.id = gifts.wedding_id and w.owner_id = auth.uid())
  );

-- payments: o dono apenas lê o próprio histórico. Escrita só via service-role (webhook).
create policy "payments_owner_read" on public.payments
  for select
  using (
    exists (select 1 from public.weddings w
            where w.id = payments.wedding_id and w.owner_id = auth.uid())
  );
