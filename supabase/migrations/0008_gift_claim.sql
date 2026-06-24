-- ════════════════════════════════════════════════════════════════════════
-- Presente "já presenteado": o convidado confirma que comprou e o item fica
-- indisponível no site. Itens do fundo de lua de mel não entram (aceitam
-- várias contribuições).
-- ════════════════════════════════════════════════════════════════════════

alter table public.gifts
  add column if not exists claimed_at timestamptz;

-- Convidado (anon) marca um presente como já comprado. SECURITY DEFINER para
-- ignorar a RLS de forma controlada, validando que o site está publicado e que
-- o item ainda está disponível.
create or replace function public.claim_gift(p_gift_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_claimed   timestamptz;
  v_honeymoon boolean;
begin
  select g.claimed_at, g.is_honeymoon_fund
    into v_claimed, v_honeymoon
  from public.gifts g
  join public.weddings w on w.id = g.wedding_id
  where g.id = p_gift_id
    and w.status = 'published'
    and w.expires_at > now();

  if not found then
    raise exception 'Presente indisponível.';
  end if;

  if v_honeymoon then
    raise exception 'Itens do fundo de lua de mel aceitam várias contribuições.';
  end if;

  if v_claimed is not null then
    raise exception 'Este presente já foi escolhido por outra pessoa.';
  end if;

  update public.gifts set claimed_at = now() where id = p_gift_id;
end;
$$;

grant execute on function public.claim_gift(uuid) to anon, authenticated;
