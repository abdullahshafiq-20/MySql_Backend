import pool from '../config/database.js';
import { generateItemId } from '../utils/generateId.js';

export const addMenuItem = async (req, res) => {
  const { name, description, price } = req.body;
  const shop_id = req.params.shop_id;
  const item_id = generateItemId(name);

  try {
    const [result] = await pool.execute(
      'INSERT INTO menu_items (item_id, shop_id, name, description,price) VALUES (?, ?, ?, ?, ?)',
      [item_id, shop_id, name, description, price]
    );
    res.status(201).json({ item_id, shop_id, name, description, price });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item', message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  const { name, description, price } = req.body;
  const { shop_id, item_id } = req.params;

  try {
    const [result] = await pool.execute(
      'UPDATE menu_items SET name = ?, description = ?,  price = ? WHERE shop_id = ? AND item_id = ?',
      [name, description, price, shop_id, item_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json({ item_id, shop_id, name, description,  price });
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