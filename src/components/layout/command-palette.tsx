"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CornerDownLeft,
  Mic,
  Upload,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { NAV, QUICK_ACTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface Flat {
  label: string;
  href: string;
  group: string;
}

const FLAT: Flat[] = NAV.flatMap((s) =>
  s.items.flatMap((it) => [
    { label: it.label, href: it.href, group: s.label },
    ...(it.children ?? []).map((c) => ({
      label: c.label,
      href: c.href,
      group: it.label,
    })),
  ])
);

/**
 * Unified command palette + embedded AI assist (SRS Appendix L.3).
 * One surface offering text / voice / document modes — AI produces a draft for
 * review; nothing posts unattended (AI-F14). Here it is representational.
 */
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [aiMode, setAiMode] = React.useState<"idle" | "listening" | "processing">(
    "idle"
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setAiMode("idle");
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const results = React.useMemo(() => {
    if (!q.trim()) return FLAT.slice(0, 7);
    const s = q.toLowerCase();
    return FLAT.filter((f) => f.label.toLowerCase().includes(s)).slice(0, 8);
  }, [q]);

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  const looksLikeNL = q.trim().split(" ").length >= 3;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 shadow-xl animate-slide-up">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search modules, or ask AI to fill a form…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border px-1.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* AI mode bar (SRS L.3.1: three input modes, one surface) */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-muted/40 px-4 py-2">
          <span className="text-[11px] font-medium text-muted-foreground">AI Assist</span>
          <button
            onClick={() => setAiMode("listening")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              aiMode === "listening"
                ? "bg-danger-muted text-danger"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Mic size={13} />
            Voice
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Upload size={13} />
            Document
          </button>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Provider: ANTHROPIC · drafts require confirmation
          </span>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {looksLikeNL && (
            <button
              onClick={() => setAiMode("processing")}
              className="mb-1 flex w-full items-start gap-3 rounded-lg border border-accent/30 bg-accent-muted/40 px-3 py-2.5 text-left transition-colors hover:bg-accent-muted"
            >
              <Sparkles size={16} className="mt-0.5 text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium">
                  Parse with AI →{" "}
                  <span className="text-muted-foreground font-normal">
                    “{q}”
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Produces an editable draft mapped to the relevant form. You
                  confirm before anything is saved.
                </p>
              </div>
            </button>
          )}

          {results.length > 0 && (
            <>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Navigate
              </p>
              {results.map((r) => (
                <button
                  key={r.href}
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted"
                >
                  <span className="text-[13px] font-medium">{r.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {r.group}
                  </span>
                  <ArrowRight size={13} className="ml-auto text-muted-foreground" />
                </button>
              ))}
            </>
          )}

          {!q && (
            <>
              <p className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Quick actions
              </p>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.href}
                  onClick={() => go(a.href)}
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted"
                >
                  <a.icon size={15} className="text-muted-foreground" />
                  <span className="text-[13px] font-medium">{a.label}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft size={12} /> to select
          </span>
          <span>↑↓ to navigate</span>
          <span className="ml-auto inline-flex items-center gap-1">
            <Sparkles size={12} className="text-accent" /> AI never auto-posts
            (AI-F14)
          </span>
        </div>
      </div>
    </div>
  );
}
