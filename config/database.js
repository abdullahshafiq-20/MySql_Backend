import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();
const pool = mysql.createPool({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }).promise()

export default pool;