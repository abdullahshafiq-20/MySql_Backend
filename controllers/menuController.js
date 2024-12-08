import pool from '../config/database.js';
import { generateItemId } from '../utils/generateId.js';

const determineCategory = (itemName) => {
  // Convert to lowercase and remove spaces
  const normalizedName = itemName.toLowerCase().replace(/\s+/g, '');
  
  // Define category patterns
  const categoryPatterns = [
    { pattern: /(burger|brgr)/, category: 'Burgers' },
    { pattern: /(roll|rol)/, category: 'Rolls' },
    { pattern: /(pizza|piza)/, category: 'Pizza' },
    { pattern: /(tea|chai|coffee|cappuccino|latte)/, category: 'Hot Beverages' },
    { pattern: /(pepsi|coke|sprite|drink|soda|juice)/, category: 'Cold Drinks' },
    { pattern: /(sandwich|club|sub)/, category: 'Sandwiches' },
    { pattern: /(biryani|rice|pulao)/, category: 'Rice' },
    { pattern: /(paratha|naan|roti)/, category: 'Bread' },
    { pattern: /(cake|pastry|dessert|icecream|brownie)/, category: 'Desserts' },
    { pattern: /(chicken|beef|mutton)/, category: 'Meat' },
  ];

  // Find matching category
  for (const {pattern, category} of categoryPatterns) {
    if (pattern.test(normalizedName)) {
      return category;
    }
  }

  return 'Other'; // Default category
};

export const addMenuItem = async (req, res) => {
  const { name, description, price, image_url } = req.body;
  const shop_id = req.params.shop_id;
  const item_id = generateItemId(name);
  const category = determineCategory(name);

  try {
    const [result] = await pool.execute(
      'INSERT INTO menu_items (item_id, shop_id, name, category, description, image_url, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item_id, shop_id, name, category, description, image_url, price]
    );
    res.status(201).json({ item_id, shop_id, name, category, description, image_url, price });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item', message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  const { name, description, price, image_url } = req.body;
  const { shop_id, item_id } = req.params;
  const category = determineCategory(name);

  try {
    const [result] = await pool.execute(
      'UPDATE menu_items SET name = ?, category = ?, description = ?, image_url = ?, price = ? WHERE shop_id = ? AND item_id = ?',
      [name, category, description, image_url, price, shop_id, item_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json({ item_id, shop_id, name, category, description, image_url, price });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item', message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  const { shop_id, item_id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM menu_items WHERE item_id = ? AND shop_id = ?',
      [item_id, shop_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item', message: error.message });
  }
};

export const getMenuItem = async (req, res) => {
  const { shop_id, item_id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM menu_items WHERE item_id = ? AND shop_id = ?',
      [item_id, shop_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Failed to get menu item', message: error.message });
  }
};

export const getAllMenuItems = async (req, res) => {
    const { shop_id } = req.params;
    console.log(shop_id);
  
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menu_items WHERE shop_id = ?',
        [shop_id]
      );
  
      if (rows.length === 0) {
        return res.status(200).json({ message: 'No menu items found for this shop', items: [] });
      }
  
      res.status(200).json({
        message: 'Menu items retrieved successfully',
        items: rows
      });
    } catch (error) {
      console.error('Get all menu items error:', error);
      res.status(500).json({ error: 'Failed to retrieve menu items', message: error.message });
    }
  };

export const getOverAllMenuItems = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        mi.item_id,
        mi.name,
        mi.description,
        mi.image_url,
        mi.price,
        s.name AS shop_name,
        s.id AS shop_id
      FROM menu_items mi
      JOIN shops s ON mi.shop_id = s.id
    `);
  
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No menu items found',
        items: []
      });
    }
  
    res.status(200).json({
      success: true,
      message: 'Menu items retrieved successfully',
      items: rows,
      total: rows.length
    });
  
  } catch (error) {
    console.error('Error retrieving menu items:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving menu items',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

export const getShopCategories = async (req, res) => {
  const { shop_id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT DISTINCT category FROM menu_items WHERE shop_id = ? ORDER BY category',
      [shop_id]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No categories found for this shop',
        categories: []
      });
    }

    // Extract categories from rows
    const categories = rows.map(row => row.category);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      categories: categories
    });
  } catch (error) {
    console.error('Get shop categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve shop categories',
      message: error.message
    });
  }
};