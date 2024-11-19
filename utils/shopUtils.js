import pool from '../config/database.js';

const getShopDetailsWithStats = async (shopId) => {
    const [rows] = await pool.execute(`
        SELECT s.*, ss.*
        FROM shops s
        JOIN shop_statistics ss ON s.id = ss.shop_id
        WHERE s.id = ?
    `, [shopId]);

    return rows[0];
};


const getTopSellingItems = async (shopId, limit = 5, metric = 'quantity') => {
    try {
        // First, check if the shop exists
        const [shopRows] = await pool.execute('SELECT id FROM shops WHERE id = ?', [shopId]);
        if (shopRows.length === 0) {
            return { error: 'Shop not found', items: [] };
        }

        // Add this debug query at the start of getTopSellingItems
        const [orderItemsCheck] = await pool.execute(`
            SELECT oi.item_id, oi.quantity, o.status, p.verification_status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN payments p ON o.order_id = p.order_id
            WHERE o.shop_id = ?
        `, [shopId]);

        console.log('Debug - Order Items Check:', orderItemsCheck);

        // Get all sales data with item details - using INNER JOINs for actual sales
        const [salesData] = await pool.execute(`
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
        `, [shopId, limit.toString()]);

        // If no sales data, get menu items with zero sales
        if (salesData.length === 0) {
            const [menuItems] = await pool.execute(`
                SELECT 
                    item_id,
                    name,
                    price as unit_price,
                    0 as total_quantity_sold
                FROM menu_items
                WHERE shop_id = ?
                LIMIT ?
            `, [shopId, limit.toString()]);

            console.log('\n=== Top Selling Items Report ===');
            console.log('No sales data available yet.');
            console.log('Available menu items:');
            menuItems.forEach(item => {
                console.log(`Item: ${item.name}`);
                console.log(`Unit Price: $${item.unit_price}`);
                console.log('------------------------');
            });
            console.log('==============================\n');

            return { 
                items: menuItems,
                metric: metric === 'revenue' ? 'Total Revenue' : 'Total Quantity Sold'
            };
        }

        // Log detailed sales information
        console.log('\n=== Top Selling Items Report ===');
        salesData.forEach(item => {
            console.log(`Item: ${item.name}`);
            console.log(`Total Quantity Sold: ${item.total_quantity_sold}`);
            console.log(`Unit Price: $${item.unit_price}`);
            console.log(`Total Revenue: $${item.total_quantity_sold * item.unit_price}`);
            console.log('------------------------');
        });
        console.log('==============================\n');

        return { 
            items: salesData,
            metric: metric === 'revenue' ? 'Total Revenue' : 'Total Quantity Sold'
        };
    } catch (error) {
        console.error('Error in getTopSellingItems:', error);
        throw error;
    }
};

const getRecentOrdersWithDetails = async (shopId, limit = 10) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.order_id, o.total_price, o.status, o.created_at,
                   u.id as user_id, u.user_name, u.email, u.role
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.shop_id = ?
            ORDER BY o.created_at DESC
            LIMIT ?
        `, [shopId, limit.toString()]);

        return rows;
    } catch (error) {
        console.error('Error in getRecentOrdersWithDetails:', error);
        throw error;
    }
};
const getRevenueOverTime = async (shopId, period = 'last_30_days') => {
    let dateFilter;
    switch (period) {
        case 'last_7_days':
            dateFilter = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
            break;
        case 'last_30_days':
            dateFilter = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
            break;
        case 'last_year':
            dateFilter = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
            break;
        default:
            dateFilter = '';
    }

    const [rows] = await pool.execute(`
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
    `, [shopId]);

    return rows;
};
const getCustomerInsights = async (shopId) => {
    const [rows] = await pool.execute(`
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
    `, [shopId]);

    return rows;
};

const getRevenue = async (shopId) => {
    const [rows] = await pool.execute(`
        SELECT COALESCE(SUM(o.total_price), 0) as total_revenue
        FROM orders o
        JOIN payments p ON o.order_id = p.order_id
        WHERE o.shop_id = ? 
        AND o.status = 'delivered'
        AND p.verification_status = 'verified'
    `, [shopId]);

    return rows[0].total_revenue;
}

// Update the debugItemSales function to be more comprehensive
const debugItemSales = async (shopId) => {
    let orders = [], orderItems = [], payments = [], menuItems = [];
    try {
        // 1. Check menu items
        [menuItems] = await pool.execute(`
            SELECT item_id, name, price 
            FROM menu_items 
            WHERE shop_id = ?
        `, [shopId]);
        console.log('1. Available menu items:', menuItems);

        // 2. Check orders for this shop
        [orders] = await pool.execute(`
            SELECT o.order_id, o.status, o.created_at
            FROM orders o
            WHERE o.shop_id = ?
        `, [shopId]);
        console.log('2. Orders for shop:', orders);

        // 3. Check order items (modified query to debug)
        [orderItems] = await pool.execute(`
            SELECT oi.*, o.shop_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.shop_id = ?
        `, [shopId]);
        console.log('3. Order items:', orderItems);

        // 4. Check payments
        [payments] = await pool.execute(`
            SELECT p.payment_id, p.order_id, p.verification_status
            FROM payments p
            WHERE p.shop_id = ?
        `, [shopId]);
        console.log('4. Payments:', payments);

        // Additional debug query to check order_items table directly
        const [directOrderItems] = await pool.execute(`
            SELECT * FROM order_items WHERE order_id IN (
                SELECT order_id FROM orders WHERE shop_id = ?
            )
        `, [shopId]);
        console.log('5. Direct order items check:', directOrderItems);

        return {
            menuItemsCount: menuItems.length,
            ordersCount: orders.length,
            orderItemsCount: orderItems.length,
            paymentsCount: payments.length,
            orderIds: orders.map(o => o.order_id),
            directOrderItemsCount: directOrderItems.length
        };
    } catch (error) {
        console.error('Error in debugItemSales:', error);
        throw error;
    }
};

export { 
    getShopDetailsWithStats, 
    getTopSellingItems, 
    getRecentOrdersWithDetails, 
    getRevenueOverTime, 
    getCustomerInsights, 
    getRevenue,
    debugItemSales  // Export the debug function
};