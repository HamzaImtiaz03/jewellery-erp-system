"use client";

import * as React from "react";
import { Plus, FileDown, Printer, RotateCcw, Ban, CreditCard } from "lucide-react";
import { PageHeader, DescriptionList } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Separator } from "@/components/ui/feedback";
import { invoices, POS_CART, type Invoice } from "@/lib/data/sales";
import { formatMoney, formatDateTime, formatGrams } from "@/lib/utils";

export default function InvoicesPage() {
  const [selected, setSelected] = React.useState<Invoice | null>(null);

  const columns: Column<Invoice>[] = [
    { key: "invoice_no", header: "Invoice #", mono: true, cell: (r) => <span className="font-medium tnum">{r.invoice_no}</span> },
    { key: "customer", header: "Customer", cell: (r) => <span className="font-medium">{r.customer}</span> },
    { key: "date", header: "Date", accessor: (r) => r.date, cell: (r) => <span className="text-muted-foreground">{formatDateTime(r.date)}</span> },
    { key: "branch", header: "Branch", cell: (r) => <Badge tone="neutral">{r.branch}</Badge> },
    { key: "items", header: "Items", align: "right", mono: true },
    { key: "fine_weight", header: "Fine Wt", align: "right", mono: true, cell: (r) => formatGrams(r.fine_weight) },
    { key: "grand_total", header: "Total", align: "right", mono: true, cell: (r) => <span className="font-medium">{formatMoney(r.grand_total)}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  const totals = {
    count: invoices.length,
    revenue: invoices.filter((i) => i.status !== "VOID").reduce((s, i) => s + i.grand_total, 0),
    outstanding: invoices.reduce((s, i) => s + (i.grand_total - i.paid), 0),
    returned: invoices.filter((i) => i.status === "RETURNED").length,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description="Sales invoices across all branches. Posting occurs on CONFIRMED (SRS §10 state machine)."
        actions={
          <>
            <Button variant="outline" size="sm" icon={FileDown}>Export</Button>
            <Button size="sm" icon={Plus}>New Invoice</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Invoices" value={totals.count} icon={CreditCard} accent="primary" />
        <StatCard label="Net Revenue" value={formatMoney(totals.revenue, "SAR", { compact: true })} accent="success" />
        <StatCard label="Outstanding" value={formatMoney(totals.outstanding, "SAR", { compact: true })} accent="warning" />
        <StatCard label="Returns" value={totals.returned} accent="accent" />
      </div>

      <Card className="overflow-hidden">
        <Tabs defaultValue="all">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger value="all" count={invoices.length}>All</TabsTrigger>
              <TabsTrigger value="paid" count={invoices.filter((i) => i.status === "PAID").length}>Paid</TabsTrigger>
              <TabsTrigger value="confirmed" count={invoices.filter((i) => i.status === "CONFIRMED").length}>Confirmed</TabsTrigger>
              <TabsTrigger value="partial" count={invoices.filter((i) => i.status === "PARTIALLY_PAID").length}>Partial</TabsTrigger>
              <TabsTrigger value="returned" count={invoices.filter((i) => ["RETURNED", "VOID"].includes(i.status)).length}>Returns / Void</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all">
            <DataTable columns={columns} data={invoices} rowKey={(r) => r.invoice_no} onRowClick={setSelected} searchPlaceholder="Search invoice #, customer…" />
          </TabsContent>
          <TabsContent value="paid">
            <DataTable columns={columns} data={invoices.filter((i) => i.status === "PAID")} rowKey={(r) => r.invoice_no} onRowClick={setSelected} />
          </TabsContent>
          <TabsContent value="confirmed">
            <DataTable columns={columns} data={invoices.filter((i) => i.status === "CONFIRMED")} rowKey={(r) => r.invoice_no} onRowClick={setSelected} />
          </TabsContent>
          <TabsContent value="partial">
            <DataTable columns={columns} data={invoices.filter((i) => i.status === "PARTIALLY_PAID")} rowKey={(r) => r.invoice_no} onRowClick={setSelected} />
          </TabsContent>
          <TabsContent value="returned">
            <DataTable columns={columns} data={invoices.filter((i) => ["RETURNED", "VOID"].includes(i.status))} rowKey={(r) => r.invoice_no} onRowClick={setSelected} />
          </TabsContent>
        </Tabs>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.invoice_no ?? ""}
        description={selected ? `${selected.customer} · ${formatDateTime(selected.date)}` : ""}
        footer={
          <>
            <Button variant="ghost" size="sm" icon={Printer}>Print</Button>
            <Button variant="outline" size="sm" icon={RotateCcw}>Return</Button>
            <Button variant="danger" size="sm" icon={Ban}>Void</Button>
            <Button size="sm" icon={CreditCard}>Take Payment</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={selected.status} />
              <Badge tone="neutral">{selected.branch} · {selected.cashier}</Badge>
            </div>

            <DescriptionList
              cols={2}
              items={[
                { label: "Customer", value: selected.customer },
                { label: "Payment", value: selected.payment },
                { label: "Items", value: selected.items },
                { label: "Fine Weight", value: formatGrams(selected.fine_weight) },
              ]}
            />

            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Line Items</p>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>Item / Tag</TH>
                      <TH align="right">Fine</TH>
                      <TH align="right">Rate</TH>
                      <TH align="right">Making</TH>
                      <TH align="right">Total</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {POS_CART.map((l) => (
                      <TR key={l.tag}>
                        <TD>
                          <p className="font-medium text-[13px]">{l.item}</p>
                          <p className="text-[11px] text-muted-foreground tnum">{l.tag}</p>
                        </TD>
                        <TD align="right" mono>{l.fine.toFixed(3)}g</TD>
                        <TD align="right" mono>{l.rate.toFixed(2)}</TD>
                        <TD align="right" mono>{formatMoney(l.making)}</TD>
                        <TD align="right" mono>{formatMoney(l.line)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted/40 p-4 space-y-2">
              <Row label="Sub-total" value={formatMoney(selected.sub_total)} />
              <Row label="VAT (5%)" value={formatMoney(selected.tax_total)} />
              <Separator />
              <Row label="Grand Total" value={formatMoney(selected.grand_total)} bold />
              <Row label="Paid" value={formatMoney(selected.paid)} />
              <Row label="Balance Due" value={formatMoney(selected.grand_total - selected.paid)} tone={selected.grand_total - selected.paid > 0 ? "danger" : "success"} />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">GL Posting (SRS §3 atomic)</p>
              <div className="space-y-1.5 text-[12px]">
                <PostLine acct="1200 · Cash & Bank" dr={selected.paid} />
                <PostLine acct="1150 · Accounts Receivable" dr={selected.grand_total - selected.paid} />
                <PostLine acct="4000 · Sales — Metal Value" cr={selected.sub_total * 0.78} />
                <PostLine acct="4100 · Making-Charge Income" cr={selected.sub_total * 0.22} />
                <PostLine acct="2200 · VAT Output" cr={selected.tax_total} />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: "danger" | "success" }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tnum ${bold ? "font-semibold text-base" : "font-medium"} ${tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}

function PostLine({ acct, dr, cr }: { acct: string; dr?: number; cr?: number }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface px-3 py-1.5 border border-border">
      <span>{acct}</span>
      <span className="flex gap-6 tnum">
        <span className="w-24 text-right text-success">{dr ? formatMoney(dr) : ""}</span>
        <span className="w-24 text-right text-danger">{cr ? formatMoney(cr) : ""}</span>
      </span>
    </div>
  );
}
