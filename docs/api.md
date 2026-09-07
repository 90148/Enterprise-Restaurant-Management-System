# API Specifications & Conventions

## 1. REST Base URI
All endpoints are prefixed with `/api`.

Swagger UI is accessible locally at:
`http://localhost:8080/swagger-ui.html`

OpenAPI 3 JSON specification:
`http://localhost:8080/v3/api-docs`

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
    "field": "Field is required"
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

## 3. Core REST Endpoints Map
- `POST /api/auth/login` - Authenticate with username/password
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/users` - List users with pagination and search
- `GET /api/outlets` - List restaurant outlets
- `GET /api/floors` - List floors by outlet
- `GET /api/tables` - List tables and live statuses
- `GET /api/menu/categories` - List menu categories
- `GET /api/menu/items` - List menu items with filters
- `POST /api/orders` - Create order and generate KOT
- `GET /api/kitchen/kots` - Kitchen display system queue
- `PATCH /api/kitchen/kots/{id}/status` - Advance kitchen preparation status
- `POST /api/bills/generate` - Generate invoice from order
- `POST /api/payments` - Process payment (Cash, Card, UPI, Split)
- `POST /api/refunds` - Process transaction refund
- `GET /api/inventory` - Current stock and alert levels
- `POST /api/inventory/adjust` - Manual stock adjustment
- `GET /api/reports/sales` - Sales analytics report

---

## 4. WebSocket / STOMP Channels
- **Endpoint**: `/ws` (with SockJS fallback)
- **Topics**:
  - `/topic/outlet/{outletId}/orders` - Order status broadcasts
  - `/topic/outlet/{outletId}/kitchen` - Kitchen KOT updates
  - `/topic/outlet/{outletId}/tables` - Table status transitions
