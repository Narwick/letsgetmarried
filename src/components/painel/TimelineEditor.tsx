"use client";

import { useState, useTransition } from "react";
import { saveTimeline } from "@/app/painel/actions";
import { uploadImage } from "@/lib/uploadImage";
import { maskYear } from "@/lib/masks";
import type { TimelineEntry } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent";

const emptyRow = (): TimelineEntry => ({ ano: "", titulo: "", texto: "", imagem: "" });

export function TimelineEditor({
  weddingId,
  initial,
}: {
  weddingId: string;
  initial: TimelineEntry[];
}) {
  const [rows, setRows] = useState<TimelineEntry[]>(
    initial.length ? initial : [emptyRow()],
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, field: keyof TimelineEntry, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  const add = () => setRows((r) => [...r, emptyRow()]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  async function handleFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingIdx(i);
    const res = await uploadImage(file, "timeline");
    setUploadingIdx(null);
    if (res.error) setError(res.error);
    else if (res.url) update(i, "imagem", res.url);
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      await saveTimeline(weddingId, rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <div className="mb-2 grid gap-2 sm:grid-cols-[120px_1fr]">
            <input
              value={row.ano}
              onChange={(e) => update(i, "ano", maskYear(e.target.value))}
              inputMode="numeric"
              className={inputCls}
              placeholder="Ano (2019)"
            />
            <input
              value={row.titulo}
              onChange={(e) => update(i, "titulo", e.target.value)}
              className={inputCls}
              placeholder="Título (Onde tudo começou)"
            />
          </div>
          <textarea
            value={row.texto}
            onChange={(e) => update(i, "texto", e.target.value)}
            rows={2}
            className={inputCls}
            placeholder="O que aconteceu nesse capítulo..."
          />

          {/* Foto do capítulo (opcional) */}
          <div className="mt-3 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-stone-50">
              {row.imagem ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imagem} alt="Prévia" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-center text-[0.65rem] text-muted">
                  sem foto
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-accent">
              {uploadingIdx === i ? "Enviando..." : row.imagem ? "Trocar foto" : "Adicionar foto (opcional)"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingIdx !== null}
                onChange={(e) => handleFile(i, e)}
              />
            </label>
            {row.imagem && (
              <button
                type="button"
                onClick={() => update(i, "imagem", "")}
                className="text-sm text-red-600 hover:underline"
              >
                Remover foto
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Remover capítulo
          </button>
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent"
        >
          + Capítulo
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar história"}
        </button>
        {saved && <span className="text-sm text-green-700">Salvo!</span>}
      </div>
    </div>
  );
}
