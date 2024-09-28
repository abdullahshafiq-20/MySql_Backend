import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import dotenv from 'dotenv';


export const signup = async (req, res) => {
    const {user_name, email, password, imageURL} = req.body;
    var role;
    
    console.log(req.body);
    try {
        // Check if the email domain is nu.edu.pk
        if (!email.endsWith('@nu.edu.pk')) {
            return res.status(400).json({message: 'Invalid email domain. Only nu.edu.pk emails are allowed.'});
        }
        if (email.endsWith('@nu.edu.pk')) {
            role='student';
        }else
        {
            role='teacher';
        }

        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
        .catch(err => {
            console.error('Query execution error:', err);
            throw err;
        });
        if (existingUser.length > 0) {
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const [result] = await pool.query(
            'INSERT INTO users (id, user_name, email, password, role, imageURL) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, user_name, email, hashedPassword, role, imageURL || null]
        );

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query('INSERT INTO otps (user_id, otp) VALUES (?, ?)', [userId, otp]);

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Email Verification',
                text: `Your OTP is ${otp}`
            });
            console.log('Verification email sent successfully');
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            if (emailError.response) {
                console.error('SMTP Response:', emailError.response);
            }
        }

        const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            user_info: { id: userId, user_name, email, imageURL },
            token,
            message: 'Successfully signed up! Please verify your email.',
        });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ message: 'Database table not found' });
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(500).json({ message: 'Database access denied' });
        } else {
            return res.status(500).json({ message: 'Error during signup process', error: err.message });
        }
    }
};

export const shop_signup = async (req, res) => {
    const {user_name, email, password, imageURL} = req.body;
    
    console.log(req.body);
    try {
       
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
        .catch(err => {
            console.error('Query execution error:', err);
            throw err;
        });
        if (existingUser.length > 0) {
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const role= 'shop_owner';
        const [result] = await pool.query(
            'INSERT INTO users (id, user_name, email, password, imageURL, role) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, user_name, email, hashedPassword, imageURL, role  || null]
        );

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query('INSERT INTO otps (user_id, otp) VALUES (?, ?)', [userId, otp]);

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Email Verification',
                text: `Your OTP is ${otp}`
            });
            console.log('Verification email sent successfully');
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            if (emailError.response) {
                console.error('SMTP Response:', emailError.response);
            }
        }

        const token = jwt.sign(
            { email: user.email, id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
          );
        res.status(201).json({
            user_info: { id: userId, user_name, email, imageURL },
            token,
            message: 'Successfully signed up!',
        });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ message: 'Database table not found' });
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(500).json({ message: 'Database access denied' });
        } else {
            return res.status(500).json({ message: 'Error during signup process', error: err.message });
        }
    }

}

export const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    
    const userId = req.user.id;

    try {
        const [otpRecord] = await pool.query('SELECT * FROM otps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);

        if (otpRecord.length === 0) {
            return res.status(400).json({ message: 'No OTP found for this user' });
        }

        if (otpRecord[0].otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid, update user's verification status
        await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);

        // Delete the used OTP
        await pool.query('DELETE FROM otps WHERE user_id = ?', [userId]);

        // Fetch updated user info including role
        const [updatedUser] = await pool.query('SELECT id, user_name, email, imageURL, is_verified, role FROM users WHERE id = ?', [userId]);


        res.status(200).json({
            message: 'Email verified successfully',
            user: updatedUser[0],
            role: updatedUser[0].role
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Error during OTP verification', error: error.message });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
  
    try {
      // Fetch user by email
      const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  
      if (existingUser.length === 0) {
        return res.status(400).json({ message: 'User not found!' });
      }
      const verified = existingUser[0].is_verified;
        if (!verified) {
            return res.status(400).json({ message: 'User not verified!' });
        }
  
      const user = existingUser[0];
  
      // Verify password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate token
      const token = jwt.sign(
        { email: user.email, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token expires in 1 hour
      );
  
      res.status(201).json({
        user_info: user,
        token,
        message: 'Welcome back!',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  
