"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeft,
  Search,
  Bell,
  Sparkles,
  Palette,
  ChevronRight,
  Building2,
  Check,
  LogOut,
  User,
  Settings,
  LifeBuoy,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTE_INDEX } from "@/lib/nav";
import { useUi } from "@/components/theme-provider";
import { IconButton, Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "./command-palette";
import { AppearancePanel } from "./appearance-panel";
import { BRAND } from "@/components/brand";

const BRANCHES = [
  "Riyadh — Olaya Flagship",
  "Riyadh — Granada Mall",
  "Jeddah — Tahlia",
  "Dammam — Corniche",
  "All Branches (Consolidated)",
];

export function Topbar() {
  const pathname = usePathname();
  const ui = useUi();
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [appearanceOpen, setAppearanceOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const meta = ROUTE_INDEX[pathname];

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/40 bg-surface/65 supports-[backdrop-filter]:bg-surface/55 px-3 backdrop-blur-2xl backdrop-saturate-150 sm:px-4">
        <IconButton
          icon={PanelLeft}
          label="Toggle sidebar"
          onClick={ui.toggleSidebar}
          className="hidden lg:inline-flex"
        />

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
          <Link
            href="/dashboard"
            className="font-medium text-foreground/80 hover:text-foreground transition-colors shrink-0"
          >
            {BRAND.name}
          </Link>
          {meta?.parent && (
            <>
              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              <Link
                href={meta.parent.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {meta.parent.label}
              </Link>
            </>
          )}
          {meta && (
            <>
              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground truncate">
                {meta.label}
              </span>
            </>
          )}
        </nav>

        {/* Search trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          className="ml-auto flex h-9 items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3.5 text-sm text-muted-foreground transition-all hover:bg-muted hover:border-border sm:min-w-[280px]"
        >
          <Search size={15} />
          <span className="hidden sm:inline">Search or ask AI…</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/70 bg-surface/60 px-1.5 py-0.5 text-[10px]">
            <Command size={10} />K
          </kbd>
        </button>

        {/* AI assist */}
        <IconButton
          icon={Sparkles}
          label="AI Assist"
          onClick={() => setCmdOpen(true)}
          className="text-accent"
        />

        {/* Branch switcher */}
        <Menu
          align="end"
          trigger={
            <Button variant="outline" size="sm" icon={Building2} className="hidden sm:inline-flex max-w-[180px]">
              <span className="truncate">{ui.branch.split(" — ")[0]}</span>
            </Button>
          }
        >
          <MenuLabel>Active branch</MenuLabel>
          {BRANCHES.map((b) => (
            <MenuItem
              key={b}
              icon={ui.branch === b ? Check : undefined}
              onClick={() => ui.setBranch(b)}
            >
              {b}
            </MenuItem>
          ))}
        </Menu>

        {/* Notifications */}
        <Menu
          align="end"
          className="w-80"
          trigger={
            <span className="relative inline-flex">
              <IconButton icon={Bell} label="Notifications" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
            </span>
          }
        >
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-[13px] font-semibold">Notifications</span>
            <Badge tone="danger">4 new</Badge>
          </div>
          <MenuSeparator />
          {NOTIFS.map((n, i) => (
            <div key={i} className="flex gap-2.5 px-2.5 py-2 hover:bg-muted rounded-md">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  n.tone === "danger" && "bg-danger",
                  n.tone === "warning" && "bg-warning",
                  n.tone === "info" && "bg-info",
                  n.tone === "success" && "bg-success"
                )}
              />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium leading-tight">{n.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </Menu>

        {/* Appearance */}
        <IconButton
          icon={Palette}
          label="Appearance"
          onClick={() => setAppearanceOpen(true)}
        />

        {/* User menu */}
        <Menu
          align="end"
          className="w-56"
          trigger={
            <button className="ml-0.5 inline-flex items-center gap-2 rounded-full transition-opacity hover:opacity-90">
              <Avatar name="Danish Hakeem" size="sm" />
            </button>
          }
        >
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-semibold">Danish Hakeem</p>
            <p className="text-[11px] text-muted-foreground">Controller · {BRAND.workspace}</p>
          </div>
          <MenuSeparator />
          <MenuItem icon={User}>My profile</MenuItem>
          <MenuItem icon={Settings}>Preferences</MenuItem>
          <MenuItem icon={Palette} onClick={() => setAppearanceOpen(true)}>
            Appearance
          </MenuItem>
          <MenuItem icon={LifeBuoy}>Help & support</MenuItem>
          <MenuSeparator />
          <MenuItem icon={LogOut} danger>
            Sign out
          </MenuItem>
        </Menu>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <AppearancePanel
        open={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
      />
    </>
  );
}

const NOTIFS: { title: string; time: string; tone: string }[] = [
  { title: "Gold 22K rate updated to 245.80 SAR/g", time: "5 minutes ago", tone: "info" },
  { title: "Karigar job KJ-2041 overdue by 2 days", time: "1 hour ago", tone: "warning" },
  { title: "High-value sale flagged for AML review", time: "2 hours ago", tone: "danger" },
  { title: "Day-close reconciled for Olaya branch", time: "Yesterday", tone: "success" },
];
