-- Initial Seed Reference for Database
-- Password for all seed users is Admin@123 / Cashier@123 / Kitchen@123 (BCrypt hash)

INSERT INTO roles (id, name, description) VALUES
('r-1', 'ADMIN', 'Full access to all modules and configurations'),
('r-2', 'MANAGER', 'Restaurant manager with operational and reporting access'),
('r-3', 'CASHIER', 'POS register and billing access'),
('r-4', 'WAITER', 'Order placement and table status management'),
('r-5', 'KITCHEN', 'Kitchen display system access'),
('r-6', 'INVENTORY', 'Stock, purchase, and recipe management')
ON CONFLICT (name) DO NOTHING;
