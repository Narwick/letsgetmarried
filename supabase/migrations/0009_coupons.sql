-- ════════════════════════════════════════════════════════════════════════
-- Cupons de afiliado: desconto na publicação + comissão para o dono do cupom.
--
-- O desconto real é aplicado pela AbacatePay (cada cupom é espelhado lá via
-- POST /v1/coupon/create). Esta tabela é a fonte da verdade do dono e da
-- comissão — a AbacatePay não repassa valor a terceiros, isso é controle nosso.
--
-- Acesso: somente service-role (painel admin no servidor, após checar o e-mail
-- contra ADMIN_EMAILS). RLS fica habilitada sem policies = nega tudo para
-- usuários comuns, igual ao padrão de escrita em payments.
-- ════════════════════════════════════════════════════════════════════════

create type commission_status as enum ('pending', 'paid');

-- ── coupons ────────────────────────────────────────────────────────────────
create table public.coupons (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  owner_name         text not null,
  owner_contact      text,                                  -- PIX/e-mail p/ pagar a comissão
  discount_percent   integer not null default 10,           -- desconto do comprador (1–100)
  commission_percent integer not null default 0,            -- comissão do dono (0–100)
  active             boolean not null default true,
  max_redeems        integer not null default -1,           -- espelha AbacatePay; -1 = ilimitado
  redeems_count      integer not null default 0,
  notes              text,
  created_at         timestamptz not null default now(),
  constraint coupon_code_format check (code ~ '^[A-Z0-9]+(_[A-Z0-9]+)*$'),
  constraint discount_pct_range check (discount_percent between 1 and 100),
  constraint commission_pct_range check (commission_percent between 0 and 100)
);

create index coupons_code_idx on public.coupons (code);

-- ── payments: vínculo com cupom + comissão ─────────────────────────────────
alter table public.payments
  add column coupon_id          uuid references public.coupons (id),
  add column coupon_code        text,
  add column discount_amount    integer not null default 0,   -- centavos
  add column commission_percent integer not null default 0,   -- snapshot no momento da compra
  add column commission_amount  integer not null default 0,   -- centavos, calculado ao pagar
  add column commission_status  commission_status,            -- null quando não há cupom
  add column commission_paid_at timestamptz;

create index payments_coupon_idx on public.payments (coupon_id);

-- Incremento atômico de usos do cupom (chamado pelo webhook após pagamento).
create or replace function public.increment_coupon_redeems(p_coupon_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.coupons set redeems_count = redeems_count + 1 where id = p_coupon_id;
$$;

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Sem policies: usuários comuns não leem nem escrevem; acesso só via service-role.
alter table public.coupons enable row level security;
