"use client";

import * as React from "react";
import { Lock, RefreshCw, TrendingUp, TrendingDown, Plus, History, Radio } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TrendArea } from "@/components/dashboard/charts";

const rates = [
  { metal: "Gold", purity: "24K", factor: "0.9999", buy: 266.1, sell: 268.4, change: 1.2 },
  { metal: "Gold", purity: "22K", factor: "0.9160", buy: 243.6, sell: 245.8, change: 1.1 },
  { metal: "Gold", purity: "21K", factor: "0.8750", buy: 232.5, sell: 234.7, change: 1.0 },
  { metal: "Gold", purity: "18K", factor: "0.7500", buy: 199.2, sell: 201.3, change: 0.9 },
  { metal: "Silver", purity: "999", factor: "0.9990", buy: 3.05, sell: 3.18, change: -0.4 },
  { metal: "Platinum", purity: "950", factor: "0.9500", buy: 122.8, sell: 124.6, change: 0.3 },
];

const rateTrend = [
  { label: "03:00", revenue: 244.1 },
  { label: "06:00", revenue: 244.6 },
  { label: "09:00", revenue: 245.0 },
  { label: "12:00", revenue: 245.4 },
  { label: "15:00", revenue: 245.8 },
  { label: "18:00", revenue: 245.6 },
  { label: "Now", revenue: 245.8 },
];

interface RateHistory { time: string; metal: string; purity: string; rate: number; by: string; source: string; }
const history: RateHistory[] = [
  { time: "2026-06-09 09:05", metal: "Gold", purity: "22K", rate: 245.8, by: "Danish H.", source: "Locked — MT5 feed" },
  { time: "2026-06-09 06:00", metal: "Gold", purity: "22K", rate: 244.9, by: "System", source: "Auto — MT5 feed" },
  { time: "2026-06-08 21:30", metal: "Gold", purity: "22K", rate: 244.2, by: "Danish H.", source: "Manual override" },
  { time: "2026-06-08 09:05", metal: "Gold", purity: "22K", rate: 243.6, by: "Danish H.", source: "Locked — MT5 feed" },
  { time: "2026-06-08 06:00", metal: "Gold", purity: "21K", rate: 232.1, by: "System", source: "Auto — MT5 feed" },
];

export default function RatesPage() {
  const cols: Column<RateHistory>[] = [
    { key: "time", header: "Timestamp", mono: true },
    { key: "metal", header: "Metal", cell: (r) => <Badge tone="neutral">{r.metal}</Badge> },
    { key: "purity", header: "Purity", mono: true },
    { key: "rate", header: "Rate (SAR/g)", align: "right", mono: true, cell: (r) => r.rate.toFixed(2) },
    { key: "by", header: "Set By" },
    { key: "source", header: "Source", cell: (r) => <span className="text-muted-foreground">{r.source}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rates & Bullion"
        description="Metal rate engine — server-resolved rates drive all pricing at sale (PricingStrategy, SRS §8 / JWL-RATE)."
        meta={
          <>
            <Badge tone="success" dot>Feed live · MT5</Badge>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Radio size={12} /> Last sync 2 min ago
            </span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" icon={RefreshCw}>Sync feed</Button>
            <Button size="sm" icon={Lock}>Lock today's rates</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Gold 22K (Sell)" value="245.80" hint="SAR/g" delta={{ value: "+1.1%", direction: "up" }} icon={TrendingUp} accent="accent" />
        <StatCard label="Spot (USD/oz)" value="$2,412" delta={{ value: "+0.8%", direction: "up" }} accent="primary" />
        <StatCard label="USD → SAR" value="3.7500" delta={{ value: "Pegged", direction: "flat" }} accent="info" />
        <StatCard label="Session Status" value="Locked" hint="09:05 GST" icon={Lock} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Rate board */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Today's Rate Board</CardTitle>
              <CardDescription>Buy / sell per gram by metal and purity</CardDescription>
            </div>
            <Badge tone="neutral">SAR / gram</Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rates.map((r) => (
              <div key={r.metal + r.purity} className="rounded-lg border border-border p-3.5 hover:border-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{r.metal} {r.purity}</p>
                    <p className="text-[11px] text-muted-foreground tnum">Fine factor {r.factor}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${r.change >= 0 ? "text-success" : "text-danger"}`}>
                    {r.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(r.change)}%
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-surface-muted/70 px-2.5 py-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Buy</p>
                    <p className="text-base font-semibold tnum">{r.buy.toFixed(2)}</p>
                  </div>
                  <div className="rounded-md bg-accent-muted/60 px-2.5 py-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-accent">Sell</p>
                    <p className="text-base font-semibold tnum text-accent">{r.sell.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rate entry */}
        <Card>
          <CardHeader>
            <CardTitle>Set / Override Rate</CardTitle>
            <Badge tone="warning">Sensitive · audited</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Metal" required>
              <Select defaultValue="Gold">
                <option>Gold</option>
                <option>Silver</option>
                <option>Platinum</option>
              </Select>
            </Field>
            <Field label="Purity" required>
              <Select defaultValue="22K">
                <option>24K</option>
                <option>22K</option>
                <option>21K</option>
                <option>18K</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Buy (SAR/g)" required>
                <Input type="number" defaultValue="243.60" className="tnum" />
              </Field>
              <Field label="Sell (SAR/g)" required>
                <Input type="number" defaultValue="245.80" className="tnum" />
              </Field>
            </div>
            <Field label="Source" hint="pricing.rate.update permission required (§6)">
              <Select defaultValue="manual">
                <option value="manual">Manual override</option>
                <option value="feed">Lock from MT5 feed</option>
                <option value="akr">Lock from AKR Trader</option>
              </Select>
            </Field>
            <Button className="w-full" icon={Lock}>Apply &amp; lock rate</Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Applied rates resolve server-side at sale — never trusted from the client.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>22K Intraday</CardTitle>
            <CardDescription>SAR / gram</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendArea data={rateTrend} dataKey="revenue" height={180} color="hsl(var(--accent))" />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History size={15} /> Rate History</CardTitle>
          </CardHeader>
          <DataTable columns={cols} data={history} rowKey={(r) => r.time + r.purity} searchable={false} pageSize={5} />
        </Card>
      </div>
    </div>
  );
}
