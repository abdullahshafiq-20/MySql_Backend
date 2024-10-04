import pool from '../config/database.js';
import {io } from '../app.js';
import  {generateOrderId}  from '../utils/generateId.js'; 
import { checkShopOwnership, incrementAlertCount } from '../utils/orderUtils.js';

export const createOrder = async (req, res) => {
    const { shop_id, items } = req.body;
    const user_role = req.user.role;
    const user_id = req.user.id;
    const order_id = generateOrderId();

    if (user_role !== 'student' && user_role !== 'teacher') {
        return res.status(403).json({ error: 'Only students and teachers can place orders' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Calculate total price before creating the order
            let total_price = 0;
            for (const item of items) {
                const [menuItemResult] = await connection.execute(
                    'SELECT price FROM menu_items WHERE item_id = ? AND shop_id = ?',
                    [item.item_id, shop_id]
                );

                if (menuItemResult.length === 0) {
                    throw new Error(`Menu item ${item.item_id} not found or does not belong to the shop`);
                }

                total_price += menuItemResult[0].price * item.quantity;
            }

            // Create the order with the calculated total_price
            await connection.execute(
                'INSERT INTO orders (order_id, user_id, shop_id, status, payment_status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
                [order_id, user_id, shop_id, 'pending', 'pending', total_price]
            );

            // Insert order items
            for (const item of items) {
                const [menuItemResult] = await connection.execute(
                    'SELECT price FROM menu_items WHERE item_id = ? AND shop_id = ?',
                    [item.item_id, shop_id]
                );

                const item_price = menuItemResult[0].price * item.quantity;

                await connection.execute(
                    'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [order_id, item.item_id, item.quantity, item_price]
                );
            }
            await connection.commit();

            const [orderDetails] = await connection.execute(
                `SELECT o.*, u.user_name, u.email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.order_id = ?`,
                [order_id]
              );
        
              const [orderItems] = await connection.execute(
                `SELECT oi.*, mi.name as item_name, mi.price
                 FROM order_items oi
                 JOIN menu_items mi ON oi.item_id = mi.item_id
                 WHERE oi.order_id = ?`,
                [order_id]
              );
              
              const fullOrderDetails = {
                ...orderDetails[0],
                items: orderItems
              };

              io.emit('newOrder', fullOrderDetails);

            res.status(201).json({
                message: 'Order created successfully',
                order_id,
                total_price,
                user_role,
                fullOrderDetails
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
};


  export const getOrderDetails = async (req, res) => {
    const { orderId } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;
  
    try {
      // Get order details
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
        [orderId, user_id]
      );
  
      if (orderRows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Get order items
      const [itemRows] = await pool.execute(
        `SELECT oi.*, mi.name as item_name 
         FROM order_items oi
         JOIN menu_items mi ON oi.item_id = mi.item_id
         WHERE oi.order_id = ?`,
        [orderId]
      );
  
      res.status(200).json({
        order: orderRows[0],
        items: itemRows,
        user_role
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get order details', message: error.message });
    }
  };
  
  export const listUserOrders = async (req, res) => {
    const user_id = req.user.id;
    
    try {
        const [orderRows] = await pool.execute(
            'SELECT * FROM orders WHERE user_id = ?',
            [user_id]
        );

        res.status(200).json({
            orders: orderRows,
            user_id: user_id
        });
    } catch (error) {
        console.error('List user orders error:', error);
        res.status(500).json({ 
            error: 'Failed to list user orders', 
            message: error.message,
            stack: error.stack,
            user_id: user_id
        });
    }
};


//update order status by the shop owner
//single order status check
export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;

    if (!['pending', 'accepted', 'delivered', 'discarded', 'rejected', 'preparing', 'ready', 'pickedup'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Get the order and check if it exists
            const [orderRows] = await connection.execute(
                'SELECT * FROM orders WHERE order_id = ?',
                [orderId]
            );

            if (orderRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: 'Order not found' });
            }

            const order = orderRows[0];

            // Check if the user is the owner of the shop
            const isOwner = await checkShopOwnership(ownerId, order.shop_id);
            if (!isOwner) {
                await connection.rollback();
                return res.status(403).json({ error: 'You are not authorized to update this order' });
            }

            // Update the order status
            await connection.execute(
                'UPDATE orders SET status = ? WHERE order_id = ?',
                [status, orderId]
            );

            // If the status is changed to "delivered", update the shop's total revenue
            if (status === 'delivered' || status === 'pickedup') {
                await connection.execute(
                    'UPDATE shops SET total_revenue = total_revenue + ? WHERE id = ?',
                    [order.total_price, order.shop_id]
                );
            }

            // If the status is changed to "discarded", increment the user's alert count
            if (status === 'discarded') {
                await incrementAlertCount(order.user_id);
            }

            await connection.commit();

            const [updatedOrderRows] = await connection.execute(
                `SELECT o.*, u.user_name, u.email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.order_id = ?`,
                [orderId]
            );

            const [orderItems] = await connection.execute(
                `SELECT oi.*, mi.name as item_name, mi.price
                 FROM order_items oi
                 JOIN menu_items mi ON oi.item_id = mi.item_id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            const fullUpdatedOrder = {
                ...updatedOrderRows[0],
                items: orderItems
            };

            io.emit('orderUpdate', fullUpdatedOrder);

            res.status(200).json({
                message: 'Order status updated successfully',
                orderId,
                newStatus: status,
                fullUpdatedOrder
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
};

export const listShopOrders = async (req, res) => {
    const shopOwnerId = req.user.id;
    
    try {
        const connection = await pool.getConnection();
        
        try {
            // First, get the shop_id for the shop owner
            const [shopRows] = await connection.execute(
                'SELECT id FROM shops WHERE owner_id = ?',
                [shopOwnerId]
            );

            if (shopRows.length === 0) {
                return res.status(404).json({ error: 'Shop not found for this owner' });
            }

            const shopId = shopRows[0].id;

            // Verify shop ownership
            const isOwner = await checkShopOwnership(shopOwnerId, shopId);
            if (!isOwner) {
                return res.status(403).json({ error: 'You are not authorized to view these orders' });
            }

            // Get all orders for this shop
            const [orderRows] = await connection.execute(
                `SELECT o.*, u.user_name, u.email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.shop_id = ?
                 ORDER BY o.created_at DESC`,
                [shopId]
            );

            // Get order items for each order
            const ordersWithItems = await Promise.all(orderRows.map(async (order) => {
                const [itemRows] = await connection.execute(
                    `SELECT oi.*, mi.name as item_name 
                     FROM order_items oi
                     JOIN menu_items mi ON oi.item_id = mi.item_id
                     WHERE oi.order_id = ?`,
                    [order.order_id]
                );
                return { ...order, items: itemRows };
            }));

            res.status(200).json({
                shop_id: shopId,
                orders: ordersWithItems
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('List shop orders error:', error);
        res.status(500).json({ 
            error: 'Failed to list shop orders', 
            message: error.message,
            stack: error.stack
        });
    }
};


  export const getOrderStatus = async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM orders WHERE id = ? AND shop_id = ?',
        [req.params.orderId, req.params.shopId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get order', message: error.message });
    }
  };

  export const getPaymentInfo = async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Query to get payment information
      const [paymentRows] = await pool.execute(`
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
        FROM 
          payments p
        JOIN 
          orders o ON p.order_id = o.order_id
        WHERE 
          p.order_id = ?
      `, [orderId]);
  
      if (paymentRows.length === 0) {
        return res.status(404).json({ error: 'Payment information not found for this order' });
      }
  
      const paymentInfo = paymentRows[0];
  
      // If there's a Gemini response, parse it from JSON
      if (paymentInfo.gemini_response) {
        try {
          paymentInfo.gemini_response = JSON.parse(paymentInfo.gemini_response);
        } catch (error) {
          console.error('Error parsing Gemini response:', error);
          paymentInfo.gemini_response = { error: 'Unable to parse Gemini response' };
        }
      }
  
      res.status(200).json({
        message: 'Payment information retrieved successfully',
        paymentInfo
      });
  
    } catch (error) {
      console.error('Error retrieving payment information:', error);
      res.status(500).json({ error: 'An error occurred while retrieving payment information' });
    }
  };

//   export const updateOrderStatus = async (req, res) => {
//     const { status } = req.body;
//     try {
//       const [result] = await pool.execute(
//         'UPDATE orders SET status = ? WHERE order_id = ? AND shop_id = ?',
//         [status, req.params.orderId, req.params.shopId]
//       );
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ error: 'Order not found' });
//       }
//       res.status(200).json({ id: req.params.orderId, shop_id: req.params.shopId, status });
//     } catch (error) {
//       res.status(400).json({ error: 'Failed to update order status', message: error.message });
//     }
//   };
  