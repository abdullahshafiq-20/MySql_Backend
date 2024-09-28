import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import { generateShopId } from '../utils/generateId.js';
import { getShopDetailsWithStats, getTopSellingItems, getRecentOrdersWithDetails, getCustomerInsights, getRevenueOverTime } from '../utils/shopUtils.js';

export const createShop = async (req, res) => {
    const { name, email, description, image_url, phone_number } = req.body;
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
      // If no existing shop, proceed with creation
      const [result] = await pool.execute(
        'INSERT INTO shops (id, owner_id, name, email, description, image_url, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [shopId, owner_id, name, email, description, image_url, phone_number]
      );
  
      res.status(201).json({ 
        id: shopId, 
        owner_id, 
        name, 
        email, 
        description, 
        image_url, 
        phone_number 
      });
    } catch (error) {
      console.error('Shop creation error:', error);
      res.status(500).json({ error: 'Failed to create shop', message: error.message });
    }
};

export const getShopDetails = async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM shops WHERE id = ? AND owner_id = ?',
        [req.params.shopId, req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get shop details', message: error.message });
    }
  };

  export const updateShop = async (req, res) => {
    const { name, email, description, image_url, phone_number } = req.body;
    try {
      const [result] = await pool.execute(
        'UPDATE shops SET name = ?, email = ?, description = ?, image_url = ?, phone_number = ? WHERE id = ? AND owner_id = ?',
        [name, email, description, image_url, phone_number, req.params.shopId, req.user.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      res.status(200).json({ id: req.params.shopId, name, email, description, image_url, phone_number });
    } catch (error) {
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

        res.json({
            shopDetails,
            topSellingItems: topItems,
            recentOrders,
            revenueOverTime,
            customerInsights
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data', message: error.message });
    }
};

  export const getOwnerShops = async (req, res) => {
    const userId = req.user.id; // Assuming the user ID is available in req.user after authentication
    console.log(userId);
  
    try {
      // First, check if the user is an owner
      const [ownerCheck] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
  
      if (ownerCheck.length === 0 || ownerCheck[0].role !== 'shop_owner') {
        return res.status(403).json({ error: 'Access denied', message: 'User is not an owner' });
      }
  
      // If the user is an owner, fetch all their shops
      const [shops] = await pool.execute(
        'SELECT id, name FROM shops WHERE owner_id = ?',
        [userId]
      );
  
      res.status(200).json({ 
        ownerId: userId,
        shops: shops.map(shop => ({ id: shop.id, name: shop.name }))
      });
  
    } catch (error) {
      console.error('Error fetching owner shops:', error);
      res.status(500).json({ error: 'Failed to fetch shops', message: error.message });
    }
  };

  export const getAllShops = async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT id, name, email, description, image_url, phone_number FROM shops');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get shops', message: error.message });
    }
  }