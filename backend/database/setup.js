const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 4000,
      ssl: {
        rejectUnauthorized: true
      },
      multipleStatements: true
    });

    console.log('✅ Connected to database server');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing schema...');
    await connection.query(schema);
    console.log('✅ Schema created successfully');

    // Read and execute sample_data.sql if it exists
    const sampleDataPath = path.join(__dirname, 'sample_data.sql');
    if (fs.existsSync(sampleDataPath)) {
      const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
      console.log('📝 Inserting sample data...');
      await connection.query(sampleData);
      console.log('✅ Sample data inserted successfully');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
