/**
 * Theme registry — SRS Appendix L.1.1 (UI-F01): 10 curated enterprise base
 * themes incl. light / dark / high-contrast variants. The active theme key is
 * applied via <html data-theme>. Tokens themselves live in globals.css.
 */

export type ThemeMode = "light" | "dark";

export interface ThemeDef {
  key: string;
  name: string;
  mode: ThemeMode;
  /** swatch hints for the picker (primary, accent, surface) */
  swatch: [string, string, string];
  highContrast?: boolean;
}

export const THEMES: ThemeDef[] = [
  { key: "royal", name: "Royal Navy", mode: "light", swatch: ["#1F3864", "#C55A11", "#FFFFFF"] },
  { key: "royal-dark", name: "Royal Navy Dark", mode: "dark", swatch: ["#4E84D6", "#E8843A", "#161D2E"] },
  { key: "graphite", name: "Graphite", mode: "light", swatch: ["#2A303C", "#0B84C4", "#FFFFFF"] },
  { key: "graphite-dark", name: "Graphite Dark", mode: "dark", swatch: ["#C6CDD6", "#22A7E8", "#191C21"] },
  { key: "emerald", name: "Emerald", mode: "light", swatch: ["#0E5237", "#D99320", "#FFFFFF"] },
  { key: "emerald-dark", name: "Emerald Dark", mode: "dark", swatch: ["#43C28C", "#EBB13E", "#131E1A"] },
  { key: "plum", name: "Plum", mode: "light", swatch: ["#5E2D77", "#D69B16", "#FFFFFF"] },
  { key: "plum-dark", name: "Plum Dark", mode: "dark", swatch: ["#C08AE0", "#EFC03E", "#1A1320"] },
  { key: "contrast-light", name: "High Contrast", mode: "light", swatch: ["#0A33A3", "#C24A00", "#FFFFFF"], highContrast: true },
  { key: "contrast-dark", name: "High Contrast Dark", mode: "dark", swatch: ["#FFD21A", "#33B5FF", "#000000"], highContrast: true },
];

export const DEFAULT_THEME = "royal";

export type Density = "compact" | "comfortable" | "spacious";
export const DENSITIES: { key: Density; name: string }[] = [
  { key: "compact", name: "Compact" },
  { key: "comfortable", name: "Comfortable" },
  { key: "spacious", name: "Spacious" },
];

export function isDark(themeKey: string): boolean {
  return THEMES.find((t) => t.key === themeKey)?.mode === "dark";
}
