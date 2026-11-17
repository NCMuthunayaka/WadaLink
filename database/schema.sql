-- ============================================================
-- WedaLink Database Schema: Module 3 - Equipment Rental
-- ============================================================

-- Users table (minimal reference schema for foreign keys)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Equipment table: Provider listings for tools, gear, and machinery
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price_per_day DECIMAL(10, 2) NOT NULL,
    deposit DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    delivery_radius INT DEFAULT 0,
    status ENUM('available', 'reserved', 'in_rent', 'return_pending', 'maintenance') NOT NULL DEFAULT 'available',
    tags JSON,
    pickup_location VARCHAR(255),
    return_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipment_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_equipment_status (status),
    INDEX idx_equipment_category (category),
    INDEX idx_equipment_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Equipment Reservations table: Customer bookings and lifecycle transitions
CREATE TABLE IF NOT EXISTS equipment_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    renter_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    total_days INT NOT NULL,
    daily_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    hold_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'reserved', 'in_rent', 'return_pending', 'returned', 'cancelled') NOT NULL DEFAULT 'reserved',
    pickup_location VARCHAR(255),
    return_location VARCHAR(255),
    payment_cleared BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_renter FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reservation_equipment_dates (equipment_id, start_date, end_date),
    INDEX idx_reservation_status (status),
    INDEX idx_reservation_renter (renter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Seed Data for testing & demo
INSERT INTO users (id, name, email, phone, role) VALUES
(1, 'Marcus Rodriguez', 'marcus@wedalink.test', '+1 555-0199', 'provider'),
(2, 'Sparkline Electrical', 'sparkline@wedalink.test', '+1 555-0101', 'customer')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO equipment (id, owner_id, name, category, description, image_url, price_per_day, deposit, delivery_fee, delivery_radius, status, tags, pickup_location, return_location) VALUES
(1, 1, 'FLIR E8-XT Thermal Camera', 'Diagnostic & Inspection', 'Handheld thermal imaging camera with MSX technology.', 'https://images.unsplash.com/photo-1635002962399-9e6c2e6e6e6e?w=400', 45.00, 150.00, 0.00, 0, 'reserved', '[]', 'Downtown Austin', 'Downtown Austin'),
(2, 1, 'Greenlee 555 Conduit Bender', 'Heavy Electrical Tools', 'Kit includes 1/2" to 2" rigid & EMT shoes. Locking storage crate + remote foot control pendant.', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400', 65.00, 200.00, 0.00, 0, 'available', '["Ready", "2-day min"]', 'East Austin Depot', 'East Austin Depot'),
(3, 1, 'CAT 301.5 Mini Excavator', 'Heavy Machinery • Trench Bucket', '1.5-ton compact excavator with rubber tracks and quick-coupler bucket.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 185.00, 500.00, 40.00, 15, 'available', '["Trailer option"]', 'North Yard Austin', 'North Yard Austin'),
(4, 1, 'Southwire Maxis 3K Cable Puller', 'Conduit Pulling Rig', 'High-speed cable puller, dual-capstan design.', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400', 55.00, 180.00, 0.00, 0, 'return_pending', '[]', 'East Austin Lockbox', 'East Austin Lockbox')
ON DUPLICATE KEY UPDATE name=VALUES(name);
