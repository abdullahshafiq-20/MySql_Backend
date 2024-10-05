import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const validateNUEmail = (email) => {
  if (!email.endsWith('@nu.edu.pk')) {
    return { isValid: false, message: 'Only NU email addresses are allowed' };
  }
  
  const localPart = email.split('@')[0];
  
  const studentPattern = /^k[0-9]{2}[0-9]{4}$/;
  if (studentPattern.test(localPart)) {
    return { isValid: true, role: 'student' };
  }
  
  // Check for teacher email pattern: name.name format
  const teacherPattern = /^[a-zA-Z]+\.[a-zA-Z]+$/;
  if (teacherPattern.test(localPart)) {
    return { isValid: true, role: 'teacher' };
  }
  
  return { isValid: false, message: 'Invalid email format for NU domain' };
};

export const googleAuth = async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const emailValidation = validateNUEmail(email);
    
    if (!emailValidation.isValid) {
      return done(new Error(emailValidation.message), null);
    }

    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      // User already exists, update their Google-specific info if needed
      const user = existingUser[0];
      await pool.query('UPDATE users SET imageURL = ? WHERE id = ?', [profile.photos[0].value, user.id]);
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      return done(null, { ...user, token });
    } else {
      // New user, create an account
      const userId = uuidv4();
      const randomPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const newUser = {
        id: userId,
        user_name: profile.displayName,
        email: email,
        password: hashedPassword,
        imageURL: profile.photos[0].value,
        is_verified: true,
        role: emailValidation.role, // Set role based on email pattern
        auth_type: 'google'
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
  res.redirect(`${process.env.FRONTEND_URL}/userdashboard`);
};

export const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    
    const [userData] = await pool.query(
      'SELECT id, user_name, email, role, is_verified, imageURL, auth_type FROM users WHERE id = ?', 
      [user.id]
    );
    
    if (userData.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user: userData[0] });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};