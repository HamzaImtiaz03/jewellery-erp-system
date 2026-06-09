import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function THead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-border bg-surface-muted/60 text-xs uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function TBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-border", className)} {...props} />
  );
}

export function TR({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-muted/40", className)}
      {...props}
    />
  );
}

export function TH({
  className,
  align,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  return (
    <th
      className={cn(
        "px-4 font-semibold text-[11px] whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        !align && "text-left",
        className
      )}
      style={{ height: "var(--row-h)" }}
      {...props}
    />
  );
}

export function TD({
  className,
  align,
  mono,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        mono && "tnum",
        className
      )}
      style={{ paddingTop: "var(--cell-py)", paddingBottom: "var(--cell-py)" }}
      {...props}
    />
  );
}
