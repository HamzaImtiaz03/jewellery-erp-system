/**
 * Representational dashboard data (SRS L.2 personal lobby + §5.8 widget/metric
 * model). Static figures only — no client data is seeded (SRS §9).
 */

export const salesTrend = [
  { label: "Dec", revenue: 4180000, lastYear: 3640000 },
  { label: "Jan", revenue: 4620000, lastYear: 3980000 },
  { label: "Feb", revenue: 4410000, lastYear: 4120000 },
  { label: "Mar", revenue: 5230000, lastYear: 4350000 },
  { label: "Apr", revenue: 5870000, lastYear: 4690000 },
  { label: "May", revenue: 6240000, lastYear: 5010000 },
  { label: "Jun", revenue: 6815000, lastYear: 5380000 },
];

export const salesByCategory = [
  { label: "Gold Chains", value: 2140000 },
  { label: "Bangles", value: 1680000 },
  { label: "Rings", value: 1320000 },
  { label: "Necklace Sets", value: 980000 },
  { label: "Diamond", value: 1460000 },
  { label: "Coins/Bullion", value: 1235000 },
];

export const metalByPurity = [
  { name: "24K (0.9999)", value: 18420 },
  { name: "22K (0.9160)", value: 42680 },
  { name: "21K (0.8750)", value: 15240 },
  { name: "18K (0.7500)", value: 9860 },
];

export const channelMix = [
  { name: "Showroom POS", value: 64 },
  { name: "E-commerce", value: 18 },
  { name: "B2B / Dealer", value: 12 },
  { name: "Field Sales", value: 6 },
];

export const recentActivity = [
  { id: "INV-2026-04417", type: "Sale", party: "Aisha Al-Rashid", amount: "48,250.00 SAR", status: "PAID", time: "2026-06-09T11:42:00" },
  { id: "PO-2026-00318", type: "Purchase", party: "Emirates Gold DMCC", amount: "1,284,000.00 SAR", status: "APPROVED", time: "2026-06-09T10:18:00" },
  { id: "KJ-2026-02041", type: "Karigar Job", party: "Karigar — Suresh M.", amount: "182.450 g", status: "IN_PROGRESS", time: "2026-06-09T09:55:00" },
  { id: "RET-2026-00219", type: "Return", party: "Mohammed Khan", amount: "12,400.00 SAR", status: "RETURNED", time: "2026-06-09T09:30:00" },
  { id: "INV-2026-04416", type: "Sale", party: "Walk-in", amount: "8,900.00 SAR", status: "PARTIALLY_PAID", time: "2026-06-09T09:12:00" },
  { id: "SCH-2026-00744", type: "Scheme", party: "Fatima Noor", amount: "2,000.00 SAR", status: "ACTIVE", time: "2026-06-09T08:47:00" },
];

export const alerts = [
  { title: "3 high-value transactions awaiting AML review", tone: "danger" as const, srs: "M.1.3" },
  { title: "Karigar job KJ-2041 overdue by 2 days (182.45g issued)", tone: "warning" as const, srs: "JWL-KAR" },
  { title: "Dead stock: 42 pieces with no movement > 180 days", tone: "warning" as const, srs: "F.4.5" },
  { title: "Gold 22K rate not yet locked for today's session", tone: "info" as const, srs: "JWL-RATE" },
];

export const metalRates = [
  { metal: "Gold", purity: "24K", rate: 268.4, change: 1.2 },
  { metal: "Gold", purity: "22K", rate: 245.8, change: 1.1 },
  { metal: "Gold", purity: "21K", rate: 234.7, change: 1.0 },
  { metal: "Gold", purity: "18K", rate: 201.3, change: 0.9 },
  { metal: "Silver", purity: "999", rate: 3.18, change: -0.4 },
  { metal: "Platinum", purity: "950", rate: 124.6, change: 0.3 },
];
