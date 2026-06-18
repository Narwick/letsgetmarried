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

export function getTheme(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Variáveis CSS para aplicar inline no wrapper do site público. */
export function themeStyle(id: string | null | undefined): CSSProperties {
  const v = getTheme(id).vars;
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
