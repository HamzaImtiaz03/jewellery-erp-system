"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
}
const Ctx = React.createContext<TabsCtx | null>(null);

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <Ctx.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 border-b border-border w-full",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  count,
}: {
  value: string;
  children: React.ReactNode;
  count?: number;
}) {
  const ctx = React.useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "relative -mb-px inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors border-b-2",
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] tnum font-semibold",
            active ? "bg-accent-muted text-accent" : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className={cn("animate-fade-in", className)}>{children}</div>;
}
