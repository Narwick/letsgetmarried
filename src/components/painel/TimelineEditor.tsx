"use client";

import { useState, useTransition } from "react";
import { saveTimeline } from "@/app/painel/actions";
import type { TimelineEntry } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent";

export function TimelineEditor({
  weddingId,
  initial,
}: {
  weddingId: string;
  initial: TimelineEntry[];
}) {
  const [rows, setRows] = useState<TimelineEntry[]>(
    initial.length ? initial : [{ ano: "", titulo: "", texto: "" }],
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function update(i: number, field: keyof TimelineEntry, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  const add = () => setRows((r) => [...r, { ano: "", titulo: "", texto: "" }]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

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
              onChange={(e) => update(i, "ano", e.target.value)}
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
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Remover capítulo
          </button>
        </div>
      ))}

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
