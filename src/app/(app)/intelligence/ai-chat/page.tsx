"use client";

import * as React from "react";
import { Sparkles, Send, Mic, Paperclip, User, BarChart3, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bars } from "@/components/dashboard/charts";

const suggestions = [
  "Top 5 slow-moving 22K items in Jeddah",
  "Compare gross margin across branches this quarter",
  "Which karigars have overdue jobs?",
  "Total metal payable to Emirates Gold DMCC",
];

const branchMargin = [
  { label: "Olaya", value: 26.8 },
  { label: "Granada", value: 25.2 },
  { label: "Tahlia", value: 24.5 },
  { label: "Corniche", value: 22.6 },
];

export default function AiChatPage() {
  return (
    <div className="flex h-[calc(100vh-104px)] flex-col gap-4">
      <PageHeader
        title="AI Data Chat"
        description="Query your ERP data in natural language via the MCP gateway — read-only, RBAC-scoped, and audited (SRS Intelligence / §2.4)."
        meta={
          <>
            <Badge tone="accent" dot>Provider · ANTHROPIC</Badge>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><ShieldCheck size={12} /> Respects your permissions &amp; branch scope</span>
          </>
        }
      />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* user */}
          <div className="flex justify-end">
            <div className="flex max-w-[80%] items-start gap-2.5">
              <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground">
                <p className="text-[13px]">Compare gross margin across branches this quarter</p>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><User size={14} /></span>
            </div>
          </div>

          {/* assistant */}
          <div className="flex justify-start">
            <div className="flex max-w-[90%] items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sparkles size={14} /></span>
              <div className="space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-surface-muted px-4 py-3">
                  <p className="text-[13px] leading-relaxed">
                    Across Q2 2026, the group gross margin is <strong>25.6%</strong>. Olaya leads at <strong>26.8%</strong>; Corniche trails at <strong>22.6%</strong>, driven by a higher making-charge discount mix. Here's the branch breakdown:
                  </p>
                </div>
                <Card className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <BarChart3 size={14} className="text-accent" />
                    <span className="text-[12px] font-semibold">Gross Margin by Branch (%)</span>
                  </div>
                  <Bars data={branchMargin} dataKey="value" height={180} />
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Database size={11} /> Source: Branch P&amp;L cube · 4 branches · refreshed 15 min ago
                  </div>
                </Card>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="outline" size="xs">Drill into Corniche</Button>
                  <Button variant="outline" size="xs">Export to report</Button>
                  <Button variant="outline" size="xs">Add to dashboard</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* suggestions + input */}
        <div className="border-t border-border p-4">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground">
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-input bg-surface p-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><Paperclip size={17} /></button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><Mic size={17} /></button>
            <input
              placeholder="Ask anything about your sales, inventory, finance…"
              className="h-9 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button size="icon" className="h-9 w-9"><Send size={16} /></Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI Data Chat is read-only — it never posts or mutates data. All queries are logged for audit.
          </p>
        </div>
      </Card>
    </div>
  );
}
