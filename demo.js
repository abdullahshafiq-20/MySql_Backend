import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function createTables() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        imageURL VARCHAR(255),
        is_verified BOOLEAN DEFAULT TRUE,
        role VARCHAR(50) DEFAULT 'student',
        alert_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create otps table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        otp VARCHAR(6) NOT NULL,
        user_id VARCHAR(36),
        isUsed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create shops table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shops (
        id VARCHAR(36) PRIMARY KEY,
        owner_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        phone_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    // Create menu_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        item_id VARCHAR(36) PRIMARY KEY,
        shop_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      )
    `);

    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        shop_id VARCHAR(36) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'accepted', 'delivered', 'discarded') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      )
    `);

    // Create order_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
      )
    `);

    await connection.commit();
    console.log('Tables created successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Error creating tables:', error);
  } finally {
    connection.release();
  }
}

async function insertDemoData() {
  console.log("user ", process.env.DB_USER);
  console.log("password ", process.env.DB_PASS);
  console.log("database ", process.env.DB_NAME);
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert users (2 teachers, 3 students, 3 shop owners)
    const users = [
      { id: uuidv4(), user_name: 'Teacher1', email: 'teacher1@example.com', password: 'password123', role: 'teacher' },
      { id: uuidv4(), user_name: 'Teacher2', email: 'teacher2@example.com', password: 'password123', role: 'teacher' },
      { id: uuidv4(), user_name: 'Student1', email: 'student1@example.com', password: 'password123', role: 'student' },
      { id: uuidv4(), user_name: 'Student2', email: 'student2@example.com', password: 'password123', role: 'student' },
      { id: uuidv4(), user_name: 'Student3', email: 'student3@example.com', password: 'password123', role: 'student' },
      { id: uuidv4(), user_name: 'ShopOwner1', email: 'owner1@example.com', password: 'password123', role: 'shop_owner' },
      { id: uuidv4(), user_name: 'ShopOwner2', email: 'owner2@example.com', password: 'password123', role: 'shop_owner' },
      { id: uuidv4(), user_name: 'ShopOwner3', email: 'owner3@example.com', password: 'password123', role: 'shop_owner' },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'INSERT INTO users (id, user_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.user_name, user.email, hashedPassword, user.role]
      );
    }

    // Insert shops
    const shops = [
      { id: uuidv4(), owner_id: users[5].id, name: 'Shop1', email: 'shop1@example.com', description: 'First shop' },
      { id: uuidv4(), owner_id: users[6].id, name: 'Shop2', email: 'shop2@example.com', description: 'Second shop' },
      { id: uuidv4(), owner_id: users[7].id, name: 'Shop3', email: 'shop3@example.com', description: 'Third shop' },
    ];

    for (const shop of shops) {
      await connection.execute(
        'INSERT INTO shops (id, owner_id, name, email, description) VALUES (?, ?, ?, ?, ?)',
        [shop.id, shop.owner_id, shop.name, shop.email, shop.description]
      );
    }

    // Insert menu items (5 items per shop)
    for (const shop of shops) {
      for (let i = 1; i <= 5; i++) {
        await connection.execute(
          'INSERT INTO menu_items (item_id, shop_id, name, description, price) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), shop.id, `Item${i}`, `Description for Item${i}`, 10.99 + i]
        );
      }
    }

    // Insert some orders
    const orders = [
      { id: uuidv4(), user_id: users[2].id, shop_id: shops[0].id, total_price: 32.97 },
      { id: uuidv4(), user_id: users[3].id, shop_id: shops[1].id, total_price: 54.95 },
      { id: uuidv4(), user_id: users[4].id, shop_id: shops[2].id, total_price: 43.96 },
    ];

    for (const order of orders) {
      await connection.execute(
        'INSERT INTO orders (order_id, user_id, shop_id, total_price) VALUES (?, ?, ?, ?)',
        [order.id, order.user_id, order.shop_id, order.total_price]
      );
    }

    // Insert order items (assuming 2 items per order)
    const [menuItems] = await connection.execute('SELECT item_id, price FROM menu_items');
    for (const order of orders) {
      for (let i = 0; i < 2; i++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        await connection.execute(
          'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
          [order.id, menuItem.item_id, 1, menuItem.price]
        );
      }
    }

    await connection.commit();
    console.log('Demo data inserted successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Error inserting demo data:', error);
  } finally {
    connection.release();
  }
}

async function main() {
  try {
    await createTables();
    await insertDemoData();
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await pool.end();
  }
}

main();