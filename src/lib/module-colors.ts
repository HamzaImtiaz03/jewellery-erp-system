/**
 * Per-module signature hues (references the categorical --c-* tokens in
 * globals.css, which adapt to light/dark). Used to colour the sidebar icons,
 * KPI cards and module headers so each area has a soft, recognisable identity.
 */
export const MODULE_HUE: Record<string, string> = {
  dashboard: "--c-indigo",
  sales: "--c-blue",
  inventory: "--c-violet",
  jewellery: "--c-amber",
  procurement: "--c-cyan",
  finance: "--c-emerald",
  hcm: "--c-rose",
  crm: "--c-pink",
  manufacturing: "--c-orange",
  intelligence: "--c-teal",
  admin: "--c-purple",
  settings: "--c-slate",
};

export const DEFAULT_HUE = "--c-blue";

export function hueVar(moduleId?: string): string {
  return (moduleId && MODULE_HUE[moduleId]) || DEFAULT_HUE;
}

/** Build an hsl() string from a hue var (raw `--c-x` or any colour) + alpha. */
export function hsl(v: string, alpha?: number): string {
  const val = v.startsWith("--") ? `var(${v})` : v;
  return alpha == null ? `hsl(${val})` : `hsl(${val} / ${alpha})`;
}

/** Colourful rotation for KPI rows / chart series. */
export const HUE_ROTATION = [
  "--c-blue",
  "--c-violet",
  "--c-amber",
  "--c-emerald",
  "--c-rose",
  "--c-cyan",
  "--c-orange",
  "--c-indigo",
];
