import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const fieldBase =
  "w-full rounded-xl border border-border/70 bg-surface/70 supports-[backdrop-filter]:bg-surface/60 backdrop-blur-sm text-sm text-surface-foreground placeholder:text-muted-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-ring/60 focus-visible:bg-surface disabled:cursor-not-allowed disabled:opacity-60";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, ...props }, ref) => {
    if (Icon) {
      return (
        <div className="relative">
          <Icon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={ref}
            className={cn(fieldBase, "h-10 pl-9 pr-3", className)}
            {...props}
          />
        </div>
      );
    }
    return (
      <input ref={ref} className={cn(fieldBase, "h-10 px-3", className)} {...props} />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-[80px] px-3 py-2 resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        fieldBase,
        "h-10 pl-3 pr-8 appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
));
Select.displayName = "Select";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn("text-[13px] font-medium text-foreground", className)}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
