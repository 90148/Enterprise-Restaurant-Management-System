# System Architecture

## 1. High-Level Architecture

The RestoMaster Restaurant Management System is architected as an enterprise multi-tier, multi-outlet platform with decoupled Single Page Application (SPA) frontend, Spring Boot microservices-ready backend, and PostgreSQL relational database.

```
┌─────────────────────────────────────────────────────────────┐
│                 React SPA Frontend (Vite)                   │
│   (Touch POS, KDS Kitchen Display, Real-time Dashboard)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST / STOMP WebSockets
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Spring Boot 3.x Backend Architecture            │
│  ┌────────────────────────┐    ┌──────────────────────────┐ │
│  │ Spring Security & JWT  │    │ STOMP WebSocket Broker   │ │
│  └───────────┬────────────┘    └────────────┬─────────────┘ │
│              │                              │               │
│  ┌───────────▼────────────┐    ┌────────────▼─────────────┐ │
│  │ REST Controllers       │    │ Service Layer (Tx)       │ │
│  │ (POS, Orders, Billing) │    │ (Order, KDS, Stock Deduct│ │
│  └───────────┬────────────┘    └────────────┬─────────────┘ │
│              │                              │               │
│  ┌───────────▼──────────────────────────────▼─────────────┐ │
│  │           Spring Data JPA / Hibernate ORM              │ │
│  └───────────────────────────┬────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────┘
                               │ JDBC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 Database                    │
│   (Normalized relational schema, Flyway migrations V1..V8)  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Key Architecture Principles

1. **Strict Separation of Concerns**: DTOs isolate internal database representations from external REST contracts.
2. **Stateless Authentication**: JWT tokens with role and permission claims; no server session affinity required.
3. **Event-Driven Kitchen Updates**: STOMP WebSockets notify kitchen terminals in real-time as orders are placed or advanced.
4. **ACID Transaction Integrity**: Crucial operational boundaries (e.g. Order Placed → Table Occupied → KOT Generated; and Bill Paid → Table Released → Inventory Deducted) execute atomically via `@Transactional`.
5. **Multi-Outlet Tenant Model**: All operational entities (tables, inventory, orders, sales) are partitioned by `outlet_id`.
