# Ophir — Jewellery ERP (Frontend UI System)

A production-grade, enterprise **SaaS ERP frontend** for the Multi-Vertical ERP Platform,
derived **strictly** from `Jewellery_ERP_Complete_SRS_v4.3.1.docx` (the single source of truth).
Jewellery is the complete reference vertical.

> **Scope of this build:** the **UI system** — application shell, navigation, design system,
> dashboards and module screens — with **static / representational data only** (no backend).
> Every screen maps directly to an SRS module, submodule, entity or workflow. Nothing is
> introduced outside SRS scope.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000  (login → /dashboard)
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

Tech stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · CSS-variable design tokens · lucide-react · Recharts**.

---

## Architecture

```
src/
├─ app/
│  ├─ layout.tsx                 # root: fonts, ThemeProvider, flash-free theme bootstrap
│  ├─ globals.css                # token-driven design system + 10 themes (SRS L.1)
│  ├─ login/ · not-found.tsx     # auth shell + 404
│  └─ (app)/                     # authenticated shell (sidebar + topbar)
│     ├─ layout.tsx
│     ├─ dashboard/              # Executive lobby (SRS L.2)
│     ├─ sales/{pos,invoices}/   # bespoke flagship screens …
│     ├─ jewellery/{rates,karigar}/
│     ├─ finance/coa/ · admin/users/ · intelligence/{ai-chat,dashboards}/
│     └─ [...slug]/page.tsx      # catch-all → ModuleWorkspace / ModuleHub for every other SRS route
├─ components/
│  ├─ ui/                        # token-driven primitive library (Button, Card, DataTable, …)
│  ├─ layout/                    # Sidebar, Topbar, CommandPalette (AI assist), AppearancePanel
│  ├─ dashboard/charts.tsx       # Recharts wrappers reading theme tokens
│  ├─ module/module-workspace.tsx# generic module renderer
│  └─ theme-provider.tsx         # cascading UI config (user→tenant→system, SRS L.1.3)
└─ lib/
   ├─ nav.ts                     # ★ complete SRS module → submodule → screen IA
   ├─ themes.ts                  # 10 enterprise themes (UI-F01)
   ├─ utils.ts                   # money/weight/rate/date formatting (SRS §5.1.2 precision)
   └─ data/                      # representational static data + module descriptor registry
```

### How the whole SRS is covered without 404s
- **Bespoke screens** (POS, Invoices, Rates board, Karigar kanban, Chart of Accounts tree,
  RBAC matrix, AI Data Chat, Configurable Dashboards, Executive lobby) are explicit route files.
- **Every other SRS route** is served by `[...slug]/page.tsx`, which renders either a
  **ModuleHub** (for parent modules) or a **ModuleWorkspace** driven by a descriptor in
  `lib/data/modules.ts` (KPIs, record table, §10 state-machine pipeline, FR capabilities).
- Routes not in the nav map correctly return **404**.

---

## SRS conformance highlights

| SRS reference | Realized as |
|---|---|
| §1.3 Layered module map | `lib/nav.ts` — sidebar IA (Operations · Financials · People · Production & Insight · Administration) |
| §5.1.2 Types & precision | `lib/utils.ts` — money `(16,2)`, grams `(14,3)`, rate `(14,4)`, tabular figures everywhere |
| §6 RBAC | `/admin/users` — roles, users, permission matrix, sensitive-action notes |
| §9 / §10 Enums & state machines | `StatusBadge` tone map + workflow pipelines on every workspace |
| §8 Strategy interfaces | Rate engine (PricingStrategy), valuation, dual-ledger posting surfaces |
| Appendix L.1 Token design system | 10 themes, density, radius, RTL — all CSS-variable driven, zero hard-coded hex |
| Appendix L.2 Personal lobby | Executive dashboard with customizable widgets + quick actions |
| Appendix L.3 Embedded AI assist | Command palette with voice / document / text modes (drafts require confirmation) |
| JWL-RATE / JWL-KAR / JWL-INV / ACC-* | Rates board · Karigar reconciliation · tag inventory · COA / journals / AR / AP |

---

## Design system (token-driven)

All styling derives from CSS variables owned by the active theme (`<html data-theme data-density>`).
Switching theme swaps token values and re-skins the entire UI with **zero component changes**
(SRS UI-F07). 10 enterprise themes ship including dark and high-contrast variants; density
(compact/comfortable/spacious), corner radius and RTL are configurable from the **Appearance**
panel (top-bar palette icon). Configuration persists per user (localStorage stands in for the
DB-backed `ui_preference` table).

---

## Notes
- **Static data**: all figures are representational (SRS §9 seeds no client figures). Wiring to
  real APIs means replacing `lib/data/*` and the descriptor registry with data-layer calls; the
  UI components and routes stay unchanged.
- **Source of truth**: `_SRS_extracted.md` is a plain-text extraction of the `.docx` SRS
  (regenerate with `python _extract_docx.py`). The SRS itself governs all scope decisions.

Built to SRS v4.3.1 · "One document. One source of truth. Buildable end to end."
