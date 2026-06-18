"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface RsvpInput {
  weddingId: string;
  slug: string;
  name: string;
  attending: boolean;
  companions: number;
  message: string;
}

/**
 * Convidado confirma presença. Usa a função submit_rsvp (SECURITY DEFINER),
 * que valida se o site está publicado antes de inserir.
 */
export async function submitRsvp(input: RsvpInput): Promise<{ ok?: boolean; error?: string }> {
  if (!input.name.trim()) return { error: "Informe seu nome." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_rsvp", {
    p_wedding_id: input.weddingId,
    p_name: input.name,
    p_attending: input.attending,
    p_companions: Number.isFinite(input.companions) ? input.companions : 0,
    p_message: input.message ?? "",
  });

  if (error) {
    // A função retorna mensagens claras (ex.: "Site indisponível para confirmações.").
    return { error: error.message || "Não foi possível registrar agora. Tente novamente." };
  }

  revalidatePath(`/${input.slug}`);
  return { ok: true };
}
