-- ==============================================================================
-- RESTOMASTER POS: Flyway Database Migration V4
-- Description: Order Modifiers, Item Status, and Order Enhancements
-- ==============================================================================

-- 1. Create order_item_modifiers table for modifier snapshotting
CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id VARCHAR(36) PRIMARY KEY,
    order_item_id VARCHAR(36) NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id VARCHAR(36) REFERENCES modifiers(id) ON DELETE SET NULL,
    modifier_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add guest_count to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_count INT DEFAULT 1;

-- 3. Add status to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- 4. Add is_veg to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_veg BOOLEAN DEFAULT TRUE;

-- 5. Indexes for fast table lookup and active order queries
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_item ON order_item_modifiers(order_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_status ON orders(table_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_outlet_created ON orders(outlet_id, created_at DESC);
