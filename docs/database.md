# Database Architecture & Migrations

## 1. Engine & Migration Strategy
- **Engine**: PostgreSQL 16
- **Migration Framework**: Flyway
- **Location**: `backend/src/main/resources/db/migration/`

## 2. Table Dependency Hierarchy
```
roles + permissions -> role_permissions
outlets -> floors -> restaurant_tables
outlets + roles -> users -> user_roles
outlets -> menu_categories -> menu_items
outlets -> inventory_units -> inventory_items
menu_items + inventory_items -> recipes -> recipe_items
outlets + restaurant_tables + users -> orders -> order_items
orders + restaurant_tables -> kots -> kot_items
orders -> invoices -> invoice_items
invoices -> payments -> payment_transactions
payments -> refunds
inventory_items + users -> inventory_transactions
```

## 3. High-Traffic Indexes
- `idx_orders_outlet_status` on `orders(outlet_id, status)`
- `idx_tables_floor_status` on `restaurant_tables(floor_id, status)`
- `idx_menu_items_category` on `menu_items(category_id, is_available)`
- `idx_inv_tx_item` on `inventory_transactions(inventory_item_id, created_at)`
