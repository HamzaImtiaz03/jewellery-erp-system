import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* --------------------------------------------------------------------------
   Formatting helpers — all financial values use tabular figures (.tnum).
   SRS §5.1.2 precision: money numeric(16,2), weight grams numeric(14,3),
   rate numeric(14,4), purity numeric(6,4).
   -------------------------------------------------------------------------- */

export const DEFAULT_CURRENCY = "SAR";

export function formatMoney(
  value: number,
  currency: string = DEFAULT_CURRENCY,
  opts: { compact?: boolean; signed?: boolean } = {}
): string {
  const { compact, signed } = opts;
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
  });
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${formatter.format(value)} ${currency}`;
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Weight in grams — numeric(14,3). */
export function formatGrams(value: number): string {
  return `${formatNumber(value, 3)} g`;
}

/** Carats — numeric(10,3). */
export function formatCarats(value: number): string {
  return `${formatNumber(value, 3)} ct`;
}

/** Rate per gram — numeric(14,4). */
export function formatRate(value: number, currency = DEFAULT_CURRENCY): string {
  return `${formatNumber(value, 2)} ${currency}/g`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
