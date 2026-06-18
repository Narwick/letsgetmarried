import type { CSSProperties } from "react";

/**
 * Paletas que o casal pode escolher para o seu site. Cada tema define as
 * variáveis CSS aplicadas no site público (escopo por página).
 *
 * Além das cores claras (seções claras), cada tema traz um tom escuro
 * coordenado ("ink") usado nas seções dramáticas (O Dia, Presentes).
 */
export interface ThemeVars {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  ink: string; // fundo das seções escuras
  inkSoft: string; // fim do gradiente / bordas
  onInk: string; // texto claro sobre o escuro
  onInkSoft: string; // texto claro secundário
  inkAccent: string; // destaque (dourado) sobre o escuro
}

export interface Theme {
  id: string;
  label: string;
  description: string;
  vars: ThemeVars;
}

export const THEMES: Theme[] = [
  {
    id: "navy",
    label: "Navy & Dourado",
    description: "Clássico, elegante e formal",
    vars: {
      background: "#f7f1e6",
      surface: "#fcf7ed",
      foreground: "#1e242c",
      muted: "#55504a",
      border: "#e4dcc8",
      accent: "#a8863f",
      accentHover: "#8c6f31",
      accentSoft: "#f0e7cf",
      ink: "#0f1d33",
      inkSoft: "#16294a",
      onInk: "#f7f1e6",
      onInkSoft: "#c7cedd",
      inkAccent: "#dcc187",
    },
  },
  {
    id: "sage",
    label: "Sage",
    description: "Verde sálvia natural",
    vars: {
      background: "#f7f6f1",
      surface: "#ffffff",
      foreground: "#2b2b28",
      muted: "#6f7268",
      border: "#e4e3da",
      accent: "#67745c",
      accentHover: "#525d49",
      accentSoft: "#e8ece2",
      ink: "#2f3a2c",
      inkSoft: "#3c4a37",
      onInk: "#f3f1e8",
      onInkSoft: "#cdd3c4",
      inkAccent: "#b6c2a3",
    },
  },
  {
    id: "blush",
    label: "Rosé",
    description: "Rosa amadeirado romântico",
    vars: {
      background: "#faf7f2",
      surface: "#ffffff",
      foreground: "#2b2724",
      muted: "#756f68",
      border: "#ece4dc",
      accent: "#a25c67",
      accentHover: "#874c55",
      accentSoft: "#f5e7e9",
      ink: "#3a2a2e",
      inkSoft: "#4a363b",
      onInk: "#f7efe9",
      onInkSoft: "#d9c9c2",
      inkAccent: "#d8a7af",
    },
  },
  {
    id: "terracotta",
    label: "Terracota",
    description: "Boho quente com dourado",
    vars: {
      background: "#faf5ee",
      surface: "#ffffff",
      foreground: "#322a22",
      muted: "#7a6f63",
      border: "#ece0d3",
      accent: "#a85d3a",
      accentHover: "#8c4c2f",
      accentSoft: "#f4e3d6",
      ink: "#2e2620",
      inkSoft: "#3e342b",
      onInk: "#f7efe6",
      onInkSoft: "#d9cdbf",
      inkAccent: "#e0a877",
    },
  },
  {
    id: "lavender",
    label: "Lavanda",
    description: "Lilás suave e delicado",
    vars: {
      background: "#f8f6fb",
      surface: "#ffffff",
      foreground: "#2e2838",
      muted: "#6d6580",
      border: "#e7e1ee",
      accent: "#74609a",
      accentHover: "#5f4e82",
      accentSoft: "#ece5f5",
      ink: "#2b2438",
      inkSoft: "#392f4c",
      onInk: "#f2edf8",
      onInkSoft: "#cfc6dd",
      inkAccent: "#bda9dd",
    },
  },
  {
    id: "noir",
    label: "Preto & Branco",
    description: "Minimalista e moderno",
    vars: {
      background: "#fafafa",
      surface: "#ffffff",
      foreground: "#1a1a1a",
      muted: "#6b6b6b",
      border: "#e2e2e2",
      accent: "#1a1a1a",
      accentHover: "#000000",
      accentSoft: "#ededed",
      ink: "#161616",
      inkSoft: "#262626",
      onInk: "#f4f4f4",
      onInkSoft: "#bdbdbd",
      inkAccent: "#d8d8d8",
    },
  },
];

export const DEFAULT_THEME = "navy";
export const CUSTOM_THEME = "custom";

export function getTheme(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/* ── Utilitários de cor para o tema personalizado ─────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => clamp(c).toString(16).padStart(2, "0")).join("");
}
/** Escurece a cor por uma fração (0–1). */
function darken(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - f), g * (1 - f), b * (1 - f));
}
/** Clareia em direção ao branco por uma fração (0–1). */
function mixWhite(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export function isValidHex(hex: string | null | undefined): boolean {
  return !!hex && HEX_RE.test(hex.trim());
}

/** Monta um tema com base neutra (creme) e a cor de destaque escolhida. */
export function buildCustomTheme(accent: string | null | undefined): Theme {
  const safe = isValidHex(accent) ? accent!.trim() : THEMES[0].vars.accent;
  const normalized = safe.startsWith("#") ? safe : `#${safe}`;
  return {
    id: CUSTOM_THEME,
    label: "Personalizada",
    description: "Sua cor",
    vars: {
      background: "#faf8f4",
      surface: "#ffffff",
      foreground: "#2b2b28",
      muted: "#6f6f68",
      border: "#e7e3db",
      accent: normalized,
      accentHover: darken(normalized, 0.15),
      accentSoft: mixWhite(normalized, 0.85),
      ink: darken(normalized, 0.78),
      inkSoft: darken(normalized, 0.68),
      onInk: "#f7f4ee",
      onInkSoft: mixWhite(normalized, 0.55),
      inkAccent: mixWhite(normalized, 0.45),
    },
  };
}

/** Resolve as variáveis do tema considerando preset OU cor personalizada. */
export function resolveThemeVars(
  themeId: string | null | undefined,
  customAccent: string | null | undefined,
): ThemeVars {
  if (themeId === CUSTOM_THEME) return buildCustomTheme(customAccent).vars;
  return getTheme(themeId).vars;
}

/** Variáveis CSS para aplicar inline no wrapper do site público. */
export function themeStyle(
  id: string | null | undefined,
  customAccent?: string | null,
): CSSProperties {
  const v = resolveThemeVars(id, customAccent);
  return {
    "--background": v.background,
    "--surface": v.surface,
    "--foreground": v.foreground,
    "--muted": v.muted,
    "--border": v.border,
    "--accent": v.accent,
    "--accent-hover": v.accentHover,
    "--accent-soft": v.accentSoft,
    "--ink": v.ink,
    "--ink-soft": v.inkSoft,
    "--on-ink": v.onInk,
    "--on-ink-soft": v.onInkSoft,
    "--ink-accent": v.inkAccent,
  } as CSSProperties;
}
