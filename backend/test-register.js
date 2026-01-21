const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Adish Gupta',
      email: 'adish.9.gupta@gmail.com',
      password: '100Mic10*'
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Registration failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
      console.log('Code:', error.code);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRegister();
