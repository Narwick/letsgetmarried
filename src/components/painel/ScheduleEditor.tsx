"use client";

import { useState, useTransition } from "react";
import { saveSchedule } from "@/app/painel/actions";
import type { ScheduleEntry } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent";

export function ScheduleEditor({
  weddingId,
  initial,
}: {
  weddingId: string;
  initial: ScheduleEntry[];
}) {
  const [rows, setRows] = useState<ScheduleEntry[]>(
    initial.length ? initial : [{ hora: "", evento: "" }],
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function update(i: number, field: keyof ScheduleEntry, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  const add = () => setRows((r) => [...r, { hora: "", evento: "" }]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  function save() {
    setSaved(false);
    startTransition(async () => {
      await saveSchedule(weddingId, rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[110px_1fr_auto] items-center gap-2">
          <input
            value={row.hora}
            onChange={(e) => update(i, "hora", e.target.value)}
            className={inputCls}
            placeholder="16h00"
          />
          <input
            value={row.evento}
            onChange={(e) => update(i, "evento", e.target.value)}
            className={inputCls}
            placeholder="Cerimônia religiosa"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="px-2 text-sm text-red-600 hover:underline"
          >
            Remover
          </button>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent"
        >
          + Item
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar programação"}
        </button>
        {saved && <span className="text-sm text-green-700">Salvo!</span>}
      </div>
    </div>
  );
}
