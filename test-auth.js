const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testUser = {
  username: 'api_test_user',
  email: 'apitest@example.com',
  password: 'testpassword123'
};

let accessToken = '';

async function runTests() {
  console.log('🔥 Starting ErrorWise Authentication API Tests\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Register
    console.log('2️⃣ Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Registration Success:', registerResponse.data.message);
      console.log('📧 User Email:', registerResponse.data.user.email);
      accessToken = registerResponse.data.token;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️ User already exists, proceeding with login...');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Login
    console.log('3️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login Success:', loginResponse.data.message);
    console.log('👤 User ID:', loginResponse.data.user.id);
    accessToken = loginResponse.data.token;
    console.log('');

    // Test 4: Get Profile
    console.log('4️⃣ Testing Get Profile (Protected Route)...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Profile Retrieved:', profileResponse.data.user.username);
    console.log('📊 Subscription Tier:', profileResponse.data.user.subscription_tier);
    console.log('');

    // Test 5: Update Profile
    console.log('5️⃣ Testing Update Profile...');
    const updateResponse = await axios.put(`${BASE_URL}/api/auth/profile`, {
      username: 'updated_api_test_user'
    }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Profile Updated:', updateResponse.data.message);
    console.log('👤 New Username:', updateResponse.data.user.username);
    console.log('');

    // Test 6: Get History
    console.log('6️⃣ Testing Get History...');
    const historyResponse = await axios.get(`${BASE_URL}/api/auth/history`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ History Retrieved:', historyResponse.data.pagination);
    console.log('📝 Query Count:', historyResponse.data.history.length);
    console.log('');

    // Test 7: Test Invalid Token
    console.log('7️⃣ Testing Invalid Token...');
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid Token Rejected:', error.response.data.error);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 8: Test No Token
    console.log('8️⃣ Testing No Token...');
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ No Token Rejected:', error.response.data.error);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 9: Logout
    console.log('9️⃣ Testing Logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Logout Success:', logoutResponse.data.message);
    console.log('');

    console.log('🎉 All Authentication Tests Passed! 🎉');
    console.log('');
    console.log('📋 Test Summary:');
    console.log('  ✅ Health Check');
    console.log('  ✅ User Registration');
    console.log('  ✅ User Login');
    console.log('  ✅ Get Profile (Protected)');
    console.log('  ✅ Update Profile');
    console.log('  ✅ Get History');
    console.log('  ✅ Invalid Token Handling');
    console.log('  ✅ No Token Handling');
    console.log('  ✅ Logout');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running at', BASE_URL);
    return true;
  } catch (error) {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('Please start the server with: npm start');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
})();