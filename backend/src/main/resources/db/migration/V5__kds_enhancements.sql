-- ==============================================================================
-- RESTOMASTER POS: Flyway Database Migration V5
-- Description: KOT & Kitchen Display System (KDS) Enhancements
-- ==============================================================================

-- 1. Enhance kots table
ALTER TABLE kots ADD COLUMN IF NOT EXISTS outlet_id VARCHAR(36) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE kots ADD COLUMN IF NOT EXISTS station VARCHAR(50) DEFAULT 'MAIN_KITCHEN';
ALTER TABLE kots ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'DINE_IN';
ALTER TABLE kots ADD COLUMN IF NOT EXISTS server_name VARCHAR(100);
ALTER TABLE kots ADD COLUMN IF NOT EXISTS round_number INT DEFAULT 1;

-- 2. Enhance kot_items table
ALTER TABLE kot_items ADD COLUMN IF NOT EXISTS order_item_id VARCHAR(36) REFERENCES order_items(id) ON DELETE SET NULL;
ALTER TABLE kot_items ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE kot_items ADD COLUMN IF NOT EXISTS modifiers_summary TEXT;
ALTER TABLE kot_items ADD COLUMN IF NOT EXISTS kitchen_station VARCHAR(50) DEFAULT 'MAIN_KITCHEN';

-- 3. Enhance menu_categories for station routing
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS kitchen_station VARCHAR(50) DEFAULT 'MAIN_KITCHEN';

-- 4. High-performance indexes for KDS feed queries
CREATE INDEX IF NOT EXISTS idx_kots_outlet_status ON kots(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_kots_station_status ON kots(station, status);
CREATE INDEX IF NOT EXISTS idx_kots_order ON kots(order_id);
CREATE INDEX IF NOT EXISTS idx_kot_items_kot ON kot_items(kot_id);
