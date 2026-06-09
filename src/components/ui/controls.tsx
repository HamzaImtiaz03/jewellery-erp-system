"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-muted p-0.5",
        size === "sm" ? "text-xs" : "text-[13px]"
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5",
            value === opt.value
              ? "bg-surface text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
          checked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-input bg-surface"
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      {label && <span className="text-[13px] text-foreground">{label}</span>}
    </label>
  );
}
