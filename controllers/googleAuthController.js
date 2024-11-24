import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

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

const validateNUEmail = (email) => {
    if (!email.endsWith('@nu.edu.pk')) {
        return { isValid: false, message: 'Only NU email addresses are allowed' };
    }
    
    const localPart = email.split('@')[0];
    
    const studentPattern = /^k[0-9]{2}[0-9]{4}$/;
    if (studentPattern.test(localPart)) {
        return { isValid: true, role: 'student' };
    }
    
    const teacherPattern = /^[a-zA-Z]+\.[a-zA-Z]+$/;
    if (teacherPattern.test(localPart)) {
        return { isValid: true, role: 'teacher' };
    }
    
    return { isValid: false, message: 'Invalid email format for NU domain' };
};

const sendPasswordEmail = async (email, password) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Account Password',
            html: `
                <h2>Welcome to Our Platform!</h2>
                <p>Your account has been created successfully using Google Sign-In.</p>
                <p>Here is your generated password: <strong>${password}</strong></p>
                <p>Please change this password after your first login for security purposes.</p>
                <p>Note: This password is only needed if you choose to login without Google in the future.</p>
            `
        });
        console.log('Password email sent successfully');
    } catch (error) {
        console.error('Error sending password email:', error);
        throw error;
    }
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
            const user = existingUser[0];
            
            if (user.role === 'student' && user.alert_count >= 3) {
                return done(new Error('Your account has been restricted due to multiple alerts. Please contact administration.'), null);
            }
            
            await pool.query('UPDATE users SET imageURL = ? WHERE id = ?', [profile.photos[0].value, user.id]);
            
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );
            
            return done(null, { ...user, token });
        } else {
            const userId = uuidv4();
            const randomPassword = uuidv4().substring(0, 12); // Generate a shorter password for better usability
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const newUser = {
                id: userId,
                user_name: profile.displayName,
                email: email,
                password: hashedPassword,
                imageURL: profile.photos[0].value,
                is_verified: true,
                role: emailValidation.role,
                auth_type: 'google'
            };

            await pool.query(
                'INSERT INTO users (id, user_name, email, password, imageURL, is_verified, role, auth_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [newUser.id, newUser.user_name, newUser.email, newUser.password, newUser.imageURL, newUser.is_verified, newUser.role, newUser.auth_type]
            );

            // Send password email to new users
            await sendPasswordEmail(email, randomPassword);

            const token = jwt.sign(
                { id: newUser.id, email: newUser.email, role: newUser.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            return done(null, { ...newUser, token });
        }
    } catch (error) {
        console.error('Google Auth Error:', error);
        return done(error, null);
    }
};

export const googleCallback = (req, res) => {
  const token = req.user.token;
  
  // Define allowed frontend URLs
  const frontendUrl = process.env.FRONTEND_URL 
      || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null)
      || 'http://localhost:5173';

  // Construct the full redirect URL
//   const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;
//   const redirectUrl = `http://localhost:3000/auth/callback?token=${encodeURIComponent(token)}`;

  const redirectUrl = `https://campick-nuces.netlify.app/auth/callback?token=${encodeURIComponent(token)}`;
  res.redirect(redirectUrl);
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