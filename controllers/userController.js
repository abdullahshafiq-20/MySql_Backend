import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_name, email, imageURL, is_verified, role, alert_count, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user profile', message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { user_name, email, image_url } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE users SET user_name = ?, email = ?, imageURL = ? WHERE id = ?',
      [user_name, email, image_url, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [rows] = await pool.execute(
      'SELECT id, user_name, email, imageURL, is_verified, role, alert_count, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    // Extract values from rows[0]
    const { role, alert_count, is_verified } = rows[0];
    
    // Log the values to see them separately
    console.log('Role:', role);
    console.log('Alert Count:', alert_count);
    console.log('Is Verified:', is_verified);
    
    res.status(200).json({ id: req.user.id, user_name, email, image_url, role, alert_count, is_verified });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user profile', message: error.message });
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