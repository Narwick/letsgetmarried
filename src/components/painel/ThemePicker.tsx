"use client";

import { useState, useTransition } from "react";
import { THEMES } from "@/lib/themes";
import { saveTheme } from "@/app/painel/actions";

export function ThemePicker({
  weddingId,
  initialTheme,
}: {
  weddingId: string;
  initialTheme: string;
}) {
  const [selected, setSelected] = useState(initialTheme);
  const [pending, startTransition] = useTransition();

  function choose(id: string) {
    setSelected(id);
    startTransition(async () => {
      await saveTheme(weddingId, id);
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEMES.map((t) => {
        const active = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => choose(t.id)}
            disabled={pending}
            className={`rounded-xl border p-3 text-left transition ${
              active ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent"
            }`}
          >
            <div className="mb-2 flex gap-1.5">
              <span
                className="h-8 w-full rounded-md"
                style={{ backgroundColor: t.vars.background, border: `1px solid ${t.vars.border}` }}
              />
              <span className="h-8 w-5 rounded-md" style={{ backgroundColor: t.vars.accent }} />
            </div>
            <p className="text-sm font-medium text-foreground">{t.label}</p>
            <p className="text-xs text-muted">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
