"use client";

import { useState, useTransition } from "react";
import { updateGift, deleteGift } from "@/app/painel/actions";
import { uploadImage } from "@/lib/uploadImage";
import { CurrencyInput } from "@/components/painel/CurrencyInput";
import type { Gift } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent";

function brl(cents: number | null) {
  return cents == null
    ? "Valor livre"
    : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function GiftRow({ gift, weddingId }: { gift: Gift; weddingId: string }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(gift.title);
  const [description, setDescription] = useState(gift.description ?? "");
  const [amountCents, setAmountCents] = useState<number | null>(gift.suggested_amount);
  const [honeymoon, setHoneymoon] = useState(gift.is_honeymoon_fund);
  const [imageUrl, setImageUrl] = useState(gift.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const res = await uploadImage(file, "gift");
    setUploading(false);
    if (res.error) setError(res.error);
    else if (res.url) setImageUrl(res.url);
  }

  function save() {
    setError(null);
    const fd = new FormData();
    fd.set("id", gift.id);
    fd.set("wedding_id", weddingId);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("image_url", imageUrl);
    fd.set("suggested_amount", amountCents != null ? (amountCents / 100).toString() : "");
    if (honeymoon) fd.set("is_honeymoon_fund", "on");
    startTransition(async () => {
      const res = await updateGift(fd);
      if (res?.error) setError(res.error);
      else setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex min-w-0 items-center gap-4">
          {gift.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gift.image_url} alt={gift.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {gift.title}
              {gift.is_honeymoon_fund && (
                <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-hover">
                  Lua de mel
                </span>
              )}
            </p>
            {gift.description && <p className="text-sm text-muted">{gift.description}</p>}
            <p className="text-sm text-muted">{brl(gift.suggested_amount)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button onClick={() => setEditing(true)} className="text-sm text-accent hover:underline">
            Editar
          </button>
          <form action={deleteGift}>
            <input type="hidden" name="id" value={gift.id} />
            <input type="hidden" name="wedding_id" value={weddingId} />
            <button className="text-sm text-red-600 hover:underline">Remover</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-accent bg-surface p-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-stone-50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Prévia" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted">sem foto</div>
          )}
        </div>
        <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-accent">
          {uploading ? "Enviando..." : imageUrl ? "Trocar foto" : "Adicionar foto"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
        </label>
        {imageUrl && (
          <button type="button" onClick={() => setImageUrl("")} className="text-sm text-red-600 hover:underline">
            Remover foto
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Valor sugerido (R$)</label>
          <CurrencyInput valueCents={amountCents} onChange={setAmountCents} className={inputCls} />
          <p className="mt-1 text-xs text-muted">Vazio = valor livre.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Descrição</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={honeymoon} onChange={(e) => setHoneymoon(e.target.checked)} className="h-4 w-4 accent-accent" />
        É um item do fundo da lua de mel
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending || uploading}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button onClick={() => setEditing(false)} className="text-sm text-muted hover:text-foreground">
          Cancelar
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
