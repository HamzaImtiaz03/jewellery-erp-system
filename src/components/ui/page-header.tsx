import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  meta,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {description}
          </p>
        )}
        {meta && <div className="mt-2.5 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/** Two-column key/value list for detail surfaces. */
export function DescriptionList({
  items,
  cols = 2,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const grid = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[cols];
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4", grid, className)}>
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {it.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground break-words">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
