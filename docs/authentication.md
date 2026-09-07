# Authentication & RBAC Architecture

## 1. Authentication Flow
1. Client submits credentials to `POST /api/auth/login`.
2. Backend verifies credentials against BCrypt password hashes.
3. Upon success, backend produces:
   - `accessToken`: Short-lived JWT signed with HMAC-SHA256 containing `userId`, `username`, `roles`, `permissions`, and `outletId`.
   - `refreshToken`: Long-lived token for refreshing session.
   - `user`: Sanitized profile representation (passwords never exposed).
4. Client stores tokens in secure storage and sends `Authorization: Bearer <token>` on all requests.

## 2. Permissions Hierarchy
- `USER_VIEW`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
- `ROLE_VIEW`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`
- `OUTLET_VIEW`, `OUTLET_CREATE`, `OUTLET_UPDATE`
- `MENU_VIEW`, `MENU_CREATE`, `MENU_UPDATE`, `MENU_DELETE`
- `ORDER_VIEW`, `ORDER_CREATE`, `ORDER_UPDATE`, `ORDER_CANCEL`
- `KITCHEN_VIEW`, `KITCHEN_UPDATE`
- `BILL_VIEW`, `BILL_CREATE`
- `PAYMENT_CREATE`, `PAYMENT_REFUND`
- `INVENTORY_VIEW`, `INVENTORY_UPDATE`
- `REPORT_VIEW`, `REPORT_EXPORT`
- `SETTINGS_VIEW`, `SETTINGS_UPDATE`
