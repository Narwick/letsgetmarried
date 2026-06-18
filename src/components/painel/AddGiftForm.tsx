"use client";

import { useActionState, useRef, useState } from "react";
import { addGift } from "@/app/painel/actions";
import { createClient } from "@/lib/supabase/client";

type State = { ok?: boolean; error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  return await addGift(formData);
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent";
const BUCKET = "wedding-photos";

export function AddGiftForm({ weddingId }: { weddingId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImgError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setUploading(true);
    setImgError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setImgError("Sessão expirada.");
      setUploading(false);
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/gift-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) {
      setImgError(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <form
      ref={ref}
      action={async (fd) => {
        await formAction(fd);
        ref.current?.reset();
        setImageUrl("");
      }}
      className="space-y-4 rounded-2xl border border-border bg-surface p-5"
    >
      <input type="hidden" name="wedding_id" value={weddingId} />
      <input type="hidden" name="image_url" value={imageUrl} />
      <h2 className="font-serif text-xl text-foreground">Adicionar presente</h2>

      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-stone-50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Prévia" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted">sem foto</div>
          )}
        </div>
        <div>
          <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-accent">
            {uploading ? "Enviando..." : imageUrl ? "Trocar foto" : "Adicionar foto (opcional)"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
          </label>
          {imgError && <p className="mt-1 text-sm text-red-600">{imgError}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Título</label>
          <input name="title" required className={inputCls} placeholder="Jogo de panelas" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Valor sugerido (R$)</label>
          <input name="suggested_amount" type="number" step="0.01" min="0" className={inputCls} placeholder="deixe em branco p/ valor livre" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Descrição</label>
        <input name="description" className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="is_honeymoon_fund" className="h-4 w-4 accent-accent" />
        É um item do fundo da lua de mel (doação de viagem)
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Adicionando..." : "Adicionar"}
        </button>
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
