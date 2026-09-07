-- ==============================================================================
-- RESTOMASTER POS: Flyway Database Migration V3
-- Description: Menu Modifiers, Groups, and Item Associations
-- ==============================================================================

CREATE TABLE IF NOT EXISTS modifier_groups (
    id VARCHAR(36) PRIMARY KEY,
    outlet_id VARCHAR(36) REFERENCES outlets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    min_selection INT NOT NULL DEFAULT 0,
    max_selection INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modifiers (
    id VARCHAR(36) PRIMARY KEY,
    modifier_group_id VARCHAR(36) NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    menu_item_id VARCHAR(36) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_group_id VARCHAR(36) NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, modifier_group_id)
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_outlet ON modifier_groups(outlet_id);
CREATE INDEX IF NOT EXISTS idx_modifiers_group ON modifiers(modifier_group_id);
