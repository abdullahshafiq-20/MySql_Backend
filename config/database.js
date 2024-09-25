import mysql from 'mysql2';
import dotenv from 'dotenv';
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "5420",
    database: "testing"
  }).promise()

export default pool;