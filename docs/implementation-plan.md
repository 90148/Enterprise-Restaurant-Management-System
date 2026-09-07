# Enterprise Restaurant Management System - Implementation Plan

Build a production-ready, enterprise-grade Restaurant Management System featuring an integrated customer-to-report lifecycle:
**Login → Dashboard → Outlet → Floor/Table → Menu → POS → Order → KOT → Kitchen (KDS) → Ready/Served → Bill → Payment → Receipt → Table Release → Recipe Inventory Deduction → Reports.**

---

## 1. Monorepo Structure (`d:/pos/`)
```
restaurant-management-system/
├── frontend/                     # React 18/19, TypeScript, Vite, Tailwind CSS, TanStack Query
├── backend/                      # Spring Boot 3.x, Spring Security, JWT, JPA, Flyway, WebSocket
├── database/                     # PostgreSQL schema, seed data, Flyway migrations
├── docker/                       # Dockerfile.backend, Dockerfile.frontend, docker-compose.yml
├── docs/                         # Architecture, API specs, workflows, deployment docs
└── README.md                     # Monorepo setup, run guides, and architecture documentation
```

---

## 2. Technical Architecture & Component Design

### Backend (Spring Boot 3.3.x, Java 21/25)
- **Security & RBAC**: JWT filter, BCrypt password hashing, permissions matrix (`USER_VIEW`, `ORDER_CREATE`, `KITCHEN_UPDATE`, `BILL_CREATE`, `PAYMENT_CREATE`, etc.).
- **Database Migrations**: Flyway versioned migrations (`V1` through `V8`) for PostgreSQL.
- **Real-Time Communication**: Spring STOMP WebSocket broker with channels for orders, kitchen KDS, table statuses, and payments.
- **Business Workflows**: Atomic `@Transactional` operations handling the entire order-to-receipt cycle and automatic bill-of-materials recipe inventory deductions.

### Frontend (React 18/19, TypeScript, Vite, Tailwind CSS)
- **Strict TypeScript & React Router v6**: Protected routes, role-based route guards, TanStack Query caching and mutations.
- **State & Real-Time**: AuthContext, WebSocketContext with auto-reconnect and audible notifications on incoming KOT.
- **Full Operational UI**: POS touchscreen interface, interactive floor/table layout, KDS live Kanban with preparation timers, thermal receipt generator, split payments modal, inventory transaction logs, and interactive analytics charts.

---

## 3. Phased Execution Steps
1. **Phase 1**: Monorepo Scaffolding & Foundation (Backend pom.xml, frontend Vite+TS+Tailwind, Maven wrapper).
2. **Phase 2**: Database Schema & Flyway Migrations (V1 to V8 SQL scripts).
3. **Phase 3**: Authentication, Security & RBAC (JWT, users, roles, permissions).
4. **Phase 4**: Outlets, Floor & Table Management.
5. **Phase 5**: Menu & Recipe Management.
6. **Phase 6**: POS & Order Management.
7. **Phase 7**: KOT & Kitchen Display System (KDS).
8. **Phase 8**: Billing, Split Payments, Receipts & Table Release.
9. **Phase 9**: Automated Recipe-Driven Inventory Deduction & Stock Operations.
10. **Phase 10**: Reports, Analytics & Dashboards.
11. **Phase 11**: Real-Time WebSockets & Settings.
12. **Phase 12**: Verification, Docker Configuration & Documentation.
