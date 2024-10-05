import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

import bcrypt from 'bcrypt'; // Make sure to import bcrypt

export const googleAuth = async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);

    if (existingUser.length > 0) {
      // User already exists, update their Google-specific info if needed
      const user = existingUser[0];
      await pool.query('UPDATE users SET imageURL = ? WHERE id = ?', [profile.photos[0].value, user.id]);
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      return done(null, { ...user, token });
    } else {
      // New user, create an account
      const userId = uuidv4();
      
      // Generate a secure random password for Google users
      const randomPassword = uuidv4(); // Using UUID as a secure random password
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const newUser = {
        id: userId,
        user_name: profile.displayName,
        email: profile.emails[0].value,
        password: hashedPassword, // Store the hashed password
        imageURL: profile.photos[0].value,
        is_verified: true,
        role: 'student',
        auth_type: 'google' // Add this field to indicate the authentication method
      };

      await pool.query(
        'INSERT INTO users (id, user_name, email, password, imageURL, is_verified, role, auth_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newUser.id, newUser.user_name, newUser.email, newUser.password, newUser.imageURL, newUser.is_verified, newUser.role, newUser.auth_type]
      );

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

      return done(null, { ...newUser, token });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    return done(error, null);
  }
};

export const googleCallback = (req, res) => {
  res.redirect(`http://localhost:5173/api/userdashboard?token=${req.user.token}`);
};

export const verifyToken = async (req, res) => {
    try {
      // req.user should be set by your authenticateToken middleware
      const user = req.user;
      
      // Fetch fresh user data from database
      const [userData] = await pool.query('SELECT id, user_name, email, role, is_verified, imageURL, auth_type FROM users WHERE id = ?', [user.id]);
      
      if (userData.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      res.json({ user: userData[0] });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  };