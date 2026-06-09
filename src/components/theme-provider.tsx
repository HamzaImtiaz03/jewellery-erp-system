"use client";

import * as React from "react";
import { DEFAULT_THEME, type Density } from "@/lib/themes";

/**
 * Client-side resolution of the cascading UI config (SRS L.1.3: user → tenant →
 * system). In this representational build the effective tokens are persisted to
 * localStorage as a stand-in for the DB-backed ui_preference table.
 */
interface UiConfig {
  theme: string;
  density: Density;
  sidebarCollapsed: boolean;
  rtl: boolean;
  radius: number; // px
  branch: string;
}

interface UiContext extends UiConfig {
  setTheme: (t: string) => void;
  setDensity: (d: Density) => void;
  toggleSidebar: () => void;
  setRtl: (v: boolean) => void;
  setRadius: (n: number) => void;
  setBranch: (b: string) => void;
  reset: () => void;
}

const DEFAULTS: UiConfig = {
  theme: DEFAULT_THEME,
  density: "comfortable",
  sidebarCollapsed: false,
  rtl: false,
  radius: 16,
  branch: "Riyadh — Olaya Flagship",
};

const Ctx = React.createContext<UiContext | null>(null);
const STORAGE_KEY = "jwl-erp-ui";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfg] = React.useState<UiConfig>(DEFAULTS);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCfg({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", cfg.theme);
    root.setAttribute("data-density", cfg.density);
    root.setAttribute("dir", cfg.rtl ? "rtl" : "ltr");
    root.style.setProperty("--radius", `${cfg.radius / 16}rem`);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch {}
  }, [cfg, hydrated]);

  const value: UiContext = {
    ...cfg,
    setTheme: (theme) => setCfg((c) => ({ ...c, theme })),
    setDensity: (density) => setCfg((c) => ({ ...c, density })),
    toggleSidebar: () => setCfg((c) => ({ ...c, sidebarCollapsed: !c.sidebarCollapsed })),
    setRtl: (rtl) => setCfg((c) => ({ ...c, rtl })),
    setRadius: (radius) => setCfg((c) => ({ ...c, radius })),
    setBranch: (branch) => setCfg((c) => ({ ...c, branch })),
    reset: () => setCfg(DEFAULTS),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUi() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useUi must be used within ThemeProvider");
  return ctx;
}
