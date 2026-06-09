"use client";

import * as React from "react";
import { ChevronRight, Plus, Lock, Landmark, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatMoney } from "@/lib/utils";

interface Account {
  code: string;
  name: string;
  type: string;
  balance: number;
  flags?: ("control" | "bank" | "postable")[];
  children?: Account[];
}

const coa: Account[] = [
  {
    code: "1000", name: "Assets", type: "Asset", balance: 41200000,
    children: [
      { code: "1100", name: "Current Assets", type: "Group", balance: 28400000, children: [
        { code: "1200", name: "Main Cash", type: "Cash", balance: 684000, flags: ["bank", "postable"] },
        { code: "1201", name: "SNB Current Account", type: "Bank", balance: 8420000, flags: ["bank", "postable"] },
        { code: "1150", name: "Accounts Receivable", type: "Receivable", balance: 3840000, flags: ["control"] },
        { code: "1300", name: "Metal Stock (Fine)", type: "Inventory", balance: 16800000, flags: ["control"] },
        { code: "1310", name: "Stone Stock", type: "Inventory", balance: 2200000, flags: ["postable"] },
      ]},
      { code: "1500", name: "Fixed Assets", type: "Group", balance: 5860000, children: [
        { code: "1510", name: "Showroom Fittings", type: "Fixed Asset", balance: 4200000, flags: ["postable"] },
        { code: "1520", name: "Plant & Machinery", type: "Fixed Asset", balance: 1660000, flags: ["postable"] },
      ]},
    ],
  },
  {
    code: "2000", name: "Liabilities", type: "Liability", balance: 18400000,
    children: [
      { code: "2100", name: "Accounts Payable", type: "Payable", balance: 6120000, flags: ["control"] },
      { code: "2110", name: "Metal Payable", type: "Payable", balance: 11800000, flags: ["control"] },
      { code: "2200", name: "VAT Output", type: "Tax", balance: 342000, flags: ["postable"] },
      { code: "2300", name: "Scheme Liability", type: "Liability", balance: 8420000, flags: ["control"] },
      { code: "2310", name: "Customer Advances", type: "Liability", balance: 1240000, flags: ["postable"] },
    ],
  },
  {
    code: "3000", name: "Equity", type: "Equity", balance: 22800000,
    children: [
      { code: "3100", name: "Share Capital", type: "Equity", balance: 15000000, flags: ["postable"] },
      { code: "3200", name: "Retained Earnings", type: "Equity", balance: 7800000, flags: ["postable"] },
    ],
  },
  {
    code: "4000", name: "Income", type: "Income", balance: 6815000,
    children: [
      { code: "4010", name: "Sales — Metal Value", type: "Direct Income", balance: 5310000, flags: ["postable"] },
      { code: "4100", name: "Making-Charge Income", type: "Direct Income", balance: 1280000, flags: ["postable"] },
      { code: "4200", name: "Repair & Service Income", type: "Direct Income", balance: 225000, flags: ["postable"] },
    ],
  },
  {
    code: "5000", name: "Expenses", type: "Expense", balance: 5073000,
    children: [
      { code: "5100", name: "Cost of Goods Sold", type: "Direct Cost", balance: 4350000, flags: ["postable"] },
      { code: "5200", name: "Wastage / Loss", type: "Direct Cost", balance: 82000, flags: ["postable"] },
      { code: "5300", name: "Refining Cost", type: "Operating Expense", balance: 18200, flags: ["postable"] },
      { code: "5400", name: "Salaries & Wages", type: "Operating Expense", balance: 1840000, flags: ["postable"] },
    ],
  },
];

const CLASS_TONE: Record<string, any> = {
  Asset: "info", Liability: "warning", Equity: "primary", Income: "success", Expense: "danger",
};

export default function CoaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Chart of Accounts"
        description="Typed, hierarchical chart of accounts — postings reference leaf accounts only; control accounts post via sub-ledgers (SRS ACC-COA)."
        meta={<Badge tone="primary" dot>Jewellery COA template · 5 classes</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm">Account Types</Button>
            <Button size="sm" icon={Plus}>New Account</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {coa.map((root) => (
          <StatCard
            key={root.code}
            label={root.name}
            value={formatMoney(root.balance, "SAR", { compact: true })}
            accent={CLASS_TONE[root.type]}
          />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="max-w-xs flex-1">
            <Input icon={Search} placeholder="Search account code or name…" className="h-8" />
          </div>
          <div className="hidden items-center gap-6 pr-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
            <span className="w-28 text-right">Balance</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {coa.map((root) => (
            <AccountRow key={root.code} account={root} depth={0} defaultOpen />
          ))}
        </div>
      </Card>
    </div>
  );
}

function AccountRow({ account, depth, defaultOpen }: { account: Account; depth: number; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen ?? false);
  const hasChildren = !!account.children?.length;
  return (
    <>
      <div
        className="flex items-center gap-2 px-4 py-2 hover:bg-muted/40 transition-colors cursor-pointer"
        style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {hasChildren ? (
          <ChevronRight size={15} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-90")} />
        ) : (
          <span className="w-[15px] shrink-0" />
        )}
        <span className="tnum text-[12px] text-muted-foreground w-12 shrink-0">{account.code}</span>
        <span className={cn("text-[13px] flex-1 truncate", depth === 0 ? "font-semibold" : "font-medium")}>
          {account.name}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {account.flags?.includes("control") && <Badge tone="warning" className="gap-1"><Lock size={9} /> Control</Badge>}
          {account.flags?.includes("bank") && <Badge tone="info" className="gap-1"><Landmark size={9} /> Bank</Badge>}
          {depth === 0 && <Badge tone={CLASS_TONE[account.type]}>{account.type}</Badge>}
        </div>
        <span className={cn("tnum w-28 text-right text-[13px] shrink-0", depth === 0 ? "font-semibold" : "font-medium")}>
          {formatMoney(account.balance, "", { compact: depth > 0 ? false : true })}
        </span>
      </div>
      {open && account.children?.map((child) => (
        <AccountRow key={child.code} account={child} depth={depth + 1} defaultOpen={depth < 1} />
      ))}
    </>
  );
}
