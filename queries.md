
Auth.js

-- Check if user exists by email
SELECT * FROM users WHERE email = ?

-- Insert new user during signup
INSERT INTO users (id, user_name, email, password, role, imageURL) VALUES (?, ?, ?, ?, ?, ?)

-- Insert new OTP record
INSERT INTO otps (user_id, otp) VALUES (?, ?)

-- Expire old OTPs for a user
UPDATE otps SET is_used = TRUE WHERE user_id = ? AND expires_at < NOW() AND is_used = FALSE

-- Check for valid unexpired OTP
SELECT * FROM otps WHERE user_id = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1

-- Mark specific OTP as used
UPDATE otps SET is_used = TRUE WHERE id = ?

-- Update user verification status
UPDATE users SET is_verified = 1 WHERE id = ?

-- Get user details after verification
SELECT id, user_name, email, imageURL, is_verified, role FROM users WHERE id = ?

-- Get full user details (used in signin)
SELECT * FROM users WHERE email = ?





googleAuthController.js 

-- Check if user exists by email
SELECT * FROM users WHERE email = ?

-- Update user's profile image URL
UPDATE users SET imageURL = ? WHERE id = ?

-- Insert new user with Google authentication
INSERT INTO users (id, user_name, email, password, imageURL, is_verified, role, auth_type) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?)

-- Get specific user fields for token verification
SELECT id, user_name, email, role, is_verified, imageURL, auth_type FROM users WHERE id = ?






 menuController.js 

 -- Insert new menu item for a shop
INSERT INTO menu_items (item_id, shop_id, name, description, price) VALUES (?, ?, ?, ?, ?)

-- Update existing menu item details
UPDATE menu_items SET name = ?, description = ?, price = ? WHERE shop_id = ? AND item_id = ?

-- Delete a specific menu item from a shop
DELETE FROM menu_items WHERE item_id = ? AND shop_id = ?

-- Get a specific menu item details
SELECT * FROM menu_items WHERE item_id = ? AND shop_id = ?

-- Get all menu items for a specific shop
SELECT * FROM menu_items WHERE shop_id = ?

-- Get all menu items across all shops with shop details
SELECT 
    mi.item_id,
    mi.name,
    mi.description,
    mi.price,
    s.name AS shop_name,
    s.id AS shop_id
FROM menu_items mi
JOIN shops s ON mi.shop_id = s.id






orderController.js
-- Check student's alert count before allowing order
SELECT alert_count FROM users WHERE id = ?

-- Get menu item details for price calculation
SELECT price, name FROM menu_items WHERE item_id = ? AND shop_id = ?

-- Create new order
INSERT INTO orders (order_id, user_id, shop_id, status, payment_status, total_price) VALUES (?, ?, ?, ?, ?, ?)

-- Insert order items
INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)

-- Verify order items with details
SELECT 
    oi.*,
    mi.name as item_name,
    mi.price as unit_price,
    (oi.quantity * mi.price) as expected_total
FROM order_items oi
JOIN menu_items mi ON oi.item_id = mi.item_id
WHERE oi.order_id = ?

-- Get order details with user information
SELECT o.*, u.user_name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.order_id = ?

-- Get order items with menu item details
SELECT oi.*, mi.name as item_name, mi.price
FROM order_items oi
JOIN menu_items mi ON oi.item_id = mi.item_id
WHERE oi.order_id = ?

-- Get order details for specific user
SELECT * FROM orders WHERE order_id = ? AND user_id = ?

-- Get all orders for a user
SELECT * FROM orders WHERE user_id = ?

-- Get basic order information
SELECT * FROM orders WHERE order_id = ?

-- Delete order items (for rejected orders)
DELETE FROM order_items WHERE order_id = ?

-- Update order status
UPDATE orders SET status = ? WHERE order_id = ?

-- Update shop's total revenue
UPDATE shops SET total_revenue = total_revenue + ? WHERE id = ?

-- Get shop ID for owner
SELECT id FROM shops WHERE owner_id = ?

-- Get all orders for a shop with user details
SELECT o.*, u.user_name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.shop_id = ?
ORDER BY o.created_at DESC

-- Get order status for specific shop
SELECT * FROM orders WHERE id = ? AND shop_id = ?

-- Get payment information with order details
SELECT 
    p.payment_id,
    p.order_id,
    p.user_id,
    p.shop_id,
    p.amount,
    p.payment_method,
    p.payment_screenshot_url,
    p.verification_status,
    p.created_at,
    p.updated_at,
    o.status AS order_status,
    o.payment_status AS order_payment_status,
    o.total_price AS order_total_price
FROM payments p
JOIN orders o ON p.order_id = o.order_id
WHERE p.order_id = ?








 paymentController.js 

 -- Check student's alert count before allowing payment
SELECT alert_count FROM users WHERE id = ?

-- Get menu item details for price verification
SELECT price, name FROM menu_items WHERE item_id = ? AND shop_id = ?

-- Create new order
INSERT INTO orders (order_id, user_id, shop_id, total_price, status, payment_status) 
VALUES (?, ?, ?, ?, ?, ?)

-- Insert order items
INSERT INTO order_items (order_id, item_id, quantity, price) 
VALUES (?, ?, ?, ?)

-- Create payment record
INSERT INTO payments (payment_id, order_id, user_id, shop_id, amount, payment_method, payment_screenshot_url, verification_status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?)

-- Verify order items with menu item details
SELECT oi.*, mi.name as item_name
FROM order_items oi
JOIN menu_items mi ON oi.item_id = mi.item_id
WHERE oi.order_id = ?

-- Update payment with Gemini API analysis
UPDATE payments SET gemini_response = ? WHERE payment_id = ?

-- Update order status and payment status
UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?

-- Update payment verification status
UPDATE payments SET verification_status = ? WHERE payment_id = ?

-- Get shop payment details with owner info
SELECT sc.*, u.email as owner_email
FROM shop_contacts sc
JOIN shops s ON sc.shop_id = s.id
JOIN users u ON s.owner_id = u.id
WHERE sc.shop_id = ?

-- Get detailed payment information with customer and order details
SELECT 
    u.user_name as customer_name,
    u.role,
    o.order_id,
    o.total_price,
    p.payment_method,
    p.payment_screenshot_url,
    p.gemini_response,
    p.verification_status,
    o.status as order_status,
    o.created_at as order_date
FROM 
    payments p
    INNER JOIN orders o ON p.order_id = o.order_id
    INNER JOIN users u ON p.user_id = u.id
WHERE 
    p.payment_id = ?

-- Get payment details for status update
SELECT payment_id, verification_status, order_id, shop_id 
FROM payments 
WHERE payment_id = ?

-- Update payment status with timestamp
UPDATE payments 
SET verification_status = ?, updated_at = CURRENT_TIMESTAMP
WHERE payment_id = ?

-- Update order status and payment status with timestamp
UPDATE orders 
SET payment_status = ?, status = ?, updated_at = CURRENT_TIMESTAMP
WHERE order_id = ?

-- Get updated payment details with order and shop info
SELECT 
    p.*,
    o.status as order_status,
    s.total_revenue as shop_revenue
FROM payments p
JOIN orders o ON p.order_id = o.order_id
JOIN shops s ON p.shop_id = s.id
WHERE p.payment_id = ?





shopController.js

-- Check if owner already has a shop
SELECT * FROM shops WHERE owner_id = ?

-- Create new shop
INSERT INTO shops (id, owner_id, name, description, image_url) 
VALUES (?, ?, ?, ?, ?)

-- Create shop contact information
INSERT INTO shop_contacts (shop_id, email, contact_number, full_name, account_title, payment_method, payment_details, is_primary) 
VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)

-- Get shop details by ID and owner
SELECT * FROM shops WHERE id = ? AND owner_id = ?

-- Get primary contact details for a shop
SELECT * FROM shop_contacts WHERE shop_id = ? AND is_primary = TRUE

-- Update shop details
UPDATE shops 
SET name = ?, description = ?, image_url = ? 
WHERE id = ? AND owner_id = ?

-- Update shop contact information
UPDATE shop_contacts 
SET email = ?, contact_number = ?, full_name = ?, payment_method = ?, payment_details = ? 
WHERE shop_id = ? AND is_primary = TRUE

-- Get shop contact details for dashboard
SELECT email, contact_number, full_name, account_title, payment_method, payment_details 
FROM shop_contacts 
WHERE shop_id = ? AND is_primary = TRUE

-- Check user role
SELECT role FROM users WHERE id = ?

-- Get owner's shops with contact details
SELECT s.id, s.name, sc.email, sc.contact_number 
FROM shops s 
LEFT JOIN shop_contacts sc ON s.id = sc.shop_id AND sc.is_primary = TRUE 
WHERE s.owner_id = ?

-- Get all shops with contact details
SELECT s.id, s.name, s.description, s.image_url, sc.email, sc.contact_number 
FROM shops s
LEFT JOIN shop_contacts sc ON s.id = sc.shop_id AND sc.is_primary = TRUE





userController.js

-- Get user profile details (excluding sensitive info)
SELECT id, user_name, email, imageURL, is_verified, role, alert_count, created_at 
FROM users 
WHERE id = ?

-- Update user profile information
UPDATE users 
SET user_name = ?, email = ?, imageURL = ? 
WHERE id = ?

-- Get user's password for verification
SELECT password FROM users WHERE id = ?

-- Update user's password
UPDATE users SET password = ? WHERE id = ?





shopUtils.js

-- Get shop details with statistics
SELECT s.*, ss.*
FROM shops s
JOIN shop_statistics ss ON s.id = ss.shop_id
WHERE s.id = ?

-- Check if shop exists
SELECT id FROM shops WHERE id = ?

-- Debug query to check order items status
SELECT oi.item_id, oi.quantity, o.status, p.verification_status
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN payments p ON o.order_id = p.order_id
WHERE o.shop_id = ?

-- Get top selling items with sales data
SELECT 
    mi.item_id, 
    mi.name, 
    mi.price as unit_price,
    SUM(oi.quantity) as total_quantity_sold
FROM menu_items mi
INNER JOIN order_items oi ON mi.item_id = oi.item_id
INNER JOIN orders o ON oi.order_id = o.order_id
INNER JOIN payments p ON o.order_id = p.order_id
WHERE mi.shop_id = ?
AND o.status = 'delivered'
AND p.verification_status = 'verified'
GROUP BY mi.item_id, mi.name, mi.price
ORDER BY total_quantity_sold DESC
LIMIT ?

-- Get menu items when no sales data exists
SELECT 
    item_id,
    name,
    price as unit_price,
    0 as total_quantity_sold
FROM menu_items
WHERE shop_id = ?
LIMIT ?

-- Get recent orders with customer details
SELECT o.order_id, o.total_price, o.status, o.created_at,
       u.id as user_id, u.user_name, u.email, u.role
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.shop_id = ?
ORDER BY o.created_at DESC
LIMIT ?

-- Get revenue over time with date filtering
SELECT 
    DATE(o.created_at) as date, 
    SUM(o.total_price) as daily_revenue
FROM orders o
JOIN payments p ON o.order_id = p.order_id
WHERE o.shop_id = ? 
AND o.status = 'delivered' 
AND p.verification_status = 'verified'
${dateFilter}
GROUP BY DATE(o.created_at)
ORDER BY date

-- Get customer insights and spending patterns
SELECT 
    u.id as user_id,
    u.user_name,
    COUNT(DISTINCT o.order_id) as order_count,
    SUM(o.total_price) as total_spent,
    AVG(o.total_price) as average_order_value,
    MAX(o.created_at) as last_order_date
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN payments p ON o.order_id = p.order_id
WHERE o.shop_id = ? 
AND o.status = 'delivered'
AND p.verification_status = 'verified'
GROUP BY u.id, u.user_name
ORDER BY total_spent DESC
LIMIT 10

-- Get total revenue for a shop
SELECT COALESCE(SUM(o.total_price), 0) as total_revenue
FROM orders o
JOIN payments p ON o.order_id = p.order_id
WHERE o.shop_id = ? 
AND o.status = 'delivered'
AND p.verification_status = 'verified'

-- Debug: Get all menu items for a shop
SELECT item_id, name, price 
FROM menu_items 
WHERE shop_id = ?

-- Debug: Get all orders for a shop
SELECT o.order_id, o.status, o.created_at
FROM orders o
WHERE o.shop_id = ?

-- Debug: Get order items with shop association
SELECT oi.*, o.shop_id
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.shop_id = ?

-- Debug: Get payments for a shop
SELECT p.payment_id, p.order_id, p.verification_status
FROM payments p
WHERE p.shop_id = ?

-- Debug: Direct check of order items
SELECT * FROM order_items 
WHERE order_id IN (
    SELECT order_id FROM orders WHERE shop_id = ?
)


Transactions:

// Inside createOrder function
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
    // Transaction operations:
    // 1. Check user's alert count
    // 2. Calculate total price
    // 3. Insert into orders table
    // 4. Insert into order_items table
    
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}

// Inside updateOrderStatus function
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
    // Transaction operations:
    // 1. Check order existence
    // 2. Delete order items (if status is 'rejected')
    // 3. Update order status
    // 4. Update shop's total revenue (if status is 'delivered' or 'pickedup')
    // 5. Increment user's alert count (if status is 'discarded')
    
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}

//inside verifyPaymentAndCreateOrder funtion
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
    // Transaction operations:
    // 1. Check user's alert count for students
    // 2. Calculate total price and verify items
    // 3. Create order in orders table
    // 4. Insert items into order_items table
    // 5. Create payment record in payments table
    // 6. Process Gemini API analysis
    // 7. Update payment record with Gemini analysis
    // 8. Update order and payment status
    
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}


//inside updatePaymentStatus function
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
    // Transaction operations:
    // 1. Update payment status in payments table
    // 2. Update corresponding order status in orders table
    
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}


//insode createShop function

connection = await pool.getConnection();
wait connection.beginTransaction();
try {
   // Transaction operations:
   // 1. Insert into shops table
    // 2. Insert into shop_contacts table
    await connection.commit();
 catch (error) {
   await connection.rollback();
   throw error;
 finally {
   connection.release();
 }
 }
}


insode updateShop funtion

const connection = await pool.getConnection();
wait connection.beginTransaction();
try {
   // Transaction operations:
   // 1. Update shops table
    // 2. Update shop_contacts table
    await connection.commit();
 catch (error) {
   await connection.rollback();
   throw error;
 }
}

