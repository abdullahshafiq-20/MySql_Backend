import pool from '../config/database.js';

 const getShopDetailsWithStats = async (shopId) => {
    const [rows] = await pool.execute(`
        SELECT s.*, 
               (SELECT COUNT(*) FROM menu_items WHERE shop_id = s.id) as total_menu_items,
               (SELECT COUNT(*) FROM orders WHERE shop_id = s.id) as total_orders
        FROM shops s
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

        // Then, check if the shop has any menu items
        const [menuItemRows] = await pool.execute('SELECT item_id FROM menu_items WHERE shop_id = ? LIMIT 1', [shopId]);
        if (menuItemRows.length === 0) {
            return { message: 'No menu items found for this shop', items: [] };
        }

        // Determine the sorting metric
        let sortMetric, metricName;
        if (metric === 'revenue') {
            sortMetric = 'total_revenue';
            metricName = 'Total Revenue';
        } else {
            sortMetric = 'total_quantity_sold';
            metricName = 'Total Quantity Sold';
        }

        // Now, get the top selling items
        const [rows] = await pool.execute(`
            SELECT 
                mi.item_id, 
                mi.name, 
                COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
            FROM menu_items mi
            LEFT JOIN order_items oi ON mi.item_id = oi.item_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            WHERE mi.shop_id = ? AND (o.status = 'delivered' OR o.status IS NULL)
            GROUP BY mi.item_id, mi.name
            ORDER BY ${sortMetric} DESC
            LIMIT ?
        `, [shopId, limit.toString()]);

        if (rows.length === 0) {
            return { message: 'No sales data available for this shop', items: [] };
        }

        return { 
            items: rows,
            metric: metricName
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
  
  export { getShopDetailsWithStats, getTopSellingItems, getRecentOrdersWithDetails };