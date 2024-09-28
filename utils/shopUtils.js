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
        SELECT DATE(o.created_at) as date, SUM(o.total_price) as daily_revenue
        FROM orders o
        WHERE o.shop_id = ? AND o.status = 'delivered' ${dateFilter}
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
        WHERE o.shop_id = ? AND o.status = 'delivered'
        GROUP BY u.id, u.user_name
        ORDER BY total_spent DESC
        LIMIT 10
    `, [shopId]);

    return rows;
};
  
  export { getShopDetailsWithStats, getTopSellingItems, getRecentOrdersWithDetails, getRevenueOverTime, getCustomerInsights };