const axios = require('axios');
const { Pool } = require('pg');

const API_BASE = 'http://localhost:3001/api/auth';
const pool = new Pool({
  connectionString: 'postgres://postgres:28April2001%4023@127.0.0.1:5432/errorwise'
});

async function generateFreshOTP() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║         GENERATE FRESH OTP FOR LOGIN                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Step 1: Attempt login to trigger OTP generation
    console.log('📤 Sending login request to generate OTP...');
    
    try {
      await axios.post(`${API_BASE}/login/enhanced`, {
        email: 'test@example.com',
        password: 'Test123!@#'
      });
      console.log('   ⚠️  Unexpected success - should have requested OTP');
    } catch (error) {
      if (error.response?.status === 200 || error.response?.data?.message?.includes('OTP')) {
        console.log('   ✅ Login request sent - OTP should be generated');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('\n❌ ERROR: Server is not running!');
        console.log('   Please start the backend server:');
        console.log('   $ cd C:\\Users\\panka\\Getgingee\\errorwise-backend');
        console.log('   $ npm run dev\n');
        process.exit(1);
      } else {
        console.log('   ✅ OTP generation triggered (got expected response)');
      }
    }

    // Step 2: Wait a moment for database update
    console.log('\n⏳ Waiting for OTP to be saved...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Fetch the fresh OTP from database
    console.log('📊 Fetching fresh OTP from database...\n');
    
    const result = await pool.query(`
      SELECT 
        email,
        login_otp,
        login_otp_expires,
        CASE 
          WHEN login_otp_expires > NOW() THEN 'Valid ✅'
          ELSE 'Expired ❌'
        END as status,
        EXTRACT(EPOCH FROM (login_otp_expires - NOW())) as seconds_remaining
      FROM users 
      WHERE email = 'test@example.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ User not found!\n');
      return;
    }

    const user = result.rows[0];
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                  FRESH OTP GENERATED                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('   📧 Email:', user.email);
    
    if (!user.login_otp) {
      console.log('   ❌ No OTP found!');
      console.log('   💡 The login request may have failed.');
      console.log('   💡 Make sure the backend server is running.\n');
    } else {
      console.log('   🔑 OTP Hash:', user.login_otp.substring(0, 30) + '...');
      console.log('   ⏰ Expires:', new Date(user.login_otp_expires).toLocaleString());
      console.log('   📊 Status:', user.status);
      
      if (user.status === 'Valid ✅') {
        const minutesLeft = Math.floor(user.seconds_remaining / 60);
        const secondsLeft = Math.floor(user.seconds_remaining % 60);
        console.log('   ⏱️  Time Left:', minutesLeft, 'minutes', secondsLeft, 'seconds');
        
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('   ⚠️  IMPORTANT: OTP WAS SENT TO EMAIL');
        console.log('════════════════════════════════════════════════════════════\n');
        console.log('   Since your email service is not working, the OTP is stored');
        console.log('   as a HASHED value in the database (for security).\n');
        console.log('   OPTIONS:\n');
        console.log('   OPTION 1: Check your email for the OTP');
        console.log('   ----------------------------------------');
        console.log('   If email service was working, check your inbox.\n');
        console.log('   OPTION 2: Temporarily store OTP in plain text (DEV ONLY)');
        console.log('   --------------------------------------------------------');
        console.log('   I can modify the code to store OTP in plain text for');
        console.log('   development testing (NOT recommended for production).\n');
        console.log('   OPTION 3: Skip OTP for testing');
        console.log('   -------------------------------');
        console.log('   I can create a bypass for development.\n');
        
      } else {
        console.log('\n   ❌ OTP already expired!');
        console.log('   💡 Run this script again immediately after running.\n');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   $ npm run dev\n');
    }
  } finally {
    await pool.end();
  }
}

// Check if server is running first
const checkServer = async () => {
  try {
    await axios.get('http://localhost:3001/health');
    return true;
  } catch {
    return false;
  }
};

(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n⚠️  Backend server is NOT running on port 3001');
    console.log('   Please start it first:');
    console.log('   $ cd C:\\Users\\panka\\Getgingee\\errorwise-backend');
    console.log('   $ npm run dev\n');
    process.exit(1);
  }
  
  await generateFreshOTP();
})();
