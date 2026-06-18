-- Permite que o DONO logado envie RSVP mesmo com o site em rascunho (para testar
-- a pré-visualização). Convidados (anon) continuam só com o site publicado.
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
       and (
         (w.status = 'published' and w.expires_at > now())
         or w.owner_id = auth.uid()
       )
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
