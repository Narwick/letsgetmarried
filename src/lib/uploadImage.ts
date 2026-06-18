import { createClient } from "@/lib/supabase/client";

const BUCKET = "wedding-photos";

/**
 * Sobe uma imagem para o Storage (no navegador) e retorna a URL pública.
 * O caminho usa o id do usuário como pasta (exigido pelas policies).
 */
export async function uploadImage(
  file: File,
  prefix: string,
): Promise<{ url?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) return { error: "A imagem deve ter no máximo 5 MB." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${prefix}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
