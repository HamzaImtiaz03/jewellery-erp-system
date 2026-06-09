SOFTWARE REQUIREMENTS & TECHNICAL DESIGN SPECIFICATION
Multi-Vertical ERP Platform
The Complete Build Specification
Architecture · Engineering Standards · Data Dictionary · RBAC · API · Strategy Contracts · Enums · State Machines · Full Functional Spec
Reference vertical: Jewellery (complete)  ·  Designed to be built by AI coding agents
One document. One source of truth. Buildable end to end.

# Document Control

[TABLE]
| Field | Value |
| Title | Multi-Vertical ERP Platform — Complete Build Specification |
| Version | 4.3.1 (production-hardening pass: structural consistency, cross-reference and version-note corrections; no functional change) |
| Supersedes | Volume I (architecture baseline), Volume II (deep functional spec), and v4.0. This single document consolidates all prior volumes and the gap-fill additions (Parts F–K) from the 5-ERP analysis. |
| Purpose | The single source of truth from which AI coding agents generate schema, APIs, services and UI without inventing contracts. |
| Completeness | Covers the architectural ‘what/why’ and the engineering ‘how’: data dictionary to field level, RBAC model + endpoint registry, API conventions + catalog, strategy interface signatures, enums and seed data, and state machines — alongside the full functional specification. |
| Reference vertical | Jewellery, specified completely; other verticals are thin packs enabled later. |
[/TABLE]

How agents must use this document. Contracts are binding. The data dictionary (§5), RBAC model (§6), API conventions (§7), strategy interfaces (§8), enums (§9) and state machines (§10) are not illustrative — they are the definitions to implement exactly. Where this document defines a field, type, permission key, interface signature or state transition, the agent implements it as written and does not invent an alternative. Where exhaustive expansion is required beyond the representative set, the agent follows the stated generation rule and the conventions, never an ad-hoc guess.
Section numbering. Part A contracts are numbered §1, §2, §3, §5–§10 (there is no §4; the sequence is intentional and stable so existing cross-references remain valid). The functional specification is in Part B as §B.3–§B.6. Non-functional requirements, traceability and glossary are §15–§17. Appendices A–M follow. All internal cross-references resolve against this scheme.

# Table of Contents

# 1. Platform Architecture
## 1.1 What this platform is
A multi-tenant, cloud-native ERP platform with a domain-agnostic core and pluggable vertical packs. A tenant's industry is a domain value resolved to a manifest that configures enabled modules, entity attributes, behavioural strategies, the seeded Chart of Accounts, dashboard presets and terminology. Jewellery is built in full; other verticals are added later as packs without touching the core.
## 1.2 Architectural principles
- Domain-agnostic core. No core module branches on domain; behaviour is injected via strategies resolved from the manifest.
- Configuration over code. A vertical is primarily a manifest; code is added only where behaviour genuinely differs.
- Strategies for behaviour, attributes for shape. Stock tracking, pricing, valuation, posting, documents and numbering vary behind interfaces; domain data shape rides on typed JSONB attributes with no core DDL.
- Tenant- and branch-aware everywhere; financial-grade integrity. RLS isolation, exact decimals, atomic multi-ledger posting, immutable history.
## 1.3 Layered module map

[TABLE]
| Layer | Name | Modules |
| A | Platform Foundation | Tenancy · Branches · Identity/RBAC ★ · Domain Registry ★ · Attribute Engine ★ · Master Data · Numbering · Localization/RTL · Audit · Settings/Workflow |
| B | Core Operations | Item Catalog ★ · Inventory ★ · Pricing/Rate ★ · Sales/POS · Purchase · Vendors · Transfers · Returns/Exchange/Buyback · Production/Job-work · Tax · Payments ★ |
| C | Financial | COA · GL · AR · AP · Cash & Bank · Day-Close ★ · Period Close & Statements · Branch P&L ★ · Fixed Assets · Multi-currency/Consolidation · Budgeting |
| D | Human Capital | Recruitment · Onboarding · Employees · Attendance · Leave · Payroll · EOSB · Loans · Performance · Training · Commission · Compliance |
| E | Engagement | CRM · Loyalty · Schemes · Promotions · Marketing Automation · Notifications |
| F | Intelligence & Experience | Configurable Dashboards ★★ · Reports · KPI Engine · BI · AI Data Chat (MCP) · Documents |
| G | Platform Operations | Integrations/Webhooks · Import/Export/Migration · Backup/Retention · Observability |
| H | Vertical Packs | Jewellery (full) · Pharmacy · Footwear · Cafe (later) |
[/TABLE]

The domain abstraction (registry, manifest, strategies, attribute engine), multi-tenancy/RLS, multi-branch model and the new-vertical playbook are specified in the architecture baseline and summarized in §1; this document concentrates remaining depth on the build contracts (§5–§10) and the full functional spec (Part B, §B.3–§B.6).

# 2. Engineering Standards & Code Architecture
These standards are binding on all generated code. They exist to keep the system loosely coupled, clean, dynamic, and free of duplicated logic, with one source of truth per concern and swappable external providers.
## 2.1 Loose coupling & clean architecture
- Layered, dependency-inverted. Controllers depend on services; services depend on repository and provider interfaces, not concrete implementations. Domain logic never imports framework or vendor SDKs directly.
- Module boundaries. Each functional module is self-contained (controller, service, DTOs, repository, types) and communicates with other modules only through their public service interface or domain events — never by reaching into another module's internals or tables directly.
- Dependency injection everywhere. All cross-cutting and external dependencies (providers, strategies, repositories) are injected by interface token, so any implementation can be swapped without touching consumers.
- Thin controllers, rich services, dumb DTOs. Controllers validate and delegate; business rules live in services; DTOs carry data and validation only.
## 2.2 Single source of truth (no duplication)
Each piece of logic, each constant, each contract exists in exactly one place and is referenced everywhere else. Duplicated functionality is a defect.
- Shared logic is extracted. Common behaviour (tenant scoping, audit stamping, soft-delete filtering, pagination, money/weight math, rounding) lives in shared base classes, utilities or interceptors — implemented once, reused by all modules.
- One definition per contract. A type/shape is defined once (e.g. a shared types package) and imported by backend and frontend; the API schema is generated from it, not hand-copied.
- Calculations centralized. Fine-weight, pricing, tax, COGS and GL-posting math each live in one service/strategy and are called from everywhere; no module re-implements them.
- Configuration not constants-in-code. Business parameters (tax rates, tolerances, making-charge rules) are data/config, edited once, never hard-coded in multiple files.
## 2.3 Dynamic & configuration-driven
- Behaviour resolved at runtime. Domain behaviour comes from the manifest and strategy bindings; new domains, attributes, dashboards and documents are added by configuration, not by editing core code.
- Data-driven UI. Forms, dashboards and document layouts render from definitions (attribute schema, widget registry, templates) rather than bespoke hard-coding per screen.
## 2.4 Switchable integration providers (enum/env-driven)
Every external integration sits behind a provider interface, with the active implementation selected by an enum value backed by environment configuration. Switching the environment variable switches the provider with no code change and no consumer impact — a direct requirement of this platform.
Provider abstraction pattern (illustrative signatures)

[TABLE]
| // One interface per capability; many implementations; one active, chosen by env. |
| interface EmailProvider  { send(msg: EmailMessage): Promise<SendResult>; } |
| interface SmsProvider    { send(msg: SmsMessage):   Promise<SendResult>; } |
| interface StorageProvider{ put(f: FileRef): Promise<StoredRef>; getUrl(k: string): Promise<string>; } |
| interface PaymentGateway { charge(req: ChargeRequest): Promise<ChargeResult>; refund(...): ... } |
| interface RateFeedProvider { latest(metal: Metal, purity: Purity): Promise<Rate>; } |
|  |
| enum EmailProviderKind   { SES, SENDGRID, SMTP, MAILGUN } |
| enum SmsProviderKind     { TWILIO, SNS, UNIFONIC } |
| enum StorageProviderKind { S3, GCS, LOCAL } |
| enum PaymentGatewayKind  { STRIPE, TADAWUL, TAP, MANUAL } |
|  |
| // Resolution: a factory reads the env-configured kind and returns the bound impl. |
| EMAIL_PROVIDER=SENDGRID   SMS_PROVIDER=TWILIO   STORAGE_PROVIDER=S3   PAYMENT_GATEWAY=TADAWUL |
|  |
| @Injectable() class EmailService { |
| constructor(@Inject('EmailProvider') private provider: EmailProvider) {} |
| // callers use EmailService; they never know or care which provider is active. |
| } |
[/TABLE]

- Capabilities covered: email, SMS, push, WhatsApp, file storage, payment gateway, metal-rate feed, e-invoicing/fiscal device, and any future integration — all follow this exact pattern.
- Per-tenant override: the default comes from env; a tenant may override its provider in settings (e.g. a tenant's own SMTP), resolved the same way.
- No vendor leakage: vendor SDKs are confined to their provider implementation; the rest of the system depends only on the interface.
## 2.5 Errors, validation & consistency
- Typed domain errors (e.g. InsufficientStock, RateNotSet, AlreadySold, PeriodClosed) mapped to HTTP/error codes by one global filter; vendor/Prisma errors never leak.
- Validation at the edge via DTO schemas; the same shared schema validates on the client for UX and on the server for trust.
- Consistent envelope for every API response and error (§7).

# 3. Concurrency, Idempotency & Transactional Integrity
Stock and money are contested. The platform guarantees correctness under concurrency as a first-class requirement.
- Atomic posting. Stock, GL and (jewellery) metal-ledger movements for one event post in a single database transaction — all or none.
- Single-sale of serialized stock. A tagged piece transitions IN_STOCK → SOLD via a conditional update that succeeds for exactly one caller; concurrent attempts fail cleanly. No double-sale.
- Guarded quantity decrement. Quantity stock decrements only where available ≥ requested; overselling is impossible.
- Optimistic concurrency. Mutable rows carry a version; lost-update writes are rejected and retried.
- Idempotent money movement. Every payment/refund/post carries an idempotency key; replays return the original result. A source document posts to the GL exactly once (unique source reference).
- DB-level guards. RLS, balance-before-post triggers, immutability triggers on posted/closed rows, and gap-free per-branch sequences.
Acceptance criteria.
- Given a piece IN_STOCK, when two tills sell it simultaneously, then exactly one sale completes and the other gets AlreadySold with no side effects.
- Given a payment with idempotency key K succeeded, when K is resubmitted, then the original result is returned and no second charge or journal is created.
- Given EMAIL_PROVIDER is changed from SES to SENDGRID and the app restarts, when an email is sent, then it routes via SendGrid with no code change.

# 5. Data Architecture & Data Dictionary
This section defines the database to field level. Conventions in §5.1 are binding on every table. §5.2 onward gives the field-level definition of the core and jewellery tables. Tables not exhaustively listed are generated by applying §5.1 conventions to the entities named in each module's functional spec (Part B, §B.3–§B.6); the generation rule is stated in §5.9.
## 5.1 Conventions (binding)
### 5.1.1 Standard columns on every business table
Mandatory columns (omitted from per-table listings below for brevity)

[TABLE]
| id          uuid         PK, default gen_random_uuid() |
| tenant_id   uuid         NOT NULL, FK tenant(id), RLS scope, indexed |
| branch_id   uuid         NULL/NOT NULL (NOT NULL on operational tables), FK branch(id), indexed |
| created_at  timestamptz  NOT NULL default now() |
| updated_at  timestamptz  NOT NULL  (auto-maintained) |
| created_by  uuid         NULL  FK user(id) |
| updated_by  uuid         NULL  FK user(id) |
| deleted_at  timestamptz  NULL   (soft delete; all reads filter deleted_at IS NULL) |
| version     int          NOT NULL default 0  (optimistic concurrency, where mutable) |
[/TABLE]

### 5.1.2 Types & precision

[TABLE]
| Class | Storage type |
| Money amount | numeric(16,2) — never float |
| Weight (grams) | numeric(14,3) |
| Weight (carats) | numeric(10,3) |
| Rate per unit | numeric(14,4) |
| Purity / factor | numeric(6,4) |
| Percentage | numeric(7,4) |
| Identifier (surrogate) | uuid |
| Human document number | text (separate unique per-branch sequence; never the PK) |
| Domain attributes | jsonb (validated by attribute engine; GIN-indexed on queried keys) |
| Enum | text constrained by app enum + check, or Postgres enum where stable |
[/TABLE]

### 5.1.3 Keys, indexes, integrity
- UUID surrogate PK on every table; no business meaning in the PK.
- Index every FK and every column used in a hot filter or sort; composite (tenant_id, branch_id, status) where listing is common.
- Row-level security policy on every tenant table keyed to the request tenant GUC.
- Independent FKs for hierarchical masters (category_id, sub_category_id, item_id each present on the line) — not chained.
- Posted financial rows and closed-period rows are immutable (enforced by trigger).

## 5.2 Foundation tables
Table  tenant
Root isolation entity. RLS scopes all tenant-owned tables to tenant.id.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| name | text | N |  | Organization name |
| domain | text | N | FK | domain_definition.code — drives the whole vertical config |
| status | text | N |  | enum TenantStatus: PROVISIONING|ACTIVE|SUSPENDED|ARCHIVED |
| plan | text | Y |  | subscription plan code |
| base_currency | text | N |  | ISO 4217 |
| settings | jsonb | Y |  | tenant-level config overrides |
[/TABLE]

Table  branch

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK | owner tenant |
| code | text | N |  | unique per tenant |
| name | text | N |  | display name |
| parent_branch_id | uuid | Y | FK | self — for groups/regions |
| timezone | text | N |  | IANA tz for day-close boundaries |
| currency | text | Y |  | branch currency if different |
| status | text | N |  | enum BranchStatus: ACTIVE|INACTIVE |
[/TABLE]

## 5.3 Identity & RBAC tables
The RBAC model (semantics in §6) is realized by these tables. Note endpoint_name and display_name are stored separately, and each endpoint carries module and feature, per requirement.
Table  app_user

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| email | text | N | U | unique per tenant |
| password_hash | text | Y |  | null if SSO-only |
| full_name | text | N |  |  |
| status | text | N |  | enum UserStatus: INVITED|ACTIVE|DISABLED |
| mfa_enabled | bool | N |  | default false |
| default_branch_id | uuid | Y | FK | branch(id) |
[/TABLE]

Table  role

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK | null tenant_id = system template role |
| code | text | N | U | unique per tenant, e.g. CASHIER, KARIGAR, CONTROLLER |
| name | text | N |  | display name |
| is_system | bool | N |  | seeded template, not deletable |
[/TABLE]

Table  permission
Global catalog of permissions (the verbs the system can authorize).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| code | text | N | U | stable key, e.g. sales.invoice.void |
| display_name | text | N |  | human label, e.g. “Void Invoice” |
| module | text | N |  | owning module, e.g. SALES |
| feature | text | N |  | feature group, e.g. Invoicing |
| is_sensitive | bool | N |  | requires fine-grained grant + audit |
[/TABLE]

Table  api_endpoint
The endpoint registry. Populated and reconciled by the endpoint-sync script (§6.5).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| endpoint_name | text | N | U | stable machine name, e.g. sales.invoice.create |
| display_name | text | N |  | human label, e.g. “Create Invoice” |
| module | text | N |  | owning module, e.g. SALES |
| feature | text | N |  | feature group, e.g. Invoicing |
| http_method | text | N |  | GET|POST|PATCH|PUT|DELETE |
| path | text | N |  | route template, e.g. /sales/invoices |
| permission_code | text | Y | FK | permission.code required to call (null = open/auth-only) |
| is_active | bool | N |  | soft toggle; sync script maintains this set |
[/TABLE]

Table  role_permission
Many-to-many: which permissions a role grants. PK(role_id, permission_code).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| role_id | uuid | N | FK | role(id) |
| permission_code | text | N | FK | permission(code) |
[/TABLE]

Table  user_role
Many-to-many user↔role with optional branch scoping. PK(user_id, role_id).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| user_id | uuid | N | FK | app_user(id) |
| role_id | uuid | N | FK | role(id) |
| branch_scope | jsonb | Y |  | optional branch restriction for this assignment |
[/TABLE]

## 5.4 Item & inventory tables
Table  item
Generic item. Domain shape lives in attributes; tracking_mode selects the stock strategy.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| code | text | N | U | unique per tenant (SKU) |
| name | text | N |  | i18n via terminology |
| category_id | uuid | N | FK | category(id) — independent FK |
| sub_category_id | uuid | Y | FK | sub_category(id) — independent FK |
| uom_id | uuid | N | FK | unit_of_measure(id) |
| tax_code_id | uuid | Y | FK | tax_code(id) |
| tracking_mode | text | N |  | enum StockTracking: SERIALIZED|BATCH|VARIANT|RECIPE|NONE |
| attributes | jsonb | N |  | domain attrs (jewellery: purity, making_rule, wastage_pct…) |
| status | text | N |  | enum ItemStatus: ACTIVE|INACTIVE |
[/TABLE]

Table  inventory_tag
Serialized stock unit (jewellery piece). status transition is the single-sale guard (§3).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| branch_id | uuid | N | FK | current location |
| item_id | uuid | N | FK | item(id) |
| tag_no | text | N | U | barcode/RFID, unique per tenant |
| gross_weight | numeric(14,3) | Y |  | jewellery |
| net_weight | numeric(14,3) | Y |  | metal weight |
| stone_weight | numeric(10,3) | Y |  | carats |
| purity | numeric(6,4) | Y |  | factor |
| fine_weight | numeric(14,3) | Y |  | computed net × purity, stored |
| status | text | N |  | enum TagStatus: IN_STOCK|RESERVED|SOLD|IN_TRANSIT|WITH_KARIGAR|MELTED |
| huid | text | Y |  | hallmark unique id |
[/TABLE]

Table  stock_movement
Append-only stock ledger; never updated.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| branch_id | uuid | N | FK |  |
| item_id | uuid | N | FK |  |
| tag_id | uuid | Y | FK | for serialized |
| movement_type | text | N |  | enum: PURCHASE_IN|SALE_OUT|TRANSFER|ADJUST|PRODUCTION|RETURN |
| qty | numeric(14,3) | N |  | signed |
| fine_weight_delta | numeric(14,3) | Y |  | signed metal change |
| source_module | text | N |  | originating module |
| source_doc_id | uuid | N |  | originating document |
[/TABLE]

## 5.5 Financial tables
Table  account

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| code | text | N | U | unique per tenant |
| name | text | N |  |  |
| account_type_id | uuid | N | FK | account_type(id) |
| parent_account_id | uuid | Y | FK | self — roll-up |
| currency | text | Y |  | account currency |
| is_control | bool | N |  | AR/AP/metal — no manual posting |
| is_bank | bool | N |  | reconcilable cash/bank |
| is_postable | bool | N |  | leaf accounts only |
| status | text | N |  | enum: ACTIVE|BLOCKED |
[/TABLE]

Table  journal
Journal header. Posted journals are immutable (trigger). Balanced before post (trigger).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| branch_id | uuid | N | FK |  |
| journal_no | text | N | U | per-branch sequence |
| journal_date | date | N |  |  |
| period_id | uuid | N | FK | accounting_period(id) |
| source_module | text | N |  |  |
| source_doc_ref | text | N | U | unique — guarantees exactly-once posting |
| currency | text | N |  |  |
| fx_rate | numeric(14,6) | N |  | to base currency |
| status | text | N |  | enum JournalStatus: DRAFT|POSTED|REVERSED |
| reversal_of_id | uuid | Y | FK | self — links a reversal to its original |
[/TABLE]

Table  journal_line
Sum(debit)=Sum(credit) in base currency enforced before post.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| journal_id | uuid | N | FK | journal(id) |
| account_id | uuid | N | FK | account(id) |
| debit | numeric(16,2) | N |  | base currency; one of debit/credit non-zero |
| credit | numeric(16,2) | N |  | base currency |
| line_currency | text | Y |  | txn currency if FX |
| line_amount | numeric(16,2) | Y |  | txn-currency amount |
| branch_id | uuid | N |  | dimension |
| cost_center_id | uuid | Y | FK | dimension |
| project_id | uuid | Y | FK | dimension |
| party_type | text | Y |  | CUSTOMER|SUPPLIER|EMPLOYEE|KARIGAR |
| party_id | uuid | Y |  | sub-ledger party |
| narration | text | Y |  |  |
[/TABLE]

Table  metal_ledger
Fine-weight metal ledger. Posted atomically with the GL journal for the same event.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| branch_id | uuid | N | FK |  |
| purity | numeric(6,4) | N |  | balances kept per purity |
| fine_weight_delta | numeric(14,3) | N |  | signed pure-gram change |
| party_type | text | Y |  | SUPPLIER|KARIGAR|CUSTOMER |
| party_id | uuid | Y |  |  |
| source_module | text | N |  |  |
| source_doc_id | uuid | N |  |  |
[/TABLE]

## 5.6 Sales tables (representative transactional pattern)
Table  sales_invoice

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| branch_id | uuid | N | FK |  |
| invoice_no | text | N | U | per-branch sequence |
| customer_id | uuid | Y | FK | null for walk-in |
| shift_id | uuid | Y | FK | for day-close attribution |
| invoice_date | timestamptz | N |  |  |
| status | text | N |  | enum InvoiceStatus: DRAFT|CONFIRMED|PAID|PARTIALLY_PAID|VOID|RETURNED |
| sub_total | numeric(16,2) | N |  |  |
| tax_total | numeric(16,2) | N |  |  |
| grand_total | numeric(16,2) | N |  |  |
| exchange_value | numeric(16,2) | Y |  | old-gold set-off |
| idempotency_key | text | Y | U | exactly-once posting guard |
[/TABLE]

Table  sales_invoice_line
Computed money/weight values are stored so historical lines are immutable and auditable.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| invoice_id | uuid | N | FK | sales_invoice(id) |
| item_id | uuid | N | FK |  |
| tag_id | uuid | Y | FK | serialized piece sold |
| category_id | uuid | N | FK | independent FK |
| sub_category_id | uuid | Y | FK | independent FK |
| qty | numeric(14,3) | N |  |  |
| gross_weight | numeric(14,3) | Y |  |  |
| net_weight | numeric(14,3) | Y |  |  |
| stone_weight | numeric(10,3) | Y |  |  |
| purity | numeric(6,4) | Y |  |  |
| fine_weight | numeric(14,3) | Y |  | stored, immutable on the line |
| rate_per_gram | numeric(14,4) | Y |  | resolved server-side at sale |
| metal_amount | numeric(16,2) | Y |  | fine_weight × rate |
| making_charge | numeric(16,2) | Y |  |  |
| wastage_pct | numeric(7,4) | Y |  |  |
| stone_amount | numeric(16,2) | Y |  |  |
| tax_amount | numeric(16,2) | N |  |  |
| line_total | numeric(16,2) | N |  |  |
[/TABLE]

Pattern note. Purchase, transfer, return, job-card, scheme, payroll and other transactional documents follow this header+line shape with the standard columns, status enum, per-branch number, and stored computed values. Their entities are named in Part B (§B.3–§B.6); §5.9 is the rule to expand them.

## 5.7 Attribute engine storage
Domain shape is carried in the attributes jsonb on host rows, validated against attribute_definition. High-volume or strongly-relational domain data uses dedicated pack tables (metal_ledger, metal_rate, karigar_job, old_gold, scheme) rather than attributes.
Table  attribute_definition

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| domain | text | N | FK | which vertical |
| entity | text | N |  | ITEM|INVOICE_LINE|CUSTOMER|SUPPLIER |
| key | text | N |  | attribute name, e.g. purity |
| data_type | text | N |  | DECIMAL|INT|TEXT|DATE|BOOL|ENUM |
| precision | text | Y |  | for decimals |
| required | bool | N |  |  |
| is_priced | bool | N |  | participates in pricing strategy |
| is_valued | bool | N |  | participates in valuation |
| is_reportable | bool | N |  | exposed to KPI/reporting/filters |
| validation | jsonb | Y |  | min/max/regex/options |
[/TABLE]

## 5.8 Configurable dashboard tables
Table  widget

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| key | text | N | U | registry key |
| title | text | N |  | i18n key |
| data_source | text | N |  | metric_definition.key |
| supported_views | jsonb | N |  | [VALUE,LINE,BAR,PIE,TABLE] |
| surfaces | jsonb | N |  | [SALES,FINANCE,INVENTORY,EXECUTIVE…] |
| requires_module | text | Y |  | gate |
| requires_permission | text | Y | FK | permission.code |
| default_config | jsonb | N |  | view,size,filters,comparison |
[/TABLE]

Table  user_dashboard_layout
Per-user, per-surface saved layout. Absence falls back to the domain preset. PK(user_id, surface).

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| user_id | uuid | N | FK |  |
| surface | text | N |  | dashboard surface |
| layout | jsonb | N |  | ordered widget instances: {key,view,size,pos,filters} |
[/TABLE]

## 5.9 Generation rule for non-listed tables
For any entity named in the functional spec (Part B, §B.3–§B.6) without a field-level listing here, the agent generates the table by: (1) applying all §5.1 standard columns; (2) adding the entity's documented fields with the §5.1.2 types; (3) modelling header/line documents on the §5.6 pattern with a status enum from §9 and a per-branch number; (4) storing computed money/weight values; (5) adding RLS, FK indexes and immutability triggers where financial. The schema-architect agent owns this and records each generated table so two agents never diverge.

# 6. RBAC — Enterprise Access Control
Access control follows a standard enterprise pattern: users hold roles, roles grant permissions, and every protected endpoint declares the permission it requires. Authorization is checked centrally; nothing is hard-coded per handler. The endpoint registry is data, kept in sync with the code by a script (§6.5).
## 6.1 Model
- User → Role (many-to-many) with optional branch scope per assignment (user_role.branch_scope).
- Role → Permission (many-to-many) via role_permission. Roles are tenant-defined; system template roles are seeded and clonable.
- Permission is a stable verb key (module.feature.action, e.g. sales.invoice.void) with a display_name, module and feature, and an is_sensitive flag.
- Endpoint → Permission each protected route declares exactly one required permission_code; the guard enforces it.
- Sensitive actions (rate edit, GL adjustment, void, day re-open) are flagged is_sensitive and additionally audited.
## 6.2 Permission key convention
Permissions are named module.feature.action in lower snake/dot form so they are sortable, greppable and self-describing. The action verb is one of a fixed set.

[TABLE]
| Element | Rule / values |
| module | Uppercase module code in code; lowercase in the key. e.g. SALES → sales |
| feature | Feature group within the module, e.g. invoice, payment, rate |
| action | Fixed verbs: view, create, update, delete, post, void, approve, export, configure |
| examples | sales.invoice.create · sales.invoice.void · accounting.journal.post · pricing.rate.update · hr.payroll.approve |
[/TABLE]

## 6.3 Authorization flow
- The JWT carries user, tenant and branch context; an auth guard establishes the request scope (and sets the DB tenant GUC for RLS).
- A permissions guard reads the endpoint's declared required permission and checks the user's effective permissions (union of their roles' permissions), honouring branch scope.
- Sensitive endpoints additionally require the is_sensitive grant and write an audit-log row with actor and before/after.
- Denials return a consistent 403 error envelope; the UI hides controls the user lacks permission for, driven by the same permission set.
One declaration, two uses (enforcement + registry sync)

[TABLE]
| // Declarative on the handler — the only place a permission is named in code. |
| @RequirePermission('sales.invoice.void') |
| @Post(':id/void') |
| voidInvoice(@Param('id') id: string) { return this.sales.void(id); } |
|  |
| // The decorator both (a) enforces at runtime via the guard, and |
| // (b) is the source the endpoint-sync script reads to populate api_endpoint. |
[/TABLE]

## 6.4 Endpoint registry (api_endpoint)
Every protected endpoint is a row in api_endpoint with endpoint_name and display_name stored separately, plus module and feature, per requirement. The registry powers permission administration UIs, documentation, and access auditing without scraping code at runtime.

[TABLE]
| Field | Example |
| endpoint_name | sales.invoice.void  (stable machine name) |
| display_name | “Void Invoice”  (human label, shown in admin UI) |
| module | SALES |
| feature | Invoicing |
| http_method / path | POST /sales/invoices/:id/void |
| permission_code | sales.invoice.void |
| is_active | true (maintained by the sync script) |
[/TABLE]

## 6.5 Endpoint extraction & sync script (required)
A build/CI script discovers every endpoint from the code, compares it to api_endpoint in the database, inserts the missing ones, and flags drift. This is the requested capability: extract all endpoints, check existence in the DB, add the missing ones — with endpoint name and display name separate and module/feature recorded.
### 6.5.1 Behaviour
- Discover: scan the application's route metadata (controllers + the @RequirePermission/route decorators) to produce the full set of {endpoint_name, display_name, module, feature, http_method, path, permission_code}.
- Compare: load existing api_endpoint rows; diff by endpoint_name.
- Insert missing: add new endpoints (is_active=true). Optionally auto-create the referenced permission row if absent (display_name defaulted from the endpoint, flagged for review).
- Mark removed: endpoints in DB but not in code are set is_active=false (never hard-deleted), so history and audits survive.
- Report: print added / deactivated / unchanged counts and any permission_code with no matching permission, failing CI on unresolved drift if configured.
Sync script — reference logic

[TABLE]
| // pnpm run sync:endpoints   (run in CI and on deploy) |
| const discovered = scanRoutes(app);      // from decorator metadata |
| const existing   = await db.apiEndpoint.findMany(); |
| const byName = indexBy(existing, 'endpoint_name'); |
|  |
| for (const e of discovered) { |
| const row = byName[e.endpoint_name]; |
| if (!row)            await db.apiEndpoint.create({ data: { ...e, is_active: true } }); |
| else if (drift(row,e))await db.apiEndpoint.update({ where:{id:row.id}, data: e }); |
| await ensurePermission(e.permission_code, e.display_name, e.module, e.feature); |
| } |
| // endpoints present in DB but absent in code → deactivate (soft), don't delete |
| await deactivateMissing(discovered, existing); |
| report({ added, updated, deactivated, orphanPermissions }); |
[/TABLE]

Idempotent: running it repeatedly converges to the same state; safe to run on every deploy.

# 7. API Specification
## 7.1 Conventions
- REST + OpenAPI. Every endpoint documented via OpenAPI generated from the code/DTOs (single source of truth, not hand-written).
- Resource paths. /{module}/{resource}, plural nouns; sub-resources nested; actions as verbs only when non-CRUD (…/:id/void).
- Versioning. /api/v1 prefix; breaking changes bump the version.
- Pagination/sort/filter. page, page_size, sort, and typed filters on all list endpoints via a shared query DTO.
- Tenant/branch implicit. Resolved from the token, never accepted from the client body.
- Idempotency. Money-moving POSTs accept an Idempotency-Key header.
## 7.2 Response & error envelope
Uniform envelope

[TABLE]
| // success |
| { "data": <payload>, "meta": { "page":1,"page_size":50,"total":214 } } |
| // error (consistent shape from the single global filter) |
| { "error": { "code": "ALREADY_SOLD", "message": "Piece already sold", |
| "details": [ ... ], "trace_id": "..." } } |
[/TABLE]

## 7.3 Representative endpoint catalog (Sales)
Illustrates the catalog shape; every module's endpoints follow this and are registered per §6.4. The full catalog is generated and synced by §6.5.

[TABLE]
| Method | Path | Permission key | Summary |
| GET | /api/v1/sales/invoices | sales.invoice.view | List invoices (paged, filterable) |
| POST | /api/v1/sales/invoices | sales.invoice.create | Create/confirm an invoice |
| GET | /api/v1/sales/invoices/:id | sales.invoice.view | Get one invoice |
| POST | /api/v1/sales/invoices/:id/void | sales.invoice.void | Void an invoice (sensitive) |
| POST | /api/v1/sales/invoices/:id/payments | sales.payment.create | Take a payment (idempotent) |
| POST | /api/v1/sales/invoices/:id/return | sales.invoice.return | Return against an invoice |
[/TABLE]

# 8. Strategy Interfaces (Extensibility Contracts)
These are the code contracts the whole multi-vertical design rests on. A vertical pack binds an implementation to each; the core depends only on the interface. Signatures are binding.
Strategy interface signatures

[TABLE]
| interface StockTrackingStrategy { |
| reserve(item: ItemRef, qty: Decimal, ctx: TxnCtx): Promise<Reservation>; |
| decrement(line: SaleLine, ctx: TxnCtx): Promise<StockMovement>;   // single-sale guard inside |
| receive(line: PurchaseLine, ctx: TxnCtx): Promise<StockMovement>; |
| availability(item: ItemRef, branch: BranchRef): Promise<Decimal>; |
| } |
| interface PricingStrategy { |
| priceLine(input: PriceInput, ctx: TxnCtx): Promise<PricedLine>;    // resolves rate server-side |
| } |
| interface ValuationStrategy { |
| valueOnHand(item: ItemRef, branch: BranchRef, at: Date): Promise<Money>; |
| cogs(line: SaleLine, ctx: TxnCtx): Promise<Money>; |
| } |
| interface PostingStrategy { |
| buildJournal(event: BusinessEvent, ctx: TxnCtx): JournalDraft;     // currency GL |
| buildMetalEntries?(event: BusinessEvent, ctx: TxnCtx): MetalEntry[]; // jewellery only |
| } |
| interface DocumentStrategy { templatesFor(docType: DocType): TemplateRef; } |
| interface NumberingStrategy { next(docType: DocType, branch: BranchRef): Promise<string>; } |
|  |
| // Binding (from the manifest): domain → implementation |
| JEWELLERY: { stock: SerializedTagStrategy, pricing: MetalRatePricing, |
| valuation: FineWeightValuation, posting: DualLedgerPosting } |
| PHARMACY:  { stock: BatchExpiryStrategy(FEFO), pricing: ListPricing, |
| valuation: WeightedAvg, posting: CurrencyGlPosting } |
[/TABLE]

Discipline: a new interface is added only when a real domain need cannot be met by an attribute or by configuration, keeping the surface small.

# 9. Enums & Seed Data
Enums are defined once in a shared package and referenced by both code and DB checks (single source of truth). Key enums:

[TABLE]
| Enum | Values |
| DomainKind | JEWELLERY · PHARMACY · FOOTWEAR · CAFE  (extensible — adding a value is configuration) |
| StockTracking | SERIALIZED · BATCH · VARIANT · RECIPE · NONE |
| TagStatus | IN_STOCK · RESERVED · SOLD · IN_TRANSIT · WITH_KARIGAR · MELTED |
| InvoiceStatus | DRAFT · CONFIRMED · PAID · PARTIALLY_PAID · VOID · RETURNED |
| JournalStatus | DRAFT · POSTED · REVERSED |
| PaymentStatus | PENDING · CAPTURED · FAILED · REFUNDED |
| JobCardStatus | ISSUED · IN_PROGRESS · RECEIVED · RECONCILED |
| SchemeStatus | ACTIVE · MATURED · CLOSED_EARLY · DEFAULTED |
| Provider enums | EmailProviderKind · SmsProviderKind · StorageProviderKind · PaymentGatewayKind · RateFeedProviderKind (env-selected, §2.4) |
[/TABLE]

Seed (non-financial only): domain definitions and manifests, account types, system template roles + permission catalog, units of measure, sample COA templates per domain, dashboard presets, widget registry. No client figures are seeded.

# 10. State Machines
Lifecycles are defined as explicit states and allowed transitions; transitions outside the set are rejected. Representative machines:

[TABLE]
| Entity | States & key transitions |
| Sales invoice | DRAFT → CONFIRMED → {PAID | PARTIALLY_PAID} ; CONFIRMED → VOID (sensitive, pre-day-close) ; PAID → RETURNED. Posting occurs on CONFIRMED. |
| Stock tag | IN_STOCK → RESERVED → SOLD ; IN_STOCK → IN_TRANSIT → IN_STOCK(other branch) ; IN_STOCK → WITH_KARIGAR → IN_STOCK ; IN_STOCK → MELTED. SOLD is terminal (except via RETURN). |
| Journal | DRAFT → POSTED (balanced, immutable) → REVERSED (creates linked mirror). No edit after POSTED. |
| Karigar job | ISSUED → IN_PROGRESS → RECEIVED → RECONCILED (issued = finished + wastage + balance). |
| Saving scheme | ACTIVE → MATURED → (converted to sale) ; ACTIVE → CLOSED_EARLY ; ACTIVE → DEFAULTED. |
| Day-close | OPEN (shifts) → RECONCILED → CLOSED (locked) → RE_OPENED (sensitive, audited) → CLOSED. |
| Purchase order | DRAFT → APPROVED → PARTIALLY_RECEIVED → RECEIVED → BILLED. |
[/TABLE]

PART B
Full Functional Specification
Accounting · Human Capital · Enterprise Gap-Fill · Jewellery Vertical (complete)
Reading bridge.  Part A (§1–§10) defined the binding build contracts — engineering standards, data dictionary, RBAC, API, strategy interfaces, enums and state machines. Part B is the functional specification: what each module must do, with functional-requirement catalogs, user stories and acceptance criteria. The two parts are one source of truth: every functional requirement in Part B is realized through the contracts in Part A (its tables in §B.5, its permission keys in §B.6, its endpoints in §7, its enums and lifecycle in §9–§10). Section numbers in Part B (B.3–6) are local to this part.

# B.3 Financial & Accounting Core
This is the spine of the platform and is specified to ledger-line fidelity. The model follows double-entry discipline with a structured Chart of Accounts, dimension-tagged journals and journal lines, an automatic posting engine driven per domain, sub-ledgers that reconcile to the GL, and database-level guarantees. The depth matches the accounting design proven on the restaurant ERP and extends it with fixed assets, multi-currency and consolidation.
## 3.1 Chart of Accounts
The Chart of Accounts is a typed, hierarchical structure. Postings reference leaf accounts only; reporting rolls up through the hierarchy and across dimensions.

[TABLE]
| Layer | Definition |
| Account class | The five roots: Asset, Liability, Equity, Income, Expense. Fixed; defines normal balance and statement placement. |
| Account type | A grouping within a class (e.g. Current Asset, Fixed Asset, Current Liability, Direct Income, Operating Expense). Drives statement structure and behaviour (e.g. bank, receivable, payable, control). |
| Account group | Optional intermediate roll-up (e.g. Cash & Bank under Current Asset). |
| Account (ledger) | The posting-level account. Carries code, name, type, currency, status, and flags (control account, reconcilable, cash/bank, blocked for manual posting). |
| Dimensions | Orthogonal tags on every posting line: branch (mandatory where operational), cost centre, project, and free analytic tags. Enable branch-wise and segmented reporting without proliferating accounts. |
[/TABLE]

A domain ships a COA template seeded at tenant creation. The jewellery template adds Metal Stock, Stone Stock, Metal Payable, Metal Receivable, Old-Gold Purchase, Wastage/Loss, Making-Charge Income, Refining Cost, Scheme Liability and Customer Advances, alongside the generic accounts every business needs.
### ACC-COA  Chart of Accounts — requirements
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| ACC-F01 | Maintain the five fixed account classes with defined normal balance and statement placement. |
| ACC-F02 | Define account types within a class, with behaviour flags (bank, receivable, payable, control, reconcilable). |
| ACC-F03 | Create leaf ledger accounts with code, name, type, currency and status; prevent posting to non-leaf or blocked accounts. |
| ACC-F04 | Seed a per-domain COA template at tenant creation; allow tenant extension thereafter. |
| ACC-F05 | Attach dimensions (branch, cost centre, project, analytic tags) to every posting line. |
| ACC-F06 | Prevent deletion of an account with postings; allow deactivation only. |
| ACC-F07 | Enforce control accounts (AR, AP, metal) to be posted only via their sub-ledgers, never by manual journal. |
| ACC-F08 | Support multi-branch account roll-up and branch-restricted account visibility. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a financial controller, I want to seed a ready jewellery chart of accounts when a new showroom company is created, so that the team can transact on day one without building the ledger by hand.
Acceptance criteria.
- Given a tenant is created with domain Jewellery, when provisioning completes, then the jewellery COA template is seeded including Metal Stock, Metal Payable, Making-Charge Income and Wastage.
- Given an account flagged as a control account, when a user attempts a manual journal to it, then the system blocks the entry and directs them to the sub-ledger.

## 3.2 Journal & Journal Line model
Every financial event is a journal: a balanced set of journal lines. The model is explicit so that integrity is structural, not conventional.

[TABLE]
| Entity / field | Meaning |
| Journal (header) | tenant, branch, journal date, period, source module, source document reference (unique), currency, exchange rate, narration, status (draft/posted/reversed), created/posted by, timestamps. |
| Journal line | account, debit, credit (exactly one non-zero), line currency + amount, base-currency amount, dimensions (branch, cost centre, project, analytic), sub-ledger party (customer/supplier/employee) where applicable, line narration. |
| Balancing rule | Sum of base-currency debits equals sum of base-currency credits; enforced before post (application + DB trigger). |
| Posting rule | A posted journal is immutable. A source document posts exactly once (unique source reference). Corrections are reversing journals. |
| Reversal | A posted journal can be reversed, creating a mirror journal dated in an open period and linked to the original. |
[/TABLE]

### ACC-JRN  Journal engine — requirements
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| ACC-F10 | Record journals with header and ≥ 2 lines; each line carries exactly one of debit or credit. |
| ACC-F11 | Enforce debits = credits in base currency before a journal may post. |
| ACC-F12 | Stamp every journal with source module and a unique source-document reference to guarantee exactly-once posting. |
| ACC-F13 | Make posted journals immutable; permit correction only by linked reversal in an open period. |
| ACC-F14 | Carry dimensions on every line so branch, cost-centre and project ledgers derive from the same data. |
| ACC-F15 | Support manual journals (with approval), recurring journals, and template journals. |
| ACC-F16 | Maintain a per-account, per-dimension running balance queryable by period. |
| ACC-F17 | Produce a trial balance that ties to the sum of journal lines for any period and branch. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a accountant, I want to reverse a wrongly posted journal rather than edit it, so that the audit trail stays intact and statements remain trustworthy.
Acceptance criteria.
- Given a posted journal, when I edit it, then the system refuses and offers a reversal instead.
- Given I reverse a posted journal, when the reversal posts, then a linked mirror journal is created in an open period and net effect on each account is zero.

User story.  As a auditor, I want to trace any ledger figure back to its source document, so that I can verify the books without leaving the system.
Acceptance criteria.
- Given any journal line, when I open it, then I see the source module and document and can navigate to it.

## 3.3 Automatic posting engine and GL entries by transaction
Operational modules do not write journals by hand. Each posts through the PostingStrategy resolved for the tenant's domain, which maps the business event to balanced journal lines. The jewellery strategy additionally posts the fine-weight metal ledger. The following are the canonical postings.

[TABLE]
| Transaction | GL journal (Dr / Cr) and ledgers |
| Cash sale | Dr Cash/Bank; Cr Metal Sales, Cr Making-Charge Income, Cr Stone Income, Cr Output Tax. Stock: pieces → SOLD. Metal ledger: − fine weight. Cost: Dr COGS, Cr Metal/Stone Stock. |
| Credit sale | Dr Customer (AR sub-ledger); same income/tax credits; same cost and metal entries. |
| Sale with old-gold exchange | As sale, plus Dr Metal Stock (old gold at buy rate), Cr Customer/settlement; metal ledger + fine weight intake; net the exchange against the receivable. |
| Purchase (metal) | Dr Metal Stock; Cr Supplier (AP) or Metal Payable; Dr Input Tax. Metal ledger: + fine weight. |
| Supplier payment | Dr Supplier (AP) / Metal Payable; Cr Cash/Bank (or metal settlement). |
| Karigar issue (job-work) | Dr Metal Receivable (karigar); Cr Metal Stock. Metal ledger: − fine weight issued. |
| Karigar receive | Dr Metal Stock (finished fine weight); Dr Wastage/Loss (loss); Cr Metal Receivable; Cr Karigar Labour (AP). Metal ledger reconciled. |
| Customer receipt | Dr Cash/Bank; Cr Customer (AR). Allocated to open invoices. |
| Scheme installment | Dr Cash/Bank; Cr Scheme Liability. |
| Scheme maturity | Dr Scheme Liability; Cr Metal Sales / issue metal; recognise Scheme Bonus expense if applicable. |
| Payroll run | Dr Salary Expense (by branch/cost centre), Dr EOSB Expense; Cr Salaries Payable, Cr Statutory Payables. |
| Depreciation | Dr Depreciation Expense (by branch); Cr Accumulated Depreciation. |
| Stock adjustment / count | Dr/Cr Inventory Gain or Loss; Cr/Dr Stock; metal ledger adjusted where metal. |
[/TABLE]

### ACC-POST  Posting engine — requirements
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| ACC-F20 | Post every operational event through the domain PostingStrategy as a balanced journal. |
| ACC-F21 | Post currency GL and (jewellery) fine-weight metal ledger atomically in one transaction. |
| ACC-F22 | Recognise cost of goods sold at the point of sale using the active ValuationStrategy. |
| ACC-F23 | Allow configurable account mapping per document type and per branch. |
| ACC-F24 | Block posting into a closed period; route to the next open period or reject per policy. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a showroom cashier, I want the sale, stock, tax and metal weight to all update together when I bill a customer, so that the books and the showroom stock are never out of step.
Acceptance criteria.
- Given a billed sale, when it posts, then stock, GL income/tax, COGS and the metal ledger all update in one transaction; if any step fails, none persist.

## 3.4 Cost model (layered)
Profitability requires costs to be decomposed, not lumped. Adapting the four-layer cost model proven on the restaurant ERP to jewellery, each sellable item's cost is built in layers so margin can be analysed at each:
- Metal cost. Fine weight × the cost rate at acquisition (or weighted-average/FIFO per ValuationStrategy).
- Stone & component cost. Diamonds, gems and findings valued per piece/lot.
- Conversion cost. Making/labour (karigar) and refining attributable to the piece.
- Overhead & wastage. Allocated overhead and metal wastage/loss.
Each layer posts to its own account so gross margin, making margin and net margin are all reportable, by item, category, branch and period. This feeds the branch-wise P&L and the margin widgets on the dashboards.
## 3.5 Sub-ledgers
- Accounts Receivable. Open-item per customer; receipts allocate to invoices; aging buckets and statements; credit limits and holds. Reconciles to the AR control account.
- Accounts Payable. Open-item per supplier and karigar; payment runs; aging and statements; metal-payable in fine weight for metal suppliers. Reconciles to AP / Metal Payable control accounts.
- Cash & Bank. Per-branch cash accounts feeding day-close; bank accounts with statement reconciliation; petty cash.
- Metal ledger. Fine-weight balances per purity; every metal movement a signed entry; reconciles to physical stock + metal receivable − metal payable.
### ACC-SUB  Sub-ledger — requirements
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| ACC-F30 | Maintain open-item AR/AP with allocation, aging (configurable buckets) and statements. |
| ACC-F31 | Reconcile each sub-ledger to its GL control account at any date. |
| ACC-F32 | Maintain a fine-weight metal ledger per purity that reconciles to physical stock and metal payable/receivable. |
| ACC-F33 | Provide bank reconciliation against imported/entered statements with matched/unmatched views. |
[/TABLE]

## 3.6 Fixed Assets & Depreciation (capability gap closed)
### ACC-FA  Fixed assets
A capability present in SAP/Odoo and absent from the earlier scope. Showrooms hold significant fixed assets (fit-out, safes, equipment) that must be capitalised and depreciated.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| FA-F01 | Maintain an asset register with category, acquisition cost, date, branch, useful life and salvage value. |
| FA-F02 | Compute depreciation by method (straight-line, reducing-balance) on a schedule; post per branch. |
| FA-F03 | Handle additions, improvements, transfers between branches, revaluation, impairment and disposal with gain/loss posting. |
| FA-F04 | Reconcile the asset register to the fixed-asset and accumulated-depreciation GL accounts. |
| FA-F05 | Report net book value by category and branch. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a controller, I want depreciation to post automatically each period per branch, so that branch P&L reflects the true cost of operating each showroom.
Acceptance criteria.
- Given an asset assigned to a branch with a straight-line schedule, when the period closes, then depreciation posts to that branch's expense and to accumulated depreciation.

## 3.7 Multi-currency, Inter-company & Consolidation (capability gap closed)
### ACC-MC  Multi-currency and consolidation
Required for groups operating across countries (e.g. GCC + South Asia). Closes a gap versus SAP/Odoo.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| MC-F01 | Transact in foreign currencies with daily rates; store both transaction and base-currency amounts. |
| MC-F02 | Revalue open foreign-currency AR/AP/bank balances at period end with unrealised gain/loss posting. |
| MC-F03 | Recognise realised exchange gain/loss on settlement. |
| MC-F04 | Support inter-company transactions between tenants/branches with matched elimination entries. |
| MC-F05 | Consolidate multiple companies into group statements with intercompany elimination and currency translation. |
[/TABLE]

## 3.8 Period Close & Financial Statements
### ACC-CL  Period close and statements
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| ACC-F40 | Lock accounting periods; permit controlled adjusting entries with approval. |
| ACC-F41 | Run year-end close with retained-earnings roll-forward. |
| ACC-F42 | Produce Trial Balance, Profit & Loss, Balance Sheet and Cash Flow with comparatives. |
| ACC-F43 | Produce all statements per branch, by branch group, and consolidated. |
| ACC-F44 | Generate General Ledger, Day Book, Cash Book, Bank Book, AR/AP aging, and tax registers. |
| ACC-F45 | Export statutory report inputs (VAT/GST) per jurisdiction via the localization framework. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a owner, I want a profit and loss for each showroom and a consolidated group view for any month, so that I can see which branches make money and how the group is doing overall.
Acceptance criteria.
- Given posted transactions tagged by branch, when I run P&L for a month, then I can view it per branch, by group, and consolidated, and the branches plus unallocated overhead reconcile to the group total.

# B.4 Human Capital Management
HR is specified beyond the restaurant ERP's payroll-attendance-EOSB scope into a full hire-to-retire suite. This is both a competitive necessity (SAP and Odoo carry deep HR; dedicated gold ERPs typically do not) and an operational fit for showroom businesses that run sales floors on commission and operate under GCC labour and visa regimes. Every cost posts per branch so it flows into branch-wise P&L.
Coverage map. Recruitment & ATS · Onboarding · Employee master & org · Attendance, shifts & scheduling · Leave · Payroll · EOSB/gratuity & final settlement · Loans & advances · Performance & appraisals · Training & LMS · Commission & incentives · Document, visa & compliance · Offboarding · Employee self-service.
## 4.1 Employee Master & Organization
### HR-EMP  Employee master
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F01 | Maintain employee records: personal, contact, identification, bank, dependents, photo, branch and department. |
| HR-F02 | Model the org structure (departments, designations, reporting lines, grades) and position assignment. |
| HR-F03 | Hold contracts with type, dates, probation, notice period and renewal; version history on changes. |
| HR-F04 | Assign roles for system access (links to RBAC), including domain roles such as karigar and goldsmith. |
| HR-F05 | Provide employee self-service for profile, payslips, leave and documents. |
[/TABLE]

## 4.2 Recruitment & Applicant Tracking (capability added)
### HR-ATS  Recruitment & ATS
Closes the recruitment gap versus SAP/Odoo and goes beyond the restaurant ERP.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F10 | Raise and approve job requisitions tied to a branch and budgeted headcount. |
| HR-F11 | Post openings, capture applicants, and track them through configurable pipeline stages. |
| HR-F12 | Schedule interviews, record scorecards, and store CVs/documents on the candidate. |
| HR-F13 | Generate offers; on acceptance, convert a candidate to an employee without re-keying. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a HR manager, I want an accepted candidate to become an employee record automatically, so that onboarding starts immediately with no duplicate data entry.
Acceptance criteria.
- Given a candidate with an accepted offer, when I convert them, then an employee record is created with the captured data and an onboarding checklist is started.

## 4.3 Onboarding & Offboarding (capability added)
### HR-ON  Onboarding / offboarding
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F15 | Drive onboarding via configurable checklists (documents, assets, accounts, training) with owners and due dates. |
| HR-F16 | Provision and later reclaim assets and system access tied to the lifecycle. |
| HR-F17 | Drive offboarding via checklist, trigger final settlement, and deactivate access on exit date. |
[/TABLE]

## 4.4 Attendance, Shifts & Scheduling
### HR-ATT  Attendance & scheduling
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F20 | Build shift rosters per branch; support split shifts and rotation common in retail. |
| HR-F21 | Capture attendance (device, biometric, or manual) with late/early/absent derivation. |
| HR-F22 | Compute overtime per policy; feed payroll. |
| HR-F23 | Tie attendance to the branch's operating shifts used in day-close. |
[/TABLE]

## 4.5 Leave Management
### HR-LV  Leave
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F25 | Define leave types with accrual, carry-forward, and encashment rules (annual, sick, unpaid, etc.). |
| HR-F26 | Maintain balances and accruals; show on self-service. |
| HR-F27 | Route leave requests through approval; reflect approved leave in attendance and payroll. |
| HR-F28 | Encash leave on settlement per policy. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a sales associate, I want to request leave and see my balance from my phone, so that I know where I stand without asking HR.
Acceptance criteria.
- Given I have an annual-leave balance, when I submit a request within balance, then it routes to my manager and provisionally reduces my available balance.

## 4.6 Payroll
### HR-PAY  Payroll
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F30 | Define salary structures with earnings and deduction components, fixed and variable. |
| HR-F31 | Run payroll per branch and period, pulling attendance, overtime, leave, loans and commission. |
| HR-F32 | Apply statutory and voluntary deductions per jurisdiction (via localization). |
| HR-F33 | Produce payslips (bilingual) and a bank payment/WPS file. |
| HR-F34 | Post payroll cost to GL by branch and cost centre; reconcile payables. |
| HR-F35 | Support off-cycle runs, arrears and retro-pay. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a payroll officer, I want commission and overtime to flow into the monthly run automatically, so that associates are paid correctly without manual spreadsheets.
Acceptance criteria.
- Given approved commission accruals and overtime for the period, when I run payroll, then each employee's pay includes them and the cost posts to their branch.

## 4.7 EOSB / Gratuity & Final Settlement
### HR-EOSB  End of service
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F40 | Accrue end-of-service benefit per the applicable labour-law formula on tenure and last pay. |
| HR-F41 | Compute final settlement on exit: EOSB, leave encashment, dues, loan recovery, notice. |
| HR-F42 | Post the EOSB liability over service and settle on exit. |
[/TABLE]

## 4.8 Loans & Advances (capability added)
### HR-LOAN  Loans & advances
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F45 | Issue salary advances and loans with schedules and interest where applicable. |
| HR-F46 | Recover via payroll deduction; track outstanding balance; settle on exit. |
[/TABLE]

## 4.9 Performance & Appraisals (capability added)
### HR-PERF  Performance management
Beyond both the restaurant ERP and most gold ERPs; matches SAP/Odoo HR depth.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F50 | Define appraisal cycles, competencies and KPIs (including sales targets per associate). |
| HR-F51 | Capture self, manager and peer reviews; calculate ratings. |
| HR-F52 | Link outcomes to increments, bonuses and training plans. |
[/TABLE]

## 4.10 Training & LMS (capability added)
### HR-LMS  Training & development
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F55 | Maintain a training catalog and assign courses to employees or roles. |
| HR-F56 | Track enrollment, completion and certifications; flag expiring certifications. |
[/TABLE]

## 4.11 Commission & Incentives
### HR-COMM  Commission
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F60 | Define commission schemes (by value, margin, making charge, category, target tiers). |
| HR-F61 | Accrue per salesperson from invoices, net of returns; handle split/team credit. |
| HR-F62 | Approve accruals and feed payroll; produce commission statements. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a showroom manager, I want commission calculated on making-charge value, not just total sale, so that associates are rewarded for the margin they bring, not the gold price.
Acceptance criteria.
- Given a scheme set to commission on making-charge income, when an invoice posts, then the associate accrues commission on that component only, reversed pro-rata if the item is returned.

## 4.12 Document, Visa & Compliance
### HR-DOC  Compliance
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| HR-F65 | Store employee documents with expiry (passport, visa, labour card, licence). |
| HR-F66 | Alert on upcoming expiries via the notification engine. |
| HR-F67 | Maintain an audit trail of HR actions for labour-authority compliance. |
[/TABLE]

# B.5 Enterprise Capability Gap-Fill (SAP / Odoo Parity)
These modules close the capabilities that SAP and Odoo carry and the earlier scope lacked. They are specified as platform modules (domain-agnostic where possible) and enabled per tenant via the manifest, so jewellery uses what it needs now and other verticals inherit them later. Each is built on the same tenant, branch, RBAC, GL and dashboard foundations.
## 5.1 Manufacturing / MRP (advanced)
### MRP  Material requirements & production planning
Extends basic job-work into planned production: for jewellery this is design-to-piece manufacturing; for other verticals, assembly and MRP.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| MRP-F01 | Define multi-level bills of material/recipes with components, yields and scrap. |
| MRP-F02 | Plan production from demand/sales forecast; net against stock and open orders (MRP run). |
| MRP-F03 | Issue production/work orders with routing through work centres/stations (e.g. casting, setting, polishing). |
| MRP-F04 | Track work-in-progress, operation completion, labour and machine time, and yield/wastage per stage. |
| MRP-F05 | Back-flush or explicitly consume components; post production cost to the layered cost model. |
| MRP-F06 | Capacity view per work centre with load and scheduling. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a production planner, I want to plan a batch of rings from a design and see what metal and stones I need, so that I can release work orders without manual material maths.
Acceptance criteria.
- Given a design BOM and a planned quantity, when I run planning, then required metal and stones are netted against stock and shortages are flagged before release.

## 5.2 Quality Management
### QM  Quality management
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| QM-F01 | Define inspection plans and checkpoints for inward goods, production stages and outward dispatch. |
| QM-F02 | Record inspection results, pass/fail and defects; quarantine failed stock. |
| QM-F03 | For jewellery: purity assay capture and hallmark verification as quality gates. |
| QM-F04 | Track non-conformance and corrective actions. |
[/TABLE]

## 5.3 Warehouse Management (advanced)
### WMS  Warehouse management
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| WMS-F01 | Model locations/bins within a branch; directed put-away and picking. |
| WMS-F02 | Barcode/RFID-driven movement, count and verification. |
| WMS-F03 | Wave/batch picking for orders; packing and dispatch confirmation. |
| WMS-F04 | Cycle counting and perpetual stock accuracy by location. |
[/TABLE]

## 5.4 E-commerce / Omnichannel
### ECOM  E-commerce & omnichannel
A major SAP/Odoo strength absent earlier; increasingly expected by modern jewellery retailers.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| ECOM-F01 | Publish a catalog (with images, attributes, live metal-rate pricing) to an online store/API. |
| ECOM-F02 | Sync stock and price in real time across showroom and online channels. |
| ECOM-F03 | Capture online orders into the same sales pipeline (unified order, payment, fulfilment). |
| ECOM-F04 | Support click-and-collect and ship-from-branch with the inventory/transfer engine. |
| ECOM-F05 | Customer accounts shared with CRM, loyalty and schemes. |
[/TABLE]

## 5.5 Marketing Automation & Campaigns
### MKT  Marketing automation
Extends notifications into true campaigns, closing the Odoo/SAP marketing gap.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| MKT-F01 | Build customer segments from CRM, purchase history and attributes. |
| MKT-F02 | Design multi-step campaigns across email, SMS, WhatsApp and push. |
| MKT-F03 | Trigger lifecycle messages (birthday/anniversary, scheme due, win-back, festival gold offers). |
| MKT-F04 | Track delivery, open, click and attributed sales; measure campaign ROI. |
[/TABLE]

## 5.6 Project Management & Services
### PROJ  Projects & services
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| PROJ-F01 | Define projects with tasks, milestones, assignees and budgets (e.g. bespoke commissions, store fit-outs). |
| PROJ-F02 | Capture timesheets and expenses against projects; cost and bill where applicable. |
| PROJ-F03 | Report project profitability via the project dimension on GL postings. |
[/TABLE]

## 5.7 Product Lifecycle & Design (PLM)
### PLM  Product lifecycle & design
Maps the jewellery design-to-catalog flow and general product lifecycle.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| PLM-F01 | Maintain designs/CAD references, versions, and design BOMs. |
| PLM-F02 | Promote a design through stages (concept → sample → approved → production) with approvals. |
| PLM-F03 | Link approved designs to manufacturing BOMs and catalog items. |
| PLM-F04 | Manage media/image assets for catalog and e-commerce. |
[/TABLE]

## 5.8 Business Intelligence & Advanced Analytics
### BI  BI & analytics
Beyond operational dashboards: cross-module analytical models and self-service exploration.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| BI-F01 | Provide pre-built analytical models (sales, inventory, margin, metal movement) over a reporting layer. |
| BI-F02 | Allow slice/dice by branch, period, category, purity, salesperson and customer segment. |
| BI-F03 | Surface trends, ranking and anomaly highlights; export and schedule. |
| BI-F04 | Feed the configurable dashboards and the AI Data Chat. |
[/TABLE]

## 5.9 Localization Framework (statutory packs)
### LOC  Localization
SAP/Odoo's strongest moat is country localization. A framework lets statutory behaviour be packaged per country rather than hard-coded.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| LOC-F01 | Package per-country tax rules, document formats and statutory reports as installable localization packs. |
| LOC-F02 | Support e-invoicing / fiscal-device integration where mandated (e.g. GCC e-invoicing, India e-invoice/e-way). |
| LOC-F03 | Configure rounding, number/date formats and legal document layouts per jurisdiction. |
| LOC-F04 | Map statutory chart-of-accounts and tax-return formats per country. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a finance lead in a new country, I want to switch on a localization pack rather than re-customize the system, so that we go live compliant in weeks, not months.
Acceptance criteria.
- Given a country localization pack is enabled for a tenant, when transactions post, then tax, invoice format and statutory reports follow that country's rules without code change.

# B.6 Jewellery Vertical — Complete Feature Specification
This is the reference vertical, specified to match or exceed the leading dedicated gold ERPs. It is delivered as a vertical pack: manifest, attributes, strategy bindings, dedicated ledgers and documents over the platform core. The feature set below is organized to be checked directly against competitor capability.
## 6.1 Metal, weight & purity
### JWL-MTL  Metal & weight management
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F01 | Track gross, net (metal) and stone weight to three decimals on every piece and line. |
| JWL-F02 | Hold purity/touch as an explicit factor; derive fine weight = net × purity; keep balances per purity. |
| JWL-F03 | Maintain a fine-weight metal ledger per purity reconciling to physical stock + receivable − payable. |
| JWL-F04 | Support multiple metals (gold, silver, platinum) and karats with conversion to 24K-equivalent. |
| JWL-F05 | Record wastage/loss in grams or percent on sales and job-work. |
[/TABLE]

## 6.2 Rates, pricing & bullion
### JWL-RATE  Rate engine & bullion
Live rate handling is, per market analysis, the single most financially critical jewellery feature.
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F10 | Maintain daily buy/sell rates per metal and purity; optional live-feed integration. |
| JWL-F11 | Price a sale line = live rate × fine weight + making charge + wastage + stone price + tax. |
| JWL-F12 | Support rate fix / unfix (lock a customer's rate for an order; settle against fixed or prevailing rate). |
| JWL-F13 | Configure making charges per gram, per piece or percent; per item, category or scheme. |
| JWL-F14 | Support bullion/metal-loan and gold-on-loan tracking in weight. |
| JWL-F15 | Resolve rate server-side; never accept a client-supplied price. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a showroom cashier, I want the price to update the instant the gold rate changes, so that we never sell at yesterday's rate and lose margin.
Acceptance criteria.
- Given today's rate is set, when I add a piece to a bill, then its metal value uses the current rate × its fine weight, recomputed if the rate is updated before billing.
- Given a customer fixes a rate for an order, when the order is settled later, then the fixed rate is honoured regardless of the prevailing rate.

## 6.3 Inventory: tags, RFID & stock by purity
### JWL-INV  Tag-level inventory
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F20 | Tag each finished piece (barcode/RFID) with weight, purity, making, stones, image and location. |
| JWL-F21 | Track stock per piece, by purity, by category and by branch/counter; loose stock by lot. |
| JWL-F22 | Fast physical verification via RFID/barcode scan with variance posting. |
| JWL-F23 | Transfer pieces between branches/counters with in-transit accountability. |
| JWL-F24 | Enforce single-sale of a tagged piece under concurrency (see §2.1). |
[/TABLE]

## 6.4 Karigar / job-work
### JWL-KAR  Karigar job-work
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F30 | Issue metal and stones to a karigar against a job card; post metal receivable and decrement metal ledger. |
| JWL-F31 | Receive finished pieces; reconcile issued vs finished + wastage; book labour payable. |
| JWL-F32 | Track karigar accounts in fine weight and in value; settle in metal or cash. |
| JWL-F33 | Capture per-stage job progress where pieces route through multiple karigars. |
[/TABLE]

Representative user stories & acceptance criteria
User story.  As a manufacturing manager, I want to know exactly how much gold each karigar holds and owes, so that metal can't go missing across job-work.
Acceptance criteria.
- Given metal issued to a karigar, when finished goods and wastage are received, then issued equals finished plus wastage plus the karigar's outstanding metal balance, and any discrepancy is flagged.

## 6.5 Old gold, exchange, melting & refining
### JWL-OLD  Old gold & refining
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F40 | Value old gold at fine weight × buy rate after purity test; set off against a sale. |
| JWL-F41 | Route scrap to melting/refining; reconcile input vs recovered fine weight and refining cost. |
| JWL-F42 | Return refined metal to stock at recovered purity. |
[/TABLE]

## 6.6 Stones & certification
### JWL-STN  Stone master & certification
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F45 | Maintain a stone master (type, shape, carat, clarity, colour, cut, certificate). |
| JWL-F46 | Value stones per piece/lot independently of metal; track certified-stone inventory. |
| JWL-F47 | Attach lab certificates (e.g. diamond grading) to pieces. |
[/TABLE]

## 6.7 Hallmarking & HUID
### JWL-HM  Hallmarking
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F50 | Store hallmark status and HUID per piece; capture assay/centre details. |
| JWL-F51 | Gate sale of pieces that must be hallmarked first, per policy. |
[/TABLE]

## 6.8 Repair, custom orders & approval/memo
### JWL-ORD  Repair, orders & approval
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F55 | Manage repair jobs with intake, estimate, advance, work and delivery. |
| JWL-F56 | Manage custom/bespoke orders linked to design and production with advances. |
| JWL-F57 | Issue goods on approval/memo (to customers or other branches/dealers) and reconcile returns/sales. |
[/TABLE]

## 6.9 Saving schemes (chit)
### JWL-SCH  Gold saving schemes
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F60 | Define schemes (duration, installment, bonus, maturity in weight or value). |
| JWL-F61 | Enroll customers; collect installments; hold scheme liability; notify on dues. |
| JWL-F62 | Mature into a sale (metal or value) plus bonus; handle early closure. |
[/TABLE]

## 6.10 Valuation & COGS
### JWL-COGS  Valuation & COGS
Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| JWL-F65 | Value inventory by fine weight × rate + stone value; support FIFO and weighted-average cost. |
| JWL-F66 | Recognise COGS at sale via the layered cost model (metal, stone, conversion, overhead). |
| JWL-F67 | Report stock valuation by purity, category and branch at any date. |
[/TABLE]

## 6.11 Competitive feature matrix
Mapped against the capabilities advertised by leading dedicated gold ERPs (live-rate pricing, purity/weight tracking, making/wastage, multi-branch, GST/VAT, manufacturing/karigar, old-gold, repair, schemes). The platform meets all of these and adds capabilities the incumbents typically lack.
Parity — capabilities the top gold ERPs have and this platform matches:

[TABLE]
| Gold-ERP capability | Platform coverage |
| Live metal-rate pricing | JWL-F10–F11 (with rate fix/unfix, F12) |
| Purity / weight / fine-weight tracking | JWL-F01–F04 + metal ledger F03 |
| Making charges & wastage | JWL-F13, F05 |
| Tag / barcode / RFID inventory | JWL-F20–F24 |
| Karigar / manufacturing | JWL-F30–F33 + MRP module |
| Old gold / exchange / melting | JWL-F40–F42 |
| Stones & certification | JWL-F45–F47 |
| Hallmarking / HUID | JWL-F50–F51 |
| Repair & custom orders | JWL-F55–F57 |
| Saving schemes (chit) | JWL-F60–F62 |
| Multi-branch & GST/VAT | Platform branches + Tax + Localization |
| COGS (FIFO/avg) & valuation | JWL-F65–F67 |
[/TABLE]

Differentiators — capabilities incumbents typically lack, that make clients prefer this platform:

[TABLE]
| Differentiator | Why it wins the deal |
| Modern cloud-native, multi-tenant, zero-downtime | Many incumbents run on dated desktop/on-prem stacks; this is faster, safer, lower-maintenance and accessible anywhere. |
| Multi-vertical optionality on one codebase | A group that adds a cafe, a watch line or a pharmacy keeps one system; no gold ERP can become another vertical. |
| Native Arabic + full RTL (and extensible i18n) | Decisive in GCC/MENA, where incumbents and even Odoo are weak; the whole UI mirrors correctly. |
| AI Data Chat (MCP) | Owners ask questions in plain language and get answers/charts — ahead of legacy reporting. |
| Per-user configurable dashboards & widgets | Each user arranges their own Sales/Finance/Inventory view (value-first vs chart-first, show/hide, reorder) — not a fixed screen. |
| First-class concurrency & idempotency | No double-sold pieces, no double charges — correctness under busy multi-till operation that legacy systems often fumble. |
| Branch-wise day-close + branch P&L out of the box | Multi-showroom owners see per-branch profit and a disciplined daily close without bolt-ons. |
| Deep HR (hire-to-retire) integrated | Commission, payroll, EOSB, visa expiry in the same system — gold ERPs rarely carry this. |
| Layered cost model & true margin analytics | Margin by making vs metal vs stone, by branch and associate — sharper than lump-sum COGS. |
| Localization framework | New-country go-live by enabling a pack, not re-customizing — approaching SAP/Odoo's moat at SMB cost. |
[/TABLE]

Positioning. The honest claim is not “beats SAP”. It is: best-in-class jewellery depth matching the dedicated gold ERPs, delivered on a modern, multi-tenant, AI-enabled, Arabic-native, multi-vertical platform — aimed squarely at the gold-ERP market where incumbents are dated and at the mid-market space between Odoo and SAP.

PART C
Quality, Traceability & Build Governance

# 15. Non-Functional Requirements
Testable, identified non-functional requirements.
## 15.1 Performance & scalability

[TABLE]
| Req. ID | Functional requirement |
| NFR-P01 | Interactive reads (catalog, stock lookup, billing, dashboard data) respond sub-second p95 under expected branch concurrency. |
| NFR-P02 | A sale posts stock + GL + metal ledger in one request transaction without perceptible till delay. |
| NFR-P03 | Dashboard data loads via one batched, cached call per surface. |
| NFR-P04 | Stateless API scales horizontally; heavy/spiky work runs on BullMQ. |
| NFR-P05 | Indexed on tenant, branch, FKs and queried attribute keys; lists paginate. |
[/TABLE]

## 15.2 Reliability & integrity

[TABLE]
| Req. ID | Functional requirement |
| NFR-R01 | Multi-ledger postings atomic; partial posts impossible. |
| NFR-R02 | Money/weight exact decimals; rounding only at presentation. |
| NFR-R03 | Concurrency-safe stock and payments (no double-sale, no double-charge). |
| NFR-R04 | Financial history immutable; corrections by reversal; closed periods locked. |
| NFR-R05 | Zero-downtime deploys; non-critical features degrade without blocking sales. |
| NFR-R06 | Backups with tested restore; defined RPO/RTO. |
[/TABLE]

## 15.3 Security

[TABLE]
| Req. ID | Functional requirement |
| NFR-S01 | Tenant isolation by DB row-level security, independent of app code. |
| NFR-S02 | JWT auth; RBAC with fine-grained permissions on sensitive actions. |
| NFR-S03 | Encryption in transit and at rest; managed secrets. |
| NFR-S04 | Immutable audit log of sensitive actions with before/after. |
| NFR-S05 | Branch-scoped access; users limited to assigned branches. |
[/TABLE]

## 15.4 Maintainability, localization, configurability

[TABLE]
| Req. ID | Functional requirement |
| NFR-U01 | Bilingual EN+AR full RTL across all surfaces and documents. |
| NFR-U02 | Loose coupling, single source of truth, no duplicated logic (§2). |
| NFR-U03 | Switchable providers via enum/env with no code change (§2.4). |
| NFR-U04 | Core untouched by verticals; packs additive and independently versioned. |
| NFR-U05 | OpenAPI on every endpoint; endpoint registry kept in sync by script (§6.5). |
| NFR-U06 | A new vertical reachable in 1–2 days via manifest + thin strategy code. |
[/TABLE]

# 16. Traceability & Definition of Done
Every functional requirement (e.g. ACC-F11, HR-F31, JWL-F12) maps through a single matrix: user story → acceptance criteria → schema object(s) in §5 → permission key in §6 → endpoint in §7 → UI screen → automated test.
Definition of done. A feature is done when its FR id appears in the matrix with a written story and Given/When/Then criteria; the table(s) it reads/writes exist per §5; its permission and endpoint are registered (§6 sync script passes); its enums/state transitions match §9–§10; and a passing test asserts the criteria, including the concurrency/posting-integrity criteria of §3 where money or stock move. Missing any leg → flagged incomplete, not shipped.
Build order for agents. (1) Generate the full data dictionary from §5; (2) generate the permission catalog and run the endpoint-sync script (§6.5); (3) implement strategy interfaces (§8) for jewellery; (4) build modules per Part B, each posting through the strategies and guarded by RBAC; (5) expand acceptance criteria to the §16 shape per feature; (6) enforce the deterministic guards (decimal-not-float, RLS present, journal balances) in CI.

# 17. Glossary

[TABLE]
| Term | Meaning |
| Manifest | Declarative vertical definition: modules, attributes, strategy bindings, COA, dashboards, terminology. |
| Strategy | Pluggable behaviour interface resolved per domain (stock, pricing, valuation, posting, document, numbering). |
| Attribute engine | Typed JSONB custom-field system carrying domain shape with no core DDL. |
| Endpoint registry | api_endpoint table: every endpoint with endpoint_name, display_name, module, feature, permission. |
| Permission key | module.feature.action verb, e.g. sales.invoice.void. |
| Provider | Swappable integration behind an interface, selected by enum/env (email, SMS, storage, payment, rate feed). |
| Fine weight | Pure-metal grams = net weight × purity; unit of the metal ledger. |
| Idempotency key | Token making a money-moving request safe to retry exactly once. |
| Dimension | Orthogonal posting tag (branch, cost centre, project) enabling segmented reporting. |
| Definition of done | The traceability legs a feature must satisfy before it ships (§16). |
[/TABLE]

PART D
Statutory Localization & Migration
GCC Tax Packs (Saudi ZATCA + UAE) · Opening Balances & Go-Live Migration
Note on currency of requirements.  Statutory rules and deadlines change. The requirements below reflect the rules as understood at authoring; the localization framework (LOC, §5/§13 Part B) is designed so a pack's rates, formats and endpoints are updated as data/configuration without core change. Implementers must confirm the live ZATCA and UAE MoF technical specifications and the tenant's assigned wave/deadline before go-live.

# Appendix A. Country-wise Taxation Framework
Tax behaviour is delivered as per-country localization packs over the generic tax engine (B10) and the localization framework (LOC). A pack supplies: VAT/tax rates and rules, document formats, e-invoicing integration, statutory reports/returns, rounding and number/date formats, and the statutory chart-of-accounts and tax-return mapping. A tenant's country selection (with the domain) loads its tax pack; switching or updating a pack is configuration.
## A.1 Tax pack contract

[TABLE]
| Pack element | Responsibility |
| Tax rates & categories | Standard / zero-rated / exempt / out-of-scope; per-item and per-customer tax treatment. |
| Place-of-supply rules | Determine taxability and rate by supply location and party. |
| Document formats | Legal invoice/credit-note layout, mandatory fields, bilingual presentation. |
| E-invoicing integration | Provider behind the e-invoicing interface (§2.4 pattern), selected per country. |
| Statutory reports | VAT return, tax registers, audit files in the authority's format. |
| COA & return mapping | Map ledger accounts to tax-return boxes. |
| Rounding & formatting | Per-jurisdiction rounding, number and date formats. |
[/TABLE]

E-invoicing behind the switchable-provider pattern

[TABLE]
| interface EInvoicingProvider { |
| build(invoice: Invoice): Promise<StructuredDoc>;   // UBL/PINT XML |
| submit(doc: StructuredDoc): Promise<ClearanceResult>; // clearance or reporting |
| status(ref: string): Promise<ClearanceStatus>; |
| } |
| enum EInvoicingProviderKind { ZATCA_FATOORA, UAE_PEPPOL_ASP, NONE } |
| // COUNTRY=SA -> ZATCA_FATOORA ; COUNTRY=AE -> UAE_PEPPOL_ASP  (env/tenant-selected) |
[/TABLE]

# Appendix B. Saudi Arabia — ZATCA / Fatoora E-Invoicing Pack
Saudi Arabia operates a 15% VAT and a centralized e-invoicing model (Fatoora) requiring real-time integration in Phase 2 (Integration Phase). The pack implements generation, cryptographic stamping and platform submission to implementation depth.
## B.1 Clearance vs reporting model
- Standard tax invoices (B2B/B2G): submitted to the Fatoora platform for clearance before being issued to the buyer; the invoice is legally valid only after ZATCA returns a cleared, stamped response.
- Simplified tax invoices (B2C retail): reported to Fatoora within 24 hours of issuance; the QR is presented to the buyer at point of sale.
- Wave-based scope: mandatory integration is rolled out in waves by VAT-taxable revenue; the tenant's assigned wave and deadline are configured per tenant.
## B.2 Technical requirements

[TABLE]
| Requirement | Detail |
| Format | UBL 2.1 XML; sharing in XML or PDF/A-3 with embedded XML. |
| Identifiers | Per-invoice UUID; sequential invoice number; previous-invoice hash (chained). |
| Cryptographic stamp | XAdES digital signature using a CSID (Cryptographic Stamp Identifier) obtained from ZATCA; anti-tampering after issuance. |
| QR code | TLV-encoded, Base64, Phase-2 set of 9 tags: seller name, VAT no, timestamp, invoice total, VAT total, invoice hash, ECDSA signature, public key, CA signature. |
| Onboarding | Register the EGS solution on Fatoora; obtain CSID; validate against ZATCA rules in sandbox before production. |
| API | Secure API to Fatoora: clearance (B2B, synchronous, await accepted response) and reporting (B2C, within 24h); support single and bulk submission. |
| Validation | Validate BR-KSA business rules offline before submission to minimize rejections. |
[/TABLE]

## B.3 Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| SA-F01 | Issue 15% VAT standard and simplified tax invoices with all legally mandated bilingual (Arabic-first) fields. |
| SA-F02 | Generate UBL 2.1 XML per ZATCA schema for every invoice and credit/debit note. |
| SA-F03 | Generate per-invoice UUID, sequential number and chained previous-invoice hash. |
| SA-F04 | Apply XAdES cryptographic stamp using the tenant's CSID; store the signed XML immutably. |
| SA-F05 | Generate the Phase-2 TLV Base64 QR (9 tags) and render it on the printed/PDF invoice. |
| SA-F06 | Clear B2B invoices with Fatoora before issuing; block issuance until a cleared response is received; surface rejections with reasons. |
| SA-F07 | Report B2C invoices to Fatoora within 24 hours; queue and retry on transient failure (idempotent submission). |
| SA-F08 | Run offline BR-KSA validation before submission; log validation outcomes. |
| SA-F09 | Produce the periodic VAT return mapped from the ledger; export ZATCA-format registers/audit file. |
| SA-F10 | Configure the tenant's CSID, VAT registration, wave and deadline; operate against sandbox or production by environment. |
[/TABLE]

## B.4 Acceptance criteria (representative)
Acceptance criteria.
- Given a B2B sale in a Saudi tenant, when the invoice is confirmed, then the system generates UBL XML, stamps it with the CSID, submits to Fatoora for clearance, and only marks the invoice issuable after a cleared response; a rejection blocks issuance and shows the reason.
- Given a B2C sale, when the invoice prints, then it carries a Phase-2 compliant TLV QR, and the invoice is reported to Fatoora within 24 hours, retrying idempotently on transient failure.
- Given COUNTRY=SA, when e-invoicing runs, then the ZATCA provider is used; switching the provider/env requires no core code change.
Penalty context. Non-compliant or unstamped invoices carry significant statutory penalties and have no tax effect, which is why clearance gating (SA-F06) is a hard, blocking control rather than a best-effort step.

# Appendix C. United Arab Emirates — E-Invoicing Pack (Peppol PINT AE)
The UAE applies 5% VAT and is adopting a decentralized Peppol-based model (the 5-corner / DCTCE model) rather than a central clearance portal. Invoices are exchanged and reported through an Accredited Service Provider (ASP); the pack integrates with an ASP rather than stamping invoices itself.
## C.1 Model and timeline
- Peppol 5-corner: supplier and buyer exchange structured invoices via Accredited Service Providers, which validate and transmit tax data to the Federal Tax Authority in near real time.
- Scope: B2B and B2G transactions for in-scope businesses; B2C is currently out of scope. Phased rollout from a 2026 pilot into 2027 go-live, by business size; an ASP must be appointed before the applicable deadline.
- Implication: the platform does not self-clear; it produces compliant PINT AE XML and hands off to the configured ASP over Peppol.
## C.2 Technical & functional requirements

[TABLE]
| Req. ID | Functional requirement |
| AE-F01 | Issue 5% VAT invoices with FTA-mandated fields: supplier TRN, buyer TRN, currency, exchange rate, line HS codes for goods, and a unique invoice reference (IRN). |
| AE-F02 | Generate PINT AE (Peppol International Invoice – UAE) XML built on UBL 2.1. |
| AE-F03 | Transmit invoices to the buyer and the FTA via the configured Accredited Service Provider over the Peppol network (corners 2–3). |
| AE-F04 | Receive inbound Peppol PINT AE invoices through the ASP and record them. |
| AE-F05 | Handle ASP validation rejections: a schema-invalid invoice is flagged and must be corrected and reissued before it is recorded by the buyer. |
| AE-F06 | Archive issued and received e-invoices for the statutory retention period (five years, longer in special cases). |
| AE-F07 | Configure the tenant's ASP, TRN, and assigned wave/deadline; select the UAE provider by environment. |
[/TABLE]

## C.3 Acceptance criteria (representative)
Acceptance criteria.
- Given a B2B sale in a UAE tenant, when the invoice is confirmed, then PINT AE UBL XML is produced with mandatory FTA fields and transmitted via the appointed ASP over Peppol; an ASP schema rejection blocks recording until corrected.
- Given an inbound Peppol invoice via the ASP, when it is received, then it is validated, recorded, and archived for the retention period.
- Given COUNTRY=AE, when e-invoicing runs, then the UAE Peppol/ASP provider is selected; no core change is needed to switch between SA and AE.
Saudi vs UAE contrast (build note). Both sit behind the same EInvoicingProvider interface, but the flows differ: Saudi is centralized clearance with self-applied cryptographic stamp + TLV QR; UAE is decentralized exchange via an ASP in PINT AE with no self-clearance. The pack abstracts this so the Sales module is unaware which model is active.

# Appendix D. Opening Balances & Go-Live Migration
A running jewellery business switching systems needs its books, parties, stock and metal positions carried in accurately, with the GL in balance from day one. This appendix specifies the opening-balance model and the cutover runbook, extending the Import/Export module (G2).
## D.1 What must be migrated

[TABLE]
| Area | Opening data |
| Masters | Items (with attributes/purity/making rules), categories, customers, suppliers, karigars, employees, branches, COA. |
| GL opening balances | Per account, per branch, as of the cutover date; must net to zero (balanced opening journal). |
| AR opening | Open customer invoices/balances with aging, per party. |
| AP opening | Open supplier and karigar payables, per party; including metal payable. |
| Stock opening | On-hand pieces (tags) with weight, purity, stones, cost; loose stock by lot; per branch. |
| Metal-ledger opening | Fine-weight balances per purity, per branch; plus metal receivable (karigar) and metal payable opening. |
| Schemes in progress | Active saving schemes with installments paid and liability to date. |
| Fixed assets | Asset register with cost, accumulated depreciation and net book value as of cutover. |
[/TABLE]

## D.2 Opening-balance posting rules
- Opening balances post as a dated opening journal to a clearing/opening-equity account so the GL stays balanced; sub-ledger opens reconcile to their control accounts.
- Opening stock posts to inventory at carried cost with a matching opening-equity entry; opening metal-ledger entries are signed fine-weight opens per purity, reconciled to opening physical stock + metal receivable − metal payable.
- Opening documents are flagged as migration-origin and excluded from current-period operational reports while included in balances.
## D.3 Import mechanics (extends G2)

[TABLE]
| Req. ID | Functional requirement |
| MIG-F01 | Provide versioned import templates per area (masters, GL open, AR open, AP open, stock open, metal open, schemes, assets) including domain attribute columns. |
| MIG-F02 | Validate each import with a dry-run: schema, referential integrity, balance checks (GL nets to zero; metal reconciles); produce an error report with row-level reasons; commit only on a clean run. |
| MIG-F03 | Make imports idempotent and re-runnable with an import batch id; allow rollback of an uncommitted batch. |
| MIG-F04 | Export the same templates for backup and for moving data between environments. |
[/TABLE]

## D.4 Cutover runbook
- Configure the tenant: domain, country/tax pack, branches, COA template, providers (§2.4), CSID/ASP where applicable.
- Import masters; reconcile counts.
- Import opening balances (GL, AR, AP, stock, metal, schemes, assets) via dry-run; fix errors; commit when GL nets to zero and metal reconciles.
- Freeze the legacy system; take a final physical stock and metal count; adjust opens to the count.
- Verify: trial balance equals legacy closing; stock valuation and fine-weight per purity match; AR/AP aging matches.
- Go live; first operational day-close validates the running system end to end.
Acceptance criteria.
- Given opening GL, AR, AP, stock, metal and asset imports, when all are committed, then the trial balance equals the legacy closing trial balance, AR/AP sub-ledgers tie to their control accounts, and the metal ledger reconciles to opening physical fine weight per purity.
- Given an import file with errors, when a dry-run is executed, then nothing is committed and a row-level error report is produced; only a clean run commits.

PART E
Retail Operations Pack
Promotions · Tiered Pricing · Refunds · Payment Methods · Party Bank Accounts · Landed Cost · Inventory Audit · Touch POS · AI Imagery
Purpose.  This appendix specifies, to build depth, the retail-operations capabilities that the core modules referenced but did not fully detail. Each builds on existing slots — the Promotions engine (E4), Pricing engine (B3), Payments (B11), Returns (B8), Stock (B2), the switchable-provider pattern (§2.4) and RBAC (§6) — so nothing here is new architecture, only specified depth.

# Appendix E.1 Promotion Engine (Candela-level)
A rule-driven promotion engine evaluated at the point of sale. A promotion has eligibility (what triggers it), a benefit (what it gives), and controls (period, branch, channel, customer segment, priority, stacking, budget, usage limits). Promotions are evaluated in priority order against the cart; the engine returns applied discounts with a full breakdown so the till and the receipt show why each line was discounted.
## E.1.1 Supported promotion types

[TABLE]
| Type | Definition |
| Percentage / amount off | % or fixed amount off a line, category, or whole bill. |
| BOGO / Buy-X-Get-Y | Buy N of A, get M of B free or discounted (same or different item). |
| Quantity break / tiered | Price per unit drops at quantity thresholds (e.g. 1–2 @ full, 3–5 @ −10%, 6+ @ −15%). |
| Mix-and-match | Any N items from a defined group qualify (e.g. any 3 from a collection for a set price). |
| Bundle / combo | A fixed set of items sold together at a bundle price. |
| Threshold gift / reward | Spend ≥ X (value or weight) → free gift, free making, or bonus points. |
| Coupon / voucher code | Code-gated discount; single or multi-use; per-customer cap. |
| Making-charge / wastage promo | Jewellery-specific: discount or waive making charge or wastage (not metal value). |
| Happy-hour / time-bound | Active only within configured time windows. |
[/TABLE]

## E.1.2 Data model
Table  promotion

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| code | text | N | U | internal code |
| name | text | N |  | i18n |
| promo_type | text | N |  | enum PromoType (E.1.1) |
| channel | jsonb | Y |  | [POS,ONLINE,ALL] |
| segment_id | uuid | Y | FK | customer segment eligibility |
| priority | int | N |  | evaluation order |
| stackable | bool | N |  | may combine with others |
| start_at / end_at | timestamptz | Y |  | validity window |
| time_windows | jsonb | Y |  | happy-hour windows |
| budget_cap | numeric(16,2) | Y |  | max total discount; stop when exhausted |
| usage_limit | int | Y |  | global / per-customer caps |
| status | text | N |  | enum: DRAFT|ACTIVE|PAUSED|EXPIRED |
[/TABLE]

Table  promotion_rule
Eligibility/benefit are typed JSON validated per promo_type; one engine evaluates all types.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| promotion_id | uuid | N | FK | promotion(id) |
| eligibility | jsonb | N |  | trigger: items/categories/groups, min qty, min value/weight, coupon |
| benefit | jsonb | N |  | give: %|amount|free qty|bundle price|gift|points|making-waiver |
| apply_to | jsonb | N |  | which lines receive the benefit |
[/TABLE]

[TABLE]
| Req. ID | Functional requirement |
| PROMO-F01 | Define promotions of every type in E.1.1 with eligibility, benefit and controls. |
| PROMO-F02 | Evaluate the cart in priority order; honour stackable/exclusive and budget/usage caps. |
| PROMO-F03 | Return a per-line discount breakdown shown on the POS and the receipt/invoice. |
| PROMO-F04 | Gate coupon promotions by code with single/multi-use and per-customer limits. |
| PROMO-F05 | Restrict by branch, channel, segment, period and time window. |
| PROMO-F06 | Post discount to the GL discount account; reverse pro-rata on return. |
| PROMO-F07 | Require approval for promotions/overrides beyond a configured threshold (links A10/RBAC). |
| PROMO-F08 | Support jewellery making-charge/wastage promotions that never discount metal value. |
[/TABLE]

Acceptance criteria.
- Given a 'buy 2 get 1 free' promotion on a collection, when three qualifying items are in the cart, then the lowest-priced qualifying item is fully discounted and the receipt shows the promotion name against it.
- Given a quantity-break rule (6+ @ −15%) and a coupon that is non-stackable, when both could apply, then the higher-priority promotion applies alone and the breakdown explains which was chosen.
- Given a promotion with a budget cap reached, when another eligible sale occurs, then the promotion no longer applies and the cart prices at standard.

# Appendix E.2 Tiered, Wholesale & Referral Pricing
Extends the Pricing engine (B3) with customer price tiers and the rules that assign a customer to a tier automatically. Pricing resolution order: active promotion → customer tier price list → contract/segment price → base price list → computed (jewellery rate-based).
## E.2.1 Tiers and auto-qualification

[TABLE]
| Concept | Definition |
| Price tier | RETAIL | WHOLESALE | VIP | DEALER | REFERRAL — each maps to a price list or discount basis. |
| Manual assignment | A customer may be set to a tier directly (with approval where sensitive). |
| Auto-qualification rule | Promote/demote a customer by behaviour: cumulative purchase value or weight over a period, order count, or single-order quantity ≥ threshold. |
| Referral pricing | A referred customer (and/or the referrer) earns a defined price/discount; referral linkage stored on the customer. |
| Quantity-based line pricing | Within an order, unit price follows the qualifying quantity (volume break), independent of tier. |
[/TABLE]

Table  price_tier

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| code | text | N | U | RETAIL|WHOLESALE|VIP|DEALER|REFERRAL |
| price_list_id | uuid | Y | FK | bound price list |
| discount_basis | jsonb | Y |  | alt: % off base or making-only discount |
[/TABLE]

Table  tier_qualification_rule
Evaluated on sale and on a scheduled job; assignment writes an audited tier change.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| target_tier_id | uuid | N | FK | tier to assign on qualifying |
| metric | text | N |  | enum: PERIOD_VALUE|PERIOD_WEIGHT|ORDER_QTY|ORDER_COUNT |
| threshold | numeric(16,3) | N |  | e.g. qty ≥ 50, or value ≥ X over window |
| window_days | int | Y |  | evaluation window for cumulative metrics |
| auto_apply | bool | N |  | auto-assign vs suggest-for-approval |
[/TABLE]

[TABLE]
| Req. ID | Functional requirement |
| PRC-F01 | Maintain price tiers bound to price lists or discount bases. |
| PRC-F02 | Resolve a line price through the documented resolution order, server-side. |
| PRC-F03 | Auto-qualify a customer to a tier when a rule's threshold is met (e.g. buys ≥ X qty → WHOLESALE), auto or with approval. |
| PRC-F04 | Support referral linkage and referral-based pricing for referrer and referee. |
| PRC-F05 | Apply quantity-break unit pricing within an order independent of tier. |
| PRC-F06 | Audit every tier change with reason, actor and triggering metric. |
[/TABLE]

Acceptance criteria.
- Given a rule 'order qty ≥ 50 → WHOLESALE' with auto_apply, when a customer places a 60-unit order, then they are assigned WHOLESALE, the order reprices at wholesale, and the change is audited.
- Given a referred customer, when they purchase, then the configured referral price/discount applies and the referrer's reward (if any) accrues.

# Appendix E.3 Refund System
Formalizes refunds over Returns (B8) and Payments (B11). A refund is authorized, references its original sale/return, chooses a refund method, and posts reversing entries; partial refunds are supported.

[TABLE]
| Req. ID | Functional requirement |
| REF-F01 | Initiate a refund against an invoice or a sales return; support full and partial amounts/lines. |
| REF-F02 | Choose refund method: original tender, cash, bank transfer, or store credit/credit note. |
| REF-F03 | Require authorization for refunds (sensitive permission) above a configured threshold. |
| REF-F04 | For gateway payments, trigger an idempotent gateway refund and track status to settlement. |
| REF-F05 | Post reversing GL (and metal-ledger, where metal returns) entries; reverse loyalty/commission pro-rata. |
| REF-F06 | Issue and redeem store-credit/credit-note with its own liability account and expiry. |
| REF-F07 | Attribute refunds to shift/branch for day-close. |
[/TABLE]

Acceptance criteria.
- Given a paid card invoice, when a partial refund is authorized, then an idempotent gateway refund is issued for that amount, GL reverses proportionally, and any commission on the refunded portion is clawed back.
- Given a refund issued as store credit, when the customer later redeems it, then the credit-note liability reduces and the sale settles against it.

# Appendix E.4 Payment Methods & Cheque Lifecycle
Specifies the payment-method taxonomy referenced by Payments (B11) for both sales receipts and purchase payments, including cash, bank (with sub-types) and the cheque lifecycle.
## E.4.1 Taxonomy

[TABLE]
| Method | Sub-type / detail |
| Cash | Posts to the branch cash account; feeds day-close. |
| Bank | Sub-type: CHEQUE | ONLINE_TRANSFER | CARD | POS_TERMINAL | WALLET. Posts to a bank account. |
| Cheque | Stores cheque no, bank, date, party; lifecycle ISSUED/RECEIVED → DEPOSITED → CLEARED | BOUNCED. |
| Online transfer | Reference no, bank, value date. |
| Card / POS terminal | Auth/reference, settlement batch. |
| Store credit / advance | Settles against credit-note or customer advance balance. |
[/TABLE]

Table  payment

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id / branch_id | uuid | N | FK | scope |
| direction | text | N |  | enum: RECEIPT|PAYMENT (sales in / purchase out) |
| method | text | N |  | enum PaymentMethod: CASH|BANK|STORE_CREDIT|ADVANCE |
| bank_subtype | text | Y |  | enum: CHEQUE|ONLINE_TRANSFER|CARD|POS_TERMINAL|WALLET |
| account_id | uuid | N | FK | cash or bank account posted to |
| party_type / party_id | text/uuid | Y |  | customer/supplier/employee |
| bank_account_id | uuid | Y | FK | party_bank_account(id) used |
| amount | numeric(16,2) | N |  |  |
| idempotency_key | text | Y | U | exactly-once |
| status | text | N |  | enum PaymentStatus + cheque states |
[/TABLE]

Table  cheque
Bounced cheques reverse the settlement and reinstate the receivable/payable.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| payment_id | uuid | N | FK | payment(id) |
| cheque_no | text | N |  |  |
| bank_name | text | N |  |  |
| cheque_date | date | N |  | post-dated supported |
| status | text | N |  | enum ChequeStatus: PENDING|DEPOSITED|CLEARED|BOUNCED |
| cleared_at | timestamptz | Y |  |  |
[/TABLE]

[TABLE]
| Req. ID | Functional requirement |
| PAY-F01 | Record sales receipts and purchase payments by cash or bank with the bank sub-type. |
| PAY-F02 | Manage the cheque lifecycle incl. post-dated cheques and clearing/bounce, with GL effects. |
| PAY-F03 | Support cash purchase (immediate cash-account posting) and bank purchase (cheque/online/card). |
| PAY-F04 | Reconcile bank sub-type payments against bank statements (links C5). |
[/TABLE]

# Appendix E.5 Employee, Customer & Supplier Bank Accounts
A shared bank-account store for parties, used by payroll/WPS, supplier payments and customer refunds.
Table  party_bank_account
Sensitive data: access controlled by permission and audited; never logged in clear.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| party_type | text | N |  | enum: EMPLOYEE|CUSTOMER|SUPPLIER |
| party_id | uuid | N |  | owner |
| account_title | text | N |  | account holder name |
| bank_name | text | N |  |  |
| iban | text | Y |  | validated format where applicable |
| account_no | text | Y |  |  |
| swift_bic | text | Y |  |  |
| is_primary | bool | N |  | default for payouts |
| status | text | N |  | ACTIVE|INACTIVE |
[/TABLE]

[TABLE]
| Req. ID | Functional requirement |
| BANK-F01 | Store multiple bank accounts per employee, customer and supplier with a primary. |
| BANK-F02 | Use employee accounts for payroll/WPS files; supplier accounts for payment runs; customer accounts for bank refunds. |
| BANK-F03 | Validate IBAN/format per country; restrict view/edit by permission; audit changes. |
[/TABLE]

# Appendix E.6 Purchase Landed Cost & Expense Allocation
Extends Purchase (B5) so expenses tied to a specific purchase (freight, customs, insurance, clearing, refining-in) are captured and apportioned into item cost, feeding the layered cost model (§3.4).

[TABLE]
| Req. ID | Functional requirement |
| LC-F01 | Attach one or more expense lines to a specific purchase (type, amount, supplier, GL account). |
| LC-F02 | Allocate expenses across received items by a chosen basis: by value, by weight, by quantity, or manual. |
| LC-F03 | Roll allocated expense into landed unit cost used by valuation and COGS. |
| LC-F04 | Post expenses to GL (payable/cash) and capitalize into inventory; show landed-cost breakdown per item. |
| LC-F05 | Support expenses booked after receipt (retro landed cost) with cost revaluation. |
[/TABLE]

Acceptance criteria.
- Given a purchase with a freight expense allocated by weight, when received, then each item's landed cost includes its weight-proportional share and inventory is valued at landed cost.

# Appendix E.7 Inventory Audit & Stock Count
Formalizes the inventory audit workflow over Stock (B2) and WMS, with count sheets, blind counts, recount and variance approval — distinct from casual adjustments.

[TABLE]
| Req. ID | Functional requirement |
| AUD-F01 | Plan a count (full, cycle, or by location/category/purity) and generate count sheets; freeze affected stock optionally. |
| AUD-F02 | Support blind counts (counter does not see system qty) and dual/independent recount on variance. |
| AUD-F03 | Capture counted vs system qty/weight; compute variance per line, by value and fine weight. |
| AUD-F04 | Route variances above tolerance for approval before posting; require reason codes. |
| AUD-F05 | Post approved adjustments to stock, GL (gain/loss) and metal ledger; write the audit trail. |
| AUD-F06 | Report count history, accuracy %, and shrinkage by branch/period. |
[/TABLE]

Table  stock_count

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id / branch_id | uuid | N | FK |  |
| count_type | text | N |  | enum: FULL|CYCLE|SPOT |
| scope | jsonb | Y |  | location/category/purity filter |
| is_blind | bool | N |  |  |
| status | text | N |  | enum CountStatus: PLANNED|IN_PROGRESS|RECOUNT|PENDING_APPROVAL|POSTED |
[/TABLE]

Acceptance criteria.
- Given a blind cycle count, when a line variance exceeds tolerance, then a recount is required and the net approved variance posts to stock, GL gain/loss and (for metal) the metal ledger with a reason code and audit entry.

# Appendix E.8 Touch-Based POS
Specifies a touch-optimized POS mode within the Sales frontend (B4), in addition to the standard back-office screens.

[TABLE]
| Req. ID | Functional requirement |
| POS-F01 | Touch layout: large product tiles, category grid, on-screen numeric/keypad, quick-search and barcode/RFID scan. |
| POS-F02 | Fast cart operations: add/void line, qty/weight entry, line discount (permission-gated), promotion auto-apply with breakdown. |
| POS-F03 | Multi-tender checkout (cash/bank/cheque/card/split) with change calc; print/issue compliant invoice (incl. ZATCA QR where applicable). |
| POS-F04 | Park/recall sales; hold multiple carts; quick customer attach/create. |
| POS-F05 | Shift-aware: every sale tagged to the open shift/branch for day-close; cashier float and X/Z readings. |
| POS-F06 | Resilient: graceful handling of intermittent connectivity for the till workflow; full RTL for Arabic. |
[/TABLE]

# Appendix E.9 AI Item-Image Generation
Adds AI image generation for catalog items behind the switchable-provider pattern (§2.4), so the provider is env/tenant-selectable and no vendor SDK leaks into the core.
AI image generation provider

[TABLE]
| interface ImageGenProvider { |
| generate(req: { prompt: string; refImageUrl?: string; size: ImageSize }): Promise<GeneratedImage>; |
| variations(imageUrl: string, n: number): Promise<GeneratedImage[]>; |
| } |
| enum ImageGenProviderKind { OPENAI_IMAGE, STABILITY, GEMINI, NONE } |
| // IMAGE_PROVIDER=OPENAI_IMAGE   (env/tenant-selectable; output stored via StorageProvider) |
[/TABLE]

[TABLE]
| Req. ID | Functional requirement |
| IMG-F01 | Generate item images from a prompt and/or a reference photo, choosing size/aspect. |
| IMG-F02 | Produce variations and let a user pick; store chosen images via the StorageProvider and attach to the item. |
| IMG-F03 | Select the provider by env/tenant; operate with no provider configured (feature off) gracefully. |
| IMG-F04 | Permission-gate generation; record prompt, provider and cost metadata for audit; respect usage limits. |
| IMG-F05 | Feed generated images to catalog, POS tiles and e-commerce. |
[/TABLE]

Acceptance criteria.
- Given IMAGE_PROVIDER=OPENAI_IMAGE and a permitted user, when they generate from a prompt, then variations are returned, the selected image is stored via the storage provider and attached to the item, and prompt/provider/cost are audited.
- Given IMAGE_PROVIDER=NONE, when the catalog loads, then image-generation controls are hidden and the rest of the catalog works normally.

# Appendix E.10 Coverage Summary

[TABLE]
| Capability | Status | Where |
| Purchasing approval workflow | Covered | B5 + A10 + RBAC §6 |
| Promotions (BOGO, bundles, mix-match, coupons, qty-breaks, gifts) | Added | E.1 |
| Tiered/wholesale/referral pricing + auto-qualification | Added | E.2 |
| Refund system | Added | E.3 |
| Cash/bank purchase + cheque/online sub-types | Added | E.4 |
| Employee/customer/supplier bank accounts | Added | E.5 |
| Purchase landed cost / linked expenses | Added (deepened) | E.6 + B5/§3.4 |
| Inventory audit system | Added | E.7 |
| Warehouse management | Covered | WMS §5 Part B |
| Touch-based POS | Added | E.8 |
| AI item-image generation | Added | E.9 |
| Daybook, cash flow, asset register | Covered | ACC-F42/F44, §3.6 |
[/TABLE]

PART F
Jewellery Vertical — Gap-Fill Additions

Part F specifies the jewellery-vertical capabilities that were identified during gap analysis against five leading dedicated gold ERPs (Jewelita, WinGold Next, Day Sum Gold, Sun Facet, and Visual Ace Gold) but were absent from the earlier specification. Every section here integrates with the platform core defined in Parts A–E: tables follow §5.1 conventions, permissions follow §6, APIs follow §7, state transitions are extensions of §10, and all postings flow through the PostingStrategy. Section numbers are local to Part F.
# Appendix F.1  Metal Hedging Module
Precious metal traders routinely buy and sell metal at an unfixed (floating) rate and later "fix" (lock) the rate once market conditions are favourable. The current specification covers the Fix/Unfix transaction type (JWL-F12) but does not provide a dedicated hedging module that automatically generates offsetting hedging vouchers, maintains separate hedging accounts, and produces with/without-hedging reporting. This section closes that gap.
## F.1.1  Hedging Concepts & Account Structure
Every metal purchase or sale has a corresponding hedging entry that records the economic offset position. Four dedicated GL accounts are seeded in the jewellery COA template:

[TABLE]
| Hedging Account | Direction | GL Account Type | Description |
| Purchase Hedging Account | Debit | Metal Control | Records the hedged side of metal purchases |
| Sales Hedging Account | Credit | Metal Control | Records the hedged side of metal sales |
| Metal Payment Hedging Account | Debit | Metal Control | Offset for metal payment transactions |
| Metal Receipt Hedging Account | Credit | Metal Control | Offset for metal receipt transactions |
[/TABLE]

## F.1.2  Hedging Data Model

[TABLE]
| Column | Type | Null | Key | Notes / Constraints |
| hedging_voucher |  |  |  | Table header |
| id | uuid | N | PK | Standard surrogate key |
| tenant_id | uuid | N | FK | tenant(id) |
| branch_id | uuid | N | FK | branch(id) |
| hedging_type | text | N |  | enum HedgingType: PURCHASE│SALE│PAYMENT│RECEIPT |
| source_doc_id | uuid | N | FK | sales_invoice(id) or purchase(id) that triggered this |
| source_module | text | N |  | SALES│PURCHASE│PAYMENT│RECEIPT |
| metal | text | N |  | GOLD│SILVER│PLATINUM |
| purity | numeric(6,4) | N |  | e.g. 0.9999 for 24K |
| gross_weight | numeric(14,3) | N |  | Gross weight in grams |
| fine_weight | numeric(14,3) | N |  | Pure-metal grams = net × purity |
| unfixed_rate | numeric(14,4) | Y |  | Rate at time of transaction (unfixed) |
| fixed_rate | numeric(14,4) | Y |  | Rate locked when fixed; null until fixed |
| hedging_amount | numeric(16,2) | N |  | Base-currency hedged value |
| status | text | N |  | enum HedgingStatus: OPEN│FIXED│CANCELLED |
| fixed_at | timestamptz | Y |  | When rate was fixed |
| journal_id | uuid | Y | FK | GL journal posting the hedging entry |
| idempotency_key | text | Y | U | Exactly-once posting guard |
[/TABLE]

## F.1.3  Functional Requirements

[TABLE]
| Req. ID | Functional Requirement |
| HED-F01 | Automatically generate a hedging voucher whenever a metal purchase, sale, payment, or receipt transaction is posted. |
| HED-F02 | Maintain four separate hedging GL accounts: Purchase Hedging, Sales Hedging, Metal Payment Hedging, and Metal Receipt Hedging. |
| HED-F03 | Allow fixing (locking) an open hedging voucher at the prevailing or agreed rate; post the fixing difference to a Fixing Gain/Loss account. |
| HED-F04 | Produce all inventory and financial reports in two modes: "with hedging" (economic view) and "without hedging" (book view) — switchable at report run time. |
| HED-F05 | Display open (unfixed) metal exposure in a real-time Fixing Position Report showing: gross weight, fine weight, unfixed value at current rate, break-even rate, and unrealised gain/loss. |
| HED-F06 | Support auto-fixing: link a hedging voucher to a corresponding sale or purchase invoice so that fixing the sale automatically closes the purchase hedge. |
| HED-F07 | Maintain a Metal Fixing Register — a complete, immutable audit trail of all fixing transactions with before/after rate, actor, and timestamp. |
| HED-F08 | Reverse hedging entries when the underlying source transaction is voided or returned; maintain net-zero hedging balance on reversal. |
| HED-F09 | Post hedging entries atomically with the underlying GL journal and metal ledger in a single database transaction. |
| HED-F10 | Expose hedging position via the configurable dashboard as a Metal Position widget showing open exposure in grams and at-risk value. |
[/TABLE]

## F.1.4  State Machine — Hedging Voucher

[TABLE]
| State | Transitions | Trigger |
| OPEN | → FIXED | Rate fixed by user or auto-fix rule |
| OPEN | → CANCELLED | Source transaction voided/reversed |
| FIXED | → CANCELLED | Fixed transaction reversed within open period |
| CANCELLED | — | Terminal state |
[/TABLE]

User Story.  As a metal trader, I want every metal sale to automatically generate a hedging voucher so that my unfixed metal exposure is tracked without manual entries, so that I can see exactly how much gold I have sold but not yet fixed, and fix it in one click when the rate is right.
Acceptance Criteria.
- Given a metal sale posts, when the PostingStrategy runs, then a hedging voucher is auto-created with status OPEN, linked to the invoice, and the open exposure updates in the Fixing Position Report.
- Given an OPEN hedging voucher, when I fix it at today's rate, then the voucher moves to FIXED, a gain/loss entry posts to the Fixing Gain/Loss account, and the Metal Fixing Register records the actor and rate.
- Given "with hedging" mode is selected on P&L, when the report runs, then hedging entries are included and gross margin reflects the economic hedged position.
# Appendix F.2  Bullion Trading Order Management
Metal traders and bullion dealers require order-desk functionality to book, track, and execute buy/sell orders for physical precious metals at specific rate conditions. This is distinct from the fix/unfix retail flow and covers the commodity desk use case with GTC orders, OCO order pairs, rate triggers, and automated fixing execution.
## F.2.1  Order Types

[TABLE]
| Order Type | Code | Description |
| Good Till Cancelled | GTC | Order remains active until manually cancelled or filled |
| Expiry Order | EXPIRY | Order expires at a specified date and time if unfilled |
| One Cancels Other | OCO | Two linked orders — filling one automatically cancels the other |
| One Activates Other | OAO | Filling one order activates the linked second order |
| Immediate or Cancel | IOC | Fill what is available now; cancel unfilled remainder |
| At Best | MKT | Execute at the best available current market rate |
[/TABLE]

## F.2.2  Rate Condition Triggers

[TABLE]
| Trigger Type | Behaviour |
| Equal To | Execute when rate equals the specified value |
| Greater Than | Execute when rate rises above threshold (for sales) |
| Less Than | Execute when rate falls below threshold (for purchases) |
| Range | Execute when rate falls within a defined min–max band |
[/TABLE]

## F.2.3  Data Model — Bullion Trading Order

[TABLE]
| Column | Type | Null | Key | Notes / Constraints |
| id | uuid | N | PK | Standard PK |
| tenant_id | uuid | N | FK | Tenant scope |
| branch_id | uuid | N | FK | Branch scope |
| direction | text | N |  | enum: BUY│SELL |
| metal | text | N |  | GOLD│SILVER│PLATINUM |
| purity | numeric(6,4) | N |  | e.g. 0.9999 |
| quantity_grams | numeric(14,3) | N |  | Ordered fine weight in grams |
| order_type | text | N |  | enum OrderType: GTC│EXPIRY│OCO│OAO│IOC│MKT |
| trigger_type | text | Y |  | enum TriggerType: EQ│GT│LT│RANGE│NONE |
| trigger_rate | numeric(14,4) | Y |  | Target rate for trigger |
| trigger_rate_max | numeric(14,4) | Y |  | Upper bound for RANGE trigger |
| expiry_at | timestamptz | Y |  | For EXPIRY orders |
| linked_order_id | uuid | Y | FK | Self-ref for OCO/OAO pairs |
| status | text | N |  | enum TradingOrderStatus: OPEN│TRIGGERED│FILLED│CANCELLED│EXPIRED |
| filled_rate | numeric(14,4) | Y |  | Actual rate at execution |
| filled_at | timestamptz | Y |  | Execution timestamp |
| fixing_entry_id | uuid | Y | FK | Auto-generated fixing transaction on fill |
| counterparty_id | uuid | Y | FK | Supplier or customer |
| notes | text | Y |  | Trader notes |
[/TABLE]

## F.2.4  Functional Requirements

[TABLE]
| Req. ID | Functional Requirement |
| BTO-F01 | Create bullion buy/sell orders with order type (GTC, EXPIRY, OCO, OAO, IOC, MKT), metal, purity, quantity, and rate conditions. |
| BTO-F02 | Evaluate open orders continuously against live or manually-entered rate feeds; trigger execution when rate conditions are met. |
| BTO-F03 | For OCO pairs: automatically cancel the linked order when one fills; for OAO pairs: activate the linked order on fill. |
| BTO-F04 | Expire EXPIRY orders at their configured date/time without manual intervention; log the expiry event. |
| BTO-F05 | On order fill: automatically generate a fixing purchase/sale entry in the metal accounting module, linked to the trading order. |
| BTO-F06 | Provide a Trading Order Control Screen showing all open orders, their trigger conditions, filled orders, and daily P&L. |
| BTO-F07 | Produce daily trading profit/loss reports with realised P&L per fill, unrealised P&L on open positions, and net daily position. |
| BTO-F08 | Gate order creation, modification, and execution by dedicated permissions (bullion.order.create, bullion.order.execute) — sensitive flag on execute. |
| BTO-F09 | All order events (creation, trigger, fill, cancellation, expiry) are immutably logged in the audit trail. |
| BTO-F10 | Provide a Bullion Position Summary widget for the dashboard: open orders, filled today, net daily P&L, open exposure in grams. |
[/TABLE]

# Appendix F.3  Advanced Manufacturing Detail
The manufacturing module (MRP, §5.1 Part B) and karigar job-work module (JWL-KAR, §6.4 Part B) specify the core production flow. The following sections add granular jewellery production steps and controls identified in leading gold-ERP manufacturing modules.
## F.3.1  Tree Making (Wax-Tree Assembly)
In lost-wax casting production, individual wax models are assembled onto a wax tree (sprue) before the casting flask is filled. The tree making step tracks how many pieces are assembled, total wax weight, and the casting batch output.

[TABLE]
| Req. ID | Functional Requirement |
| TRM-F01 | Create a Tree Making record linked to a production batch; capture the number of wax models, total wax weight, and assigned casting karigar. |
| TRM-F02 | Record the poured metal weight at casting and the recovered piece weight after de-spruing; compute casting loss. |
| TRM-F03 | Link tree making records to job cards so piece-level traceability from wax model to finished jewellery is maintained. |
| TRM-F04 | Support multiple trees per batch and multiple batches per manufacturing order. |
| TRM-F05 | Post casting loss to the Wastage/Loss GL account via the PostingStrategy on batch close. |
[/TABLE]

## F.3.2  Job Splitting and Merging
Production often requires a single job card to be split across multiple karigars or processes, or several sub-jobs to be merged back into a single finished piece (e.g. assembling a set).

[TABLE]
| Req. ID | Functional Requirement |
| JSM-F01 | Split a job card into two or more sub-jobs; distribute issued metal and stones proportionally or manually across the split jobs. |
| JSM-F02 | Merge two or more completed sub-jobs into a single job record; reconcile the combined metal and stone weight. |
| JSM-F03 | Maintain a parent-child hierarchy between original job and split/merged children; display the full tree in job enquiry. |
| JSM-F04 | Preserve audit trail on every split/merge event: actor, timestamp, before/after weights, and reason. |
| JSM-F05 | Block job completion on the parent until all child sub-jobs are received and reconciled. |
[/TABLE]

## F.3.3  Job Envelope Printing
A job envelope (physical or printed document) accompanies a piece or batch through the production floor. It carries all job-relevant information for the karigar and for floor supervisors.

[TABLE]
| Req. ID | Functional Requirement |
| JEP-F01 | Print a job envelope document for each job card containing: job number, item description, sketch/design image (from PLM), assigned karigar, issued metal weight and purity, stone details, target finishing date, and a barcode/QR code linking to the job record. |
| JEP-F02 | Support reprinting with a reprint watermark and audit log of all print events. |
| JEP-F03 | Allow scanning the job envelope barcode at any production stage to instantly retrieve the job status in the system. |
| JEP-F04 | Configurable envelope template per item category or production process type. |
[/TABLE]

## F.3.4  Setting Analysis and Design Analysis Reports
Setting (stone-setting work) and design analysis reports provide per-design and per-setting type insights into yield, loss, and labour efficiency.

[TABLE]
| Req. ID | Functional Requirement |
| SDA-F01 | Setting Analysis Report: per stone-setting type (prong, bezel, pavé, channel), show stones set, stones broken/lost, setting labour cost, and setting time per job. |
| SDA-F02 | Design Analysis Report: per design/SKU, show production count, average metal weight, average stone count, average yield, average loss percentage, and average making cost. |
| SDA-F03 | Broken/Missing Stone Analysis: list all stone loss events by job, karigar, stone type, and reason code; aggregate by period and branch. |
| SDA-F04 | Worker Efficiency Report: per karigar, show jobs completed, average turnaround time, metal loss %, stone loss %, and quality pass rate. |
| SDA-F05 | Filter all reports by branch, period, category, karigar, and setting type; export to Excel and PDF. |
[/TABLE]

## F.3.5  Merging Designs to Create Jewellery Sets
A jewellery set (e.g. necklace + earrings + bracelet) is sold and managed as a bundle but produced as individual pieces that are later grouped.

[TABLE]
| Req. ID | Functional Requirement |
| MDS-F01 | Define a Set template in the item catalog: a named grouping of two or more individual item SKUs that constitute a set. |
| MDS-F02 | Tag individual finished pieces as belonging to a set; hold them in IN_STOCK status with a set_group_id until all pieces of the set are ready. |
| MDS-F03 | Create a Set Sales transaction that invoices all set components as a single line at the set price, with the individual pieces' weights and stone values visible in the invoice detail. |
| MDS-F04 | Allow sets to be broken (sold as individual pieces) with appropriate price recalculation and inventory re-tagging. |
| MDS-F05 | Report set performance: sets sold, partial sets held, average set realisation vs individual piece total. |
[/TABLE]

# Appendix F.4  Advanced Inventory Features
## F.4.1  Jewellery Alteration Tracking
Jewellery frequently undergoes physical alterations — resizing, re-plating, stone replacement, engraving — after it enters stock or is returned by a customer. These changes affect weight, value, and status and must be tracked without creating a new item.

[TABLE]
| Req. ID | Functional Requirement |
| ALT-F01 | Record an alteration event on an inventory tag: alteration type, before/after weight, before/after stone details, karigar or internal bench, cost, and estimated completion date. |
| ALT-F02 | Move the tag to a WITH_ALTERATION status during the alteration; block sale until the alteration is closed and the tag returns to IN_STOCK. |
| ALT-F03 | Post weight change to the metal ledger and alteration cost to the relevant GL account on alteration close. |
| ALT-F04 | Maintain a complete alteration history per tag; display in the tag detail view and stock movement report. |
| ALT-F05 | Alteration register report: list all open and closed alterations by branch, period, item category, and alteration type. |
[/TABLE]

## F.4.2  Jewellery Dismantling
Dismantling converts a finished jewellery piece back to its raw-material components — metal scrap and loose stones. This is required for vintage buyback, defective-piece processing, or design rework.

[TABLE]
| Req. ID | Functional Requirement |
| DIS-F01 | Create a dismantling order against an inventory tag; specify the expected recovered metal weight, purity, and stone details. |
| DIS-F02 | On dismantling completion: set the source tag to MELTED; create stock entries for recovered metal scrap (by weight and purity) and any recovered loose stones. |
| DIS-F03 | Record dismantling loss (difference between original tag weight and recovered weight) and post to Wastage/Loss GL account. |
| DIS-F04 | Recover and re-tag stones as loose stone inventory if in usable condition; post the stone value adjustment. |
| DIS-F05 | Dismantling report: input pieces, recovered metal, recovered stones, and loss in grams and value, by period and branch. |
[/TABLE]

## F.4.3  RFID Anti-Theft and Security System
Beyond inventory scanning, RFID enables an active security layer that detects and alerts on unauthorized jewellery movement within the showroom.

[TABLE]
| Req. ID | Functional Requirement |
| RFID-S01 | Define authorized movement zones and exits in the RFID configuration; any tag read outside its assigned zone or at an unauthorized exit triggers an alert. |
| RFID-S02 | Tamper detection: log and alert when an RFID tag is removed or detected as non-responsive (indicating tampering or tag removal from a piece). |
| RFID-S03 | Real-time alert notification to designated staff via in-app notification and SMS when unauthorized movement or tampering is detected. |
| RFID-S04 | Maintain a Security Event Log: all unauthorized movement detections, tampering events, false-positive dismissals, actor, and resolution notes — immutable. |
| RFID-S05 | Anti-theft report: security events by branch, counter, period, and event type; unresolved events dashboard widget. |
[/TABLE]

## F.4.4  Smart Tray Integration
A Smart Tray is an RFID-enabled display tray that continuously reads all pieces placed on it, providing real-time stock presence confirmation and customer-facing piece identification.

[TABLE]
| Req. ID | Functional Requirement |
| STR-F01 | Integrate Smart Tray readers into the inventory module; any piece placed on or removed from a Smart Tray generates a stock presence event linked to its tag. |
| STR-F02 | Smart Tray inventory dashboard: real-time view of which pieces are on which trays, total count, and total value per counter. |
| STR-F03 | Alert when a piece leaves a Smart Tray without a corresponding POS sale or authorized transfer in the system. |
| STR-F04 | Customer-facing integration: when a piece is placed on a Smart Tray at a display counter, optionally display item details on the customer-facing screen (links F.6.1). |
[/TABLE]

## F.4.5  Dead-Stock Identification and Alerts
Dead stock (slow-moving or zero-movement pieces) ties up capital. The system proactively identifies and surfaces dead-stock for management action.

[TABLE]
| Req. ID | Functional Requirement |
| DST-F01 | Configure dead-stock thresholds per category: pieces with no sale or transfer activity beyond N days are flagged as dead stock. |
| DST-F02 | Dead-stock report: pieces flagged beyond threshold, by branch, category, karikar/supplier source, cost value, and days in stock. |
| DST-F03 | Dead-stock dashboard widget: total pieces, total cost value at risk, and top-N dead-stock items by value. |
| DST-F04 | Scheduled alert: automatically notify the branch manager (via in-app or email) when new pieces cross the dead-stock threshold. |
| DST-F05 | Dead-stock action tracking: record disposition actions (markdown, transfer to central, melt, return to supplier) against each flagged piece. |
[/TABLE]

# Appendix F.5  Diamond & Stone Enhancements
## F.5.1  Rapaport Diamond Price Integration
The Rapaport Price List is the global industry standard benchmark for polished diamond pricing. Integration enables automated diamond valuation, invoice pricing, and margin calculation against current Rapaport rates, replacing manual price lookups.

[TABLE]
| Req. ID | Functional Requirement |
| RAP-F01 | Connect to the Rapaport price list API (or import the weekly Rapaport Excel/CSV price sheet) to maintain a current in-system diamond price matrix by shape, colour, clarity, and carat range. |
| RAP-F02 | Price a diamond line on a sales invoice as: Rapaport rate for the stone's 4C attributes × a configurable Rapaport percentage (e.g. −15% back of Rap) + making charges. |
| RAP-F03 | Allow per-stone, per-category, or per-customer-tier Rapaport discount/premium configuration. |
| RAP-F04 | Automatically update the in-system Rapaport price matrix on schedule (daily or on import); alert the diamond manager when rates update. |
| RAP-F05 | Diamond Margin Report: per-stone or per-lot, show the Rapaport rate at invoice, the actual selling price, the percentage back-of-Rap, and the gross margin. |
| RAP-F06 | Provide the Rapaport feed as a switchable provider behind the DiamondPricingProvider interface (§2.4 pattern); support RAPAPORT_API, RAPAPORT_IMPORT, and MANUAL as provider kinds. |
[/TABLE]

[TABLE]
| Provider Kind | Integration Method | Update Frequency |
| RAPAPORT_API | Direct API connection to RapNet; OAuth-authenticated | Daily or on-demand |
| RAPAPORT_IMPORT | Excel/CSV upload from Rapaport downloaded file | Weekly (manual) |
| MANUAL | Price matrix entered manually in the system | User-controlled |
[/TABLE]

## F.5.2  Broken and Missing Stone Analysis

[TABLE]
| Req. ID | Functional Requirement |
| BMS-F01 | At any production stage or during repair, record a stone loss event: stone type, carat, reason code (broken, missing, stolen, incorrect), job card, karigar, and estimated value. |
| BMS-F02 | Stone Loss Report: by job, by karigar, by stone type, by period — showing count, total carats lost, and estimated value lost. |
| BMS-F03 | Broken stone inventory: stones recovered from a piece that are damaged but re-usable are logged as broken-stone stock with reduced valuation. |
| BMS-F04 | Karigar stone accountability: for each karigar, compare stones issued vs stones returned (set + loose recovery + broken); flag discrepancies above tolerance. |
| BMS-F05 | Post stone loss to the Stone Wastage/Loss GL account on job close; reconcile with the stone sub-ledger. |
[/TABLE]

# Appendix F.6  Gold Testing Laboratory Module (VAGL)
A gold testing and assay laboratory is a distinct business vertical adjacent to jewellery retail and manufacturing. The laboratory module manages the complete sample lifecycle — from customer counter intake through testing, certificate issuance, and fee collection — fully integrated with the platform's financial accounts. This module is enabled via the tenant manifest as a laboratory vertical pack alongside or independent of the retail/manufacturing packs.
## F.6.1  Sample Lifecycle

[TABLE]
| Stage | System Action |
| Customer Receipt at Counter | Sample intake: item details, customer, weight, declared purity; generate sample number; collect advance if required |
| Transfer to Laboratory | Sample dispatched to lab bench; tag with sample number; metal ledger shows sample in transit |
| Testing | Record test method, result purity, assay details; attach test results to sample record |
| Laboratory Receipt | Confirm testing complete; update sample status; trigger certificate generation |
| Certificate Printing | Print testing certificate with sample number, test method, declared vs actual purity, tester name, and lab stamp |
| Sample Delivery | Sample returned to customer counter; update status to DELIVERED |
| Fee Collection | Collect testing fee; post to GL (Dr Cash/Bank; Cr Testing Income); receipt printed |
[/TABLE]

## F.6.2  Laboratory Data Model

[TABLE]
| Column | Type | Null | Key | Notes / Constraints |
| lab_sample |  |  |  | Table header |
| id | uuid | N | PK | Standard PK |
| tenant_id | uuid | N | FK | Tenant scope |
| branch_id | uuid | N | FK | Lab branch |
| sample_no | text | N | U | Per-branch unique sequence |
| customer_id | uuid | Y | FK | Customer (walk-in allowed) |
| item_description | text | N |  | Customer-stated description |
| category_id | uuid | Y | FK | Item category |
| test_method | text | N |  | enum TestMethod: XRF│FIRE_ASSAY│ACID│SPECTROMETRY |
| gross_weight | numeric(14,3) | N |  | Weight in grams |
| declared_purity | numeric(6,4) | Y |  | Customer-stated purity |
| tested_purity | numeric(6,4) | Y |  | Lab result purity; set on testing complete |
| status | text | N |  | enum SampleStatus: RECEIVED│IN_TRANSIT│TESTING│TESTED│CERTIFICATE_ISSUED│DELIVERED |
| testing_fee | numeric(16,2) | Y |  | Charged testing fee |
| payment_status | text | N |  | enum PaymentStatus (§9) |
| received_at | timestamptz | N |  | Intake timestamp |
| tested_at | timestamptz | Y |  | Testing completion timestamp |
| delivered_at | timestamptz | Y |  | Delivery timestamp |
| tester_id | uuid | Y | FK | app_user(id) who performed the test |
| certificate_no | text | Y | U | Certificate number for issued certificates |
| notes | text | Y |  | Lab notes |
[/TABLE]

## F.6.3  Functional Requirements

[TABLE]
| Req. ID | Functional Requirement |
| LAB-F01 | Receive samples at the customer counter with full sample details: item description, category, gross weight, declared purity, customer, and collection of advance payment if required. |
| LAB-F02 | Support test methods: XRF (X-ray fluorescence), fire assay, acid test, and spectrometry; record test method, tested purity result, and tester on the sample record. |
| LAB-F03 | Laboratory Sample Status Enquiry: real-time status tracking by sample number or customer — shows current stage, expected completion, and tester. |
| LAB-F04 | Testing Certificate printing with: lab name and logo, sample number, test date, item description, weight, declared purity, tested purity, test method, tester name, authorized signature field, and lab stamp. |
| LAB-F05 | Testing Register: view all samples, pending samples, and undelivered samples with full details; filter by branch, period, test method, and purity range. |
| LAB-F06 | Sample Analysis Report: volume and value of samples tested by method, category, purity distribution, and average turnaround time by period. |
| LAB-F07 | Accounting integration: post testing fees to Testing Income; support advance receipt, credit to customer account, and receipt-against-earlier-dues payment modes. |
| LAB-F08 | Double-entry accounting with full audit trail; produce customer statements, trial balance, and income reports for the laboratory business. |
| LAB-F09 | Multi-sample workflow: a customer may drop multiple samples in one visit; group them under one receipt with individual test results and a combined fee invoice. |
| LAB-F10 | Barcode/QR on sample receipt and certificate for instant sample lookup and status verification. |
[/TABLE]

User Story.  As a laboratory manager, I want every sample to be tracked from intake through testing to certificate issuance without any sample being lost or misidentified, so that the laboratory operates with zero-error sample traceability and full accounting for fees collected.
Acceptance Criteria.
- Given a sample is received at the counter, when the intake is saved, then a unique sample number is generated, a receipt is printed, and the sample appears in the Testing Register with status RECEIVED.
- Given testing is completed, when the tester records the purity result, then the status moves to TESTED and a Testing Certificate can be printed with the lab's details and the tester's name.
- Given a testing fee is collected on delivery, when payment is recorded, then the fee posts to Testing Income (Dr Cash; Cr Income) and a receipt is printed.

PART G
Named External Integrations

Part G specifies integration requirements for named external services identified in leading gold ERP platforms. All integrations follow the switchable-provider pattern defined in §2.4: each external service sits behind a provider interface, and the active implementation is selected by an environment variable or tenant setting with no code change required to switch. Adding a new provider for any category requires only a new implementation of the existing interface — no core module changes.
# Appendix G.1  Precious Metal Market Integrations
## G.1.1  MetaTrader 5 (MT5) Integration
MT5 is a widely used trading platform providing real-time precious metal spot prices and historical rate data. Integration enables live gold, silver, and platinum rates to feed directly into the platform's rate engine (JWL-F10).

[TABLE]
| Req. ID | Functional Requirement |
| MT5-F01 | Connect to a configured MT5 broker account via the MetaQuotes WebAPI or a bridge service to receive real-time tick data for XAU/USD, XAG/USD, and XPT/USD (gold, silver, platinum). |
| MT5-F02 | Map MT5 symbols to the platform's metal and purity definitions; configure the rate conversion formula (e.g. USD/troy-oz → AED/gram at current FX). |
| MT5-F03 | Feed received rates into the RateFeedProvider interface so the POS and pricing engine use live MT5 rates automatically. |
| MT5-F04 | Rate history: store every received MT5 tick with timestamp for audit, chart display, and historical rate reporting. |
| MT5-F05 | Alert on rate feed interruption: if no MT5 rate is received within a configurable timeout, alert the rate manager and fall back to the last known rate. |
| MT5-F06 | Provider kind: MT5 is one implementation of RateFeedProviderKind; switching to a different rate source requires only changing the env variable (§2.4). |
[/TABLE]

## G.1.2  AKR Trader Platform Integration
AKR Trader is a regional bullion trading and rate platform used in the UAE and GCC markets. Integration provides rate feeds and trading connectivity for regional bullion dealers.

[TABLE]
| Req. ID | Functional Requirement |
| AKR-F01 | Connect to the AKR Trader API for real-time gold and silver rates in local currencies (AED, SAR). |
| AKR-F02 | Support AKR Trader as a named RateFeedProviderKind: AKR_TRADER, selectable by environment or tenant setting. |
| AKR-F03 | Where AKR Trader supports order placement, implement bullion order submission for buy/sell orders created in the Trading Order module (F.2). |
| AKR-F04 | Receive AKR trade confirmations and automatically match them to open trading orders in the system; update order status to FILLED. |
[/TABLE]

[TABLE]
| Provider Kind | Service | Region |
| MT5 | MetaTrader 5 — real-time spot rates & trade execution | Global |
| AKR_TRADER | AKR Trader — regional rate feed & order placement | UAE, GCC |
| MANUAL | Manually entered rates by rate manager | All |
| GOLD_API | REST gold/silver API (generic configurable endpoint) | Global |
[/TABLE]

# Appendix G.2  Payment Gateway Additions
The platform's PaymentGatewayKind enum (§9) currently covers STRIPE, TADAWUL, TAP, and MANUAL. The following named gateways are confirmed requirements in the target markets and are added as additional enum values and provider implementations.

[TABLE]
| Gateway | Kind Enum Value | Region | Use Case |
| Mada | MADA | Saudi Arabia | Local debit card network mandatory for KSA retail POS |
| STC Pay | STC_PAY | Saudi Arabia | Popular mobile wallet in KSA; QR and deeplink payment |
| Planet | PLANET | UAE, GCC | Payment terminal integration for retail POS and DCC |
| HyperPay | HYPERPAY | MENA | Regional online payment gateway for e-commerce |
[/TABLE]

[TABLE]
| Req. ID | Functional Requirement |
| PGW-F01 | Implement Mada as a PaymentGateway provider: support card-present POS transactions through a Mada-certified terminal; handle authorization, capture, and reversal. |
| PGW-F02 | Implement STC Pay: support QR code generation for in-store payment and deeplink for in-app payment; receive real-time payment confirmation webhook. |
| PGW-F03 | Implement Planet payment terminal integration: support card-present DCC (Dynamic Currency Conversion), settlement, and end-of-day batch processing via Planet's API. |
| PGW-F04 | All new gateway implementations follow the PaymentGateway interface (§2.4); no core sales or POS code changes are required to add them. |
| PGW-F05 | Gateway-specific refund and void are supported through the same interface; the Refund module (E.3) operates gateway-agnostically. |
| PGW-F06 | Add PGW-F01–F03 gateway kinds to the PaymentGatewayKind enum and the switchable provider factory; update PAYMENT_GATEWAY env docs. |
[/TABLE]

# Appendix G.3  Mall & Venue Integration (EMAAR)
Jewellery retailers operating in EMAAR-managed malls (Dubai Mall, Mall of the Emirates, etc.) may be required to integrate with EMAAR's reporting and concession management systems.

[TABLE]
| Req. ID | Functional Requirement |
| EMR-F01 | Produce EMAAR-format daily sales reports (tenancy code, turnover by hour, payment split) for automated or manual submission to the mall management system. |
| EMR-F02 | Support EMAAR concession fee calculation based on sales turnover thresholds; post concession cost to the GL expense account. |
| EMR-F03 | Configure EMAAR tenant/unit codes per branch; reports are generated per branch-EMAAR mapping. |
| EMR-F04 | Implement EMAAR as an optional ReportingProvider behind the provider interface; enable per tenant via settings with no core code impact. |
[/TABLE]

# Appendix G.4  Named E-Commerce Platform Connectors
The E-Commerce module (ECOM, §5.4 Part B) specifies platform-agnostic online store integration. The following named connectors are required for the primary target market (Saudi Arabia / GCC) and are implemented as ECommerceProvider implementations behind the existing interface.

[TABLE]
| Platform | Kind | Market | Integration Method |
| Salla | SALLA | Saudi Arabia, GCC | Salla Merchant API v2 — OAuth; product sync, order webhook, inventory push |
| Zid | ZID | Saudi Arabia | Zid Partner API — API key; catalog, order, and inventory integration |
| Shopify | SHOPIFY | Global | Shopify Admin API — OAuth; product, order, and webhook integration |
[/TABLE]

[TABLE]
| Req. ID | Functional Requirement |
| EC-NM-F01 | Salla connector: authenticate via Salla OAuth 2.0; push product catalog (with live metal-rate pricing and images from PLM); receive new orders via webhook; push inventory updates on every sale or receipt. |
| EC-NM-F02 | Zid connector: authenticate via Zid API key; sync catalog, pricing, and stock levels; receive orders from Zid into the ERP sales pipeline; send shipment confirmation and tracking back to Zid. |
| EC-NM-F03 | For both Salla and Zid: apply ZATCA-compliant invoice generation to online orders (B2C simplified invoice with QR) as specified in Appendix B. |
| EC-NM-F04 | All three connectors follow the ECommerceProvider interface; a tenant may activate multiple connectors simultaneously for multi-channel selling. |
| EC-NM-F05 | Connector health dashboard: show sync status, last sync timestamp, pending order count, and error log per connected platform. |
[/TABLE]

# Appendix G.5  Signum CRM Integration
Signum CRM is an external customer relationship management platform used by some jewellery retailers for advanced segmentation, campaign management, and customer scoring beyond the platform's built-in CRM capabilities.

[TABLE]
| Req. ID | Functional Requirement |
| SIG-F01 | Bidirectional customer sync between the platform's CRM module and Signum CRM: customer master data, purchase history, loyalty points balance, and scheme status flow to Signum; Signum-generated segments and campaign responses flow back. |
| SIG-F02 | Implement Signum as an ExternalCRMProvider behind a provider interface (CrmProvider); switching to another CRM platform requires only a new implementation. |
| SIG-F03 | Trigger customer data push to Signum on every new sale, return, or scheme installment; configurable sync frequency (real-time webhook or scheduled batch). |
| SIG-F04 | Receive Signum campaign segments as customer tags/groups in the platform's CRM, usable for targeted promotions (PROMO-F05) and loyalty tier assignment. |
[/TABLE]

# Appendix G.6  RFID Hardware Ecosystem Integration
The platform's RFID integration (JWL-F22) specifies inventory scanning. The following hardware types require specific integration protocols.

[TABLE]
| Hardware Type | Protocol | Use Case |
| Fixed RFID Gate Reader | LLRP (Low Level Reader Protocol) | Showroom entrance/exit monitoring for anti-theft |
| Handheld RFID Reader | LLRP or REST API to reader | Mobile stock count and piece lookup |
| RFID Smart Tray | Proprietary REST API / MQTT | Display counter piece presence (F.4.4) |
| RFID-enabled POS terminal | USB/SDK integration | Fast checkout by placing items on the counter |
| HF Tag (ISO 15693) | HF reader hardware | Fine jewellery (common in GCC/India) |
| UHF Tag (ISO 18000-6C) | UHF reader hardware | Bullion, heavy items — longer read range |
[/TABLE]

[TABLE]
| Req. ID | Functional Requirement |
| RFID-HW-F01 | RFID hardware adapters follow an RfidReaderProvider interface; specific reader models are implemented as named providers selected by tenant hardware configuration. |
| RFID-HW-F02 | The system supports simultaneous operation of multiple reader types in a single branch (e.g. Smart Trays on counters + handheld for stock count + gate reader at entrance). |
| RFID-HW-F03 | Tag commissioning: when a new piece is tagged, the system associates the RFID tag UID with the inventory_tag record and writes item metadata to the tag if the tag format supports it. |
| RFID-HW-F04 | Reader health monitoring: alert the system administrator if a registered reader stops responding beyond a configurable timeout. |
[/TABLE]

PART H
Advanced POS & Customer Experience Features

Part H specifies customer-experience and POS features identified in leading gold-ERP retail modules that were not covered in the core POS specification (Part E, Appendix E.8). These features build on the existing POS module without requiring architectural changes.
# Appendix H.1  Customer-Facing Display (Pole Display / LCD Screen)
A customer-facing display shows the customer what is being added to their bill in real time, reinforcing transparency and reducing disputes. In jewellery retail, it can also be used to showcase designs and current gold rates.

[TABLE]
| Req. ID | Functional Requirement |
| CFD-F01 | POS-connected second screen (pole display or mounted LCD) that mirrors the current bill in real time: item name, weight, making charge, stone charge, line total, and running bill total. |
| CFD-F02 | Display the current live gold rate on the customer screen when no active transaction is in progress (idle mode rate display). |
| CFD-F03 | Idle mode slideshow: display item images from the catalogue (PLM module) as a rotating slideshow when the POS is idle. |
| CFD-F04 | Smart Tray integration (F.4.4): when a piece is placed on a Smart Tray at a sales counter, display the piece's image, description, weight, and price on the customer screen. |
| CFD-F05 | Configurable per counter: enable/disable customer display, choose display mode (bill mirror, rate display, slideshow) from POS settings. |
| CFD-F06 | Support hardware types: USB pole display, HDMI-connected LCD monitor, and IP-connected display running a lightweight browser-based viewer fed by the POS WebSocket. |
[/TABLE]

# Appendix H.2  Customer Self-Service Kiosk Mode
Kiosk mode enables customers to browse the jewellery catalogue independently on a dedicated tablet or kiosk terminal, view current prices, and print or share estimate slips — reducing sales floor pressure while enriching the customer experience.

[TABLE]
| Req. ID | Functional Requirement |
| KIOSK-F01 | Kiosk mode is a restricted POS interface on a dedicated device — read-only access to the product catalogue; no ability to complete a sale or view backend data. |
| KIOSK-F02 | Customers can browse items by category, filter by metal type, karat, price range, and design; view item images, weight, and live metal-rate-based price estimate. |
| KIOSK-F03 | Estimate slip: customer can select items and generate a printable or QR-sharable estimate showing item details, weights, current gold rate, estimated price, and branch contact — no commitment or order created. |
| KIOSK-F04 | Kiosk sessions are anonymous by default; an optional loyalty card scan or mobile number entry links the session to a customer profile for personalised suggestions. |
| KIOSK-F05 | Gold rate display: show the current live buy and sell rates prominently in the kiosk interface, updated in real time. |
| KIOSK-F06 | Session analytics: log kiosk browse events (items viewed, estimates generated, time on device) as anonymous or linked customer journey data for CRM analysis. |
| KIOSK-F07 | Kiosk devices are managed via the tenant settings: assign a device to kiosk mode, configure allowed categories, set idle timeout, and lock/unlock remotely. |
[/TABLE]

# Appendix H.3  Magnetic Card Reader for Loyalty Cards
Physical loyalty cards with magnetic stripes are issued to high-value customers. Swiping the card at POS instantly identifies the customer and loads their loyalty balance.

[TABLE]
| Req. ID | Functional Requirement |
| MCR-F01 | Magnetic card reader hardware integration at POS: swipe a loyalty card to auto-populate the customer field and load their loyalty points balance, purchase history, and tier. |
| MCR-F02 | Issue physical loyalty cards to customers from the CRM module: assign a card number (encoded on the magnetic stripe), link to the customer profile, and activate. |
| MCR-F03 | Support card replacement: deactivate a lost card and issue a new card to the same customer, transferring the loyalty balance to the new card. |
| MCR-F04 | Card reader as a hardware provider: MagCardReaderProvider interface; implementations for common USB HID magnetic card readers. |
| MCR-F05 | Card swipe events are logged in the customer activity trail. |
[/TABLE]

# Appendix H.4  Customer Address Label and Greeting Card Printing
Jewellery retailers run seasonal and occasion-based direct marketing campaigns (Eid, Diwali, Valentine's Day, anniversary) by sending physical greeting cards or catalogues. Address label printing enables mass-mailing from the customer database.

[TABLE]
| Req. ID | Functional Requirement |
| ADR-F01 | Generate mailing address labels from the CRM customer master: filter by area, nationality, tier, last-purchase date, birthday month, or anniversary month. |
| ADR-F02 | Support standard label formats (Avery-compatible A4 sheet layouts: 2×5, 3×8, 4×11) and custom label sizes; print directly to a label printer or generate a PDF sheet. |
| ADR-F03 | Label content: customer name (bilingual if available), address, postal code, and optional loyalty tier indicator. |
| ADR-F04 | Export the same filtered customer list as CSV/Excel for use with external mailing services. |
| ADR-F05 | Log every label-print run as a CRM activity with filter used, count of labels printed, actor, and timestamp. |
[/TABLE]

PART I
Exceptional Reporting & Real-Time Alerts

Part I specifies real-time alerting and exception-reporting capabilities identified in leading gold ERP reporting modules. These features operate on top of the BI & Analytics layer (§5.8 Part B) and the Configurable Dashboard system (Layer F) without requiring new data models — they are alert rules and report definitions over existing data.
# Appendix I.1  Exceptional Sales / Gross Profit Alert (Pre-Print)
The most powerful pre-emptive control in retail jewellery is a real-time alert that fires before an invoice is printed whenever an abnormal margin, unusually high value, sale at loss, or excessively high discount is detected. This intercepts errors and potential fraud at the point of no return — before the bill reaches the customer.

[TABLE]
| Req. ID | Functional Requirement |
| EXC-F01 | Define configurable alert thresholds per branch, category, and user role: (a) gross margin below X%, (b) line total above Y value, (c) sale at loss (negative margin), (d) tag discount above Z%, (e) making charge below W per gram. |
| EXC-F02 | Evaluate the alert rules against every invoice BEFORE it is printed or confirmed; if any rule fires, interrupt the billing flow and display the alert to the cashier. |
| EXC-F03 | Alert actions: (a) Notify only — cashier acknowledges and proceeds; (b) Require supervisor override — a supervisor PIN or approval is required before the invoice can be printed; (c) Block — the transaction cannot proceed until the rule violation is corrected. |
| EXC-F04 | Every fired alert is logged: invoice reference, rule triggered, alert value, alert action taken, cashier, supervisor (if override), branch, and timestamp. |
| EXC-F05 | Exceptional Transactions Report: list all invoices that triggered an alert in the period — by rule, branch, cashier, and resolution (acknowledged / supervisor approved / blocked). |
| EXC-F06 | Management notification: optionally push an immediate notification to the branch manager for (b) and (c) level alerts via the notification engine. |
| EXC-F07 | Gate threshold configuration by a sensitive permission (sales.alert.configure) so only controllers and managers can change alert rules. |
[/TABLE]

User Story.  As a branch manager, I want the system to interrupt a cashier before printing if they accidentally bill at the wrong making charge or at a loss, so that no jewellery piece ever leaves the showroom at an unintentional margin without a supervisor's explicit approval.
Acceptance Criteria.
- Given an alert rule "GP% < 5% → Require supervisor override" is configured, when a cashier adds a line with 3% gross margin, then the bill is paused and a supervisor PIN prompt appears before the invoice can be printed.
- Given a supervisor approves an exceptional transaction, then the invoice prints, the override is logged with the supervisor's identity, and the Exceptional Transactions Report shows the event.
- Given an alert rule "sale at loss → Block", when a cashier inadvertently prices a piece below cost, then the invoice is blocked, an error is shown, and the cashier must correct the price before proceeding.
# Appendix I.2  Short / Excess Margin Control Report
Metal traders and bullion desks carry fix/unfix positions and customer metal accounts. The Short/Excess Margin Control Report shows whether any customer's open metal position has moved beyond their agreed margin thresholds, triggering a margin call or credit action.

[TABLE]
| Req. ID | Functional Requirement |
| MCT-F01 | For each customer with an open (unfixed) metal position, calculate the current mark-to-market value using the live gold rate and compare it to the customer's credit margin (deposited margin / facility limit). |
| MCT-F02 | Classify each customer position as: Adequate Margin, Margin Warning (within X% of limit), Short Margin (below the margin requirement), or Excess Margin (margin well in excess of requirement). |
| MCT-F03 | Short/Excess Margin Control Report: tabulated per customer showing open position in grams, current market value, margin deposited, margin requirement, margin shortfall/excess, and action required. |
| MCT-F04 | Automated alert: notify the account manager (email + in-app) when a customer's margin status changes to Short Margin. |
| MCT-F05 | Record margin calls issued and customer responses (additional deposit, position reduction) in the customer's account activity trail. |
[/TABLE]

# Appendix I.3  Extended Dead-Stock and Slow-Moving Intelligence
Building on the Dead-Stock Identification requirements in F.4.5, the following analytics provide management with actionable intelligence on underperforming inventory.

[TABLE]
| Req. ID | Functional Requirement |
| DSI-F01 | Aging pyramid report: bucket inventory by days-in-stock (0–30, 31–90, 91–180, 181–365, 365+) showing piece count, cost value, and % of total stock value per bucket. |
| DSI-F02 | Slow-moving inventory report: filter pieces with fewer than N sales in the last M days; show cost value, current valuation, and potential markdown impact. |
| DSI-F03 | Dead-stock by category report: identify which categories carry the highest proportion of dead-stock by value; compare across branches. |
| DSI-F04 | Markdown simulation: for a selected set of dead-stock pieces, simulate the impact of a percentage markdown on revenue recovery and gross margin. |
| DSI-F05 | Dead-stock resolution register: track the outcome of each dead-stock piece (sold, transferred, melted, returned to supplier) for inventory hygiene reporting. |
[/TABLE]

# Appendix I.4  Bullion Position and Fixing Reports
Comprehensive position reporting for metal trading and bullion desks, integrating with the Hedging Module (F.1), Bullion Trading Order Management (F.2), and the Fix/Unfix transaction architecture (JWL-F12).

[TABLE]
| Req. ID | Functional Requirement |
| BPR-F01 | Fixing Position Report: per customer and per metal, show Opening Position, Purchases (unfixed), Sales (unfixed), Purity Loss/Gain, Net Short/Long Position, Break-Even Rate, Net Position at Current Rate, and Fixing Profit/Loss. |
| BPR-F02 | Suffix-wise Fixing Position Report: break the fixing position down by metal unit (TTB, GOZ, KG, TOLA, 995 grams) for customers who trade in multiple units. |
| BPR-F03 | Customer Fixing Register: per customer, chronological history of all fixing transactions — unfixed purchase/sale, rate, fix date, fixed rate, and gain/loss. |
| BPR-F04 | Supplier Fixing Register: same as Customer Fixing Register for suppliers. |
| BPR-F05 | Account Control Centre: for a selected customer or supplier, a comprehensive one-screen view of all suffix/currency balances valued at the current metal rate — including facility limit, current balance, current value, margin value, break-even rate, and margin percentage. |
| BPR-F06 | Daily Trading P&L Report: realised P&L from fixing transactions closed today, unrealised P&L on open positions at current rate, and net daily trading result. |
| BPR-F07 | All position reports support as-at-date queries to reconstruct the position at any historical date. |
[/TABLE]

PART J
Updated Enums, State Machines & Data Dictionary Additions

Part J documents the additions to §9 (Enums & Seed Data) and §10 (State Machines) required by the gap-fill modules in Parts F–I. All conventions from §5.1 apply to the new tables.
# Appendix J.1  Additional Enums

[TABLE]
| Enum | Values | Used By |
| HedgingType | PURCHASE │ SALE │ PAYMENT │ RECEIPT | F.1 Hedging Module |
| HedgingStatus | OPEN │ FIXED │ CANCELLED | F.1 Hedging Module |
| TradingOrderStatus | OPEN │ TRIGGERED │ FILLED │ CANCELLED │ EXPIRED | F.2 Bullion Trading |
| OrderType | GTC │ EXPIRY │ OCO │ OAO │ IOC │ MKT | F.2 Bullion Trading |
| TriggerType | EQ │ GT │ LT │ RANGE │ NONE | F.2 Bullion Trading |
| SampleStatus | RECEIVED │ IN_TRANSIT │ TESTING │ TESTED │ CERTIFICATE_ISSUED │ DELIVERED | F.6 Laboratory |
| TestMethod | XRF │ FIRE_ASSAY │ ACID │ SPECTROMETRY | F.6 Laboratory |
| TagStatus | IN_STOCK │ RESERVED │ SOLD │ IN_TRANSIT │ WITH_KARIGAR │ MELTED │ WITH_ALTERATION | F.4.1 — adds WITH_ALTERATION to existing §9 enum |
| RateFeedProviderKind | MT5 │ AKR_TRADER │ GOLD_API │ MANUAL | G.1 Metal Market Integrations |
| PaymentGatewayKind | (extends §9) + MADA │ STC_PAY │ PLANET │ HYPERPAY | G.2 Payment Gateways |
| ECommerceProviderKind | SHOPIFY │ SALLA │ ZID │ CUSTOM | G.4 E-Commerce Connectors |
| ImageGenProviderKind | (extends §9) — no changes required | E.9 — unchanged |
| PromoType | (extends E.1.1) — MAKING_CHARGE_WAIVER is confirmed | E.1 Promotions — confirmed |
| AlertAction | NOTIFY │ REQUIRE_OVERRIDE │ BLOCK | I.1 Exceptional Sales Alert |
| MarginStatus | ADEQUATE │ WARNING │ SHORT │ EXCESS | I.2 Margin Control Report |
[/TABLE]

# Appendix J.2  Additional State Machines
## J.2.1  Hedging Voucher

[TABLE]
| State | Allowed Transitions | Trigger / Guard |
| OPEN | → FIXED | User fixes the rate; live rate meets auto-fix threshold |
| OPEN | → CANCELLED | Underlying source transaction voided or returned |
| FIXED | → CANCELLED | Fixed transaction reversed within an open period (requires permission) |
| CANCELLED | — terminal | No further transitions |
[/TABLE]

## J.2.2  Bullion Trading Order

[TABLE]
| State | Allowed Transitions | Trigger / Guard |
| OPEN | → TRIGGERED | Rate condition met by incoming rate feed update |
| TRIGGERED | → FILLED | Execution confirmed (manual confirmation or auto-execute setting) |
| TRIGGERED | → OPEN | Rate moved away before execution (re-arm if configured) |
| OPEN | → CANCELLED | Manual cancellation by trader with permission |
| OPEN | → EXPIRED | Expiry date/time reached for EXPIRY order type |
| FILLED | — terminal | Fixing entry auto-generated on transition to FILLED |
| CANCELLED | — terminal | Linked OCO/OAO orders cancelled if applicable |
| EXPIRED | — terminal |  |
[/TABLE]

## J.2.3  Laboratory Sample (extends §10)

[TABLE]
| State | Allowed Transitions | Trigger / Guard |
| RECEIVED | → IN_TRANSIT | Dispatched to lab bench |
| IN_TRANSIT | → TESTING | Lab confirms receipt and begins test |
| TESTING | → TESTED | Test results recorded by lab staff |
| TESTED | → CERTIFICATE_ISSUED | Certificate printed and assigned a certificate number |
| CERTIFICATE_ISSUED | → DELIVERED | Sample physically returned to customer; fee collected |
| Any (except DELIVERED) | → CANCELLED | Customer cancels; partial fee may apply |
[/TABLE]

## J.2.4  Inventory Tag — WITH_ALTERATION addition
The existing TagStatus state machine (§10) is extended with the WITH_ALTERATION state:

[TABLE]
| New Transition | From | To | Trigger |
| Start alteration | IN_STOCK | WITH_ALTERATION | Alteration order created (ALT-F01) |
| Complete alteration | WITH_ALTERATION | IN_STOCK | Alteration closed; weight/stone updated (ALT-F02) |
| Cancel alteration | WITH_ALTERATION | IN_STOCK | Alteration order cancelled without changes |
[/TABLE]

WITH_ALTERATION pieces cannot be sold (POS blocks the transaction) until the tag returns to IN_STOCK.

PART K
Gap-Fill Coverage Summary & Updated Competitive Matrix

This section records the complete list of gap-fill additions made in Parts F–J and provides an updated competitive feature matrix showing this platform's coverage against each of the five source ERPs analysed.
# Appendix K.1  Gap-Fill Additions Index

[TABLE]
| Section | Feature Added | Source ERPs | Status |
| F.1 | Metal Hedging Module — auto hedging vouchers, four hedging accounts, fixing register, with/without-hedging reports | Sun Facet, Visual Ace Gold | Added |
| F.2 | Bullion Trading Order Management — GTC, OCO, OAO, EXPIRY, rate triggers, auto-fix execution | Visual Ace Gold | Added |
| F.3.1 | Tree Making (wax-tree assembly in casting production) | Sun Facet | Added |
| F.3.2 | Job Splitting and Merging with parent-child hierarchy | Sun Facet | Added |
| F.3.3 | Job Envelope Printing with barcode/QR and image | Sun Facet | Added |
| F.3.4 | Setting Analysis, Design Analysis, and Broken/Missing Stone Reports | Sun Facet | Added |
| F.3.5 | Merging Designs into Jewellery Sets | Sun Facet, WinGold Next | Added |
| F.4.1 | Jewellery Alteration Tracking with WITH_ALTERATION tag status | Sun Facet | Added |
| F.4.2 | Jewellery Dismantling — finished piece to raw materials with loss tracking | Sun Facet | Added |
| F.4.3 | RFID Anti-Theft System — zone monitoring, tamper detection, security alerts | Jewelita | Added |
| F.4.4 | Smart Tray Integration — real-time counter piece presence | Jewelita | Added |
| F.4.5 | Dead-Stock Identification — configurable thresholds, dashboard widget, action tracking | Jewelita, WinGold Next | Added |
| F.5.1 | Rapaport Diamond Price Integration — provider interface, API/import/manual kinds | Sun Facet, Visual Ace Gold | Added |
| F.5.2 | Broken and Missing Stone Analysis — karigar accountability, loss register | Sun Facet | Added |
| F.6 | Gold Testing Laboratory Module (VAGL) — full sample lifecycle, certificate printing, integrated accounting | Visual Ace Gold | Added |
| G.1.1 | MT5 (MetaTrader 5) rate feed integration as RateFeedProvider | Sun Facet, Visual Ace Gold | Added |
| G.1.2 | AKR Trader platform integration for regional rate feed and order placement | Sun Facet, Visual Ace Gold | Added |
| G.2 | Payment gateway additions: Mada, STC Pay, Planet (HyperPay) as PaymentGatewayKind | Day Sum Gold, Sun Facet | Added |
| G.3 | EMAAR mall integration — daily turnover reporting, concession fee calculation | Sun Facet | Added |
| G.4 | Named e-commerce connectors: Salla and Zid for KSA market | Day Sum Gold | Added |
| G.5 | Signum CRM bidirectional integration | Sun Facet | Added |
| G.6 | RFID hardware ecosystem — provider interface for gate, handheld, smart tray, POS readers | All | Added |
| H.1 | Customer-Facing Display — bill mirror, live rate, idle slideshow, Smart Tray link | WinGold Next, Sun Facet | Added |
| H.2 | Customer Self-Service Kiosk Mode — catalogue browse, estimate slip, session analytics | WinGold Next | Added |
| H.3 | Magnetic Card Reader for Loyalty Cards — swipe-to-identify, card issuance and replacement | WinGold Next, Visual Ace Gold | Added |
| H.4 | Customer Address Label Printing — filtered mailing from CRM, Avery format, CSV export | Visual Ace Gold | Added |
| I.1 | Exceptional Sales / GP Alert — pre-print rule evaluation, supervisor override, block levels | Visual Ace Gold | Added |
| I.2 | Short / Excess Margin Control Report — live mark-to-market vs customer margin limits | Visual Ace Gold | Added |
| I.3 | Extended Dead-Stock Intelligence — aging pyramid, slow-moving buckets, markdown simulation | Multiple | Added |
| I.4 | Bullion Position & Fixing Reports — fixing register, suffix-wise position, Account Control Centre, daily P&L | Visual Ace Gold | Added |
| J | Updated Enums (HedgingType, HedgingStatus, TradingOrderStatus, SampleStatus, etc.) and State Machines | All gap modules | Updated |
[/TABLE]

# Appendix K.2  Updated Competitive Feature Matrix
The following matrix shows this platform's coverage of all features from the five analysed gold ERPs after the gap-fill additions in Parts F–J. ● = Fully covered. ◑ = Partially covered. ○ = Not in scope.

[TABLE]
| Feature Domain | Jewelita | WinGold Next | Day Sum Gold | Sun Facet | Visual Ace Gold | This Platform |
| Real-time inventory tracking | ● | ● | ● | ● | ● | ● |
| RFID inventory automation | ● | ● | ● | ● | ● | ● |
| Barcode generation & scanning | ● | ● | ● | ● | ● | ● |
| Serialised jewellery (tag per piece) | ○ | ● | ○ | ● | ● | ● |
| Fix / Unfix gold price transactions | ○ | ● | ● | ● | ● | ● |
| Live gold/silver rate feed integration | ○ | ● | ● | ● | ● | ● |
| Metal hedging module (auto vouchers) | ○ | ○ | ○ | ● | ● | ● |
| Bullion trading orders (GTC/OCO/triggers) | ○ | ○ | ○ | ○ | ● | ● |
| Short/Excess margin control report | ○ | ○ | ○ | ○ | ● | ● |
| MT5 integration | ○ | ○ | ○ | ● | ● | ● |
| AKR Trader integration | ○ | ○ | ○ | ● | ● | ● |
| Rapaport diamond price integration | ○ | ○ | ○ | ● | ● | ● |
| Diamond 4C classification | ○ | ● | ○ | ● | ● | ● |
| Broken / missing stone analysis | ○ | ○ | ○ | ● | ○ | ● |
| Full BOM / Manufacturing MRP | ○ | ○ | ● | ● | ● | ● |
| Karigar / job-work management | ○ | ● | ● | ● | ● | ● |
| Tree making (casting process) | ○ | ○ | ○ | ● | ○ | ● |
| Job splitting and merging | ○ | ○ | ○ | ● | ○ | ● |
| Job envelope printing | ○ | ○ | ○ | ● | ○ | ● |
| Setting / design analysis reports | ○ | ○ | ○ | ● | ○ | ● |
| Jewellery alteration tracking | ○ | ○ | ○ | ● | ○ | ● |
| Jewellery dismantling | ○ | ○ | ○ | ● | ○ | ● |
| RFID anti-theft / tamper detection | ● | ○ | ○ | ○ | ○ | ● |
| Smart Tray integration | ● | ○ | ○ | ○ | ○ | ● |
| Dead-stock identification & alerts | ● | ● | ○ | ○ | ○ | ● |
| Gold testing laboratory module | ○ | ○ | ○ | ○ | ● | ● |
| Full GL / double-entry accounting | ○ | ● | ● | ● | ● | ● |
| Metal ledger (fine-weight) | ○ | ● | ● | ● | ● | ● |
| Fixed assets management | ○ | ○ | ○ | ● | ● | ● |
| UAE FTA VAT compliance | ○ | ● | ○ | ● | ● | ● |
| ZATCA Phase 2 e-invoicing | ● | ○ | ● | ● | ○ | ● |
| GST compliance (India) | ○ | ● | ○ | ● | ● | ● |
| AML customer verification at POS | ○ | ● | ○ | ● | ○ | ● |
| Gold / diamond saving schemes | ○ | ○ | ○ | ● | ● | ● |
| Loyalty points programme | ● | ● | ○ | ● | ● | ● |
| Promotions engine (BOGO, bundles, etc.) | ● | ● | ○ | ● | ● | ● |
| Customer-facing POS display | ○ | ● | ○ | ● | ○ | ● |
| Kiosk mode (customer self-browse) | ○ | ● | ○ | ○ | ○ | ● |
| Magnetic card reader (loyalty) | ○ | ● | ○ | ● | ● | ● |
| Customer address label printing | ○ | ○ | ○ | ○ | ● | ● |
| Exceptional GP alert (pre-print) | ○ | ○ | ○ | ○ | ● | ● |
| WhatsApp invoice & order delivery | ○ | ○ | ● | ● | ○ | ● |
| Mada / STC Pay gateways | ○ | ○ | ● | ○ | ○ | ● |
| Salla / Zid e-commerce connectors | ○ | ○ | ● | ○ | ○ | ● |
| EMAAR mall integration | ○ | ○ | ○ | ● | ○ | ● |
| Planet payment terminal | ○ | ○ | ○ | ● | ○ | ● |
| Signum CRM integration | ○ | ○ | ○ | ● | ○ | ● |
| HR hire-to-retire (ATS, LMS, Appraisals) | ○ | ● | ○ | ● | ● | ● |
| Multi-vertical / domain-agnostic core | ○ | ○ | ○ | ○ | ○ | ● |
| AI Data Chat (MCP) | ○ | ○ | ○ | ○ | ○ | ● |
| AI item-image generation | ○ | ○ | ○ | ○ | ○ | ● |
| Configurable per-user dashboards | ○ | ○ | ○ | ○ | ○ | ● |
| Localization framework (country packs) | ○ | ○ | ○ | ○ | ○ | ● |
| Purchase landed cost allocation | ○ | ○ | ○ | ● | ○ | ● |
| Formal inventory audit (blind count) | ○ | ● | ○ | ● | ● | ● |
| Project management module | ○ | ○ | ○ | ○ | ○ | ● |
| Quality management module | ○ | ○ | ○ | ○ | ○ | ● |
[/TABLE]

PART L
Experience, Personalization & Embedded AI
Deep UI Configurability · Themes · Per-User Lobby · AI Input Everywhere · Delivery QA Governance
Purpose.  Parts A–K specify what the system does and how it is built. Part L specifies how it looks, how each user personalizes it, how AI accelerates data entry on nearly every screen, and the delivery-time QA governance that gates every feature to done. All persistence follows the data dictionary (§B.5.1) and RBAC (§6); all AI and theming integrations follow the switchable-provider pattern (§2.4).

# Appendix L.1 Deep UI Configurability & Theming
The interface is configurable to a depth where a fully re-themed deployment looks like a different product. Configuration is per user, persisted in the database, and falls back to a tenant default and then a system default — never temporary, never browser-only.
### L.1.1 What is configurable

[TABLE]
| Dimension | Configurable values |
| Theme | 10 curated enterprise base themes (light/dark/high-contrast variants) selectable as a starting point. |
| Custom color | Beyond the 10 bases, a full color picker for primary, secondary, accent, surface, background, success/warning/danger — any color, with automatic accessible-contrast derivation. |
| Typography | Font family (from an allowed enterprise set + optional custom web font), base font size, scale ratio, heading weights, line height. |
| Density & shape | Compact / comfortable / spacious spacing; corner radius; border style; elevation/shadow level. |
| Layout | Sidebar position (start/end), collapsed/expanded default, top-bar style, content max-width, RTL mirroring. |
| Components | Table density, default page size, badge/chip style, button style — token-driven so every component inherits. |
| Branding | Tenant logo, login backdrop, app name/title, favicon, email/document letterhead. |
[/TABLE]

### L.1.2 Token-driven design system (single source of truth)
All styling derives from a design-token set (color, typography, spacing, radius, elevation). Components never hard-code style values — they read tokens. A theme is a stored token set; switching theme swaps the token values and the entire UI re-skins consistently. This is what makes a re-theme feel like a different product without touching component code, and keeps the styling single-source-of-truth per engineering standards (§2.2).
Design tokens (illustrative)

[TABLE]
| // Tokens resolved at runtime, cascading: user -> tenant -> system default |
| { color:{ primary:'#1F3864', accent:'#C55A11', surface:'#FFFFFF', danger:'#B00020', ... }, |
| font:{ family:'Inter', baseSize:14, scale:1.2, headingWeight:700, lineHeight:1.5 }, |
| density:'comfortable', radius:8, elevation:1, sidebar:'start' } |
| // Components consume tokens only: background: var(--color-surface); never a literal hex. |
[/TABLE]

### L.1.3 Scope & persistence (per-user, DB-backed, with fallback)
- Per-user. Each user's UI configuration is theirs; two users of the same tenant can look completely different.
- Persisted in the database. Stored server-side (table below), not in browser storage, so it follows the user across devices and sessions.
- Cascading fallback. Effective config = user override → tenant default → system default. A user who has set nothing gets the tenant default; resetting clears the user layer and falls back cleanly. Configuration is never lost or temporary.
- Governed. Admins may lock certain dimensions (e.g. brand colors) at tenant level; users configure within what is unlocked. Custom-font upload is permission-gated.
Table  ui_preference
Cascading UI config. Effective tokens computed user→tenant→system at load; stored in DB, never browser-only.

[TABLE]
| Column | Type | Null | Key | Notes / constraints |
| tenant_id | uuid | N | FK |  |
| scope | text | N |  | enum UiScope: SYSTEM | TENANT | USER (cascade order) |
| user_id | uuid | Y | FK | set when scope=USER |
| theme_key | text | Y |  | selected base theme, e.g. ENTERPRISE_DARK |
| tokens | jsonb | N |  | resolved/overridden design tokens (color, font, density, layout...) |
| locked_dimensions | jsonb | Y |  | tenant-level locks (which dimensions users may not change) |
| updated_by | uuid | Y | FK |  |
[/TABLE]

[TABLE]
| Req. ID | Functional requirement |
| UI-F01 | Provide 10 curated enterprise base themes (incl. dark and high-contrast) as starting points. |
| UI-F02 | Allow a full custom color palette beyond the bases via color picker, with automatic accessible-contrast derivation (WCAG AA). |
| UI-F03 | Make typography, density, shape, layout and component style token-driven and configurable. |
| UI-F04 | Persist UI configuration per user in the database; resolve effective tokens by cascade (user→tenant→system). |
| UI-F05 | Reset to default by clearing the user layer; configuration is never temporary or browser-only. |
| UI-F06 | Allow admins to lock dimensions at tenant level; permission-gate custom-font/brand uploads. |
| UI-F07 | Re-skin the entire UI consistently on theme change with zero component code change (tokens only). |
| UI-F08 | Maintain full RTL correctness across every theme. |
[/TABLE]

Acceptance criteria.
- Given a user selects a custom primary color and a larger base font, when they log in on another device, then their choices are applied (loaded from the database), proving persistence is server-side not browser-only.
- Given a user resets their theme, when the page reloads, then their personal layer is cleared and the tenant default applies with no leftover overrides.
- Given an admin locks brand colors at tenant level, when a user opens appearance settings, then color controls for brand tokens are disabled while other dimensions remain editable.
# Appendix L.2 Per-User Lobby & Personal Dashboard
Each user has a personal landing space — a 'lobby' — that they arrange themselves. It builds on the configurable dashboard engine (§B.6 F1 / §3.1) but is the user's own home surface: which widgets, which shortcuts, which default branch and reports appear first.

[TABLE]
| Req. ID | Functional requirement |
| LOBBY-F01 | Give each user a personal lobby as their default landing surface after login. |
| LOBBY-F02 | Let the user choose, arrange, resize and configure widgets (KPIs, charts, shortcuts, recent items, tasks, alerts) from the permitted widget registry. |
| LOBBY-F03 | Persist the lobby layout per user in the database (user_dashboard_layout / lobby surface), with domain preset as the fallback. |
| LOBBY-F04 | Offer quick-action shortcuts (new sale, new purchase, open POS) the user can pin. |
| LOBBY-F05 | Respect permissions and branch scope: the picker only offers widgets the user may see. |
| LOBBY-F06 | Let the user switch their own lobby on/off and reset to the role/domain default. |
[/TABLE]

Acceptance criteria.
- Given a user customizes their lobby with specific widgets and order, when they next log in, then the lobby renders exactly as they arranged it from their saved layout.
- Given a user has no custom lobby, when they log in, then the role/domain default lobby is shown.
# Appendix L.3 Embedded AI Assistance (Input Everywhere)
Almost every data-entry surface offers an AI assist that turns speech, an uploaded document, or a free-text instruction into filled form fields. The user reviews and confirms before anything is saved — AI accelerates entry, it does not post unattended. All AI calls go through provider interfaces selected by enum/env (§2.4) and respect RBAC, tenant/branch scope and audit.
### L.3.1 The three input modes (one AI input surface)

[TABLE]
| Mode | Behaviour |
| Voice | User taps the mic and speaks ('add two 22-karat bangles, 18 grams each, making 12 percent'); speech → text → NLP → structured field values populated for review. |
| Document scan | User uploads/photographs a document (supplier invoice, ID, old bill, certificate); OCR + extraction → mapped to the form's fields (parties, items, weights, amounts) for review. |
| Natural-language text | User types a free-text instruction into a single AI box; NLP parses it into the form's structured fields. |
[/TABLE]

All three converge on the same contract: produce a structured draft mapped to the current form's schema (using the attribute schema in §B.5.7), show it inline for the user to confirm or edit, then the normal validated submit path runs. Nothing bypasses DTO validation, RBAC, or the posting rules.
### L.3.2 Provider abstraction
AI assist behind the switchable-provider pattern

[TABLE]
| interface AiAssistProvider { |
| transcribe(audio: AudioRef): Promise<string>;                 // voice -> text |
| extractFromDocument(file: FileRef, schema: FormSchema): Promise<FieldDraft>;  // OCR+map |
| parseInstruction(text: string, schema: FormSchema): Promise<FieldDraft>;     // NLP -> fields |
| } |
| enum AiAssistProviderKind { OPENAI, ANTHROPIC, AZURE_OPENAI, LOCAL, NONE } |
| // AI_ASSIST_PROVIDER=ANTHROPIC ; per-tenant override allowed. NONE hides AI controls gracefully. |
[/TABLE]

### L.3.3 Functional requirements

[TABLE]
| Req. ID | Functional requirement |
| AI-F10 | Offer an AI assist control on data-entry surfaces (sales, purchase, item, customer, supplier, payment, journal, lab sample, etc.). |
| AI-F11 | Voice input: capture audio, transcribe, parse to the form's fields, present a draft for review. |
| AI-F12 | Document input: accept upload/camera, OCR + extract, map to the form's fields, present a draft for review. |
| AI-F13 | Text input: a single NLP box that parses a free-text instruction into the form's fields. |
| AI-F14 | Always require explicit user confirmation; AI never auto-posts. Show low-confidence fields flagged for attention. |
| AI-F15 | Run all AI through the provider interface (enum/env), respecting RBAC, tenant/branch scope; audit prompt, provider, and what was filled. |
| AI-F16 | Degrade gracefully when AI_ASSIST_PROVIDER=NONE: controls hidden, manual entry unaffected. |
| AI-F17 | Localized: accept and parse English and Arabic input; map to the same fields. |
[/TABLE]

Acceptance criteria.
- Given a user dictates a sale by voice, when transcription completes, then the line items, weights, purity and making charge are populated as an editable draft and nothing is saved until the user confirms.
- Given a user uploads a supplier invoice photo, when extraction completes, then supplier, items, weights and amounts are mapped to the purchase form for review, with any low-confidence field flagged.
- Given AI_ASSIST_PROVIDER=NONE, when a form loads, then no AI controls appear and manual entry works normally.
### L.3.4 AI experience (UX) requirements
- A single, consistent AI affordance across the app (mic + upload + text in one elegant control), not a different widget per screen.
- Clear states: idle, listening, processing, draft-ready, error — with smooth, non-blocking feedback.
- Draft review overlays the form: filled fields highlighted, low-confidence flagged, one tap to accept all or edit individually.
- Fully keyboard- and screen-reader-accessible; RTL-correct; honours the active theme tokens.
# Appendix L.4 UX Quality Bar
- Aesthetic & modern. Clean, professional, visually polished — not a generic admin template; consistent spacing rhythm, purposeful color, clear hierarchy.
- User-friendly. Obvious primary actions, forgiving forms (inline validation, autosave drafts where safe), helpful empty/loading/error states, fast perceived performance.
- Accessible. WCAG AA contrast (auto-derived for custom themes), full keyboard navigation, screen-reader labels, focus management.
- Consistent. All surfaces consume the same design tokens and component library; one interaction language across modules.
- Responsive & RTL. Works across desktop, tablet and POS/touch; mirrors correctly in Arabic on every theme.
# Appendix L.5 Delivery QA Governance (Per-Feature Gate)
Enterprise delivery requires that every feature pass a quality gate before it is considered complete, and that completion be tracked in a two-stage status. This governs how the build is delivered (by AI agents and reviewed by the product owner); the operational detail and the machine-readable register live in the companion file FEATURE-REGISTER-AND-QA.md.
### L.5.1 Per-feature QA gate (ritual after building each feature)
- Implement the feature to its FR + acceptance criteria.
- Write tests that assert each acceptance criterion (unit + e2e where money/stock/tenant-isolation is involved), including the concurrency/posting-integrity checks of §3.
- Run the gate: tests pass · type-check passes · lint passes · build passes · endpoint-sync passes (if routes/permissions changed) · the §16 Definition-of-Done legs are all satisfied (schema, permission, endpoint, enums/state, traceability).
- Assumptions check: record any assumption made; if an assumption affects a contract, flag it rather than silently proceeding.
- Mark status: on a fully green gate, set the feature to DONE, then immediately to AWAITING_HUMAN_VERIFICATION.
### L.5.2 Two-stage completion status

[TABLE]
| Status | Meaning |
| NOT_STARTED | No work yet. |
| IN_PROGRESS | Being implemented. |
| BLOCKED | Cannot proceed (records the blocker). |
| DONE | Implemented and the QA gate is fully green (tests/type/lint/build/DoD all pass). |
| AWAITING_HUMAN_VERIFICATION | Done and queued for the product owner's review. Set automatically after DONE. |
| VERIFIED | The product owner (you) has confirmed it. This is the only status a human sets. |
[/TABLE]

Human verification is not per-feature-blocking. Agents keep building; completed features queue as AWAITING_HUMAN_VERIFICATION. The product owner may verify after one feature, after several, at a milestone, or at the very end — verification is batched at the owner's discretion and never gates further agent progress. Only the product owner moves a feature to VERIFIED.
### L.5.3 The feature register
A machine-readable register (FEATURE-REGISTER-AND-QA.md, generated from this spec's FR ids) lists every feature with its id, module, status, the tests that cover it, and links to its DoD legs. Agents update it as the single source of delivery truth; the product owner reads it to see what is done and what awaits verification. Its format and the agent workflow are defined in that companion file.

[TABLE]
| Req. ID | Functional requirement |
| QA-F01 | Maintain a feature register keyed by FR id with status, owner agent, test refs, and DoD-leg checklist. |
| QA-F02 | Enforce the per-feature QA gate before any feature may be marked DONE. |
| QA-F03 | Auto-transition DONE → AWAITING_HUMAN_VERIFICATION; only the product owner sets VERIFIED. |
| QA-F04 | Allow human verification to be batched (n features or end-of-build); never block agent progress on it. |
| QA-F05 | Record assumptions and surface contract-affecting ones for review. |
[/TABLE]

PART M
Enterprise Enhancement Pack
Compliance · Lending · Deferred Sales · Hardware · Provenance · Wholesale · Mobile · Executive Analytics
Purpose.  Part M integrates validated, high-value enterprise features identified through industry benchmarking that were genuinely absent from Parts A–L. Each feature follows the existing conventions — data dictionary (§B.5.1), RBAC and permission keys (§6), endpoint registry (§7), the switchable-provider pattern (§2.4), enums reconciled with §9, state machines (§10), atomic GL + metal posting (§3), and the QA gate (Appendix L.5). No existing workflow, module or contract is altered; these are additive.

# Appendix M.1 Compliance, AML & KYC
### M.1.1 AML & KYC at POS
Capture and verify customer identity at point of sale, enforce due diligence on threshold transactions, and retain compliance evidence. Integrates into the existing customer master and POS without changing the sale flow.

[TABLE]
| Req. ID | Functional requirement |
| AML-F01 | Capture KYC identity data (ID type, number, expiry, nationality, document scan) on the customer profile; require it before a transaction crosses a configurable value/cash/weight threshold. |
| AML-F02 | Perform configurable due-diligence checks and record outcome, reviewer and timestamp as immutable compliance evidence. |
| AML-F03 | Flag and hold a sale that breaches a threshold until the High-Value Review (M.1.3) clears it. |
| AML-F04 | Maintain a KYC status per customer (NONE | PENDING | VERIFIED | EXPIRED | REJECTED) with expiry re-prompting. |
| AML-F05 | Audit every KYC capture, view and change; expose to the Compliance Dashboard (M.7.3). |
[/TABLE]

Acceptance criteria.
- Given a cash sale above the configured KYC threshold, when the cashier confirms it, then the system requires verified KYC and blocks completion until KYC is VERIFIED and any required review has cleared.
### M.1.2 PEP & Sanctions Screening
Screen counterparties against politically-exposed-person and sanctions sources through a provider interface, per the switchable-provider pattern (§2.4).

[TABLE]
| Req. ID | Functional requirement |
| AML-F10 | Screen customers, suppliers, dealers and counterparties against PEP/sanctions sources via a ScreeningProvider interface (enum/env selectable; NONE disables gracefully). |
| AML-F11 | Record screening result (CLEAR | POTENTIAL_MATCH | CONFIRMED_MATCH), score and evidence; route matches to compliance review. |
| AML-F12 | Re-screen on a schedule and on material profile change; alert on new matches. |
[/TABLE]

### M.1.3 High-Value Transaction Review Workflow
Require approval/compliance review for transactions beyond defined thresholds. Reuses the Settings/Workflow approval engine (A10) and RBAC sensitive-action model (§6).

[TABLE]
| Req. ID | Functional requirement |
| HVR-F01 | Define thresholds by value, weight, cash amount, discount % or risk score, per branch/role. |
| HVR-F02 | Route a breaching sale, refund, discount or bullion transaction to a reviewer before completion; record decision and reason. |
| HVR-F03 | Block completion until approved; support multi-level approval for higher tiers. |
| HVR-F04 | Audit all reviews; expose pending reviews to the Compliance Dashboard. |
[/TABLE]

### M.1.4 Sensitive Customer Data Access Log

[TABLE]
| Req. ID | Functional requirement |
| SDL-F01 | Record every view, edit, export and print of customer identity documents, KYC records, customer photographs, bank details and high-value transaction history (actor, action, timestamp, record). |
| SDL-F02 | Make the log immutable and queryable; surface anomalous access to the Compliance Dashboard. |
[/TABLE]

# Appendix M.2 Lending & Deferred Sales
### M.2.1 Gold Collateral Loan Management
Manage loans issued against pledged gold or jewellery. Posts through the GL and metal ledger (§3) like any other value/metal movement; pledged items are held in a distinct stock state.

[TABLE]
| Req. ID | Functional requirement |
| GCL-F01 | Record a collateral loan: pledged item(s) with weight/purity/valuation, principal, interest rate/method, disbursement, maturity date. |
| GCL-F02 | Hold pledged stock in a PLEDGED state (extends TagStatus, reconciled with §9); it cannot be sold while pledged. |
| GCL-F03 | Accrue interest per method; track partial repayments, renewal/rollover, and settlement. |
| GCL-F04 | On default: handle auction/write-off with GL posting and metal-ledger reconciliation; release collateral on settlement. |
| GCL-F05 | Loan lifecycle state machine: ACTIVE → RENEWED → SETTLED | DEFAULTED → AUCTIONED/WRITTEN_OFF; reminders before maturity. |
[/TABLE]

Acceptance criteria.
- Given an active collateral loan, when it is settled, then accrued interest is posted, the pledged items return to IN_STOCK, and the GL and metal ledger reconcile.
### M.2.2 Installment / EMI Sales
Support deferred-payment sales with installment schedules — distinct from saving schemes (where the customer pays before taking goods). Here goods are delivered and the balance is receivable.

[TABLE]
| Req. ID | Functional requirement |
| EMI-F01 | Convert a sale to an installment plan: down payment, schedule, due dates, interest/late-fee rules, optional post-dated cheque linkage (§E.4). |
| EMI-F02 | Track partial payments, allocate collections to installments, compute overdue aging and late charges. |
| EMI-F03 | Installment-plan state machine: ACTIVE → COMPLETED | DEFAULTED; block further credit on default per policy. |
[/TABLE]

### M.2.3 Installment Receivable Ledger

[TABLE]
| Req. ID | Functional requirement |
| EMI-F10 | Maintain a structured receivable sub-ledger for installment sales: schedule generation, collection allocation, overdue aging buckets, late charges, customer statements — reconciled to the AR control account (§B.3). |
[/TABLE]

# Appendix M.3 Stone Classification & Provenance
### M.3.1 Lab-Grown / Natural / Treated / Synthetic Classification
Classify stones and diamonds by origin type so pricing, disclosure and reporting separate natural from lab-grown. Extends the stone/diamond attributes (§F.5 / attribute engine §B.5.7).

[TABLE]
| Req. ID | Functional requirement |
| STC-F01 | Classify each stone by origin: NATURAL | LAB_GROWN | TREATED | SYNTHETIC | COMPOSITE (new enum, reconciled with §9). |
| STC-F02 | Carry origin type through inventory, pricing, certificate handling, invoice disclosure and reporting; price lists may differ by origin. |
| STC-F03 | Require origin disclosure on the invoice/certificate where the item contains classified stones. |
[/TABLE]

### M.3.2 Provenance & Ethical Sourcing

[TABLE]
| Req. ID | Functional requirement |
| PRV-F01 | Capture supplier origin declarations, country of origin, conflict-free status, Kimberley Process reference, RJC/LBMA document references and chain-of-custody evidence against supplier lots and items. |
| PRV-F02 | Link provenance from supplier lot → production batch → finished tag → sale (feeds Chain-of-Custody reporting, M.7.5). |
[/TABLE]

### M.3.3 Stock Audit Discrepancy Report with Images

[TABLE]
| Req. ID | Functional requirement |
| AUD-F10 | Extend the inventory audit (§E.7) variance output to display the item image beside each missing/excess tagged item for faster visual verification. |
[/TABLE]

### M.3.4 Inventory Visual Search

[TABLE]
| Req. ID | Functional requirement |
| VSR-F01 | Search/filter inventory by image, design, category, weight range, purity, branch, tag number and status, returning results with images for fast showroom lookup. |
[/TABLE]

# Appendix M.4 Supplier Compliance

[TABLE]
| Req. ID | Functional requirement |
| SUP-F01 | Maintain a compliance profile per supplier (metal/diamond/gemstone/finished-goods): certifications, expiry dates, risk category, approved-supplier status. |
| SUP-F02 | Block or route-for-review purchases from non-compliant or expired suppliers per policy. |
| SUP-F03 | Alert procurement and compliance users before supplier certificates/declarations expire (via the notification engine). |
[/TABLE]

# Appendix M.5 POS Resilience, Wholesale & Mobile Sales
### M.5.1 Full Offline POS Mode
Allow POS terminals to keep billing through connectivity loss and synchronize on reconnection. Builds on the touch POS (§E.8); respects idempotency (§3) on sync.

[TABLE]
| Req. ID | Functional requirement |
| POS-F10 | Operate the POS fully offline: billing, payment capture, stock decrement against a local cache; queue transactions durably. |
| POS-F11 | Synchronize queued transactions on reconnection with conflict handling and idempotent posting (no double-sale, no double-post). |
| POS-F12 | Resolve gold-rate and numbering deterministically for offline sales; reconcile on sync; surface unsynced status to the cashier. |
[/TABLE]

Acceptance criteria.
- Given the POS loses connectivity mid-shift, when sales continue offline and connectivity returns, then queued sales post exactly once with correct stock, GL and metal-ledger effects and no duplicates.
### M.5.2 POS Customer Visual Verification

[TABLE]
| Req. ID | Functional requirement |
| POS-F13 | Display the verified customer photograph at POS when a customer profile, loyalty account, store credit, customer deposit, or repair-delivery claim is opened, to reduce misuse — without slowing standard billing. |
[/TABLE]

### M.5.3 B2B Dealer Ordering Application
A dedicated wholesale ordering interface for dealers — distinct from retail e-commerce. Reuses wholesale tier pricing (§E.2) and stock reservation; adds the ordering surface and dealer role.

[TABLE]
| Req. ID | Functional requirement |
| DLR-F01 | Provide dealers a catalogue of available inventory at their negotiated/wholesale price (§E.2), with bulk order placement and order-status tracking. |
| DLR-F02 | Reserve stock on dealer order; route to existing fulfillment; respect dealer credit terms and the installment/AR ledgers where applicable. |
| DLR-F03 | Dealer order state machine: SUBMITTED → CONFIRMED → RESERVED → FULFILLED | CANCELLED. |
[/TABLE]

### M.5.4 Mobile Field Sales & Invoicing

[TABLE]
| Req. ID | Functional requirement |
| MOB-F01 | Authorized representatives view stock, create quotations, reserve items, and create orders/invoices from mobile devices for exhibitions, private viewings and field sales; data syncs to the core (offline-aware per M.5.1). |
[/TABLE]

# Appendix M.6 Customer Engagement
### M.6.1 Appointment & Consultation Booking

[TABLE]
| Req. ID | Functional requirement |
| APT-F01 | Schedule showroom appointments (bridal, bespoke, repair intake, diamond/private viewing, scheme advisory) with staff/counter/specialist allocation per branch; remind via notifications. |
[/TABLE]

### M.6.2 Customer Order & Repair Tracking Portal

[TABLE]
| Req. ID | Functional requirement |
| TRK-F01 | Provide customers a secure tokenized link / QR status page for repair jobs, bespoke orders, approvals and pending deliveries (reuses tokenized public profile pattern). |
| TRK-F02 | Show appointment, custom-order, repair and delivery status on a simple customer-facing page. |
[/TABLE]

### M.6.3 Jewellery Insurance Record

[TABLE]
| Req. ID | Functional requirement |
| INS-F01 | Record insurance policy details, insured value, linked item certificate, renewal date and insurance-partner reference against sold items; support a future partner-integration provider interface. |
[/TABLE]

# Appendix M.7 Executive Analytics & Risk
### M.7.1 OLAP Data Warehouse / Enterprise Data Warehouse
A dedicated analytical layer separating operational data from reporting, for multi-year, multi-branch, multi-company analytics without loading the transactional system.

[TABLE]
| Req. ID | Functional requirement |
| DWH-F01 | Maintain an analytical warehouse fed from operational data across sales, stock, metal movement, production, finance, customer behaviour and branch performance. |
| DWH-F02 | Support multi-company / multi-branch / multi-year / multi-region executive reporting and BI on the warehouse, isolated from operational load. |
[/TABLE]

### M.7.2 Data Normalization & Analytical Health Log

[TABLE]
| Req. ID | Functional requirement |
| DWH-F10 | Maintain checks/logs for data quality: duplicates, broken dimensions, inconsistent item attributes and analytical-processing issues, to keep dashboards and the warehouse reliable. |
[/TABLE]

### M.7.3 Compliance & Risk Dashboard

[TABLE]
| Req. ID | Functional requirement |
| RSK-F01 | Provide a control-centre dashboard: high-value transactions, pending KYC reviews, supplier-compliance expiry, unresolved audit variances, AML/PEP alerts and overdue approvals. |
[/TABLE]

### M.7.4 Advanced Risk & Exception Engine

[TABLE]
| Req. ID | Functional requirement |
| RSK-F10 | Configurable risk rules generating alerts: unusual discounts, repeated voids, excessive cash sales, abnormal stock variance, high-value customer activity, unusual metal loss — routed to the risk dashboard and approvals. |
[/TABLE]

### M.7.5 Chain-of-Custody Reporting

[TABLE]
| Req. ID | Functional requirement |
| COC-F01 | Generate end-to-end traceability reports: supplier lot → production batch → finished tag → transfer → sale → customer delivery (uses provenance data, M.3.2). |
[/TABLE]

# Appendix M.8 Hardware & Communication Integrations
All integrations follow the switchable-provider pattern (§2.4): one interface, implementations selected by enum/env, vendor SDK confined to its provider.
### M.8.1 Digital Weighing Scale Provider Interface
A configurable hardware provider interface for digital jeweller scales, used across production, procurement, inventory, old-gold, melting/refining and tag creation — capturing metal/stone/wax/scrap/finished weights directly to protect fine-weight accuracy and the metal ledger.

[TABLE]
| Req. ID | Functional requirement |
| SCL-F01 | Define a WeighingScaleProvider interface (enum/env): RS232 | USB | BLUETOOTH | NETWORK | NONE; vendor drivers confined to the provider. |
| SCL-F02 | Capture weights directly from the scale into inventory transactions (purchase receipt, old-gold intake, melting, refining, stock adjustment, tag creation), replacing manual entry where connected. |
| SCL-F03 | Capture weights directly during production material issue, receipt, QC and completion (feeds manufacturing reconciliation, §F.3). |
| SCL-F04 | Degrade gracefully to manual entry when no scale is configured; audit captured vs manual weights. |
[/TABLE]

Acceptance criteria.
- Given a weighing scale is configured, when an operator records an old-gold intake, then the gross/net weight is read directly from the scale and the metal ledger uses that value without manual typing.
### M.8.2 WhatsApp Business Communication Workflows
The WhatsApp channel/provider already exists (§2.4, MKT-F02); this adds the transactional communication workflows on top of it.

[TABLE]
| Req. ID | Functional requirement |
| WAB-F01 | Send invoice sharing, repair updates, order confirmations, scheme reminders, installment reminders, appointment reminders and payment follow-ups via WhatsApp Business through the existing provider; templated, audited, opt-in respected. |
[/TABLE]

### M.8.3 Dynamic Catalogue Generator

[TABLE]
| Req. ID | Functional requirement |
| CAT-F01 | Generate customer-ready PDF/web catalogues from live inventory filters (branch, category, metal, purity, weight range, stone type, origin, price range, collection, availability) with current pricing and item images. |
[/TABLE]

### M.8.4 Diamond & Gemstone Certificate Verification

[TABLE]
| Req. ID | Functional requirement |
| CRT-F01 | Validate certificate numbers against supported lab/provider systems via a CertificateVerificationProvider interface (enum/env) where available; record verification result; reduce fraudulent/incorrect certificate entry. |
[/TABLE]

# Document Version Note
This document is Version 4.3.1 of the Multi-Vertical ERP Platform Complete Build Specification. It supersedes Version 4.3 and all prior volumes (4.3.1 is a non-functional hardening pass). Parts A–C (§1–§17, with the functional spec in §B.3–§B.6) and Appendices A–E.10 are unchanged from Version 3.0 and remain the binding build contracts. Parts F–K are net-new additions from the gap-fill analysis against five jewellery ERP systems (May 2026); Parts L and M add experience/AI/QA governance and the enterprise enhancement pack respectively. All gap-fill requirements follow the same conventions, data dictionary rules (§5.1), RBAC model (§6), and strategy interface patterns (§8) as the original specification. The Definition of Done (§16) and the QA gate (Appendix L.5) apply equally to all requirements in Parts F–M.

[TABLE]
| Version | Date | Change Summary |
| 1.0 | Prior | Architecture baseline (Volume I) |
| 2.0 | Prior | Deep functional specification (Volume II) |
| 3.0 | Prior | Consolidated build-complete specification (Parts A–E) |
| 4.0 | May 2026 | Gap-fill additions from 5-ERP analysis: Parts F–K. 30 new feature areas, 4 new appendix parts, ~200 new functional requirements. |
| 4.1 | May 2026 | Structural corrections: Part B section headings renumbered (§B.3–§B.6) to resolve duplicate section numbers; 51 table XML ordering violations repaired. No content changes. |
| 4.2 | May 2026 | Added Part L: deep UI configurability & theming, per-user lobby, embedded AI input (voice/document/NLP), UX quality bar, and delivery QA governance (per-feature gate + two-stage done/human-verification). Companion file: FEATURE-REGISTER-AND-QA.md. |
| 4.3 | May 2026 | Added Part M: Enterprise Enhancement Pack — AML/KYC, PEP/sanctions, high-value review, gold collateral loans, installment/EMI sales, lab-grown/natural stone classification, provenance & chain-of-custody, supplier compliance, offline POS, B2B dealer ordering, mobile sales, appointments, OLAP warehouse, risk dashboard, weighing-scale & WhatsApp & certificate-verification integrations. ~60 new FRs. Additive only; no existing workflow changed. |
| 4.3.1 | May 2026 | Production-hardening pass: fixed Part A §4 numbering ambiguity (added a canonical numbering note), repointed 4 stale §11+ cross-references to Part B §B.3–§B.6, and corrected the Version Note to reflect §1–§17 plus Parts L/M. No features added, removed or changed. |
[/TABLE]

