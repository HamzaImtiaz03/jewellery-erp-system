"use client";

import * as React from "react";
import { Plus, FileDown, ChevronRight, CheckCircle2, ListTree, Activity, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/utils";
import { hueVar, hsl, HUE_ROTATION } from "@/lib/module-colors";
import type { ModuleSpec, ModuleColumn } from "@/lib/data/modules";
import type { RouteMeta } from "@/lib/nav";

const NEUTRAL_ACCENTS = new Set(["primary", "info", "accent", undefined, ""]);

export function ModuleWorkspace({
  meta,
  spec,
}: {
  meta: RouteMeta;
  spec: ModuleSpec;
}) {
  const columns: Column<Record<string, any>>[] = spec.columns.map((c) =>
    toColumn(c)
  );
  const hue = hueVar(meta.moduleId);

  return (
    <div className="space-y-5">
      <PageHeader
        title={meta.label}
        description={spec.summary}
        meta={
          spec.srs ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
              style={{ background: hsl(hue, 0.12), color: hsl(hue), borderColor: hsl(hue, 0.25) }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: hsl(hue) }} />
              SRS · {spec.srs}
            </span>
          ) : undefined
        }
        actions={
          <>
            <Button variant="outline" size="sm" icon={FileDown}>
              Export
            </Button>
            <Button size="sm" icon={Plus}>
              New {spec.recordLabel}
            </Button>
          </>
        }
      />

      {/* KPIs — colourful: signature hue first, then rotation, semantic kept */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {spec.kpis.map((k, i) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            accent={NEUTRAL_ACCENTS.has(k.accent) ? (i === 0 ? hue : HUE_ROTATION[i % HUE_ROTATION.length]) : k.accent}
            delta={
              k.delta
                ? { value: k.delta, direction: k.direction ?? "flat" }
                : undefined
            }
          />
        ))}
      </div>

      {/* Lifecycle pipeline (SRS §10 state machine) */}
      {spec.states && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-1 mb-3">
              <ListTree size={14} className="text-muted-foreground" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Workflow · State Machine
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {spec.states.map((s, i) => (
                <React.Fragment key={s}>
                  <span
                    className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={
                      i === 0
                        ? { background: hsl(hue, 0.16), color: hsl(hue) }
                        : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                    }
                  >
                    {s.replace(/_/g, " ")}
                  </span>
                  {i < spec.states!.length - 1 && (
                    <ChevronRight size={14} className="text-muted-foreground/50" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 overflow-hidden">
          <Tabs defaultValue="records">
            <div className="px-4 pt-2">
              <TabsList>
                <TabsTrigger value="records" count={spec.rows.length}>
                  {spec.recordLabel}s
                </TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="records">
              <DataTable
                columns={columns}
                data={spec.rows}
                rowKey={(r) => String(Object.values(r)[0])}
                searchPlaceholder={`Search ${spec.recordLabel.toLowerCase()}s…`}
                pageSize={8}
              />
            </TabsContent>
            <TabsContent value="activity">
              <div className="p-5">
                <ActivityFeed label={spec.recordLabel} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" />
                Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {(spec.capabilities ?? []).map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <p className="text-[13px] leading-snug">{c}</p>
                </div>
              ))}
              {!spec.capabilities?.length && (
                <p className="text-sm text-muted-foreground">
                  Implements the SRS functional-requirement catalog for this
                  module.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 size={15} className="text-muted-foreground" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ConfigRow label="Module" value={meta.section} />
              <ConfigRow label="Branch scope" value="Active branch" />
              <ConfigRow label="Permissions" value="RBAC-gated (§6)" />
              <ConfigRow label="Audit" value="Enabled" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function toColumn(c: ModuleColumn): Column<Record<string, any>> {
  return {
    key: c.key,
    header: c.header,
    align: c.align,
    mono: c.mono || c.kind === "money",
    cell: (row) => {
      const v = row[c.key];
      if (v == null || v === "") return <span className="text-muted-foreground">—</span>;
      switch (c.kind) {
        case "status":
          return <StatusBadge status={String(v)} />;
        case "money":
          return <span className="font-medium">{formatMoney(Number(v))}</span>;
        case "badge":
          return <Badge tone="neutral">{String(v)}</Badge>;
        case "muted":
          return <span className="text-muted-foreground">{String(v)}</span>;
        default:
          return c.key === Object.keys(row)[0] ? (
            <span className="font-medium">{String(v)}</span>
          ) : (
            String(v)
          );
      }
    },
  };
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ActivityFeed({ label }: { label: string }) {
  const events = [
    { who: "Noura S.", what: `created a new ${label.toLowerCase()}`, when: "12 minutes ago", tone: "success" },
    { who: "Danish H.", what: "approved a pending item", when: "1 hour ago", tone: "info" },
    { who: "System", what: "posted the linked GL journal", when: "1 hour ago", tone: "primary" },
    { who: "Faisal A.", what: "updated a record", when: "3 hours ago", tone: "muted" },
    { who: "System", what: "ran scheduled reconciliation", when: "Yesterday", tone: "muted" },
  ];
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface" />
          <p className="text-[13px]">
            <span className="font-medium">{e.who}</span>{" "}
            <span className="text-muted-foreground">{e.what}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{e.when}</p>
        </li>
      ))}
    </ol>
  );
}
