import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary-muted text-primary ring-primary/20",
  accent: "bg-accent-muted text-accent ring-accent/25",
  success: "bg-success-muted text-success ring-success/25",
  warning: "bg-warning-muted text-warning ring-warning/30",
  danger: "bg-danger-muted text-danger ring-danger/25",
  info: "bg-info-muted text-info ring-info/25",
};

export function Badge({
  tone = "neutral",
  className,
  dot,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

/**
 * Status → tone mapping for every SRS lifecycle enum (§9 / §10).
 * Centralized so status coloring is consistent across all modules (§2.2).
 */
const STATUS_TONE: Record<string, Tone> = {
  // Generic
  ACTIVE: "success", INACTIVE: "neutral", BLOCKED: "danger", DISABLED: "neutral",
  DRAFT: "neutral", PENDING: "warning", APPROVED: "info", REJECTED: "danger",
  OPEN: "info", CLOSED: "neutral", PROVISIONING: "warning", SUSPENDED: "danger",
  ARCHIVED: "neutral", INVITED: "info",
  // InvoiceStatus
  CONFIRMED: "info", PAID: "success", PARTIALLY_PAID: "warning", VOID: "danger",
  RETURNED: "accent",
  // TagStatus
  IN_STOCK: "success", RESERVED: "warning", SOLD: "neutral", IN_TRANSIT: "info",
  WITH_KARIGAR: "accent", MELTED: "danger", WITH_ALTERATION: "warning",
  // JournalStatus
  POSTED: "success", REVERSED: "danger",
  // PaymentStatus
  CAPTURED: "success", FAILED: "danger", REFUNDED: "accent",
  // JobCardStatus
  ISSUED: "info", IN_PROGRESS: "warning", RECEIVED: "info", RECONCILED: "success",
  // SchemeStatus
  MATURED: "success", CLOSED_EARLY: "warning", DEFAULTED: "danger",
  // Day-close
  RECONCILED_DAY: "info", RE_OPENED: "warning",
  // PO
  PARTIALLY_RECEIVED: "warning", BILLED: "success",
  // QA / generic risk
  DONE: "success", VERIFIED: "success", AWAITING_HUMAN_VERIFICATION: "info",
  NOT_STARTED: "neutral", BLOCKED_STATUS: "danger",
  HIGH: "danger", MEDIUM: "warning", LOW: "success", CRITICAL: "danger",
  CLEARED: "success", FLAGGED: "warning", ESCALATED: "danger",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = STATUS_TONE[status.toUpperCase()] ?? "neutral";
  const label = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge tone={tone} dot className={className}>
      {label}
    </Badge>
  );
}
