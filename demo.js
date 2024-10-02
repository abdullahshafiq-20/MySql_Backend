import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

dotenv.config();

// Database connection configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Sample data with plain passwords
const demoData = {
  students: [
      { id: uuidv4(), user_name: 'John Doe', email: 'john@student.com', password: 'student123', is_verified: 1, role: 'student' },
      { id: uuidv4(), user_name: 'Jane Smith', email: 'jane@student.com', password: 'student456', is_verified: 1, role: 'student' },
      { id: uuidv4(), user_name: 'Mike Wilson', email: 'mike@student.com', password: 'student789', is_verified: 1, role: 'student' }
  ],
  teachers: [
      { id: uuidv4(), user_name: 'Prof. Anderson', email: 'anderson@teacher.com', password: 'teacher123', is_verified: 1, role: 'teacher' },
      { id: uuidv4(), user_name: 'Dr. Brown', email: 'brown@teacher.com', password: 'teacher456', is_verified: 1, role: 'teacher' },
      { id: uuidv4(), user_name: 'Prof. Carter', email: 'carter@teacher.com', password: 'teacher789', is_verified: 1, role: 'teacher' }
  ],
  shopOwners: [
      { id: uuidv4(), user_name: 'Ali Khan', email: 'ali@shop.com', password: 'shop123', is_verified: 1, role: 'shop_owner' },
      { id: uuidv4(), user_name: 'Sara Ahmed', email: 'sara@shop.com', password: 'shop456', is_verified: 1, role: 'shop_owner' },
      { id: uuidv4(), user_name: 'Hassan Ali', email: 'hassan@shop.com', password: 'shop789', is_verified: 1, role: 'shop_owner' }
  ]
};

// Password hashing function
async function hashPassword(plainPassword) {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Password verification function
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

async function insertDemoData() {
  const connection = await pool.getConnection();
  try {
      await connection.beginTransaction();

      // Insert users with hashed passwords
      const allUsers = [...demoData.students, ...demoData.teachers, ...demoData.shopOwners];
      for (const user of allUsers) {
          const hashedPassword = await hashPassword(user.password);
          await connection.query(
              'INSERT INTO users (id, user_name, email, password, is_verified, role) VALUES (?, ?, ?, ?, ?, ?)',
              [user.id, user.user_name, user.email, hashedPassword, user.is_verified, user.role]
          );
          console.log(`User created: ${user.user_name}`);
          console.log(`Original password: ${user.password}`);
          console.log(`Hashed password: ${hashedPassword}`);
          console.log('-------------------');
      }

      // Create shops with their menu items
      const shopsData = [
          {
              id: uuidv4(),
              owner_id: demoData.shopOwners[0].id,
              name: 'Campus Café',
              description: 'Best coffee and snacks',
              menuItems: [
                  { id: uuidv4(), name: 'Cappuccino', price: 150.00, description: 'Italian coffee' },
                  { id: uuidv4(), name: 'Sandwich', price: 200.00, description: 'Club sandwich' },
                  { id: uuidv4(), name: 'Pasta', price: 250.00, description: 'Creamy pasta' }
              ]
          },
          {
              id: uuidv4(),
              owner_id: demoData.shopOwners[1].id,
              name: 'Book Corner',
              description: 'Books and stationery',
              menuItems: [
                  { id: uuidv4(), name: 'Notebook', price: 100.00, description: 'Spiral notebook' },
                  { id: uuidv4(), name: 'Pen Set', price: 150.00, description: 'Premium pen set' },
                  { id: uuidv4(), name: 'Calculator', price: 300.00, description: 'Scientific calculator' }
              ]
          },
          {
              id: uuidv4(),
              owner_id: demoData.shopOwners[2].id,
              name: 'Quick Bites',
              description: 'Fast food and beverages',
              menuItems: [
                  { id: uuidv4(), name: 'Burger', price: 180.00, description: 'Chicken burger' },
                  { id: uuidv4(), name: 'Fries', price: 120.00, description: 'Crispy fries' },
                  { id: uuidv4(), name: 'Cola', price: 80.00, description: 'Cold drink' }
              ]
          }
      ];

      // Insert shops and their data
      for (const shop of shopsData) {
          // Insert shop
          await connection.query(
              'INSERT INTO shops (id, owner_id, name, description) VALUES (?, ?, ?, ?)',
              [shop.id, shop.owner_id, shop.name, shop.description]
          );

          // Insert shop contact
          await connection.query(
              'INSERT INTO shop_contacts (shop_id, email, contact_number, full_name, payment_method, payment_details, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [shop.id, `contact@${shop.name.toLowerCase().replace(' ', '')}.com`, '03001234567', shop.name, 'jazzcash', '03001234567', 1]
          );

          // Insert menu items
          for (const item of shop.menuItems) {
              await connection.query(
                  'INSERT INTO menu_items (item_id, shop_id, name, description, price) VALUES (?, ?, ?, ?, ?)',
                  [item.id, shop.id, item.name, item.description, item.price]
              );
          }
      }

      // Create sample orders
      for (const student of demoData.students) {
          const shop = shopsData[Math.floor(Math.random() * shopsData.length)];
          const menuItem = shop.menuItems[0]; // Use first menu item for simplicity
          const quantity = 2;
          const orderId = uuidv4();

          // Create order
          await connection.query(
              'INSERT INTO orders (order_id, user_id, shop_id, total_price, status) VALUES (?, ?, ?, ?, ?)',
              [orderId, student.id, shop.id, menuItem.price * quantity, 'delivered']
          );

          // Create order item
          await connection.query(
              'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
              [orderId, menuItem.id, quantity, menuItem.price]
          );
      }

      await connection.commit();
      console.log('Demo data inserted successfully!');

      // Demonstrate password verification
      const [users] = await connection.query('SELECT email, password FROM users LIMIT 1');
      const user = users[0];
      const plainPassword = demoData.students[0].password;
      const isMatch = await verifyPassword(plainPassword, user.password);
      console.log('\nPassword Verification Demo:');
      console.log(`Password verification test for ${user.email}:`);
      console.log(`Plain password: ${plainPassword}`);
      console.log(`Password match: ${isMatch}`);

  } catch (error) {
      await connection.rollback();
      console.error('Error inserting demo data:', error);
      throw error;
  } finally {
      connection.release();
  }
}

async function runExampleQueries() {
  try {
      // Get all shops with their statistics
      const [shopStats] = await pool.query('SELECT * FROM shop_statistics');
      console.log('Shop Statistics:', shopStats);

      // Get all orders for a specific student
      const [studentOrders] = await pool.query(
          'SELECT o.*, s.name as shop_name FROM orders o JOIN shops s ON o.shop_id = s.id WHERE o.user_id = ?',
          [demoData.students[0].id]
      );
      console.log('Student Orders:', studentOrders);

      // Get menu items for a specific shop
      const [shops] = await pool.query('SELECT id FROM shops LIMIT 1');
      const [menuItems] = await pool.query(
          'SELECT * FROM menu_items WHERE shop_id = ?',
          [shops[0].id]
      );
      console.log('Menu Items:', menuItems);

  } catch (error) {
      console.error('Error running queries:', error);
  }
}

async function runDemo() {
  try {
      await insertDemoData();
      await runExampleQueries();
  } catch (error) {
      console.error('Demo failed:', error);
  } finally {
      await pool.end();
  }
}

runDemo();