# Testing & Quality Assurance Guide

## 1. Backend Automated Integration Test Suite

The backend includes a comprehensive suite of 53 integration tests utilizing JUnit 5, Spring Boot Test, Spring Security Test, and MockMvc. All tests execute with in-memory H2 PostgreSQL-compatible persistence and mock STOMP WebSocket brokers.

### Running Tests
```powershell
# Windows PowerShell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; mvn test

# Linux / macOS
mvn test
```

### Test Suite Breakdown (53 Tests Total)
| Test Suite Class | Tests | Coverage Scope |
| :--- | :---: | :--- |
| `AuthAndRbacIntegrationTests` | 10 | Login, refresh token, bad credentials, role & permission evaluation, admin access |
| `UserRoleOutletIntegrationTests` | 4 | User CRUD, outlet assignment, role synchronization, duplicate validation |
| `FloorAndTableIntegrationTests` | 5 | Floor layout creation, table capacity, status transitions (`AVAILABLE` → `OCCUPIED` → `BILLING`) |
| `MenuAndRecipeIntegrationTests` | 5 | Categories, dishes, variants/modifiers, recipe BOM linking |
| `OrderIntegrationTests` | 6 | Dine-in & takeaway placement, table occupancy lock, order item modifiers, status lifecycle |
| `KotAndKdsIntegrationTests` | 5 | Kitchen ticket queueing, stage bumping, individual item bumps, recall last ticket |
| `BillingAndPaymentIntegrationTests` | 4 | Invoice calculation, split payments (Cash + Card + UPI), tip handling, table release |
| `InventoryAndPurchasingIntegrationTests` | 5 | Ingredient stock movements, low-stock triggers, PO receiving with weighted average costing, recipe BOM deduction, refund ledger reversal |
| `ReportAndAnalyticsIntegrationTests` | 7 | Real-time dashboard KPIs, daily/hourly sales trends, payment tender breakdown, top-selling dishes, CSV export format, tax CRUD, unauthorized access protection |
| `RestaurantApplicationTests` | 2 | Spring application context startup, bean wiring integrity |

---

## 2. Frontend Strict TypeScript & Production Build

The frontend enforces strict TypeScript compliance (no implicit any, strict null checks) and Vite production asset bundling.

### Running Verification
```bash
cd frontend
npm run build
```
- `tsc`: Validates 0 type errors across all routes, components, contexts, and API hooks.
- `vite build`: Transformed 2,680+ modules; produces minified JS/CSS chunks in `dist/`.
