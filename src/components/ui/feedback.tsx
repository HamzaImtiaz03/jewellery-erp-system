import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}

export function Separator({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
    />
  );
}

export function ProgressBar({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Lightweight CSS tooltip. */
export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "right" | "left";
}) {
  const pos: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  };
  return (
    <span className="relative inline-flex group/tt">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover/tt:opacity-100",
          pos[side]
        )}
      >
        {label}
      </span>
    </span>
  );
}
