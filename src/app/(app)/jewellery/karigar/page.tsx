"use client";

import * as React from "react";
import { Plus, Scale, Clock, AlertTriangle, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Job {
  job_no: string;
  karigar: string;
  item: string;
  issued_fine: number;
  received_fine: number;
  wastage: number;
  due: string;
  status: "ISSUED" | "IN_PROGRESS" | "RECEIVED" | "RECONCILED";
  overdue?: boolean;
}

const jobs: Job[] = [
  { job_no: "KJ-2026-02041", karigar: "Suresh Menon", item: "22K Bridal Set — A19", issued_fine: 182.45, received_fine: 0, wastage: 0, due: "07 Jun", status: "IN_PROGRESS", overdue: true },
  { job_no: "KJ-2026-02044", karigar: "Ramesh Iyer", item: "18K Pendant — Heritage", issued_fine: 24.1, received_fine: 0, wastage: 0, due: "14 Jun", status: "IN_PROGRESS" },
  { job_no: "KJ-2026-02046", karigar: "Anil Kumar", item: "22K Kada (pair)", issued_fine: 76.8, received_fine: 0, wastage: 0, due: "16 Jun", status: "ISSUED" },
  { job_no: "KJ-2026-02047", karigar: "Suresh Menon", item: "21K Earrings set", issued_fine: 31.2, received_fine: 0, wastage: 0, due: "18 Jun", status: "ISSUED" },
  { job_no: "KJ-2026-02039", karigar: "Mohan Das", item: "22K Chain — Rope 24\"", issued_fine: 42.6, received_fine: 41.9, wastage: 0.7, due: "06 Jun", status: "RECEIVED" },
  { job_no: "KJ-2026-02038", karigar: "Ramesh Iyer", item: "18K Diamond Ring mount", issued_fine: 8.4, received_fine: 8.2, wastage: 0.2, due: "05 Jun", status: "RECEIVED" },
  { job_no: "KJ-2026-02035", karigar: "Anil Kumar", item: "22K Bangle set (6)", issued_fine: 128.0, received_fine: 125.4, wastage: 2.6, due: "03 Jun", status: "RECONCILED" },
  { job_no: "KJ-2026-02034", karigar: "Mohan Das", item: "24K Coin blanks (20)", issued_fine: 204.0, received_fine: 203.8, wastage: 0.2, due: "02 Jun", status: "RECONCILED" },
];

const columns = [
  { key: "ISSUED", label: "Issued", tone: "info" },
  { key: "IN_PROGRESS", label: "In Progress", tone: "warning" },
  { key: "RECEIVED", label: "Received", tone: "info" },
  { key: "RECONCILED", label: "Reconciled", tone: "success" },
] as const;

export default function KarigarPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Karigar Job-work"
        description="Issue metal to karigars and reconcile on return: issued = finished + wastage + balance (SRS JWL-KAR / §10)."
        actions={<Button size="sm" icon={Plus}>Issue Job</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open Jobs" value="4" icon={Clock} accent="primary" />
        <StatCard label="Metal With Karigars" value="314.55 g" icon={Scale} accent="accent" />
        <StatCard label="Overdue" value="1" icon={AlertTriangle} accent="danger" />
        <StatCard label="Avg. Wastage" value="1.8%" accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className="flex items-center justify-between px-1 pb-2.5">
                <div className="flex items-center gap-2">
                  <Badge tone={col.tone as any} dot>{col.label}</Badge>
                </div>
                <span className="text-xs font-medium text-muted-foreground tnum">{colJobs.length}</span>
              </div>
              <div className="flex flex-col gap-2.5 rounded-lg bg-surface-muted/40 p-2.5 min-h-[200px] border border-border/60">
                {colJobs.map((j) => (
                  <JobCard key={j.job_no} job={j} />
                ))}
                {colJobs.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-8 text-xs text-muted-foreground">
                    No jobs
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const balance = job.issued_fine - job.received_fine - job.wastage;
  const reconciled = job.status === "RECONCILED" || job.status === "RECEIVED";
  return (
    <Card className={cn("p-3 shadow-xs hover:shadow-md transition-shadow cursor-pointer", job.overdue && "ring-1 ring-danger/40")}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-semibold tnum">{job.job_no}</span>
        {job.overdue && <Badge tone="danger">Overdue</Badge>}
      </div>
      <p className="mt-1 text-[13px] font-medium leading-tight">{job.item}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-muted text-primary">
          <User size={11} />
        </span>
        {job.karigar}
      </div>

      <div className="mt-2.5 space-y-1 rounded-md bg-surface-muted/60 p-2 text-[11px]">
        <div className="flex justify-between"><span className="text-muted-foreground">Issued fine</span><span className="tnum font-medium">{job.issued_fine.toFixed(3)} g</span></div>
        {reconciled && (
          <>
            <div className="flex justify-between"><span className="text-muted-foreground">Received</span><span className="tnum font-medium">{job.received_fine.toFixed(3)} g</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Wastage</span><span className="tnum font-medium text-warning">{job.wastage.toFixed(3)} g</span></div>
            <div className="flex justify-between border-t border-border pt-1"><span className="text-muted-foreground">Balance</span><span className={cn("tnum font-semibold", Math.abs(balance) < 0.01 ? "text-success" : "text-danger")}>{balance.toFixed(3)} g</span></div>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Clock size={11} /> Due {job.due}</span>
        <StatusBadge status={job.status} />
      </div>
    </Card>
  );
}
