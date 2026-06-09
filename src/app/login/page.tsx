import Link from "next/link";
import { ArrowRight, ShieldCheck, Globe, Sparkles } from "lucide-react";
import { BrandMark, BRAND } from "@/components/brand";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: "hsl(var(--sidebar))", color: "hsl(var(--sidebar-foreground))" }}
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex items-center gap-3">
          <BrandMark size={44} />
          <div>
            <p className="text-lg font-semibold text-white tracking-tight">{BRAND.name}</p>
            <p className="text-xs" style={{ color: "hsl(var(--sidebar-muted))" }}>
              Multi-Vertical Enterprise Platform
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight text-white">
            The complete jewellery ERP, built to one source of truth.
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "hsl(var(--sidebar-muted))" }}>
            Tag-level inventory, metal-rate pricing, karigar job-work, dual-ledger
            posting, saving schemes and statutory e-invoicing — engineered for
            financial-grade integrity across every branch.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: ShieldCheck, text: "RBAC, RLS isolation & atomic posting" },
              { icon: Sparkles, text: "Embedded AI assist on every surface" },
              { icon: Globe, text: "Full RTL, 10 themes, ZATCA-ready" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-accent">
                  <f.icon size={16} />
                </span>
                <span style={{ color: "hsl(var(--sidebar-foreground))" }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: "hsl(var(--sidebar-muted))" }}>
          SRS v4.3.1 · Jewellery reference vertical
        </p>
      </div>

      {/* Form */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background px-6 lg:w-1/2">
        <div className="app-ambient" aria-hidden />
        <div className="glass-panel relative w-full max-w-sm rounded-3xl border border-border/60 p-8 shadow-xl">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandMark size={38} />
            <p className="text-lg font-semibold tracking-tight">{BRAND.name}</p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your Aurum Jewellers workspace.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium">Email</label>
              <input
                type="email"
                defaultValue="danish@aurum.sa"
                className="h-10 rounded-xl border border-input bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium">Password</label>
                <a className="text-[12px] text-accent hover:underline" href="#">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                defaultValue="••••••••••"
                className="h-10 rounded-xl border border-input bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Link
              href="/dashboard"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in <ArrowRight size={15} />
            </Link>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-input bg-surface text-sm font-medium transition-colors hover:bg-muted">
              <ShieldCheck size={15} /> Continue with SSO
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Protected by enterprise SSO &amp; MFA · Branch-scoped access
          </p>
        </div>
      </div>
    </div>
  );
}
