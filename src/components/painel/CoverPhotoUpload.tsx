"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveCoverPhoto } from "@/app/painel/actions";

const BUCKET = "wedding-photos";

export function CoverPhotoUpload({
  weddingId,
  initialUrl,
}: {
  weddingId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/cover-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const res = await saveCoverPhoto(weddingId, publicUrl);
    setUploading(false);
    if (res?.error) setError(res.error);
    else setUrl(publicUrl);
  }

  async function handleRemove() {
    setUploading(true);
    await saveCoverPhoto(weddingId, null);
    setUrl(null);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      {url ? (
        <div className="relative overflow-hidden rounded-xl border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Foto de capa" className="h-48 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-sm text-stone-400">
          Nenhuma foto de capa
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
          {uploading ? "Enviando..." : url ? "Trocar foto" : "Enviar foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="text-sm text-red-600 hover:underline"
          >
            Remover
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-stone-500">Recomendado: imagem horizontal, até 5 MB.</p>
    </div>
  );
}
