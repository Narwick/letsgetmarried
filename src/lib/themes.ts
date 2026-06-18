import type { CSSProperties } from "react";

/**
 * Paletas que o casal pode escolher para o seu site. Cada tema define as
 * variáveis CSS aplicadas no site público (escopo por página).
 */
export interface Theme {
  id: string;
  label: string;
  description: string;
  vars: {
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    border: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
  };
}

export const THEMES: Theme[] = [
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
      accent: "#7c8a6f",
      accentHover: "#67745c",
      accentSoft: "#e8ece2",
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
      accent: "#b76e79",
      accentHover: "#a25c67",
      accentSoft: "#f5e7e9",
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
      accent: "#c2724a",
      accentHover: "#a85d3a",
      accentSoft: "#f4e3d6",
    },
  },
  {
    id: "navy",
    label: "Azul marinho",
    description: "Clássico elegante e formal",
    vars: {
      background: "#f6f7f9",
      surface: "#ffffff",
      foreground: "#1f2a3c",
      muted: "#5d6675",
      border: "#dde1e8",
      accent: "#2f4a6b",
      accentHover: "#23394f",
      accentSoft: "#e1e7f0",
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
      accent: "#8a72b0",
      accentHover: "#74609a",
      accentSoft: "#ece5f5",
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
    },
  },
];

export const DEFAULT_THEME = "sage";
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
/** Mistura a cor com branco por uma fração (0–1) — versão "suave". */
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
    },
  };
}

/** Resolve as variáveis do tema considerando preset OU cor personalizada. */
export function resolveThemeVars(
  themeId: string | null | undefined,
  customAccent: string | null | undefined,
): Theme["vars"] {
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
  } as CSSProperties;
}
