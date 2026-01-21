const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 4000,
      ssl: {
        rejectUnauthorized: true
      }
    });

    console.log('✅ Connected to database');

    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@iqtest.com']
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists');
      
      // Update the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'UPDATE users SET password = ?, role = ? WHERE email = ?',
        [hashedPassword, 'admin', 'admin@iqtest.com']
      );
      
      console.log('✅ Admin password updated successfully');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.query(
        'INSERT INTO users (email, password, name, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
        ['admin@iqtest.com', hashedPassword, 'Admin User', 'admin', 'local']
      );
      
      console.log('✅ Admin user created successfully');
    }

    console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
    console.log('Email: admin@iqtest.com');
    console.log('Password: admin123');
    console.log('\n🎉 You can now login to the admin dashboard!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();
