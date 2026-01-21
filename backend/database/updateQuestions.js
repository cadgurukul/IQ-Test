const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateQuestions() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 4000,
      ssl: {
        rejectUnauthorized: true
      },
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Delete existing questions
    console.log('🗑️  Deleting old questions...');
    await connection.query('DELETE FROM questions');
    console.log('✅ Old questions deleted');

    // Read and execute sample_data.sql
    const sampleDataPath = path.join(__dirname, 'sample_data.sql');
    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    
    console.log('📝 Inserting new questions...');
    await connection.query(sampleData);
    console.log('✅ New questions inserted successfully');

    // Count questions
    const [iqCount] = await connection.query('SELECT COUNT(*) as count FROM questions WHERE test_id = 1');
    const [careerCount] = await connection.query('SELECT COUNT(*) as count FROM questions WHERE test_id = 2');
    
    console.log('\n📊 Question Summary:');
    console.log(`   IQ Test: ${iqCount[0].count} questions`);
    console.log(`   Career Assessment: ${careerCount[0].count} questions`);
    console.log('\n🎉 Database updated successfully!');

  } catch (error) {
    console.error('❌ Error updating questions:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateQuestions();
