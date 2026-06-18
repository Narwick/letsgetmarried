"use client";

import { useState, useTransition } from "react";
import { THEMES, CUSTOM_THEME, buildCustomTheme, isValidHex } from "@/lib/themes";
import { saveTheme } from "@/app/painel/actions";

export function ThemePicker({
  weddingId,
  initialTheme,
  initialCustomAccent,
}: {
  weddingId: string;
  initialTheme: string;
  initialCustomAccent: string | null;
}) {
  const [selected, setSelected] = useState(initialTheme);
  const [customColor, setCustomColor] = useState(
    isValidHex(initialCustomAccent) ? initialCustomAccent! : "#c08552",
  );
  const [pending, startTransition] = useTransition();

  function choosePreset(id: string) {
    setSelected(id);
    startTransition(async () => {
      await saveTheme(weddingId, id);
    });
  }

  function chooseCustom(color: string) {
    setCustomColor(color);
    setSelected(CUSTOM_THEME);
    startTransition(async () => {
      await saveTheme(weddingId, CUSTOM_THEME, color);
    });
  }

  const customVars = buildCustomTheme(customColor).vars;
  const customActive = selected === CUSTOM_THEME;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEMES.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => choosePreset(t.id)}
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

      {/* Cor personalizada */}
      <div
        className={`rounded-xl border p-4 transition ${
          customActive ? "border-accent ring-2 ring-accent/30" : "border-border"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Cor personalizada</p>
            <p className="text-xs text-muted">Escolha qualquer cor de destaque.</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-8 w-8 rounded-md border border-border"
              style={{ backgroundColor: customVars.background }}
              title="Fundo"
            />
            <input
              type="color"
              value={customColor}
              onChange={(e) => chooseCustom(e.target.value)}
              disabled={pending}
              className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent"
              aria-label="Escolher cor de destaque"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                const v = e.target.value;
                setCustomColor(v);
                if (isValidHex(v)) chooseCustom(v.startsWith("#") ? v : `#${v}`);
              }}
              placeholder="#c08552"
              className="w-24 rounded-md border border-border px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        {customActive && (
          <div className="mt-3 flex gap-2">
            <span className="rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: customVars.accent }}>
              Botão
            </span>
            <span className="rounded-md px-3 py-1.5 text-xs" style={{ backgroundColor: customVars.accentSoft, color: customVars.accentHover }}>
              Detalhe suave
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
