"use client";

import * as React from "react";
import {
  Search,
  Scan,
  Plus,
  Minus,
  Trash2,
  User,
  Sparkles,
  Tag,
  Percent,
  Banknote,
  X,
  Gem,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { POS_CART, POS_CATALOG } from "@/lib/data/sales";
import { formatMoney, formatGrams } from "@/lib/utils";

export default function PosPage() {
  const [cart, setCart] = React.useState(POS_CART);

  const subTotal = cart.reduce((s, l) => s + l.line, 0);
  const vat = subTotal * 0.05;
  const total = subTotal + vat;
  const fineTotal = cart.reduce((s, l) => s + l.fine, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px] -mt-1 h-[calc(100vh-104px)]">
      {/* LEFT — catalog */}
      <div className="flex flex-col gap-4 min-h-0">
        <div className="flex items-center gap-2">
          <Input icon={Search} placeholder="Scan tag / search item, SKU, HUID…" className="h-11 text-[15px]" />
          <Button variant="outline" size="lg" icon={Scan} className="h-11">Scan</Button>
          <Button variant="accent" size="lg" icon={Sparkles} className="h-11">AI</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Gold 22K", "Gold 21K", "Diamond 18K", "Coins", "Silver", "Platinum"].map((c, i) => (
            <button
              key={c}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
          {POS_CATALOG.map((p) => (
            <button
              key={p.code}
              className="lift group flex flex-col items-start gap-2 rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-sm p-3 text-left transition-all hover:border-accent hover:shadow-lg"
            >
              <div className="flex h-20 w-full items-center justify-center rounded-xl bg-gradient-to-br from-accent-muted/60 to-muted">
                <Gem size={28} className="text-accent/70" />
              </div>
              <div className="w-full">
                <p className="text-[13px] font-medium leading-tight truncate">{p.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground tnum">{p.code}</span>
                  <Badge tone="neutral">{p.count} in stock</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT — cart / payment */}
      <div className="flex flex-col rounded-2xl border border-border/60 bg-surface/80 supports-[backdrop-filter]:bg-surface/70 backdrop-blur-xl shadow-glass min-h-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Current Sale</p>
            <p className="text-[11px] text-muted-foreground">Olaya · Till 02 · Shift #418</p>
          </div>
          <Badge tone="success" dot>22K @ 245.80/g</Badge>
        </div>

        {/* customer */}
        <button className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-left hover:bg-muted/40 transition-colors">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-primary">
            <User size={16} />
          </span>
          <div className="flex-1">
            <p className="text-[13px] font-medium">Aisha Al-Rashid</p>
            <p className="text-[11px] text-muted-foreground">Loyalty Gold · 2,480 pts · KYC verified</p>
          </div>
          <Plus size={16} className="text-muted-foreground" />
        </button>

        {/* lines */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {cart.map((l, idx) => (
            <div key={l.tag} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium leading-tight">{l.item}</p>
                  <p className="text-[11px] text-muted-foreground tnum flex items-center gap-1">
                    <Tag size={10} /> {l.tag}
                  </p>
                </div>
                <IconButton
                  icon={Trash2}
                  label="Remove"
                  className="h-7 w-7 text-muted-foreground hover:text-danger"
                  onClick={() => setCart((c) => c.filter((_, i) => i !== idx))}
                />
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5 text-[11px]">
                <Mini label="Net Wt" value={formatGrams(l.net)} />
                <Mini label="Fine" value={`${l.fine.toFixed(3)}g`} />
                <Mini label="Rate" value={l.rate.toFixed(2)} />
                <Mini label="Making" value={formatMoney(l.making, "", { compact: true })} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                {l.stone > 0 ? (
                  <span className="text-[11px] text-muted-foreground">Stone {formatMoney(l.stone)}</span>
                ) : <span />}
                <span className="text-[14px] font-semibold tnum">{formatMoney(l.line)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* totals */}
        <div className="border-t border-border px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Gem size={12} /> Total fine weight</span>
            <span className="tnum font-medium text-foreground">{formatGrams(fineTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Sub-total</span>
            <span className="tnum font-medium">{formatMoney(subTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <button className="inline-flex items-center gap-1 text-accent hover:underline"><Percent size={12} /> Discount</button>
            <span className="tnum">— 0.00</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">VAT (5%)</span>
            <span className="tnum font-medium">{formatMoney(vat)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-xl font-bold tnum">{formatMoney(total)}</span>
          </div>
        </div>

        {/* actions */}
        <div className="grid grid-cols-3 gap-2 border-t border-border p-3">
          <Button variant="outline">Hold</Button>
          <Button variant="outline">Old Gold</Button>
          <Button variant="accent" icon={Banknote}>Pay</Button>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-muted/70 px-2 py-1">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="tnum font-medium text-foreground leading-tight">{value}</p>
    </div>
  );
}
