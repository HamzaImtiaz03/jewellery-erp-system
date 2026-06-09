"use client";

import * as React from "react";
import { Check, RotateCcw } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch, SegmentedControl } from "@/components/ui/controls";
import { THEMES, DENSITIES } from "@/lib/themes";
import { useUi } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/** Appearance settings (SRS Appendix L.1) — theme, density, shape, layout, RTL. */
export function AppearancePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ui = useUi();
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Appearance"
      description="Personal UI configuration — persisted to your profile (SRS L.1.3)."
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={ui.reset}>
            Reset to default
          </Button>
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-7">
        <section>
          <h3 className="text-[13px] font-semibold mb-3">Base theme</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => ui.setTheme(t.key)}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                  ui.theme === t.key
                    ? "border-accent ring-1 ring-accent"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <span className="flex -space-x-1.5">
                  {t.swatch.map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full ring-2 ring-surface"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-[12px] font-medium leading-tight">
                  {t.name}
                </span>
                {ui.theme === t.key && <Check size={14} className="text-accent" />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold mb-3">Density</h3>
          <SegmentedControl
            options={DENSITIES.map((d) => ({ value: d.key, label: d.name }))}
            value={ui.density}
            onChange={ui.setDensity}
          />
        </section>

        <section>
          <h3 className="text-[13px] font-semibold mb-3">Corner radius</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={ui.radius}
              onChange={(e) => ui.setRadius(Number(e.target.value))}
              className="flex-1 accent-[hsl(var(--primary))]"
            />
            <span className="tnum text-xs text-muted-foreground w-10 text-right">
              {ui.radius}px
            </span>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold">Layout</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Right-to-left (Arabic)</p>
              <p className="text-xs text-muted-foreground">
                Mirror the entire interface (UI-F08)
              </p>
            </div>
            <Switch checked={ui.rtl} onChange={ui.setRtl} label="RTL" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Collapsed sidebar</p>
              <p className="text-xs text-muted-foreground">Icon-only navigation rail</p>
            </div>
            <Switch
              checked={ui.sidebarCollapsed}
              onChange={() => ui.toggleSidebar()}
              label="Collapse sidebar"
            />
          </div>
        </section>
      </div>
    </Drawer>
  );
}
