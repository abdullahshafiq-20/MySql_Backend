import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import dotenv from 'dotenv';

// Add this helper function at the top
const expireOldOTPs = async (userId) => {
    try {
        await pool.query(
            'UPDATE otps SET is_used = TRUE WHERE user_id = ? AND expires_at < NOW() AND is_used = FALSE',
            [userId]
        );
    } catch (error) {
        console.error('Error expiring old OTPs:', error);
    }
};

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
        
        // First expire any old OTPs
        await expireOldOTPs(userId);
        
        // Then insert new OTP
        await pool.query(
            'INSERT INTO otps (user_id, otp) VALUES (?, ?)', 
            [userId, otp]
        );

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

        const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

// Modify resendOTP function
export const resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user[0].id;
        
        // First expire old OTPs
        await expireOldOTPs(userId);

        // Generate and insert new OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query(
            'INSERT INTO otps (user_id, otp) VALUES (?, ?)', 
            [userId, otp]
        );

        // Send email
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

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'New OTP for Email Verification',
            text: `Your new OTP is ${otp}. This OTP will expire in 5 minutes.`
        });

        res.status(200).json({
            message: 'New OTP has been sent to your email',
            expiresIn: '5 minutes'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            message: 'Error while resending OTP', 
            error: error.message 
        });
    }
};

// Modify verifyOTP function
export const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    
    const userId = req.user.id;

    try {
        // First expire any old OTPs
        await expireOldOTPs(userId);

        // Then check for valid OTP
        const [otpRecord] = await pool.query(
            'SELECT * FROM otps WHERE user_id = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', 
            [userId, otp]
        );

        if (otpRecord.length === 0) {
            return res.status(400).json({ 
                message: 'OTP expired or not found. Please request a new OTP.',
                expired: true 
            });
        }

        // Mark OTP as used
        await pool.query(
            'UPDATE otps SET is_used = TRUE WHERE id = ?',
            [otpRecord[0].id]
        );

        // Update user verification status
        await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);

        // Fetch updated user info
        const [updatedUser] = await pool.query(
            'SELECT id, user_name, email, imageURL, is_verified, role FROM users WHERE id = ?', 
            [userId]
        );

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
    //   const verified = existingUser[0].is_verified;
    //     if (!verified) {
    //         return res.status(400).json({ message: 'User not verified!' });
    //     }
  
        const user = existingUser[0];
  
        // Check alert count if user is a student
        if (user.role === 'student' && user.alert_count >= 3) {
            return res.status(403).json({ 
                message: 'Your account has been restricted due to multiple alerts. Please contact administration.',
                restricted: true
            });
        }
  
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
  
