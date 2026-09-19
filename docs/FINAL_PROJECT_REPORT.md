# RestoMaster POS - Enterprise Restaurant Management System
## Final Project Completion & Technical Report

**Project Name**: RestoMaster POS  
**Repository**: `d:/pos`  
**Target Release**: Production Ready (v1.0.0)  
**Status**: 100% Implemented, Integrated & Verified  
**Date**: September 2026  

---

## Executive Summary

**RestoMaster POS** is an enterprise-grade, multi-outlet restaurant management platform engineered to unify front-of-house hospitality, kitchen operations, inventory supply chain, billing, and executive analytics into a cohesive, real-time ecosystem.

The system delivers an end-to-end interconnected lifecycle:
```
[1] LOGIN & ROLE-BASED ACCESS CONTROL
     ↓
[2] OUTLET & FLOOR CONTEXT SELECTION
     ↓
[3] INTERACTIVE FLOOR & TABLE CANVAS (Available / Occupied / Billing)
     ↓
[4] TOUCH POS REGISTER (Categories → Dishes → Modifiers → Cart → Taxes)
     ↓
[5] ORDER PLACEMENT (Atomic Tx: Table Occupied + KOT Generation + STOMP Broadcast)
     ↓
[6] KITCHEN DISPLAY SYSTEM (KDS) (Preparation Timers, Station Routing, Bump / Recall)
     ↓
[7] BILLING & INVOICING (Subtotal, GST/VAT Rules, Tips, Discounts, 80mm Receipts)
     ↓
[8] SPLIT PAYMENTS & SETTLEMENTS (Cash / Card / UPI / Wallet + Reversals/Refunds)
     ↓
[9] TABLE RELEASE & RECIPE STOCK DEDUCTION (Automated BOM Depletion & Ledger Audit)
     ↓
[10] LIVE DASHBOARD & ANALYTICS (Real-Time Hourly Curves, Recharts, RFC 4180 CSV Export)
```

---

## 1. Monorepo Architecture & Technology Stack

```
d:/pos/
├── backend/                       # Spring Boot 3.3.4 REST API & STOMP Broker
│   ├── src/main/java/com/example/restaurant/
│   │   ├── config/                # Security, WebSocket, Data Initializer, OpenAPI
│   │   ├── controller/            # 16 REST Controllers
│   │   ├── dto/                   # Layer-separated Data Transfer Objects
│   │   ├── entity/                # 20 JPA Domain Entities
│   │   ├── exception/             # Centralized GlobalExceptionHandler
│   │   ├── repository/            # 16 Spring Data JPA Repositories
│   │   ├── security/              # JWT Provider, Auth Filter, UserDetailsService
│   │   └── service/               # 12 Transactional Business Services
│   ├── src/main/resources/
│   │   ├── db/migration/          # Flyway Migrations (V1 to V7 SQL scripts)
│   │   └── application.yml        # Dev (H2) and Prod (PostgreSQL) configurations
│   └── pom.xml                    # Maven 3.9+ build definition (Java 21/25)
├── frontend/                      # React 18 SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── api/                   # Typed Axios API clients & WebSocket client
│   │   ├── components/            # Reusable UI library (Buttons, Modals, Cards, Nav)
│   │   ├── context/               # AuthContext & Session management
│   │   ├── hooks/                 # Reactive hooks (useWebSocketSync)
│   │   ├── pages/                 # Full operational views (POS, KDS, Tables, Reports, Settings)
│   │   ├── types/                 # Strict TypeScript interface contracts
│   │   └── utils/                 # Currency, date, and receipt formatters
│   ├── nginx.conf                 # Production reverse-proxy configuration
│   └── package.json               # Frontend dependencies and Vite build scripts
├── database/                      # Reference SQL schemas and seed data
├── docker/                        # Containerization configs (Dockerfile.backend, Dockerfile.frontend, compose)
└── docs/                          # Architecture, API, and QA specifications
```

### Technology Matrix

| Layer | Core Technologies | Justification & Implementation Details |
| :--- | :--- | :--- |
| **Backend** | Java 21 / 25, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Hibernate, JJWT 0.12.6, Spring STOMP WebSocket | Zero-Lombok architecture ensures 100% compatibility with Java 25 reflection restrictions. Stateless JWT tokens encapsulate user identity, roles, and granular authorities. Atomic `@Transactional` service methods prevent partial state commits across orders, bills, and stock deductions. |
| **Frontend** | React 18, TypeScript (Strict Mode), Vite, Tailwind CSS, TanStack Query, React Router v6, Recharts, Lucide React, SockJS / STOMP | Zero mock data in production screens. TanStack Query ensures client caching, deduplication, and automated invalidation via STOMP WebSocket subscriptions (`/topic/*`). |
| **Database** | PostgreSQL 16 (Production) / H2 in PostgreSQL Mode (Development & Testing) | Flyway versioned migrations (`V1` to `V7`) guarantee schema reproducibility. Composite indexes optimize high-volume queries (`orders(outlet_id, status)`, `restaurant_tables(floor_id, status)`). |
| **DevOps** | Docker, Docker Compose, Multi-stage builds, Nginx | Self-contained multi-stage builds with Nginx proxying `/api` and `/ws` seamlessly to backend. |

---

## 2. Phase-by-Phase Implementation Summary

### Phase 1: Monorepo Scaffolding & Foundation
- Monorepo directory structure established with root documentation.
- Backend Spring Boot 3.3.4 project configured with Maven, Spring Web, Security, JPA, Validation, Flyway, and OpenAPI Swagger.
- Frontend scaffolded with React 18, TypeScript strict mode, Vite, Tailwind CSS, and TanStack Query.

### Phase 2: Database Schema & Flyway Versioned Migrations
- Incremental Flyway migration scripts (`V1__initial_schema.sql` through `V7__inventory_purchasing_refunds.sql`).
- Relational mapping with foreign keys, constraints, and audit timestamps across:
  - `outlets`, `floors`, `restaurant_tables`
  - `users`, `roles`, `permissions`, `user_roles`, `role_permissions`
  - `menu_categories`, `menu_items`, `modifier_groups`, `modifiers`
  - `inventory_units`, `inventory_items`, `recipes`, `recipe_items`
  - `orders`, `order_items`, `kots`, `kot_items`
  - `bills`, `bill_items`, `bill_payments`, `refund_transactions`
  - `purchase_orders`, `purchase_order_items`, `inventory_transactions`
  - `settings`, `taxes`

### Phase 3: Authentication, Security & Granular RBAC
- Stateless JWT authentication flow (`POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`).
- BCrypt password hashing and custom `JwtAuthenticationFilter`.
- Fine-grained permission matrix with method-level security (`@PreAuthorize("hasAuthority('...')")`).
- Role permissions: `ROLE_ADMIN`, `ROLE_CASHIER`, `ROLE_KITCHEN`, `ROLE_INVENTORY`.

### Phase 4: Multi-Outlet, Floor & Interactive Table Canvas
- Multi-tenant data segregation by `outlet_id`.
- Floor plan management with customizable room layouts.
- Dynamic table state machine: `AVAILABLE` (Green), `OCCUPIED` (Red), `BILLING` (Amber), `RESERVED` (Blue).
- Interactive drag-and-drop table positions with capacity and quick-action modals.

### Phase 5: Menu Engineering, Modifiers & Recipe Bill of Materials (BOM)
- Hierarchical menu categories with display ordering and visual icons.
- Menu items with base pricing, tax tags, dietary badges (Veg, Non-Veg, Vegan), and availability toggles.
- Modifier groups (single-choice and multi-choice toppings, crusts, dressings, sides).
- Recipe BOM linking menu dishes to raw inventory ingredients with precise unit requirements.

### Phase 6: Touch POS Register & Atomic Order Management
- High-speed touch POS terminal interface optimized for tablet and desktop registers.
- Category filtering, real-time item search, modifier selection modal, and active cart calculator.
- Atomic transaction execution:
  - Validates table availability.
  - Inserts order and order items with customized modifier choices.
  - Locks table state to `OCCUPIED`.
  - Automatically generates Kitchen Order Tickets (KOT).
  - Broadcasts `ORDER_CREATED` and `TABLE_OCCUPIED` to WebSocket topics.

### Phase 7: KOT Station Routing & Kitchen Display System (KDS)
- Kitchen ticket routing by preparation stations (`KITCHEN`, `BAR`, `GRILL`, `DESSERT`).
- KDS Kanban board with real-time preparation timers and urgency color coding (Green < 10m, Amber 10-20m, Red > 20m).
- Stage bump operations: `PENDING` → `IN_PREPARATION` → `READY` → `SERVED`.
- Item-level bumping and single-click "Recall Last Bumped Ticket" safety mechanism.
- Audio alert and visual highlight on new incoming orders.

### Phase 8: Billing, Invoicing, Split Tender & Table Release
- Instant bill generation from active orders (`POST /api/bills/order/{orderId}`).
- Itemized invoice calculations: subtotal, item discounts, bill-level discounts, statutory taxes, and tips.
- Multi-tender split settlement: Cash, Card, UPI, and Digital Wallets in arbitrary split increments.
- Automatic table release to `AVAILABLE` upon full settlement.
- Printable 80mm POS thermal receipt generation with custom store headers, tax numbers, and thank-you footers.

### Phase 9: Automated Recipe Stock Deductions, Purchasing & Refunds
- **Automated BOM Stock Depletion**: Hooked into payment settlement to atomically decrement raw inventory items linked via recipes.
- **Stock Audit Ledger**: Immutable `inventory_transactions` record for every `SALE`, `PURCHASE`, `WASTE`, or `ADJUSTMENT`.
- **Purchase Order Aggregate**: PO workflow (`DRAFT` → `ORDERED` → `RECEIVED`) recalculating unit costs via weighted average formula.
- **Customer Refund Processing**: Validates against original payments, records `RefundTransaction`, marks payment `REFUNDED`, restores bill balance, and re-evaluates bill status.

### Phase 10: Reports, Business Intelligence, Settings & WebSockets
- **Live Dashboard**: Replaced all mock data with real-time operational stats (`/api/reports/dashboard-stats`), active tables gauge, low-stock alerts, and 24-hour Recharts hourly revenue curve.
- **Sales Analytics (`/reports/sales`)**: Date-range presets (Today, Yesterday, 7D, 30D, Month, Custom), financial KPI cards (Gross, Net, Tax, Discounts, AOV, Refunds), payment tender donut charts, dining mode breakdown, top-selling dishes leaderboard, category profitability, and direct RFC 4180 CSV export.
- **Store Settings (`/settings/preferences`)**: Outlet branding, currency selection, tax rules CRUD modal (inclusive/exclusive rates), service charge configuration, and live 80mm thermal receipt preview.
- **Real-Time STOMP WebSockets**: Four active broadcast channels (`/topic/orders`, `/topic/kitchen`, `/topic/tables`, `/topic/billing`) with automatic TanStack Query cache invalidation across all connected terminals.

### Phase 11 & 12: Containerization, Production Readiness & Documentation
- Multi-stage Docker packaging for backend and frontend.
- Nginx reverse-proxy routing `/api` and `/ws` with WebSocket upgrade headers.
- Comprehensive API catalog, testing guide, and deployment manuals.

---

## 3. Comprehensive REST API & WebSocket Catalog

### Authentication & User Administration
- `POST /api/auth/login`: Authenticate with username & password (returns JWT access & refresh tokens).
- `POST /api/auth/refresh`: Refresh expired JWT access token.
- `GET /api/auth/me`: Fetch authenticated user profile and permissions.
- `GET /api/users`: List users with pagination and search (`USER_VIEW`).
- `POST /api/users`: Create user and assign roles (`USER_CREATE`).
- `PUT /api/users/{id}`: Update user profile and roles (`USER_UPDATE`).
- `DELETE /api/users/{id}`: Deactivate user (`USER_DELETE`).
- `GET /api/roles`: List all system roles (`ROLE_VIEW`).
- `GET /api/permissions`: List all system permissions (`ROLE_VIEW`).

### Outlets, Floors & Tables
- `GET /api/outlets`: List accessible outlets (`OUTLET_VIEW`).
- `POST /api/outlets`: Create new outlet (`OUTLET_CREATE`).
- `GET /api/floors`: List floors by outlet (`OUTLET_VIEW`).
- `POST /api/floors`: Create floor (`OUTLET_UPDATE`).
- `GET /api/tables`: List tables with live statuses by floor / outlet (`ORDER_VIEW`).
- `POST /api/tables`: Create table (`OUTLET_UPDATE`).
- `PATCH /api/tables/{id}/status`: Update table occupancy status (`ORDER_UPDATE`).

### Menu, Modifiers & Recipes
- `GET /api/menu/categories`: List menu categories (`MENU_VIEW`).
- `POST /api/menu/categories`: Create menu category (`MENU_CREATE`).
- `GET /api/menu/items`: List menu items with prices, categories, and modifiers (`MENU_VIEW`).
- `POST /api/menu/items`: Create menu item (`MENU_CREATE`).
- `GET /api/recipes/menu-item/{id}`: Retrieve recipe Bill of Materials (`MENU_VIEW`).
- `POST /api/recipes`: Attach or update recipe ingredient requirements (`MENU_CREATE`).

### Orders & Kitchen Display System (KDS)
- `POST /api/orders`: Place new order, occupy table, generate KOT (`ORDER_CREATE`).
- `GET /api/orders`: Search and list orders with status filters (`ORDER_VIEW`).
- `GET /api/orders/{id}`: Get full order details with items and modifiers (`ORDER_VIEW`).
- `PATCH /api/orders/{id}/status`: Advance order lifecycle state (`ORDER_UPDATE`).
- `GET /api/kds/tickets`: Active kitchen tickets queue by station (`KITCHEN_VIEW`).
- `GET /api/kds/stats`: Average preparation time and ticket counters (`KITCHEN_VIEW`).
- `PATCH /api/kds/tickets/{id}/status`: Transition ticket status (`KITCHEN_UPDATE`).
- `PATCH /api/kds/items/{itemId}/status`: Bump individual ticket item (`KITCHEN_UPDATE`).
- `POST /api/kds/recall`: Recall last bumped ticket back to active queue (`KITCHEN_UPDATE`).

### Invoicing, Payments & Customer Refunds
- `POST /api/bills/order/{orderId}`: Generate invoice for order (`BILL_CREATE`).
- `GET /api/bills/{id}`: Retrieve bill details with taxes and discounts (`BILL_VIEW`).
- `GET /api/bills`: Paged search of invoices (`BILL_VIEW`).
- `GET /api/bills/stats`: Settlement volume and count metrics (`BILL_VIEW`).
- `POST /api/bills/{id}/payments`: Process single or split tender payment (`PAYMENT_CREATE`).
- `POST /api/refunds`: Issue refund against payment, reverse ledger (`PAYMENT_REFUND`).
- `GET /api/refunds`: List refunds by outlet (`BILL_VIEW`).

### Raw Inventory & Purchasing
- `GET /api/inventory/items`: Paged raw materials catalog (`INVENTORY_VIEW`).
- `GET /api/inventory/low-stock`: Immediate low-stock alerts (`INVENTORY_VIEW`).
- `GET /api/inventory/stats`: Inventory item count and total valuation (`INVENTORY_VIEW`).
- `POST /api/inventory/items/{id}/adjust`: Manual stock adjustment (`INVENTORY_UPDATE`).
- `GET /api/inventory/transactions`: Full immutable stock audit ledger (`INVENTORY_VIEW`).
- `POST /api/purchases`: Create supplier purchase order (`INVENTORY_UPDATE`).
- `POST /api/purchases/{id}/receive`: Receive PO delivery and restock (`INVENTORY_UPDATE`).
- `GET /api/purchases`: Search purchase orders (`INVENTORY_VIEW`).

### Business Intelligence & Reporting
- `GET /api/reports/dashboard-stats`: Live dashboard operational metrics (`REPORT_VIEW`).
- `GET /api/reports/sales-summary`: Financial gross/net summary (`REPORT_VIEW`).
- `GET /api/reports/daily-sales`: Daily revenue trajectory (`REPORT_VIEW`).
- `GET /api/reports/payment-methods`: Breakdown by tender method (`REPORT_VIEW`).
- `GET /api/reports/order-types`: Breakdown by dining mode (`REPORT_VIEW`).
- `GET /api/reports/top-items`: Top-selling menu dishes (`REPORT_VIEW`).
- `GET /api/reports/categories`: Sales and revenue by category (`REPORT_VIEW`).
- `GET /api/reports/inventory-consumption`: Recipe depletion vs wastage (`REPORT_VIEW`).
- `GET /api/reports/export-sales-csv`: Download RFC 4180 CSV report (`REPORT_EXPORT`).

### Settings & Taxes
- `GET /api/settings/outlet`: Fetch outlet configuration and receipt notes (`SETTINGS_VIEW`).
- `PUT /api/settings/outlet`: Update outlet configuration (`SETTINGS_UPDATE`).
- `GET /api/taxes`: List configured tax rates (`SETTINGS_VIEW`).
- `POST /api/taxes`: Create tax rule (`SETTINGS_UPDATE`).
- `PUT /api/taxes/{id}`: Update tax rule (`SETTINGS_UPDATE`).
- `DELETE /api/taxes/{id}`: Delete tax rule (`SETTINGS_UPDATE`).

### Real-Time STOMP WebSocket Channels
- **Broker Handshake**: `/ws` (with SockJS fallback)
- **Topics**:
  - `/topic/orders`: `ORDER_CREATED`, `ORDER_STATUS_CHANGED`
  - `/topic/kitchen`: `KOT_CREATED`, `KOT_STATUS_CHANGED`, `ITEM_BUMPED`
  - `/topic/tables`: `TABLE_OCCUPIED`, `TABLE_RELEASED`
  - `/topic/billing`: `BILL_CREATED`, `BILL_PAID`

---

## 4. Verification & Quality Assurance Summary

### Backend Automated Integration Test Suite
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; mvn test
```
**Results: 53 / 53 Tests Passing (0 Failures, 0 Errors, 100% Green)**
- `AuthAndRbacIntegrationTests`: 10 passed
- `UserRoleOutletIntegrationTests`: 4 passed
- `FloorAndTableIntegrationTests`: 5 passed
- `MenuAndRecipeIntegrationTests`: 5 passed
- `OrderIntegrationTests`: 6 passed
- `KotAndKdsIntegrationTests`: 5 passed
- `BillingAndPaymentIntegrationTests`: 4 passed
- `InventoryAndPurchasingIntegrationTests`: 5 passed
- `ReportAndAnalyticsIntegrationTests`: 7 passed
- `RestaurantApplicationTests`: 2 passed

### Frontend Strict Compilation & Production Bundle
```bash
cd frontend
npm run build
```
- **TypeScript Compiler (`tsc`)**: 0 type errors across all routes, components, contexts, and API hooks.
- **Vite Production Bundler**: Transformed 2,686 modules with clean output in `dist/` and exit code 0.

---

## 5. Deployment & Quick Start Guide

### 1. Default Demo Credentials
| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | Full enterprise control across all outlets, settings, reports, users |
| **Cashier** | `cashier` | `Cashier@123` | Touch POS register, active orders, billing, payments, table canvas |
| **Kitchen** | `kitchen` | `Kitchen@123` | Real-time Kitchen Display System (KDS), KOT station queues, ticket bumping |
| **Inventory**| `inventory`| `Inventory@123`| Ingredients catalog, stock adjustments, purchase orders, recipe BOM |

### 2. Standalone Local Execution

#### Backend
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; mvn spring-boot:run
# Server listening on http://localhost:8080
# Swagger UI available at http://localhost:8080/swagger-ui.html
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend live at http://localhost:3000 (proxies /api and /ws to 8080)
```

### 3. Docker Compose Full-Stack Deployment
```bash
cd docker
docker compose up -d --build
```
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`
- **PostgreSQL 16**: `localhost:5432`

---

## 6. Project Conclusion & Deliverables

RestoMaster POS is complete and ready for production deployment:
1. **Zero Mock Data**: All frontend views bind directly to real backend relational tables.
2. **Zero Inconsistencies**: All orders, tables, bills, stock deductions, and ledger audits execute within atomic transactions.
3. **Real-Time Collaboration**: Registers, kitchen screens, and management dashboards update automatically via STOMP WebSockets.
4. **Clean Code & Test Coverage**: 100% test pass rate across 53 automated integration tests and clean TypeScript compilation.
