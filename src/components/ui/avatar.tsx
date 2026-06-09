import * as React from "react";
import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/utils";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

// Deterministic tone from name so avatars are stable & varied.
const TONES = [
  "bg-primary-muted text-primary",
  "bg-accent-muted text-accent",
  "bg-success-muted text-success",
  "bg-info-muted text-info",
  "bg-warning-muted text-warning",
];

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const tone =
    TONES[
      Math.abs(
        name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      ) % TONES.length
    ];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-border/50 shrink-0",
        SIZES[size],
        tone,
        className
      )}
      aria-hidden
    >
      {toInitials(name)}
    </span>
  );
}
