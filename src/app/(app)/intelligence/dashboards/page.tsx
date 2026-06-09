"use client";

import * as React from "react";
import { LayoutGrid, Plus, Pencil, Save, GripVertical, BarChart3, PieChart, TrendingUp, Table2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendArea, Bars, Donut, PIE_COLORS } from "@/components/dashboard/charts";
import { salesTrend, salesByCategory, channelMix, metalByPurity } from "@/lib/data/dashboard";

const SURFACES = [
  { key: "EXECUTIVE", label: "Executive" },
  { key: "SALES", label: "Sales" },
  { key: "FINANCE", label: "Finance" },
  { key: "INVENTORY", label: "Inventory" },
];

// Widget registry (SRS §5.8 widget / supported_views / surfaces)
const WIDGET_LIBRARY = [
  { key: "sales_trend", title: "Sales Trend", view: "LINE", icon: TrendingUp },
  { key: "sales_by_category", title: "Sales by Category", view: "BAR", icon: BarChart3 },
  { key: "metal_position", title: "Metal Position", view: "PIE", icon: PieChart },
  { key: "channel_mix", title: "Channel Mix", view: "PIE", icon: PieChart },
  { key: "top_items", title: "Top Items", view: "TABLE", icon: Table2 },
];

export default function DashboardsPage() {
  const [surface, setSurface] = React.useState("EXECUTIVE");
  const [editing, setEditing] = React.useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Configurable Dashboards"
        description="Per-surface widget layouts from the widget registry — saved per user with a domain preset fallback (SRS §5.8 / L.2)."
        actions={
          editing ? (
            <Button size="sm" icon={Save} onClick={() => setEditing(false)}>Save Layout</Button>
          ) : (
            <>
              <Button variant="outline" size="sm" icon={Plus}>Add Widget</Button>
              <Button size="sm" icon={Pencil} onClick={() => setEditing(true)}>Edit Layout</Button>
            </>
          )
        }
      />

      {/* Surface switcher */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-lg bg-muted p-0.5">
          {SURFACES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSurface(s.key)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                surface === s.key ? "bg-surface text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Badge tone="neutral" className="gap-1.5"><LayoutGrid size={12} /> {surface} surface · 6 widgets</Badge>
      </div>

      {editing && (
        <Card className="border-dashed border-accent/40 bg-accent-muted/20">
          <CardContent className="py-3">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Widget Library</p>
            <div className="flex flex-wrap gap-2">
              {WIDGET_LIBRARY.map((w) => (
                <button key={w.key} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium hover:border-accent">
                  <w.icon size={14} className="text-accent" /> {w.title}
                  <Badge tone="neutral" className="ml-1">{w.view}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI widgets */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <WidgetFrame editing={editing}><StatCard label="Net Sales (MTD)" value="6.82M SAR" delta={{ value: "+12.4%", direction: "up" }} accent="primary" /></WidgetFrame>
        <WidgetFrame editing={editing}><StatCard label="Gross Margin" value="25.6%" delta={{ value: "+0.8%", direction: "up" }} accent="success" /></WidgetFrame>
        <WidgetFrame editing={editing}><StatCard label="Inventory Value" value="21.1M SAR" accent="accent" /></WidgetFrame>
        <WidgetFrame editing={editing}><StatCard label="Avg. Basket" value="31,260 SAR" delta={{ value: "+4.1%", direction: "up" }} accent="info" /></WidgetFrame>
      </div>

      {/* Chart widgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetFrame editing={editing} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Sales Trend</CardTitle><Badge tone="neutral">LINE</Badge></CardHeader>
            <CardContent><TrendArea data={salesTrend} dataKey="revenue" /></CardContent>
          </Card>
        </WidgetFrame>
        <WidgetFrame editing={editing}>
          <Card>
            <CardHeader><CardTitle>Metal Position</CardTitle><Badge tone="neutral">PIE</Badge></CardHeader>
            <CardContent><Donut data={metalByPurity} dataKey="value" nameKey="name" /></CardContent>
          </Card>
        </WidgetFrame>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetFrame editing={editing}>
          <Card>
            <CardHeader><CardTitle>Sales by Category</CardTitle><Badge tone="neutral">BAR</Badge></CardHeader>
            <CardContent><Bars data={salesByCategory} dataKey="value" height={200} /></CardContent>
          </Card>
        </WidgetFrame>
        <WidgetFrame editing={editing}>
          <Card>
            <CardHeader><CardTitle>Channel Mix</CardTitle><Badge tone="neutral">PIE</Badge></CardHeader>
            <CardContent>
              <Donut data={channelMix} dataKey="value" nameKey="name" height={160} />
              <div className="mt-2 space-y-1">
                {channelMix.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1 text-muted-foreground">{c.name}</span>
                    <span className="tnum font-medium">{c.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </WidgetFrame>
        <WidgetFrame editing={editing}>
          <Card>
            <CardHeader><CardTitle>Comparison</CardTitle><Badge tone="neutral">VALUE</Badge></CardHeader>
            <CardContent className="space-y-3">
              {[
                { l: "This Month", v: "6.82M", d: "+12.4%" },
                { l: "Last Month", v: "6.24M", d: "+3.1%" },
                { l: "This Year", v: "34.2M", d: "+18.6%" },
              ].map((x) => (
                <div key={x.l} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-[13px] text-muted-foreground">{x.l}</span>
                  <span className="flex items-center gap-2">
                    <span className="tnum font-semibold">{x.v}</span>
                    <Badge tone="success">{x.d}</Badge>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </WidgetFrame>
      </div>
    </div>
  );
}

function WidgetFrame({ editing, children, className }: { editing: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", editing && "ring-2 ring-dashed ring-accent/40 rounded-lg", className)}>
      {editing && (
        <div className="absolute -top-2.5 left-2 z-10 flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-accent-foreground shadow-sm">
          <GripVertical size={12} />
          <span className="text-[10px] font-medium">drag</span>
        </div>
      )}
      {children}
    </div>
  );
}
