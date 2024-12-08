import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import { generateShopId } from '../utils/generateId.js';
import { getShopDetailsWithStats, getTopSellingItems, getRecentOrdersWithDetails, getCustomerInsights, getRevenueOverTime, getRevenue} from '../utils/shopUtils.js';

export const createShop = async (req, res) => {
  const { name, description, image_url, email, contact_number, full_name, account_title, payment_method, payment_details } = req.body;
  const owner_id = req.user.id;
  let connection;

  try {
    // First, check if the owner already has a shop
    const [existingShops] = await pool.execute(
      'SELECT * FROM shops WHERE owner_id = ?',
      [owner_id]
    );

    if (existingShops.length > 0) {
      return res.status(400).json({ error: 'Shop creation failed', message: 'You can only create one shop per account.' });
    }
    const shopId = generateShopId(name);
    
    // Start a transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert into shops table
    await connection.execute(
      'INSERT INTO shops (id, owner_id, name, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [shopId, owner_id, name, description, image_url]
    );

    // Insert into shop_contacts table
    await connection.execute(
      'INSERT INTO shop_contacts (shop_id, email, contact_number, full_name, account_title, payment_method, payment_details, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)',
      [shopId, email, contact_number, full_name, account_title, payment_method, payment_details]
    );

    // Commit the transaction
    await connection.commit();

    res.status(201).json({ 
      id: shopId, 
      owner_id, 
      name, 
      description, 
      image_url,
      contact: {
        email,
        contact_number,
        full_name,
        account_title,
        payment_method,
        payment_details
      }
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    console.error('Shop creation error:', error);
    res.status(500).json({ error: 'Failed to create shop', message: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const getShopDetails = async (req, res) => {
    try {
      const [shopRows] = await pool.execute(
        'SELECT id, owner_id, name, description, image_url, is_open, created_at, updated_at FROM shops WHERE id = ?',
        [req.params.shopId]
      );
      if (shopRows.length === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }

      const [contactRows] = await pool.execute(
        'SELECT * FROM shop_contacts WHERE shop_id = ? AND is_primary = TRUE',
        [req.params.shopId]
      );

      const shopDetails = {
        ...shopRows[0],
        contact: contactRows[0] || null
      };

      res.status(200).json(shopDetails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get shop details', message: error.message });
    }
};

export const updateShop = async (req, res) => {
    const { name, description, image_url, email, contact_number, full_name, payment_method, payment_details } = req.body;
    try {
      const connection = await pool.getConnection();
        await connection.beginTransaction();

      const [shopResult] = await connection.execute(
        'UPDATE shops SET name = ?, description = ?, image_url = ? WHERE id = ? AND owner_id = ?',
        [name, description, image_url, req.params.shopId, req.user.id]
      );

      if (shopResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Shop not found' });
      }

      const [contactResult] = await connection.execute(
        'UPDATE shop_contacts SET email = ?, contact_number = ?, full_name = ?, payment_method = ?, payment_details = ? WHERE shop_id = ? AND is_primary = TRUE',
        [email, contact_number, full_name, payment_method, payment_details, req.params.shopId]
      );

      await connection.commit();

      res.status(200).json({ 
        id: req.params.shopId, 
        name, 
        description, 
        image_url,
        contact: {
          email,
          contact_number,
          full_name,
          payment_method,
          payment_details
        }
      });
    } catch (error) {
      await connection.rollback();
      res.status(400).json({ error: 'Failed to update shop', message: error.message });
    }
};

export const ShopDashboard = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        const shopDetails = await getShopDetailsWithStats(shopId);
        const topItems = await getTopSellingItems(shopId, 5);
        const recentOrders = await getRecentOrdersWithDetails(shopId, 5);
        const revenueOverTime = await getRevenueOverTime(shopId, 'last_30_days');
        const customerInsights = await getCustomerInsights(shopId);
        const revenue = await getRevenue(shopId);

        // Fetch primary contact details
        const [contactRows] = await pool.execute(
          'SELECT email, contact_number, full_name, account_title, payment_method, payment_details FROM shop_contacts WHERE shop_id = ? AND is_primary = TRUE',
          [shopId]
        );

        res.json({
            shopDetails: {
              ...shopDetails,
              contact: contactRows[0] || null
            },
            topSellingItems: topItems,
            recentOrders,
            revenueOverTime,
            customerInsights,
            revenue
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data', message: error.message });
    }
};

export const getOwnerShops = async (req, res) => {
    const userId = req.user.id;
    console.log(userId);
  
    try {
      const [ownerCheck] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
  
      if (ownerCheck.length === 0 || ownerCheck[0].role !== 'shop_owner') {
        return res.status(403).json({ error: 'Access denied', message: 'User is not an owner' });
      }
  
      const [shops] = await pool.execute(
        'SELECT s.id, s.name, sc.email, sc.contact_number FROM shops s LEFT JOIN shop_contacts sc ON s.id = sc.shop_id AND sc.is_primary = TRUE WHERE s.owner_id = ?',
        [userId]
      );
  
      res.status(200).json({ 
        ownerId: userId,
        shops: shops.map(shop => ({ 
          id: shop.id, 
          name: shop.name,
          email: shop.email,
          contact_number: shop.contact_number
        }))
      });
  
    } catch (error) {
      console.error('Error fetching owner shops:', error);
      res.status(500).json({ error: 'Failed to fetch shops', message: error.message });
    }
};

export const getAllShops = async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT s.id, s.name, s.description, s.image_url, sc.email, sc.contact_number , s.is_open
        FROM shops s
        LEFT JOIN shop_contacts sc ON s.id = sc.shop_id AND sc.is_primary = TRUE
      `);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get shops', message: error.message });
    }
};

export const toggleShopStatus = async (req, res) => {
  const { shopId } = req.params;
  const { is_open } = req.body;
  
  try {
    // First verify if the user owns this shop
    const [shopCheck] = await pool.execute(
      'SELECT owner_id FROM shops WHERE id = ?',
      [shopId]
    );

    if (shopCheck.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shop not found' 
      });
    }

    if (shopCheck[0].owner_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to modify this shop' 
      });
    }

    // Update shop status
    const [result] = await pool.execute(
      'UPDATE shops SET is_open = ? WHERE id = ?',
      [is_open, shopId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Failed to update shop status' 
      });
    }

    res.status(200).json({
      success: true,
      message: `Shop is now ${is_open ? 'open' : 'closed'}`,
      is_open: is_open
    });

  } catch (error) {
    console.error('Toggle shop status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle shop status',
      error: error.message
    });
  }
};

