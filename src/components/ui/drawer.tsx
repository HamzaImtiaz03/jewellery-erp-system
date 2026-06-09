"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./button";

/** Right-side slide-over panel for detail/edit surfaces. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative flex h-full w-full flex-col border-l border-border/60 bg-surface/95 supports-[backdrop-filter]:bg-surface/85 backdrop-blur-2xl shadow-xl rounded-l-3xl overflow-hidden animate-slide-in-right",
          width
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-surface-muted/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Centered modal dialog. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full rounded-3xl border border-border/60 bg-surface/95 supports-[backdrop-filter]:bg-surface/88 backdrop-blur-2xl shadow-xl animate-slide-up",
          size
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
