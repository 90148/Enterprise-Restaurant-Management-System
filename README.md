# Enterprise Restaurant Management System (RestoMaster POS)

A production-ready, enterprise-grade multi-outlet restaurant management platform featuring an interconnected customer-to-report lifecycle:
**Login → Dashboard → Outlet → Floor & Tables → Menu & Recipes → POS → Orders → KOT → Kitchen (KDS) → Ready / Served → Billing → Split Payments → Receipts → Table Release → Recipe Inventory Deduction → Reports.**

---

## Technology Stack

- **Frontend**: React 18, TypeScript (Strict Mode), Vite, Tailwind CSS, TanStack Query, React Router v6, Axios, Lucide React, Recharts, SockJS / STOMP.
- **Backend**: Java 21/25, Spring Boot 3.3.4, Spring Security, JWT (JJWT 0.12), Spring Data JPA, Hibernate, Bean Validation, Spring STOMP WebSocket, Lombok, OpenAPI / Swagger.
- **Database**: PostgreSQL 16 (H2 compatibility mode available for zero-dependency standalone runs), Flyway Migrations.
- **DevOps**: Docker, Docker Compose, Multi-stage builds, Nginx reverse proxy.

---

## Monorepo Layout

```
restaurant-management-system/
├── frontend/                     # React + Vite + TypeScript + Tailwind SPA
├── backend/                      # Spring Boot 3.x REST API & STOMP Broker
├── database/                     # PostgreSQL schema reference and seed scripts
├── docker/                       # Dockerfiles and docker-compose.yml
├── docs/                         # In-depth architectural & API specifications
└── README.md                     # Setup and running instructions
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ & npm 9+
- Java 21+ (OpenJDK 21 or 25)
- Maven 3.9+ (or use included `mvnw.cmd`)

### 2. Running Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 3. Running Backend
```bash
cd backend
mvn clean spring-boot:run
# Running on http://localhost:8080
# Swagger UI available at: http://localhost:8080/swagger-ui.html
```

### 4. Running via Docker Compose
```bash
cd docker
docker compose up --build
```

---

## Default Demo Credentials
| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | Full enterprise access across all outlets and settings |
| **Cashier** | `cashier` | `Cashier@123` | POS register, Orders, Billing, Payments, Table views |
| **Kitchen** | `kitchen` | `Kitchen@123` | Real-time Kitchen Display System (KDS), KOTs |
| **Inventory**| `inventory`| `Inventory@123`| Stock, Purchasing, Recipes, Reconciliations |

---

## Documentation Links
- [System Architecture](docs/architecture.md)
- [API Conventions](docs/api.md)
- [Database Schema](docs/database.md)
- [Authentication & RBAC](docs/authentication.md)
- [Business Workflows](docs/business-workflows.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](docs/testing.md)
