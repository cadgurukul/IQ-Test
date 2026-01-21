const bcrypt = require('bcryptjs');

// Generate hashed password for admin
async function generateAdminPassword() {
  const password = 'admin123'; // Change this to your desired password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('\n=== ADMIN USER CREDENTIALS ===');
  console.log('Plain Password:', password);
  console.log('Hashed Password:', hashedPassword);
  console.log('\n=== SQL INSERT STATEMENT ===');
  console.log(`
INSERT INTO users (email, password, name, role) 
VALUES ('admin@iqtest.com', '${hashedPassword}', 'Admin User', 'admin');
  `);
  console.log('\n=== LOGIN CREDENTIALS ===');
  console.log('Email: admin@iqtest.com');
  console.log('Password:', password);
  console.log('\n✅ Copy the SQL statement above and run it in your MySQL database\n');
}

generateAdminPassword();
