import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_name, email, imageURL, is_verified, role, alert_count, created_at, auth_type FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user profile', 
      message: error.message 
    });
  }
};
 
export const updateProfile = async (req, res) => {
  const { user_name, email, image_url } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // First check if user is a shop owner
    const [userRole] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userRole.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Only allow shop owners to update profile
    if (userRole[0].role !== 'shop_owner') {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        error: 'Only shop owners can update their profile'
      });
    }

    // For shop owners, proceed with update
    let updateFields = {};
    let updateParams = [];
    let query = 'UPDATE users SET ';

    if (user_name) {
      updateFields.user_name = user_name;
      updateParams.push(user_name);
    }

    if (email) {
      // Check if email is already in use
      const [emailCheck] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      
      if (emailCheck.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Email already in use by another account'
        });
      }
      updateFields.email = email;
      updateParams.push(email);
    }

    if (image_url) {
      updateFields.imageURL = image_url;
      updateParams.push(image_url);
    }

    // If no fields to update
    if (Object.keys(updateFields).length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Construct the UPDATE query
    query += Object.keys(updateFields)
      .map(key => `${key} = ?`)
      .join(', ');
    query += ' WHERE id = ?';
    updateParams.push(req.user.id);

    // Execute the update
    const [result] = await connection.execute(query, updateParams);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Fetch updated user data
    const [rows] = await connection.execute(
      'SELECT id, user_name, email, imageURL, is_verified, role, alert_count, created_at, auth_type FROM users WHERE id = ?',
      [req.user.id]
    );
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: rows[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update user profile',
      message: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


  export const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
      const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(current_password, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
  
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(400).json({ error: 'Failed to change password', message: error.message });
    }
  };

export const getUserOrderStats = async (req, res) => {
  const userId = req.params.userId || req.user.id; // Use provided userId or current user's id
  let connection;

  try {
    connection = await pool.getConnection();

    // Get total orders and total spent
    const [orderStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price), 0) as total_spent,
        COUNT(CASE WHEN status = 'delivered' OR status = 'pickedup' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'rejected' OR status = 'discarded' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status = 'pending' OR status = 'preparing' OR status = 'accepted' THEN 1 END) as active_orders
      FROM orders 
      WHERE user_id = ?
    `, [userId]);

    // Get most ordered from shops
    const [frequentShops] = await connection.execute(`
      SELECT 
        s.name as shop_name,
        s.id as shop_id,
        COUNT(*) as order_count,
        SUM(o.total_price) as total_spent_at_shop
      FROM orders o
      JOIN shops s ON o.shop_id = s.id
      WHERE o.user_id = ?
      GROUP BY s.id, s.name
      ORDER BY order_count DESC
      LIMIT 5
    `, [userId]);

    // Get user details
    const [userDetails] = await connection.execute(
      'SELECT user_name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (userDetails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User order statistics retrieved successfully',
      data: {
        user: userDetails[0],
        orderStats: {
          ...orderStats[0],
          total_spent: parseFloat(orderStats[0].total_spent) // Convert to number
        },
        frequentShops: frequentShops.map(shop => ({
          ...shop,
          total_spent_at_shop: parseFloat(shop.total_spent_at_shop) // Convert to number
        }))
      }
    });

  } catch (error) {
    console.error('Get user order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user order statistics',
      message: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};