import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Brand identity — single source of truth (SRS §2.2).
 * "Ophir": the ancient land famed for the finest gold (Solomon's gold, ~1000 BCE),
 * tied to the Arabian / Red Sea trade routes. Swap `NAME` here to re-brand globally.
 */
export const BRAND = {
  name: "Ophir",
  product: "Ophir ERP",
  tagline: "Jewellery Cloud",
  /** the demo tenant (a business using the SaaS) */
  workspace: "Aurum Jewellers",
  plan: "Enterprise",
};

/** Faceted-gem emblem rendered as crisp inline SVG (hook-free → server-safe). */
export function GemGlyph({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ophir-gold" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBE3A1" />
          <stop offset="0.42" stopColor="#EBB24A" />
          <stop offset="1" stopColor="#B97E22" />
        </linearGradient>
      </defs>
      {/* outline */}
      <path d="M6 4 H18 L21.6 9 L12 20.6 L2.4 9 Z" fill="url(#ophir-gold)" />
      {/* facet lines */}
      <g stroke="#6E4A12" strokeOpacity="0.38" strokeWidth="0.6" strokeLinejoin="round">
        <path d="M2.4 9 H21.6" />
        <path d="M6 4 L9 9 L12 20.6 L15 9 L18 4" />
        <path d="M9 9 H15" />
        <path d="M2.4 9 L9 9 M21.6 9 L15 9" />
      </g>
      {/* table highlight */}
      <path d="M9 9 L10.5 5 H13.5 L15 9 Z" fill="#FFFFFF" fillOpacity="0.22" />
    </svg>
  );
}

/** The square brand mark (emblem on an obsidian tile). Fixed colours = real logo. */
export function BrandMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl shadow-md ring-1 ring-white/10",
        className
      )}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(120% 120% at 30% 20%, #243056, #11172b 70%)",
        boxShadow:
          "0 6px 18px -6px rgba(201,141,40,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <GemGlyph size={Math.round(size * 0.56)} />
    </span>
  );
}

/** Wordmark — "Ophir" with a refined subtitle. */
export function Wordmark({
  subtitle = BRAND.tagline,
  className,
  light,
}: {
  subtitle?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          light ? "text-white" : "text-foreground"
        )}
      >
        {BRAND.name}
      </span>
      <span
        className={cn(
          "mt-1 text-[10px] uppercase tracking-[0.16em]",
          light ? "text-white/55" : "text-muted-foreground"
        )}
      >
        {subtitle}
      </span>
    </span>
  );
}
