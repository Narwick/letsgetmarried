"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PixKeyType } from "@/lib/types";

/** Sai da conta. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Garante que o usuário logado tem um wedding; cria um rascunho se faltar. */
export async function getOrCreateWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("weddings")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) return existing;

  // slug provisório único; o casal ajusta depois.
  const slug = `casamento-${user.id.slice(0, 8)}`;
  const { data: created, error } = await supabase
    .from("weddings")
    .insert({ owner_id: user.id, slug })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

/** Revalida a página pública do casal (busca o slug e limpa o cache da rota). */
async function revalidateSite(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weddingId: string,
) {
  const { data } = await supabase
    .from("weddings")
    .select("slug")
    .eq("id", weddingId)
    .maybeSingle();
  if (data?.slug) revalidatePath(`/${data.slug}`);
}

/** Salva o tema (paleta) escolhido para o site. Aceita preset ou cor custom. */
export async function saveTheme(weddingId: string, theme: string, customAccent?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload: { theme: string; custom_accent?: string | null } = { theme };
  if (theme === "custom") payload.custom_accent = customAccent ?? null;

  const { error } = await supabase
    .from("weddings")
    .update(payload)
    .eq("id", weddingId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/painel/editar");
  await revalidateSite(supabase, weddingId);
  return { ok: true };
}

/** Salva (ou remove) a URL da foto de capa do casamento. */
export async function saveCoverPhoto(weddingId: string, url: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("weddings")
    .update({ cover_photo_url: url })
    .eq("id", weddingId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/painel/editar");
  await revalidateSite(supabase, weddingId);
  return { ok: true };
}

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

/** Salva os dados gerais do casamento (história, evento, PIX, slug). */
export async function saveWedding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const slug = (str(formData, "slug") || "").toLowerCase();

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { error: "O endereço (slug) deve conter apenas letras minúsculas, números e hífens." };
  }

  const eventDateRaw = str(formData, "event_date");

  const { error } = await supabase
    .from("weddings")
    .update({
      slug,
      couple_names: str(formData, "couple_names"),
      story: str(formData, "story"),
      event_date: eventDateRaw ? new Date(eventDateRaw).toISOString() : null,
      event_location: str(formData, "event_location"),
      event_details: str(formData, "event_details"),
      pix_key: str(formData, "pix_key"),
      pix_key_type: (str(formData, "pix_key_type") as PixKeyType) || null,
      pix_recipient_name: str(formData, "pix_recipient_name"),
      pix_city: str(formData, "pix_city"),
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "Esse endereço já está em uso. Escolha outro." };
    return { error: error.message };
  }

  revalidatePath("/painel/editar");
  revalidatePath(`/${slug}`);
  return { ok: true };
}

/** Adiciona um presente ou item do fundo de viagem. */
export async function addGift(formData: FormData) {
  const supabase = await createClient();
  const weddingId = formData.get("wedding_id") as string;
  const amountRaw = str(formData, "suggested_amount");

  const { error } = await supabase.from("gifts").insert({
    wedding_id: weddingId,
    title: str(formData, "title") || "Presente",
    description: str(formData, "description"),
    is_honeymoon_fund: formData.get("is_honeymoon_fund") === "on",
    suggested_amount: amountRaw ? Math.round(parseFloat(amountRaw) * 100) : null,
  });

  if (error) return { error: error.message };
  revalidatePath("/painel/presentes");
  return { ok: true };
}

/** Remove um presente. */
export async function deleteGift(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("gifts").delete().eq("id", id);
  revalidatePath("/painel/presentes");
}
