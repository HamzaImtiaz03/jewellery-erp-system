import * as React from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down" | "flat"; good?: boolean };
  icon?: LucideIcon;
  hint?: string;
  /** semantic name (primary/success/…) OR a categorical key (violet/rose/…) OR a raw --c-* var */
  accent?: string;
  className?: string;
}

const HUE: Record<string, string> = {
  primary: "var(--primary)", secondary: "var(--secondary)", accent: "var(--accent)",
  success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)", info: "var(--info)",
  blue: "var(--c-blue)", indigo: "var(--c-indigo)", violet: "var(--c-violet)", purple: "var(--c-purple)",
  pink: "var(--c-pink)", rose: "var(--c-rose)", orange: "var(--c-orange)", amber: "var(--c-amber)",
  lime: "var(--c-lime)", emerald: "var(--c-emerald)", teal: "var(--c-teal)", cyan: "var(--c-cyan)",
  slate: "var(--c-slate)",
};

function resolveHue(accent?: string): string {
  if (!accent) return "var(--primary)";
  if (accent.startsWith("--")) return `var(${accent})`;
  return HUE[accent] ?? "var(--primary)";
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  hint,
  accent = "primary",
  className,
}: StatCardProps) {
  const h = resolveHue(accent);
  const deltaGood = delta?.good ?? delta?.direction === "up";

  return (
    <div
      className={cn(
        "lift group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-4",
        className
      )}
      style={{
        background: `linear-gradient(155deg, hsl(${h} / 0.12), hsl(var(--surface) / 0.58) 62%)`,
        borderColor: `hsl(${h} / 0.22)`,
        boxShadow: `0 10px 30px -16px hsl(${h} / 0.45), 0 2px 8px -5px hsl(var(--shadow-color) / 0.12)`,
      }}
    >
      {/* corner glow */}
      <span
        className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full opacity-60 blur-2xl"
        style={{ background: `hsl(${h} / 0.30)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, hsl(${h} / 0.26), hsl(${h} / 0.08))`,
              color: `hsl(${h})`,
            }}
          >
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className="relative mt-2.5 text-[1.7rem] leading-none font-semibold tracking-tight tnum text-foreground">
        {value}
      </p>
      <div className="relative mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              delta.direction === "flat"
                ? "text-muted-foreground"
                : deltaGood
                ? "text-success"
                : "text-danger"
            )}
          >
            {delta.direction === "up" ? (
              <TrendingUp size={13} />
            ) : delta.direction === "down" ? (
              <TrendingDown size={13} />
            ) : null}
            {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
