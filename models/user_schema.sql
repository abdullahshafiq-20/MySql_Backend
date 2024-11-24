-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    imageURL VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'student',
    auth_type VARCHAR(255) NOT NULL DEFAULT 'manual',
    alert_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



-- Otp Table
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    otp VARCHAR(6) NOT NULL,
    user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL 5 MINUTE),
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shops table (modified)
CREATE TABLE shops (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    total_revenue DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- New Shop Contacts table
CREATE TABLE shop_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id VARCHAR(36) NOT NULL,
    email VARCHAR(255),
    contact_number VARCHAR(20),
    full_name VARCHAR(255),
    account_title VARCHAR(255),
    payment_method ENUM('jazzcash', 'easypaisa', 'sadapay', 'nayapay') NOT NULL,
    payment_details VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- Menu Items table
CREATE TABLE menu_items (
    item_id VARCHAR(36) PRIMARY KEY,
    shop_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- Orders table
CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    shop_id VARCHAR(36) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'preparing', 'accepted', 'rejected', 'delivered', 'discarded') DEFAULT 'pending',
    payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- Order Items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);


CREATE TABLE payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    shop_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('jazzcash', 'easypaisa', 'sadapay', 'nayapay') NOT NULL,
    payment_screenshot_url VARCHAR(255) NOT NULL,
    gemini_response JSON,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
    );



-- Shop Statistics view
CREATE OR REPLACE VIEW shop_statistics AS
SELECT 
    s.id AS shop_id,
    s.name AS shop_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT mi.item_id) AS total_menu_items,
    AVG(o.total_price) AS average_order_value,
    SUM(CASE WHEN o.status = 'delivered' THEN o.total_price ELSE 0 END) AS total_revenue
FROM 
    shops s
LEFT JOIN 
    orders o ON s.id = o.shop_id
LEFT JOIN 
    menu_items mi ON s.id = mi.shop_id
GROUP BY 
    s.id, s.name;




-- Create Audit Log Tables
CREATE TABLE user_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    old_data JSON,
    new_data JSON,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    shop_id VARCHAR(36) NOT NULL,
    old_data JSON,
    new_data JSON,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    shop_id VARCHAR(36) NOT NULL,
    old_data JSON,
    new_data JSON,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    old_data JSON,
    new_data JSON,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    payment_id VARCHAR(36) NOT NULL,
    old_data JSON,
    new_data JSON,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Triggers for Users
DELIMITER //

CREATE TRIGGER before_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_audit_logs (action_type, user_id, new_data, changed_by)
    VALUES ('INSERT', NEW.id, 
        JSON_OBJECT(
            'user_name', NEW.user_name,
            'email', NEW.email,
            'role', NEW.role,
            'auth_type', NEW.auth_type,
            'is_verified', NEW.is_verified
        ),
        CURRENT_USER());
END//

CREATE TRIGGER before_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_audit_logs (action_type, user_id, old_data, new_data, changed_by)
    VALUES ('UPDATE', NEW.id,
        JSON_OBJECT(
            'user_name', OLD.user_name,
            'email', OLD.email,
            'role', OLD.role,
            'auth_type', OLD.auth_type,
            'is_verified', OLD.is_verified
        ),
        JSON_OBJECT(
            'user_name', NEW.user_name,
            'email', NEW.email,
            'role', NEW.role,
            'auth_type', NEW.auth_type,
            'is_verified', NEW.is_verified
        ),
        CURRENT_USER());
END//

CREATE TRIGGER before_user_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_audit_logs (action_type, user_id, old_data, changed_by)
    VALUES ('DELETE', OLD.id,
        JSON_OBJECT(
            'user_name', OLD.user_name,
            'email', OLD.email,
            'role', OLD.role,
            'auth_type', OLD.auth_type,
            'is_verified', OLD.is_verified
        ),
        CURRENT_USER());
END//

-- Create Triggers for Shops
CREATE TRIGGER after_shop_insert
AFTER INSERT ON shops
FOR EACH ROW
BEGIN
    INSERT INTO shop_audit_logs (action_type, shop_id, new_data, changed_by)
    VALUES ('INSERT', NEW.id,
        JSON_OBJECT(
            'name', NEW.name,
            'owner_id', NEW.owner_id,
            'description', NEW.description,
            'total_revenue', NEW.total_revenue
        ),
        CURRENT_USER());
END//

CREATE TRIGGER after_shop_update
AFTER UPDATE ON shops
FOR EACH ROW
BEGIN
    INSERT INTO shop_audit_logs (action_type, shop_id, old_data, new_data, changed_by)
    VALUES ('UPDATE', NEW.id,
        JSON_OBJECT(
            'name', OLD.name,
            'owner_id', OLD.owner_id,
            'description', OLD.description,
            'total_revenue', OLD.total_revenue
        ),
        JSON_OBJECT(
            'name', NEW.name,
            'owner_id', NEW.owner_id,
            'description', NEW.description,
            'total_revenue', NEW.total_revenue
        ),
        CURRENT_USER());
END//

CREATE TRIGGER before_shop_delete
BEFORE DELETE ON shops
FOR EACH ROW
BEGIN
    INSERT INTO shop_audit_logs (action_type, shop_id, old_data, changed_by)
    VALUES ('DELETE', OLD.id,
        JSON_OBJECT(
            'name', OLD.name,
            'owner_id', OLD.owner_id,
            'description', OLD.description,
            'total_revenue', OLD.total_revenue
        ),
        CURRENT_USER());
END//

-- Create Triggers for Menu Items
CREATE TRIGGER after_menu_insert
AFTER INSERT ON menu_items
FOR EACH ROW
BEGIN
    INSERT INTO menu_audit_logs (action_type, item_id, shop_id, new_data, changed_by)
    VALUES ('INSERT', NEW.item_id, NEW.shop_id,
        JSON_OBJECT(
            'name', NEW.name,
            'description', NEW.description,
            'price', NEW.price
        ),
        CURRENT_USER());
END//

CREATE TRIGGER after_menu_update
AFTER UPDATE ON menu_items
FOR EACH ROW
BEGIN
    INSERT INTO menu_audit_logs (action_type, item_id, shop_id, old_data, new_data, changed_by)
    VALUES ('UPDATE', NEW.item_id, NEW.shop_id,
        JSON_OBJECT(
            'name', OLD.name,
            'description', OLD.description,
            'price', OLD.price
        ),
        JSON_OBJECT(
            'name', NEW.name,
            'description', NEW.description,
            'price', NEW.price
        ),
        CURRENT_USER());
END//

CREATE TRIGGER before_menu_delete
BEFORE DELETE ON menu_items
FOR EACH ROW
BEGIN
    INSERT INTO menu_audit_logs (action_type, item_id, shop_id, old_data, changed_by)
    VALUES ('DELETE', OLD.item_id, OLD.shop_id,
        JSON_OBJECT(
            'name', OLD.name,
            'description', OLD.description,
            'price', OLD.price
        ),
        CURRENT_USER());
END//

-- Create Triggers for Orders
CREATE TRIGGER after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_audit_logs (action_type, order_id, new_data, changed_by)
    VALUES ('INSERT', NEW.order_id,
        JSON_OBJECT(
            'user_id', NEW.user_id,
            'shop_id', NEW.shop_id,
            'total_price', NEW.total_price,
            'status', NEW.status,
            'payment_status', NEW.payment_status
        ),
        CURRENT_USER());
END//

CREATE TRIGGER after_order_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_audit_logs (action_type, order_id, old_data, new_data, changed_by)
    VALUES ('UPDATE', NEW.order_id,
        JSON_OBJECT(
            'user_id', OLD.user_id,
            'shop_id', OLD.shop_id,
            'total_price', OLD.total_price,
            'status', OLD.status,
            'payment_status', OLD.payment_status
        ),
        JSON_OBJECT(
            'user_id', NEW.user_id,
            'shop_id', NEW.shop_id,
            'total_price', NEW.total_price,
            'status', NEW.status,
            'payment_status', NEW.payment_status
        ),
        CURRENT_USER());
END//

CREATE TRIGGER before_order_delete
BEFORE DELETE ON orders
FOR EACH ROW
BEGIN
    DELETE FROM payments WHERE order_id = OLD.order_id;
    DELETE FROM order_items WHERE order_id = OLD.order_id;
    
    INSERT INTO order_audit_logs (action_type, order_id, old_data, changed_by)
    VALUES ('DELETE', OLD.order_id,
        JSON_OBJECT(
            'user_id', OLD.user_id,
            'shop_id', OLD.shop_id,
            'total_price', OLD.total_price,
            'status', OLD.status,
            'payment_status', OLD.payment_status
        ),
        CURRENT_USER());
END//

-- Create Triggers for Payments
CREATE TRIGGER after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    INSERT INTO payment_audit_logs (action_type, payment_id, new_data, changed_by)
    VALUES ('INSERT', NEW.payment_id,
        JSON_OBJECT(
            'order_id', NEW.order_id,
            'user_id', NEW.user_id,
            'shop_id', NEW.shop_id,
            'amount', NEW.amount,
            'payment_method', NEW.payment_method,
            'verification_status', NEW.verification_status
        ),
        CURRENT_USER());
END//

CREATE TRIGGER after_payment_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    INSERT INTO payment_audit_logs (action_type, payment_id, old_data, new_data, changed_by)
    VALUES ('UPDATE', NEW.payment_id,
        JSON_OBJECT(
            'order_id', OLD.order_id,
            'user_id', OLD.user_id,
            'shop_id', OLD.shop_id,
            'amount', OLD.amount,
            'payment_method', OLD.payment_method,
            'verification_status', OLD.verification_status
        ),
        JSON_OBJECT(
            'order_id', NEW.order_id,
            'user_id', NEW.user_id,
            'shop_id', NEW.shop_id,
            'amount', NEW.amount,
            'payment_method', NEW.payment_method,
            'verification_status', NEW.verification_status
        ),
        CURRENT_USER());
END//

CREATE TRIGGER before_payment_delete
BEFORE DELETE ON payments
FOR EACH ROW
BEGIN
    INSERT INTO payment_audit_logs (action_type, payment_id, old_data, changed_by)
    VALUES ('DELETE', OLD.payment_id,
        JSON_OBJECT(
            'order_id', OLD.order_id,
            'user_id', OLD.user_id,
            'shop_id', OLD.shop_id,
            'amount', OLD.amount,
            'payment_method', OLD.payment_method,
            'verification_status', OLD.verification_status
        ),
        CURRENT_USER());
END//

DELIMITER ;

-- Create Warnings table (if not exists)
CREATE TABLE IF NOT EXISTS warnings (
    warning_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    warning_type ENUM('excessive_alerts') NOT NULL,
    warning_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Trigger to monitor student alert counts
DELIMITER //

CREATE TRIGGER check_student_alerts
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(50);
    DECLARE alert_count_val INT;
    
    -- Get user role and alert count
    SELECT role, alert_count INTO user_role, alert_count_val
    FROM users 
    WHERE id = NEW.user_id;
    
    -- If user is a student and alert count >= 3
    IF user_role = 'student' AND alert_count_val >= 3 THEN
        INSERT INTO warnings (user_id, warning_type, warning_message)
        VALUES (
            NEW.user_id,
            'excessive_alerts',
            CONCAT('Student has accumulated ', alert_count_val, ' alerts and may need administrative attention')
        );
    END IF;
    
    -- Increment alert_count for the student
    IF user_role = 'student' THEN
        UPDATE users 
        SET alert_count = alert_count + 1
        WHERE id = NEW.user_id;
    END IF;
END//

DELIMITER ;