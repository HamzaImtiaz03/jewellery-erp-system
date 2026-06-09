"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronsUpDown, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV, type NavItem } from "@/lib/nav";
import { useUi } from "@/components/theme-provider";
import { Tooltip } from "@/components/ui/feedback";
import { Menu, MenuItem, MenuLabel } from "@/components/ui/menu";
import { BrandMark, Wordmark } from "@/components/brand";
import { hueVar, hsl } from "@/lib/module-colors";

const WORKSPACES = [
  { name: "Aurum Jewellers", plan: "Enterprise", domain: "Jewellery" },
  { name: "Zahra Gold House", plan: "Growth", domain: "Jewellery" },
  { name: "Noor Diamonds", plan: "Enterprise", domain: "Jewellery" },
];

const ALL_ITEMS = NAV.flatMap((s) => s.items);

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, branch } = useUi();
  const [ws, setWs] = React.useState(WORKSPACES[0]);

  // Which top-level item owns the current route.
  const activeItemId = React.useMemo(() => {
    const hit = ALL_ITEMS.find(
      (it) => pathname === it.href || pathname.startsWith(it.href + "/")
    );
    return hit?.id ?? null;
  }, [pathname]);

  // Single-open accordion: only one group expanded at a time.
  const [openId, setOpenId] = React.useState<string | null>(activeItemId);
  React.useEffect(() => {
    if (activeItemId) setOpenId(activeItemId);
  }, [activeItemId]);

  return (
    <aside
      className={cn(
        "relative z-20 hidden lg:flex flex-col shrink-0 border-r border-border/50",
        "bg-surface/65 supports-[backdrop-filter]:bg-surface/45 backdrop-blur-2xl backdrop-saturate-150",
        "transition-[width] duration-200",
        sidebarCollapsed ? "w-[72px]" : "w-[264px]"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center gap-2.5 px-4 shrink-0", sidebarCollapsed && "justify-center px-0")}>
        <BrandMark size={sidebarCollapsed ? 34 : 38} />
        {!sidebarCollapsed && <Wordmark />}
      </div>

      {/* Workspace switcher (multi-business SaaS) */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <Menu
            align="start"
            className="w-60"
            trigger={
              <button className="flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-surface/60 px-2.5 py-2 text-left transition-colors hover:bg-muted/60">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{ws.name}</span>
                  <span className="block text-[10.5px] text-muted-foreground">{ws.plan} · {ws.domain}</span>
                </span>
                <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
              </button>
            }
          >
            <MenuLabel>Switch workspace</MenuLabel>
            {WORKSPACES.map((w) => (
              <MenuItem key={w.name} icon={ws.name === w.name ? Check : Building2} onClick={() => setWs(w)}>
                <span className="flex flex-col">
                  <span className="text-[13px]">{w.name}</span>
                  <span className="text-[10.5px] text-muted-foreground">{w.plan}</span>
                </span>
              </MenuItem>
            ))}
          </Menu>
        </div>
      )}

      {/* Nav — single flat list, single-open accordion */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        <ul className="space-y-0.5">
          {ALL_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              expanded={openId === item.id}
              onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="shrink-0 border-t border-border/50 px-5 py-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            <span className="truncate">{branch.split(" — ")[0]} · v4.3.1</span>
          </div>
        </div>
      )}
    </aside>
  );
}

function SidebarItem({
  item,
  pathname,
  collapsed,
  expanded,
  onToggle,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const isActiveSection = pathname === item.href || pathname.startsWith(item.href + "/");
  const hue = hueVar(item.id);

  // ---- Collapsed: icon-only rail ----
  if (collapsed) {
    return (
      <li>
        <Tooltip label={item.label} side="right">
          <Link
            href={hasChildren ? item.children![0].href : item.href}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted/70"
            style={{
              background: isActiveSection ? hsl(hue, 0.16) : undefined,
              color: hsl(hue),
            }}
          >
            <Icon size={18} />
          </Link>
        </Tooltip>
      </li>
    );
  }

  const Tile = (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0"
      style={{
        background: hsl(hue, isActiveSection ? 0.18 : 0.1),
        color: hsl(hue),
      }}
    >
      <Icon size={16} />
    </span>
  );

  // ---- Leaf (no children) ----
  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/55"
          style={isActiveSection ? { background: hsl(hue, 0.1), color: hsl(hue) } : undefined}
        >
          {Tile}
          {item.label}
        </Link>
      </li>
    );
  }

  // ---- Group (with children) — controlled single-open accordion ----
  return (
    <li>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/55"
        style={isActiveSection && !expanded ? { background: hsl(hue, 0.07) } : undefined}
      >
        {Tile}
        <span className="flex-1 text-left">{item.label}</span>
        {isActiveSection && !expanded && (
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: hsl(hue) }} />
        )}
        <ChevronRight size={14} className={cn("text-muted-foreground transition-transform duration-200", expanded && "rotate-90")} />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <ul className="overflow-hidden pl-3.5 mt-0.5">
          {item.children!.map((leaf) => {
            const active = pathname === leaf.href;
            return (
              <li key={leaf.href}>
                <Link
                  href={leaf.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors",
                    active ? "font-medium" : "text-muted-foreground hover:bg-muted/55 hover:text-foreground"
                  )}
                  style={active ? { background: hsl(hue, 0.1), color: hsl(hue) } : undefined}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-colors", !active && "bg-muted-foreground/30")}
                    style={active ? { background: hsl(hue) } : undefined}
                  />
                  <span className="truncate">{leaf.label}</span>
                  {leaf.badge && (
                    <span className="ml-auto rounded-full bg-accent/15 px-1.5 text-[10px] font-semibold text-accent tnum">
                      {leaf.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
