"use client";

import Link from "next/link";
import {
  Banknote,
  TrendingUp,
  Scale,
  Receipt,
  Gem,
  ArrowUpRight,
  Plus,
  Settings2,
  ShoppingCart,
  Truck,
  Boxes,
  Landmark,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/feedback";
import { TrendArea, Bars, Donut, PIE_COLORS } from "@/components/dashboard/charts";
import {
  salesTrend,
  salesByCategory,
  metalByPurity,
  channelMix,
  recentActivity,
  alerts,
  metalRates,
} from "@/lib/data/dashboard";
import { formatGrams, formatMoney, relativeTime, formatRate } from "@/lib/utils";

const quickActions = [
  { label: "New Sale", href: "/sales/pos", icon: ShoppingCart },
  { label: "New Purchase", href: "/procurement/orders", icon: Truck },
  { label: "Add Item", href: "/inventory/items", icon: Boxes },
  { label: "New Journal", href: "/finance/journals", icon: Landmark },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Hero band */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 p-6 sm:p-7 shadow-glass"
        style={{
          background:
            "radial-gradient(120% 140% at 0% 0%, hsl(var(--primary) / 0.14), transparent 55%), radial-gradient(120% 140% at 100% 0%, hsl(var(--accent) / 0.14), transparent 55%), hsl(var(--surface) / 0.7)",
        }}
      >
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="primary" dot>Riyadh — Olaya Flagship</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date("2026-06-09").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
            <h1 className="mt-3 text-[1.7rem] font-semibold tracking-tight">
              Good morning, Danish 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Here is the consolidated picture across your showrooms — sales are
              up <span className="font-medium text-success">12.4%</span> against
              last year.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" icon={Settings2}>
              Customize
            </Button>
            <Button size="sm" icon={Plus}>
              Quick action
            </Button>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net Sales (MTD)"
          value={formatMoney(6815000, "SAR", { compact: true })}
          delta={{ value: "+12.4% vs LY", direction: "up" }}
          icon={Banknote}
          accent="blue"
        />
        <StatCard
          label="Gross Profit (MTD)"
          value={formatMoney(1742000, "SAR", { compact: true })}
          delta={{ value: "+8.1% · 25.6% margin", direction: "up" }}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Metal Position (Fine)"
          value={formatGrams(86200)}
          delta={{ value: "Long 1,240g vs hedge", direction: "up", good: false }}
          icon={Scale}
          accent="amber"
        />
        <StatCard
          label="Invoices Today"
          value="218"
          delta={{ value: "+34 vs avg", direction: "up" }}
          icon={Receipt}
          accent="violet"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Net revenue this year vs last year</CardDescription>
            </div>
            <Badge tone="success" dot>+12.4% YoY</Badge>
          </CardHeader>
          <CardContent>
            <TrendArea data={salesTrend} dataKey="revenue" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Live Metal Rates</CardTitle>
              <CardDescription>JWL-RATE · locked 09:05 GST</CardDescription>
            </div>
            <Link href="/jewellery/rates">
              <Button variant="ghost" size="xs" iconRight={ArrowUpRight}>
                Rates
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {metalRates.map((r) => (
                <div key={r.metal + r.purity} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-muted text-accent">
                      <Gem size={14} />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[13px] font-medium">{r.metal}</p>
                      <p className="text-[11px] text-muted-foreground">{r.purity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold tnum">{formatRate(r.rate)}</p>
                    <p className={`text-[11px] tnum ${r.change >= 0 ? "text-success" : "text-danger"}`}>
                      {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars data={salesByCategory} dataKey="value" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metal Stock by Purity</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={metalByPurity} dataKey="value" nameKey="name" />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {metalByPurity.map((m, i) => (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground flex-1 truncate">{m.name}</span>
                  <span className="tnum font-medium">{(m.value / 1000).toFixed(1)}k g</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={channelMix} dataKey="value" nameKey="name" />
            <div className="mt-3 space-y-1.5">
              {channelMix.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground flex-1">{c.name}</span>
                  <span className="tnum font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + alerts + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/sales/invoices">
              <Button variant="ghost" size="xs" iconRight={ArrowUpRight}>
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium tnum">{a.id}</span>
                      <Badge tone="neutral">{a.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.party}</p>
                  </div>
                  <span className="text-[13px] font-medium tnum hidden sm:block">{a.amount}</span>
                  <StatusBadge status={a.status} />
                  <span className="text-[11px] text-muted-foreground w-16 text-right hidden md:block">
                    {relativeTime(a.time)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Exceptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {alerts.map((al, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      al.tone === "danger" ? "bg-danger" : al.tone === "warning" ? "bg-warning" : "bg-info"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[12.5px] leading-snug">{al.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">SRS {al.srs}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
              {quickActions.map((qa) => (
                <Link
                  key={qa.href}
                  href={qa.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center transition-colors hover:border-accent hover:bg-accent-muted/30"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary">
                    <qa.icon size={17} />
                  </span>
                  <span className="text-[12px] font-medium">{qa.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent-muted/50 to-surface border-accent/20">
            <CardContent className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shrink-0">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="text-[13px] font-semibold">Ask Ophir AI</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  “Show top 5 slow-moving 22K items in Jeddah” — query your data in
                  natural language.
                </p>
                <Link href="/intelligence/ai-chat">
                  <Button variant="accent" size="xs" className="mt-2.5" iconRight={ArrowUpRight}>
                    Open AI Data Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
