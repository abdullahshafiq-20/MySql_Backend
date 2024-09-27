import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import dotenv from 'dotenv';


export const signup = async (req, res) => {
    const {user_name, email, password, imageURL} = req.body;
    
    console.log(req.body);
    try {
        // Check if the email domain is nu.edu.pk
        if (!email.endsWith('@nu.edu.pk')) {
            return res.status(400).json({message: 'Invalid email domain. Only nu.edu.pk emails are allowed.'});
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
            'INSERT INTO users (id, user_name, email, password, imageURL) VALUES (?, ?, ?, ?, ?)', 
            [userId, user_name, email, hashedPassword, imageURL || null]
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

        const token = jwt.sign({ email, id: result.insertId }, 'PRIVATEKEY');
        res.status(201).json({
            user_info: { id: result.insertId, user_name, email, imageURL },
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
};

export const verifyOTP = async (req, res) => {
    const { otp, user_id } = req.body;  // Changed email to user_id
  
    try {
        // Fetch OTP record
        const [existingOTP] = await pool.query('SELECT * FROM otps WHERE otp = ? AND user_id = ?', [otp, user_id]);
  
        if (existingOTP.length === 0) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
  
        const otpRecord = existingOTP[0];
  
        if (otpRecord.isUsed) {
            return res.status(400).json({ message: 'OTP already used' });
        }
  
        // Mark OTP as used
        await pool.query('UPDATE otps SET isUsed = ? WHERE id = ?', [true, otpRecord.id]);
  
        // Update user as verified
        await pool.query('UPDATE users SET is_verified = ? WHERE id = ?', [true, user_id]);
  
        res.status(201).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


export const signin = async (req, res) => {
    const { email, password } = req.body;
  
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
      const token = jwt.sign({ email: user.email, id: user.id }, 'PRIVATEKEY');
  
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
  
