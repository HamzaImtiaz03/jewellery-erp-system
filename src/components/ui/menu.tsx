"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/** Minimal click-to-open dropdown menu (no external deps). */
export function Menu({
  trigger,
  children,
  align = "end",
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      {open && (
        <div
          className={cn(
            "glass-strong absolute top-full z-50 mt-2 min-w-[210px] rounded-2xl border border-border/60 p-1.5 shadow-popover animate-slide-up",
            align === "end" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  icon: Icon,
  children,
  onClick,
  danger,
  shortcut,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  shortcut?: string;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors text-left",
        danger
          ? "text-danger hover:bg-danger-muted"
          : "text-surface-foreground hover:bg-muted"
      )}
    >
      {Icon && <Icon size={15} className="shrink-0 opacity-80" />}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="text-[10px] text-muted-foreground tnum">{shortcut}</span>
      )}
    </button>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
