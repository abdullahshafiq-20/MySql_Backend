import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import { generateShopId } from '../utils/generateId.js';
import { getShopDetailsWithStats, getTopSellingItems, getRecentOrdersWithDetails, getCustomerInsights, getRevenueOverTime, getRevenue} from '../utils/shopUtils.js';

export const createShop = async (req, res) => {
    const { name, description, image_url, email, contact_number, full_name, payment_method, payment_details } = req.body;
    const owner_id = req.user.id;
  
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
      await pool.execute('START TRANSACTION');

      // Insert into shops table
      await pool.execute(
        'INSERT INTO shops (id, owner_id, name, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [shopId, owner_id, name, description, image_url]
      );

      // Insert into shop_contacts table
      await pool.execute(
        'INSERT INTO shop_contacts (shop_id, email, contact_number, full_name, payment_method, payment_details, is_primary) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
        [shopId, email, contact_number, full_name, payment_method, payment_details]
      );

      // Commit the transaction
      await pool.execute('COMMIT');
  
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
          payment_method,
          payment_details
        }
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await pool.execute('ROLLBACK');
      console.error('Shop creation error:', error);
      res.status(500).json({ error: 'Failed to create shop', message: error.message });
    }
};

export const getShopDetails = async (req, res) => {
    try {
      const [shopRows] = await pool.execute(
        'SELECT * FROM shops WHERE id = ? AND owner_id = ?',
        [req.params.shopId, req.user.id]
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
      await pool.execute('START TRANSACTION');

      const [shopResult] = await pool.execute(
        'UPDATE shops SET name = ?, description = ?, image_url = ? WHERE id = ? AND owner_id = ?',
        [name, description, image_url, req.params.shopId, req.user.id]
      );

      if (shopResult.affectedRows === 0) {
        await pool.execute('ROLLBACK');
        return res.status(404).json({ error: 'Shop not found' });
      }

      const [contactResult] = await pool.execute(
        'UPDATE shop_contacts SET email = ?, contact_number = ?, full_name = ?, payment_method = ?, payment_details = ? WHERE shop_id = ? AND is_primary = TRUE',
        [email, contact_number, full_name, payment_method, payment_details, req.params.shopId]
      );

      await pool.execute('COMMIT');

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
      await pool.execute('ROLLBACK');
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
          'SELECT email, contact_number, full_name, payment_method, payment_details FROM shop_contacts WHERE shop_id = ? AND is_primary = TRUE',
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
        SELECT s.id, s.name, s.description, s.image_url, sc.email, sc.contact_number 
        FROM shops s
        LEFT JOIN shop_contacts sc ON s.id = sc.shop_id AND sc.is_primary = TRUE
      `);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get shops', message: error.message });
    }
};