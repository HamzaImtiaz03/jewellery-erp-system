import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost"
  | "danger"
  | "subtle";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm shadow-accent/25",
  outline:
    "border border-border/70 bg-surface/70 backdrop-blur-sm text-surface-foreground hover:bg-muted hover:border-border",
  ghost: "text-surface-foreground hover:bg-muted",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm shadow-danger/20",
  subtle: "bg-muted text-foreground hover:bg-muted/70",
};

const SIZES: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5 rounded-lg",
  sm: "h-8 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-6 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", icon: Icon, iconRight: IconRight, children, ...props },
    ref
  ) => {
    const iconSize = size === "xs" || size === "sm" ? 14 : 16;
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {Icon && <Icon size={iconSize} className="shrink-0" />}
        {children}
        {IconRight && <IconRight size={iconSize} className="shrink-0" />}
      </button>
    );
  }
);
Button.displayName = "Button";

/** Square icon-only button. */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "size"> & { label: string }
>(({ icon: Icon, label, variant = "ghost", className, ...props }, ref) => (
  <button
    ref={ref}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      VARIANTS[variant],
      className
    )}
    {...props}
  >
    {Icon && <Icon size={17} />}
  </button>
));
IconButton.displayName = "IconButton";
