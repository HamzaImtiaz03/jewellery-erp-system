import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Gem,
  Truck,
  Landmark,
  Users,
  HeartHandshake,
  Factory,
  BarChart3,
  Settings2,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Application navigation — derived strictly from the SRS layered module map
 * (§1.3) and the Part B / Appendix functional specs. Each leaf maps to a
 * concrete SRS module, submodule or workflow. Nothing here is outside SRS scope.
 *
 *   SRS layer A → Administration            SRS layer E → CRM & Engagement
 *   SRS layer B → Sales · Inventory · Procurement   SRS layer F → Intelligence
 *   SRS layer C → Finance                   SRS layer G → Administration (Platform Ops)
 *   SRS layer D → Human Capital             SRS layer H → Jewellery vertical pack
 */

export interface NavLeaf {
  label: string;
  href: string;
  /** SRS requirement-id cluster this screen realizes (traceability §16) */
  srs?: string;
  badge?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavLeaf[];
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        id: "sales",
        label: "Sales & POS",
        href: "/sales",
        icon: ShoppingCart,
        children: [
          { label: "Point of Sale", href: "/sales/pos", srs: "E.8 / JWL" },
          { label: "Invoices", href: "/sales/invoices", srs: "B.5 sales_invoice" },
          { label: "Quotations & Orders", href: "/sales/orders", srs: "JWL-ORD" },
          { label: "Returns & Exchange", href: "/sales/returns", srs: "E.3" },
          { label: "Old-Gold Buyback", href: "/sales/buyback", srs: "JWL-OLD" },
          { label: "Approval / Memo", href: "/sales/approvals", srs: "JWL-ORD" },
          { label: "Repairs & Custom Orders", href: "/sales/repairs", srs: "JWL-ORD" },
          { label: "Installment / EMI Sales", href: "/sales/installments", srs: "M.2.2" },
          { label: "Shifts & Day-Close", href: "/sales/day-close", srs: "ACC Day-Close" },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        href: "/inventory",
        icon: Boxes,
        children: [
          { label: "Item Catalog", href: "/inventory/items", srs: "Item Catalog" },
          { label: "Stock Tags", href: "/inventory/tags", srs: "JWL-INV" },
          { label: "Stock by Purity", href: "/inventory/by-purity", srs: "JWL-INV" },
          { label: "Transfers", href: "/inventory/transfers", srs: "Transfers" },
          { label: "Stock Count & Audit", href: "/inventory/stock-count", srs: "E.7" },
          { label: "Alterations & Dismantling", href: "/inventory/alterations", srs: "F.4.1/4.2" },
          { label: "RFID & Anti-Theft", href: "/inventory/rfid", srs: "F.4.3" },
          { label: "Dead & Slow-Moving Stock", href: "/inventory/dead-stock", srs: "F.4.5 / I.3" },
        ],
      },
      {
        id: "jewellery",
        label: "Jewellery",
        href: "/jewellery",
        icon: Gem,
        children: [
          { label: "Metal & Weight", href: "/jewellery/metal", srs: "JWL-MTL" },
          { label: "Rates & Bullion", href: "/jewellery/rates", srs: "JWL-RATE" },
          { label: "Karigar Job-work", href: "/jewellery/karigar", srs: "JWL-KAR" },
          { label: "Old Gold & Refining", href: "/jewellery/refining", srs: "JWL-OLD" },
          { label: "Stones & Certification", href: "/jewellery/stones", srs: "JWL-STN" },
          { label: "Hallmarking & HUID", href: "/jewellery/hallmarking", srs: "JWL-HM" },
          { label: "Saving Schemes (Chit)", href: "/jewellery/schemes", srs: "JWL-SCH" },
          { label: "Valuation & COGS", href: "/jewellery/valuation", srs: "JWL-COGS" },
          { label: "Metal Hedging", href: "/jewellery/hedging", srs: "F.1" },
          { label: "Bullion Trading Desk", href: "/jewellery/bullion-trading", srs: "F.2" },
          { label: "Gold Testing Lab", href: "/jewellery/lab", srs: "F.6" },
        ],
      },
      {
        id: "procurement",
        label: "Procurement",
        href: "/procurement",
        icon: Truck,
        children: [
          { label: "Purchase Orders", href: "/procurement/orders", srs: "Purchase" },
          { label: "Goods Receipt", href: "/procurement/receipts", srs: "Purchase" },
          { label: "Suppliers / Vendors", href: "/procurement/suppliers", srs: "Vendors" },
          { label: "Landed Cost", href: "/procurement/landed-cost", srs: "E.6" },
          { label: "Supplier Compliance", href: "/procurement/compliance", srs: "M.4" },
        ],
      },
    ],
  },
  {
    id: "financials",
    label: "Financials",
    items: [
      {
        id: "finance",
        label: "Finance",
        href: "/finance",
        icon: Landmark,
        children: [
          { label: "Chart of Accounts", href: "/finance/coa", srs: "ACC-COA" },
          { label: "Journals & GL", href: "/finance/journals", srs: "ACC-JRN" },
          { label: "Accounts Receivable", href: "/finance/ar", srs: "ACC-SUB" },
          { label: "Accounts Payable", href: "/finance/ap", srs: "ACC-SUB" },
          { label: "Cash & Bank", href: "/finance/cash-bank", srs: "E.4" },
          { label: "Payments", href: "/finance/payments", srs: "Payments" },
          { label: "Period Close & Statements", href: "/finance/period-close", srs: "ACC-CL" },
          { label: "Branch P&L", href: "/finance/branch-pnl", srs: "Branch P&L" },
          { label: "Fixed Assets", href: "/finance/fixed-assets", srs: "ACC-FA" },
          { label: "Multi-Currency & Consolidation", href: "/finance/multi-currency", srs: "ACC-MC" },
          { label: "Budgeting", href: "/finance/budgeting", srs: "Budgeting" },
          { label: "Tax & E-Invoicing", href: "/finance/tax", srs: "Appx A/B/C" },
        ],
      },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      {
        id: "hcm",
        label: "Human Capital",
        href: "/hcm",
        icon: Users,
        children: [
          { label: "Employees", href: "/hcm/employees", srs: "HR-EMP" },
          { label: "Recruitment (ATS)", href: "/hcm/recruitment", srs: "HR-ATS" },
          { label: "Onboarding / Offboarding", href: "/hcm/onboarding", srs: "HR-ON" },
          { label: "Attendance & Shifts", href: "/hcm/attendance", srs: "HR-ATT" },
          { label: "Leave", href: "/hcm/leave", srs: "HR-LV" },
          { label: "Payroll", href: "/hcm/payroll", srs: "HR-PAY" },
          { label: "EOSB / Gratuity", href: "/hcm/eosb", srs: "HR-EOSB" },
          { label: "Loans & Advances", href: "/hcm/loans", srs: "HR-LOAN" },
          { label: "Performance", href: "/hcm/performance", srs: "HR-PERF" },
          { label: "Training & LMS", href: "/hcm/training", srs: "HR-LMS" },
          { label: "Commission & Incentives", href: "/hcm/commission", srs: "HR-COMM" },
          { label: "Visa & Compliance", href: "/hcm/compliance", srs: "HR-DOC" },
        ],
      },
      {
        id: "crm",
        label: "CRM & Engagement",
        href: "/crm",
        icon: HeartHandshake,
        children: [
          { label: "Customers", href: "/crm/customers", srs: "CRM" },
          { label: "Loyalty", href: "/crm/loyalty", srs: "Loyalty" },
          { label: "Promotions", href: "/crm/promotions", srs: "E.1" },
          { label: "Marketing Automation", href: "/crm/marketing", srs: "MKT" },
          { label: "Appointments & Consultations", href: "/crm/appointments", srs: "M.6.1" },
          { label: "AML & KYC", href: "/crm/aml-kyc", srs: "M.1" },
          { label: "Notifications", href: "/crm/notifications", srs: "Notifications" },
        ],
      },
    ],
  },
  {
    id: "production",
    label: "Production & Insight",
    items: [
      {
        id: "manufacturing",
        label: "Manufacturing",
        href: "/manufacturing",
        icon: Factory,
        children: [
          { label: "Production Planning / MRP", href: "/manufacturing/mrp", srs: "MRP" },
          { label: "Quality Management", href: "/manufacturing/quality", srs: "QM" },
          { label: "Tree Making & Casting", href: "/manufacturing/tree-making", srs: "F.3.1" },
          { label: "Product Lifecycle (PLM)", href: "/manufacturing/plm", srs: "PLM" },
        ],
      },
      {
        id: "intelligence",
        label: "Intelligence",
        href: "/intelligence",
        icon: BarChart3,
        children: [
          { label: "Dashboards", href: "/intelligence/dashboards", srs: "Dashboards" },
          { label: "Reports", href: "/intelligence/reports", srs: "Reports" },
          { label: "KPI Engine", href: "/intelligence/kpi", srs: "KPI Engine" },
          { label: "BI & Analytics", href: "/intelligence/bi", srs: "BI / M.7" },
          { label: "AI Data Chat", href: "/intelligence/ai-chat", srs: "AI Data Chat (MCP)" },
          { label: "Documents", href: "/intelligence/documents", srs: "Documents" },
        ],
      },
    ],
  },
  {
    id: "platform",
    label: "Administration",
    items: [
      {
        id: "admin",
        label: "Administration",
        href: "/admin",
        icon: Settings2,
        children: [
          { label: "Tenancy", href: "/admin/tenancy", srs: "Tenancy" },
          { label: "Branches", href: "/admin/branches", srs: "Branches" },
          { label: "Users & Roles (RBAC)", href: "/admin/users", srs: "§6 RBAC" },
          { label: "Permissions & Endpoints", href: "/admin/permissions", srs: "§6.4" },
          { label: "Domain Registry", href: "/admin/domain-registry", srs: "Domain Registry" },
          { label: "Attribute Engine", href: "/admin/attributes", srs: "§5.7" },
          { label: "Numbering", href: "/admin/numbering", srs: "Numbering" },
          { label: "Localization & RTL", href: "/admin/localization", srs: "LOC" },
          { label: "Workflow & Settings", href: "/admin/workflow", srs: "Settings/Workflow" },
          { label: "Audit Log", href: "/admin/audit", srs: "Audit" },
          { label: "Integrations & Webhooks", href: "/admin/integrations", srs: "Integrations" },
          { label: "Import / Export / Migration", href: "/admin/data-migration", srs: "Appx D / G2" },
          { label: "Backup & Retention", href: "/admin/backup", srs: "Backup/Retention" },
          { label: "Observability", href: "/admin/observability", srs: "Observability" },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: Settings,
        children: [
          { label: "Approval Workflows", href: "/settings/workflows", srs: "A10 engine" },
          { label: "Business Parameters", href: "/settings/parameters", srs: "§2.3 config" },
          { label: "Configuration Registry", href: "/settings/configuration", srs: "settings cascade" },
        ],
      },
    ],
  },
];

/** Flat index of every route → its breadcrumb trail, for the topbar/breadcrumbs. */
export interface RouteMeta {
  href: string;
  label: string;
  parent?: { label: string; href: string };
  section: string;
  /** top-level module id (for per-module colour) */
  moduleId: string;
}

export const ROUTE_INDEX: Record<string, RouteMeta> = (() => {
  const idx: Record<string, RouteMeta> = {};
  for (const section of NAV) {
    for (const item of section.items) {
      idx[item.href] = { href: item.href, label: item.label, section: section.label, moduleId: item.id };
      for (const leaf of item.children ?? []) {
        idx[leaf.href] = {
          href: leaf.href,
          label: leaf.label,
          parent: { label: item.label, href: item.href },
          section: section.label,
          moduleId: item.id,
        };
      }
    }
  }
  return idx;
})();

/** Quick-action shortcuts (SRS LOBBY-F04: pinnable quick actions). */
export const QUICK_ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "New Sale", href: "/sales/pos", icon: ShoppingCart },
  { label: "New Purchase", href: "/procurement/orders", icon: Truck },
  { label: "New Item", href: "/inventory/items", icon: Boxes },
  { label: "New Journal", href: "/finance/journals", icon: Landmark },
];
