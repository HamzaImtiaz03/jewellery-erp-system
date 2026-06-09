"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Workflow, Cog, Database, Plus, Pencil, Trash2, ArrowRight, Save, Search, Lock, X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button, IconButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, Label } from "@/components/ui/input";
import { Switch, SegmentedControl, Checkbox } from "@/components/ui/controls";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "workflows", label: "Approval Workflows", icon: Workflow },
  { key: "parameters", label: "Business Parameters", icon: Cog },
  { key: "configuration", label: "Configuration", icon: Database },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const seg = pathname.split("/")[2];
  const active = SECTIONS.some((s) => s.key === seg) ? seg : "workflows";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings & Workflow"
        description="The configuration and approval-routing engine (SRS Layer A · the “A10” engine) — workflows, business parameters and the settings cascade."
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SECTIONS.map((s) => {
          const isActive = active === s.key;
          return (
            <Link
              key={s.key}
              href={`/settings/${s.key}`}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60"
              )}
            >
              <s.icon size={15} />
              {s.label}
            </Link>
          );
        })}
      </div>

      <div className="max-w-4xl">
        {active === "workflows" && <Workflows />}
        {active === "parameters" && <Parameters />}
        {active === "configuration" && <ConfigRegistry />}
      </div>
    </div>
  );
}

function SettingsCard({ title, description, children, footer }: any) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-3.5 bg-surface-muted/30 rounded-b-2xl">
          {footer}
        </div>
      )}
    </Card>
  );
}

/* ===================================================================== */
/* Settings & Workflow module — the "A10" engine the SRS references but    */
/* never specifies (approval workflows, business parameters, config        */
/* cascade). All three sections are interactive.                           */
/* ===================================================================== */

const ROLES = ["Cashier", "Branch Manager", "Compliance Officer", "Accountant", "Controller"];
const TRIGGERS = [
  "Sale total ≥ threshold",
  "Purchase order value ≥ threshold",
  "Discount ≥ threshold",
  "Making-charge override",
  "Metal rate change",
  "Day re-open request",
  "Manual price below floor",
  "Return value ≥ threshold",
];

interface WF {
  id: string;
  name: string;
  trigger: string;
  threshold: string;
  approvers: string[];
  escalation: string;
  active: boolean;
  sensitive: boolean;
}

const SEED_WORKFLOWS: WF[] = [
  { id: "wf1", name: "High-value sale review", trigger: "Sale total ≥ threshold", threshold: "50,000 SAR", approvers: ["Compliance Officer", "Branch Manager"], escalation: "Controller after 4h", active: true, sensitive: true },
  { id: "wf2", name: "Purchase order approval", trigger: "Purchase order value ≥ threshold", threshold: "100,000 SAR", approvers: ["Branch Manager", "Controller"], escalation: "—", active: true, sensitive: false },
  { id: "wf3", name: "Discount / making-charge override", trigger: "Discount ≥ threshold", threshold: "10 %", approvers: ["Branch Manager"], escalation: "—", active: true, sensitive: false },
  { id: "wf4", name: "Metal rate change", trigger: "Metal rate change", threshold: "Any", approvers: ["Controller"], escalation: "—", active: true, sensitive: true },
  { id: "wf5", name: "Day re-open", trigger: "Day re-open request", threshold: "Any", approvers: ["Controller"], escalation: "—", active: true, sensitive: true },
  { id: "wf6", name: "Price below floor override", trigger: "Manual price below floor", threshold: "Any", approvers: ["Branch Manager", "Controller"], escalation: "—", active: false, sensitive: false },
];

function Workflows() {
  const [list, setList] = React.useState<WF[]>(SEED_WORKFLOWS);
  const [editing, setEditing] = React.useState<WF | null>(null);
  const [open, setOpen] = React.useState(false);

  const startNew = () => { setEditing({ id: `wf${Date.now()}`, name: "", trigger: TRIGGERS[0], threshold: "", approvers: ["Branch Manager"], escalation: "—", active: true, sensitive: false }); setOpen(true); };
  const startEdit = (wf: WF) => { setEditing({ ...wf }); setOpen(true); };
  const save = () => {
    if (!editing) return;
    setList((l) => (l.some((w) => w.id === editing.id) ? l.map((w) => (w.id === editing.id ? editing : w)) : [...l, editing]));
    setOpen(false);
  };
  const remove = (id: string) => setList((l) => l.filter((w) => w.id !== id));
  const toggle = (id: string) => setList((l) => l.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Approval Workflows</CardTitle>
            <CardDescription>The approval-routing engine (SRS &ldquo;A10&rdquo;) reused by purchasing, discounts, high-value review, rate edits and day re-open.</CardDescription>
          </div>
          <Button size="sm" icon={Plus} onClick={startNew}>New Workflow</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.map((wf) => (
            <div key={wf.id} className={cn("rounded-xl border p-3.5 transition-colors", wf.active ? "border-border/70 bg-surface/40" : "border-border/50 bg-muted/20 opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold flex items-center gap-2">
                    {wf.name || "Untitled workflow"}
                    {wf.sensitive && <Badge tone="danger">Sensitive</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When <span className="font-medium text-foreground">{wf.trigger}</span>
                    {wf.threshold !== "Any" && <> · threshold <span className="font-medium text-foreground tnum">{wf.threshold}</span></>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={wf.active} onChange={() => toggle(wf.id)} label="active" />
                  <IconButton icon={Pencil} label="Edit" className="h-8 w-8" onClick={() => startEdit(wf)} />
                  <IconButton icon={Trash2} label="Delete" className="h-8 w-8 text-muted-foreground hover:text-danger" onClick={() => remove(wf.id)} />
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Route:</span>
                {wf.approvers.map((a, i) => (
                  <React.Fragment key={i}>
                    <span className="inline-flex items-center rounded-lg bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/15">{a}</span>
                    {i < wf.approvers.length - 1 && <ArrowRight size={12} className="text-muted-foreground/60" />}
                  </React.Fragment>
                ))}
                {wf.escalation !== "—" && <span className="ml-1 text-[11px] text-warning">↳ escalate: {wf.escalation}</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing && list.some((w) => w.id === editing.id) ? "Edit workflow" : "New workflow"}
        description="Define the trigger, threshold and the sequential approver chain."
        footer={<><Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={save}>Save workflow</Button></>}
      >
        {editing && (
          <div className="space-y-5">
            <Field label="Workflow name" required>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. High-value sale review" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Trigger">
                <Select value={editing.trigger} onChange={(e) => setEditing({ ...editing, trigger: e.target.value })}>
                  {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Threshold">
                <Input value={editing.threshold} onChange={(e) => setEditing({ ...editing, threshold: e.target.value })} placeholder="50,000 SAR / 10 % / Any" />
              </Field>
            </div>

            <div>
              <Label className="mb-2 block">Approver chain (in order)</Label>
              <div className="space-y-2">
                {editing.approvers.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold tnum">{i + 1}</span>
                    <Select value={a} onChange={(e) => setEditing({ ...editing, approvers: editing.approvers.map((x, xi) => (xi === i ? e.target.value : x)) })}>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </Select>
                    <IconButton icon={X} label="Remove" className="h-9 w-9 text-muted-foreground hover:text-danger shrink-0"
                      onClick={() => setEditing({ ...editing, approvers: editing.approvers.filter((_, xi) => xi !== i) })} />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" icon={Plus} className="mt-2"
                onClick={() => setEditing({ ...editing, approvers: [...editing.approvers, "Branch Manager"] })}>
                Add approver step
              </Button>
            </div>

            <Field label="Escalation">
              <Input value={editing.escalation} onChange={(e) => setEditing({ ...editing, escalation: e.target.value })} placeholder="e.g. Controller after 4h, or —" />
            </Field>
            <Checkbox checked={editing.sensitive} onChange={(v) => setEditing({ ...editing, sensitive: v })} label="Mark as sensitive (extra grant + audit, §6.1)" />
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ----------------------------- Business Parameters ----------------------- */
const PARAM_BASELINE = {
  vatRate: "5", priceRounding: "0.05", roundingMode: "nearest",
  wastageTol: "0.5", countVarianceTol: "2", fineDecimals: "3",
  makingBasis: "per_gram", makingDefault: "12", minMaking: "150",
  cashVarianceTol: "50", kycThreshold: "15000", highValueThreshold: "50000",
};

function Parameters() {
  const [p, setP] = React.useState(PARAM_BASELINE);
  const [saved, setSaved] = React.useState(PARAM_BASELINE);
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);
  const set = (k: keyof typeof p, v: string) => setP({ ...p, [k]: v });

  return (
    <div className="space-y-4 relative">
      {dirty && (
        <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-muted/60 backdrop-blur px-4 py-2.5 shadow-sm">
          <span className="text-[13px] font-medium">You have unsaved parameter changes.</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setP(saved)}>Discard</Button>
            <Button size="sm" icon={Save} onClick={() => setSaved(p)}>Save changes</Button>
          </div>
        </div>
      )}

      <SettingsCard title="Tax & rounding" description="Centralised so calculations live in one place — config, not code (§2.3).">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="VAT rate (%)"><Input value={p.vatRate} onChange={(e) => set("vatRate", e.target.value)} className="tnum" /></Field>
          <Field label="Price rounding">
            <Select value={p.priceRounding} onChange={(e) => set("priceRounding", e.target.value)}>
              <option value="0">No rounding</option><option value="0.05">0.05</option><option value="0.10">0.10</option><option value="1.00">1.00</option>
            </Select>
          </Field>
          <Field label="Rounding mode">
            <Select value={p.roundingMode} onChange={(e) => set("roundingMode", e.target.value)}>
              <option value="nearest">Nearest</option><option value="up">Round up</option><option value="down">Round down</option>
            </Select>
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Weight tolerances" description="Fine-weight reconciliation limits (karigar, stock count).">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Karigar wastage tolerance (%)"><Input value={p.wastageTol} onChange={(e) => set("wastageTol", e.target.value)} className="tnum" /></Field>
          <Field label="Stock-count variance (g)"><Input value={p.countVarianceTol} onChange={(e) => set("countVarianceTol", e.target.value)} className="tnum" /></Field>
          <Field label="Fine-weight decimals"><Input value={p.fineDecimals} onChange={(e) => set("fineDecimals", e.target.value)} className="tnum" /></Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Making charge" description="Default making-charge rule applied at pricing time.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Default basis">
            <Select value={p.makingBasis} onChange={(e) => set("makingBasis", e.target.value)}>
              <option value="per_gram">Per gram</option><option value="pct_metal">% of metal value</option><option value="fixed">Fixed amount</option>
            </Select>
          </Field>
          <Field label="Default value"><Input value={p.makingDefault} onChange={(e) => set("makingDefault", e.target.value)} className="tnum" /></Field>
          <Field label="Minimum making (SAR)"><Input value={p.minMaking} onChange={(e) => set("minMaking", e.target.value)} className="tnum" /></Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Day-close & compliance" description="Operational tolerances and AML thresholds (M.1).">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Cash variance tolerance (SAR)"><Input value={p.cashVarianceTol} onChange={(e) => set("cashVarianceTol", e.target.value)} className="tnum" /></Field>
          <Field label="KYC capture threshold (SAR)"><Input value={p.kycThreshold} onChange={(e) => set("kycThreshold", e.target.value)} className="tnum" /></Field>
          <Field label="High-value review (SAR)"><Input value={p.highValueThreshold} onChange={(e) => set("highValueThreshold", e.target.value)} className="tnum" /></Field>
        </div>
      </SettingsCard>
    </div>
  );
}

/* --------------------------- Configuration Registry ---------------------- */
type Scope = "SYSTEM" | "TENANT" | "BRANCH" | "USER";
interface ConfigRow {
  key: string; scope: Scope; type: string; value: string; overridable: boolean; locked: boolean;
  cascade: { scope: Scope; value: string | null }[];
}
const SCOPE_TONE: Record<Scope, any> = { SYSTEM: "neutral", TENANT: "primary", BRANCH: "info", USER: "accent" };

const SEED_CONFIG: ConfigRow[] = [
  { key: "tax.vat.rate", scope: "TENANT", type: "decimal", value: "5.0", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "15.0" }, { scope: "TENANT", value: "5.0" }, { scope: "BRANCH", value: null }, { scope: "USER", value: null }] },
  { key: "pricing.rate.source", scope: "TENANT", type: "enum", value: "MT5", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "MANUAL" }, { scope: "TENANT", value: "MT5" }, { scope: "BRANCH", value: null }, { scope: "USER", value: null }] },
  { key: "dayclose.cash.tolerance", scope: "BRANCH", type: "money", value: "50.00", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "0.00" }, { scope: "TENANT", value: "25.00" }, { scope: "BRANCH", value: "50.00" }, { scope: "USER", value: null }] },
  { key: "ui.theme.default", scope: "USER", type: "enum", value: "royal", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "graphite" }, { scope: "TENANT", value: "royal" }, { scope: "BRANCH", value: null }, { scope: "USER", value: "royal" }] },
  { key: "branding.brand.colors", scope: "TENANT", type: "json", value: "custom", overridable: false, locked: true, cascade: [{ scope: "SYSTEM", value: "default" }, { scope: "TENANT", value: "custom" }, { scope: "BRANCH", value: null }, { scope: "USER", value: null }] },
  { key: "aml.highvalue.threshold", scope: "TENANT", type: "money", value: "50000.00", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "100000.00" }, { scope: "TENANT", value: "50000.00" }, { scope: "BRANCH", value: null }, { scope: "USER", value: null }] },
  { key: "numbering.invoice.format", scope: "BRANCH", type: "text", value: "INV-{YYYY}-{#####}", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "{SEQ}" }, { scope: "TENANT", value: "INV-{YYYY}-{#####}" }, { scope: "BRANCH", value: "INV-{YYYY}-{#####}" }, { scope: "USER", value: null }] },
  { key: "provider.payment.gateway", scope: "TENANT", type: "enum", value: "TADAWUL", overridable: true, locked: false, cascade: [{ scope: "SYSTEM", value: "MANUAL" }, { scope: "TENANT", value: "TADAWUL" }, { scope: "BRANCH", value: null }, { scope: "USER", value: null }] },
];

function ConfigRegistry() {
  const [rows, setRows] = React.useState(SEED_CONFIG);
  const [scope, setScope] = React.useState<"ALL" | Scope>("ALL");
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<ConfigRow | null>(null);
  const [draft, setDraft] = React.useState("");

  const filtered = rows.filter(
    (r) => (scope === "ALL" || r.scope === scope) && r.key.toLowerCase().includes(q.toLowerCase())
  );
  const openRow = (r: ConfigRow) => { setSel(r); setDraft(r.value); };
  const saveRow = () => {
    if (!sel) return;
    setRows((rs) => rs.map((r) => (r.key === sel.key ? { ...r, value: draft } : r)));
    setSel(null);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Configuration Registry</CardTitle>
            <CardDescription>Every setting resolves by cascade: System → Tenant → Branch → User (SRS §2.3 / tenant.settings).</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div className="max-w-xs flex-1"><Input icon={Search} placeholder="Search config key…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9" /></div>
          <SegmentedControl
            size="sm"
            options={[{ value: "ALL", label: "All" }, { value: "SYSTEM", label: "System" }, { value: "TENANT", label: "Tenant" }, { value: "BRANCH", label: "Branch" }, { value: "USER", label: "User" }] as any}
            value={scope as any}
            onChange={(v) => setScope(v as any)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">Config Key</th>
                <th className="px-3 py-2.5 text-left font-semibold">Scope</th>
                <th className="px-3 py-2.5 text-left font-semibold">Type</th>
                <th className="px-3 py-2.5 text-left font-semibold">Effective Value</th>
                <th className="px-3 py-2.5 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((r) => (
                <tr key={r.key} className="hover:bg-muted/30 cursor-pointer" onClick={() => openRow(r)}>
                  <td className="px-4 py-2.5 font-medium tnum text-[12.5px] flex items-center gap-1.5">
                    {r.locked && <Lock size={11} className="text-warning" />}{r.key}
                  </td>
                  <td className="px-3 py-2.5"><Badge tone={SCOPE_TONE[r.scope]}>{r.scope}</Badge></td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.type}</td>
                  <td className="px-3 py-2.5 font-medium tnum">{r.value}</td>
                  <td className="px-3 py-2.5 text-right">
                    {r.overridable ? <Badge tone="success">overridable</Badge> : <Badge tone="neutral">locked</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 text-[11px] text-muted-foreground border-t border-border/60">
          {filtered.length} keys · click a key to inspect its cascade resolution.
        </div>
      </Card>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.key ?? ""}
        description="Cascade resolution — the lowest scope with a value wins."
        footer={sel?.overridable && !sel?.locked
          ? <><Button variant="ghost" size="sm" onClick={() => setSel(null)}>Cancel</Button><Button size="sm" icon={Save} onClick={saveRow}>Save override</Button></>
          : <Button size="sm" onClick={() => setSel(null)}>Close</Button>}
      >
        {sel && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge tone={SCOPE_TONE[sel.scope]}>{sel.scope}</Badge>
              <Badge tone="neutral">{sel.type}</Badge>
              {sel.locked && <Badge tone="warning" className="gap-1"><Lock size={10} /> Locked by tenant admin</Badge>}
            </div>

            <div>
              <Label className="mb-2 block">Cascade chain</Label>
              <div className="space-y-1.5">
                {sel.cascade.map((c, i) => {
                  const isEffective = c.value !== null && sel.cascade.slice(i + 1).every((x) => x.value === null);
                  return (
                    <div key={c.scope} className={cn("flex items-center justify-between rounded-lg border px-3 py-2", isEffective ? "border-success/40 bg-success-muted/40" : "border-border/60")}>
                      <span className="flex items-center gap-2 text-[12.5px]">
                        <Badge tone={SCOPE_TONE[c.scope]}>{c.scope}</Badge>
                        {isEffective && <Badge tone="success">effective</Badge>}
                      </span>
                      <span className={cn("tnum text-[12.5px]", c.value === null ? "text-muted-foreground italic" : "font-medium")}>
                        {c.value ?? "— inherits —"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {sel.overridable && !sel.locked && (
              <Field label="Override value at current scope" hint="Saved to the active tenant/branch/user layer.">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} className="tnum" />
              </Field>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
