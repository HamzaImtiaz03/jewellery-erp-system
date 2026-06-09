/** Representational sales data — SRS §5.6 sales_invoice / sales_invoice_line. */

export interface Invoice {
  invoice_no: string;
  customer: string;
  date: string;
  branch: string;
  cashier: string;
  status: string;
  sub_total: number;
  tax_total: number;
  grand_total: number;
  paid: number;
  items: number;
  fine_weight: number;
  payment: string;
}

export const invoices: Invoice[] = [
  { invoice_no: "INV-2026-04417", customer: "Aisha Al-Rashid", date: "2026-06-09T11:42:00", branch: "Olaya", cashier: "Noura S.", status: "PAID", sub_total: 45500, tax_total: 2275, grand_total: 48250, paid: 48250, items: 3, fine_weight: 64.18, payment: "Card · mada" },
  { invoice_no: "INV-2026-04416", customer: "Walk-in", date: "2026-06-09T09:12:00", branch: "Olaya", cashier: "Noura S.", status: "PARTIALLY_PAID", sub_total: 8476, tax_total: 424, grand_total: 8900, paid: 5000, items: 1, fine_weight: 22.45, payment: "Cash + Credit" },
  { invoice_no: "INV-2026-04415", customer: "Mohammed Khan", date: "2026-06-09T08:55:00", branch: "Granada", cashier: "Faisal A.", status: "CONFIRMED", sub_total: 132380, tax_total: 6619, grand_total: 138999, paid: 0, items: 5, fine_weight: 312.9, payment: "Pending" },
  { invoice_no: "INV-2026-04414", customer: "Layla Hariri", date: "2026-06-08T18:30:00", branch: "Tahlia", cashier: "Sara K.", status: "PAID", sub_total: 22900, tax_total: 1145, grand_total: 24045, paid: 24045, items: 2, fine_weight: 41.2, payment: "Bank transfer" },
  { invoice_no: "INV-2026-04413", customer: "Omar Siddiqui", date: "2026-06-08T17:05:00", branch: "Olaya", cashier: "Noura S.", status: "RETURNED", sub_total: 11800, tax_total: 590, grand_total: 12390, paid: 12390, items: 1, fine_weight: 18.9, payment: "Card · Visa" },
  { invoice_no: "INV-2026-04412", customer: "Huda Al-Otaibi", date: "2026-06-08T15:40:00", branch: "Corniche", cashier: "Yousef M.", status: "PAID", sub_total: 67200, tax_total: 3360, grand_total: 70560, paid: 70560, items: 4, fine_weight: 158.3, payment: "Scheme redemption" },
  { invoice_no: "INV-2026-04411", customer: "Walk-in", date: "2026-06-08T14:12:00", branch: "Granada", cashier: "Faisal A.", status: "VOID", sub_total: 4200, tax_total: 210, grand_total: 4410, paid: 0, items: 1, fine_weight: 9.1, payment: "Voided" },
  { invoice_no: "INV-2026-04410", customer: "Khalid Bin Rashed", date: "2026-06-08T12:48:00", branch: "Olaya", cashier: "Mona T.", status: "PAID", sub_total: 289400, tax_total: 14470, grand_total: 303870, paid: 303870, items: 7, fine_weight: 642.5, payment: "Bank transfer" },
  { invoice_no: "INV-2026-04409", customer: "Fatima Noor", date: "2026-06-08T11:20:00", branch: "Tahlia", cashier: "Sara K.", status: "PAID", sub_total: 15600, tax_total: 780, grand_total: 16380, paid: 16380, items: 2, fine_weight: 28.7, payment: "Card · mada" },
  { invoice_no: "INV-2026-04408", customer: "Abdullah Ghamdi", date: "2026-06-07T19:55:00", branch: "Corniche", cashier: "Yousef M.", status: "PARTIALLY_PAID", sub_total: 54200, tax_total: 2710, grand_total: 56910, paid: 30000, items: 3, fine_weight: 121.4, payment: "Cash + EMI" },
  { invoice_no: "INV-2026-04407", customer: "Reem Al-Dosari", date: "2026-06-07T17:30:00", branch: "Olaya", cashier: "Noura S.", status: "PAID", sub_total: 9100, tax_total: 455, grand_total: 9555, paid: 9555, items: 1, fine_weight: 16.2, payment: "Card · Visa" },
  { invoice_no: "INV-2026-04406", customer: "Saud Al-Qahtani", date: "2026-06-07T16:10:00", branch: "Granada", cashier: "Faisal A.", status: "CONFIRMED", sub_total: 78400, tax_total: 3920, grand_total: 82320, paid: 0, items: 4, fine_weight: 184.6, payment: "Pending" },
  { invoice_no: "INV-2026-04405", customer: "Mariam Al-Subai", date: "2026-06-07T13:25:00", branch: "Tahlia", cashier: "Sara K.", status: "PAID", sub_total: 33200, tax_total: 1660, grand_total: 34860, paid: 34860, items: 2, fine_weight: 58.9, payment: "Cash" },
  { invoice_no: "INV-2026-04404", customer: "Walk-in", date: "2026-06-07T11:40:00", branch: "Olaya", cashier: "Mona T.", status: "PAID", sub_total: 6700, tax_total: 335, grand_total: 7035, paid: 7035, items: 1, fine_weight: 12.4, payment: "Card · mada" },
];

export const POS_CART = [
  { tag: "TAG-22K-CHN-00841", item: "Gold Rope Chain 22K", gross: 28.4, net: 27.9, purity: 0.916, fine: 25.56, rate: 245.8, making: 980, stone: 0, line: 7264.45 },
  { tag: "TAG-22K-BNG-01177", item: "Kada Bangle 22K (pair)", gross: 42.1, net: 41.2, purity: 0.916, fine: 37.74, rate: 245.8, making: 1640, stone: 0, line: 10918.5 },
  { tag: "TAG-18K-RNG-02093", item: "Diamond Solitaire Ring 18K", gross: 6.8, net: 4.2, purity: 0.75, fine: 3.15, rate: 201.3, making: 1200, stone: 14500, line: 16334.1 },
];

export const POS_CATALOG = [
  { code: "22K-CHN", name: "Gold Chains 22K", count: 184 },
  { code: "22K-BNG", name: "Bangles 22K", count: 96 },
  { code: "22K-NCK", name: "Necklace Sets", count: 52 },
  { code: "18K-RNG", name: "Diamond Rings", count: 138 },
  { code: "21K-ERG", name: "Earrings 21K", count: 110 },
  { code: "24K-CON", name: "Gold Coins", count: 240 },
  { code: "PT-RNG", name: "Platinum Rings", count: 28 },
  { code: "SLV-ART", name: "Silver Articles", count: 320 },
];
