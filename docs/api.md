# API Specifications & Conventions

## 1. REST Base URI
All endpoints are prefixed with `/api`.

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI 3 JSON Specification**: `http://localhost:8080/v3/api-docs`

---

## 2. Standard Envelope Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-09-07T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Must not be blank"
  },
  "timestamp": "2026-09-07T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "last": false
}
```

---

## 3. Comprehensive REST Endpoints Map

### Authentication & RBAC (`/api/auth`, `/api/users`, `/api/roles`, `/api/permissions`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate with username & password | Public |
| `POST` | `/api/auth/refresh` | Refresh access token via refresh token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/users` | List users with pagination and search | `USER_VIEW` |
| `POST` | `/api/users` | Create a new user with role assignments | `USER_CREATE` |
| `PUT` | `/api/users/{id}` | Update user details or roles | `USER_UPDATE` |
| `DELETE` | `/api/users/{id}` | Soft delete / deactivate user | `USER_DELETE` |
| `GET` | `/api/roles` | List all system roles | `ROLE_VIEW` |
| `GET` | `/api/permissions` | List all available fine-grained permissions | `ROLE_VIEW` |

### Outlets, Floors & Tables (`/api/outlets`, `/api/floors`, `/api/tables`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/outlets` | List accessible outlets | `OUTLET_VIEW` |
| `POST` | `/api/outlets` | Create an outlet | `OUTLET_CREATE` |
| `GET` | `/api/floors` | List floors by outlet | `OUTLET_VIEW` |
| `POST` | `/api/floors` | Create a floor | `OUTLET_UPDATE` |
| `GET` | `/api/tables` | List tables by floor / outlet with live statuses | `ORDER_VIEW` |
| `POST` | `/api/tables` | Create a table | `OUTLET_UPDATE` |
| `PATCH` | `/api/tables/{id}/status` | Update table status (`AVAILABLE`, `OCCUPIED`, `BILLING`) | `ORDER_UPDATE` |

### Menu, Categories, Modifiers & Recipes (`/api/menu`, `/api/recipes`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menu/categories` | List active menu categories | `MENU_VIEW` |
| `POST` | `/api/menu/categories` | Create category | `MENU_CREATE` |
| `GET` | `/api/menu/items` | List menu items with pricing and modifiers | `MENU_VIEW` |
| `POST` | `/api/menu/items` | Create menu item | `MENU_CREATE` |
| `GET` | `/api/recipes/menu-item/{id}` | Retrieve recipe Bill of Materials (BOM) | `MENU_VIEW` |
| `POST` | `/api/recipes` | Attach or update recipe ingredient mapping | `MENU_CREATE` |

### POS & Order Management (`/api/orders`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Create order, mark table `OCCUPIED`, generate KOT | `ORDER_CREATE` |
| `GET` | `/api/orders` | Search and filter active / past orders | `ORDER_VIEW` |
| `GET` | `/api/orders/{id}` | Get complete order details with item breakdown | `ORDER_VIEW` |
| `PATCH` | `/api/orders/{id}/status` | Transition order status | `ORDER_UPDATE` |

### Kitchen Display System (`/api/kds`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/kds/tickets` | Live KOT queue filtered by outlet and station | `KITCHEN_VIEW` |
| `GET` | `/api/kds/stats` | Active kitchen metrics (avg prep time, ticket counts) | `KITCHEN_VIEW` |
| `PATCH` | `/api/kds/tickets/{id}/status` | Bump ticket (`PENDING` → `IN_PREPARATION` → `READY` → `SERVED`) | `KITCHEN_UPDATE` |
| `PATCH` | `/api/kds/items/{itemId}/status` | Bump individual item status | `KITCHEN_UPDATE` |
| `POST` | `/api/kds/recall` | Recall the most recently bumped ticket | `KITCHEN_UPDATE` |

### Invoices, Split Payments & Refunds (`/api/bills`, `/api/refunds`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bills/order/{orderId}` | Generate bill/invoice for order | `BILL_CREATE` |
| `GET` | `/api/bills/{id}` | Get invoice breakdown with taxes, tips, discounts | `BILL_VIEW` |
| `GET` | `/api/bills` | Search and list invoices | `BILL_VIEW` |
| `GET` | `/api/bills/stats` | Invoice counts and settlement totals | `BILL_VIEW` |
| `POST` | `/api/bills/{id}/payments` | Process full/split settlement, trigger stock deduction | `PAYMENT_CREATE` |
| `POST` | `/api/refunds` | Process payment refund, reverse ledger & restore balance | `PAYMENT_REFUND` |
| `GET` | `/api/refunds` | List transaction refunds by outlet | `BILL_VIEW` |

### Raw Inventory & Purchasing (`/api/inventory`, `/api/purchases`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory/items` | Paged raw ingredient catalog | `INVENTORY_VIEW` |
| `GET` | `/api/inventory/low-stock` | Low-stock and out-of-stock alerts | `INVENTORY_VIEW` |
| `GET` | `/api/inventory/stats` | Item counts and total stock valuation | `INVENTORY_VIEW` |
| `POST` | `/api/inventory/items/{id}/adjust` | Manual stock adjustment (Restock, Spoilage, Correction) | `INVENTORY_UPDATE` |
| `GET` | `/api/inventory/transactions` | Full immutable audit movements log | `INVENTORY_VIEW` |
| `POST` | `/api/purchases` | Create supplier purchase order | `INVENTORY_UPDATE` |
| `POST` | `/api/purchases/{id}/receive` | Receive delivery, restock inventory, update average cost | `INVENTORY_UPDATE` |
| `GET` | `/api/purchases` | Search purchase orders | `INVENTORY_VIEW` |

### Reports, Analytics & Intelligence (`/api/reports`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard-stats` | Real-time dashboard KPIs, hourly curve, active tables | `REPORT_VIEW` |
| `GET` | `/api/reports/sales-summary` | Financial summary (Gross, Net, Tax, Discount, Tips, AOV) | `REPORT_VIEW` |
| `GET` | `/api/reports/daily-sales` | Daily revenue, order counts, and tax trajectory | `REPORT_VIEW` |
| `GET` | `/api/reports/payment-methods` | Breakdown by tender (Cash, Card, UPI, etc.) | `REPORT_VIEW` |
| `GET` | `/api/reports/order-types` | Distribution across Dine-In, Takeaway, Delivery | `REPORT_VIEW` |
| `GET` | `/api/reports/top-items` | Top-selling dishes ranked by volume and revenue | `REPORT_VIEW` |
| `GET` | `/api/reports/categories` | Revenue and volume breakdown by category | `REPORT_VIEW` |
| `GET` | `/api/reports/inventory-consumption` | Recipe stock depletion vs wastage | `REPORT_VIEW` |
| `GET` | `/api/reports/export-sales-csv` | Direct RFC 4180 CSV export of sales report | `REPORT_EXPORT` |

### Settings & Statutory Taxes (`/api/settings`, `/api/taxes`)
| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settings/outlet` | Fetch outlet preferences and receipt config | `SETTINGS_VIEW` |
| `PUT` | `/api/settings/outlet` | Save outlet preferences and receipt config | `SETTINGS_UPDATE` |
| `GET` | `/api/taxes` | List configured statutory tax rates | `SETTINGS_VIEW` |
| `POST` | `/api/taxes` | Add new tax rate | `SETTINGS_UPDATE` |
| `PUT` | `/api/taxes/{id}` | Update existing tax rate | `SETTINGS_UPDATE` |
| `DELETE` | `/api/taxes/{id}` | Delete tax rate | `SETTINGS_UPDATE` |

---

## 4. WebSocket / STOMP Real-Time Broadcasting

- **Handshake Endpoint**: `/ws` (with SockJS fallback)
- **STOMP Broker Topics**:
  - `/topic/orders` - Events: `ORDER_CREATED`, `ORDER_STATUS_CHANGED`
  - `/topic/kitchen` - Events: `KOT_CREATED`, `KOT_STATUS_CHANGED`, `ITEM_BUMPED`
  - `/topic/tables` - Events: `TABLE_OCCUPIED`, `TABLE_RELEASED`
  - `/topic/billing` - Events: `BILL_CREATED`, `BILL_PAID`

### Payload Structure
```json
{
  "eventType": "ORDER_CREATED",
  "outletId": "out-001",
  "entityId": "ord-12345",
  "payload": { ... },
  "timestamp": "2026-09-07T17:15:00.000Z"
}
```
Client UI components automatically invalidate corresponding TanStack Query caches upon receiving events to ensure instant multi-device synchronization without polling.
