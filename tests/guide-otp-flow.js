/**
 * Complete OTP Login Flow - Step by Step Guide
 * This shows exactly what your frontend needs to do
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function demonstrateOTPFlow() {
  console.log('📱 COMPLETE OTP LOGIN FLOW FOR FRONTEND\n');
  console.log('='.repeat(60));
  console.log('');
  
  const email = 'pankajkrjain@outlook.com';
  const password = 'yourPassword123'; // Replace with your actual password
  const otp = '242167'; // The OTP you received in Mailtrap
  
  try {
    // ==========================================
    // STEP 1: User enters email + password
    // ==========================================
    console.log('STEP 1: User Login (Email + Password)');
    console.log('─'.repeat(60));
    console.log('Frontend Action:');
    console.log('  - User enters email and password');
    console.log('  - User clicks "Continue with OTP" button');
    console.log('');
    console.log('Frontend sends POST request to:');
    console.log('  URL: /api/auth/login/enhanced');
    console.log('  Body: { email, password }');
    console.log('');
    
    try {
      const loginStep1 = await axios.post(`${API_BASE}/auth/login/enhanced`, {
        email: email,
        password: password
      });
      
      console.log('✅ Backend Response:');
      console.log('  Status: 200 OK');
      console.log('  Message:', loginStep1.data.message);
      console.log('');
      console.log('Frontend should now:');
      console.log('  1. Hide the email/password form');
      console.log('  2. Show OTP input screen with:');
      console.log('     - 6 input boxes (one for each digit)');
      console.log('     - "Verify OTP" button');
      console.log('     - "Resend OTP" link');
      console.log('     - Message: "Check your email for verification code"');
      console.log('');
      console.log('='.repeat(60));
      console.log('');
      
      // ==========================================
      // STEP 2: User receives OTP in email
      // ==========================================
      console.log('STEP 2: User Receives OTP');
      console.log('─'.repeat(60));
      console.log('What happens:');
      console.log('  - Backend sends OTP email via Mailtrap');
      console.log('  - User checks Mailtrap inbox');
      console.log('  - User sees 6-digit code (e.g., 242167)');
      console.log('  - User enters code in frontend');
      console.log('');
      console.log('='.repeat(60));
      console.log('');
      
      // ==========================================
      // STEP 3: User enters OTP and verifies
      // ==========================================
      console.log('STEP 3: Verify OTP');
      console.log('─'.repeat(60));
      console.log('Frontend Action:');
      console.log('  - User types OTP in 6 input boxes');
      console.log('  - User clicks "Verify OTP" button');
      console.log('');
      console.log('Frontend sends POST request to:');
      console.log('  URL: /api/auth/login/verify-otp');
      console.log('  Body: { email, otp }');
      console.log('');
      
      const loginStep2 = await axios.post(`${API_BASE}/auth/login/verify-otp`, {
        email: email,
        otp: otp
      }, {
        withCredentials: true // Important: to receive cookies
      });
      
      console.log('✅ Backend Response:');
      console.log('  Status: 200 OK');
      console.log('  Message:', loginStep2.data.message);
      console.log('  User:', JSON.stringify({
        id: loginStep2.data.user.id,
        email: loginStep2.data.user.email,
        username: loginStep2.data.user.username
      }, null, 2));
      console.log('');
      console.log('🍪 Cookies Set (HTTP-only):');
      console.log('  - accessToken (expires in 1 hour)');
      console.log('  - refreshToken (expires in 7 days)');
      console.log('');
      console.log('Frontend should now:');
      console.log('  1. Store user data in state/context');
      console.log('  2. Redirect to dashboard');
      console.log('  3. Show success message');
      console.log('');
      console.log('='.repeat(60));
      console.log('');
      
      // ==========================================
      // COMPLETE FLOW SUMMARY
      // ==========================================
      console.log('✅ LOGIN COMPLETE!');
      console.log('');
      console.log('📋 FRONTEND IMPLEMENTATION CHECKLIST:');
      console.log('');
      console.log('1. Login Page (Step 1):');
      console.log('   ☐ Email input field');
      console.log('   ☐ Password input field');
      console.log('   ☐ "Continue with OTP" button');
      console.log('   ☐ POST to /api/auth/login/enhanced');
      console.log('   ☐ On success: show OTP input screen');
      console.log('');
      console.log('2. OTP Verification Screen (Step 2):');
      console.log('   ☐ 6 input boxes for OTP digits');
      console.log('   ☐ Auto-focus next input on digit entry');
      console.log('   ☐ "Verify OTP" button');
      console.log('   ☐ "Resend OTP" link');
      console.log('   ☐ POST to /api/auth/login/verify-otp');
      console.log('   ☐ Include { withCredentials: true } in axios');
      console.log('   ☐ On success: redirect to dashboard');
      console.log('');
      console.log('3. Error Handling:');
      console.log('   ☐ Invalid credentials → show error');
      console.log('   ☐ Email not verified → show verification screen');
      console.log('   ☐ Invalid OTP → show error, allow retry');
      console.log('   ☐ Expired OTP → show "Resend OTP" option');
      console.log('');
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Error:', error.response.data.error);
        console.log('   Status:', error.response.status);
        
        if (error.response.status === 401) {
          console.log('');
          console.log('⚠️  Invalid credentials - check your password!');
        } else if (error.response.status === 403) {
          console.log('');
          console.log('⚠️  Email not verified!');
          console.log('   Frontend should show email verification screen');
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('');
console.log('🎯 QUICK ANSWER TO YOUR QUESTION:');
console.log('');
console.log('After clicking "Continue with OTP", your frontend needs to:');
console.log('');
console.log('1. Make POST request to: /api/auth/login/enhanced');
console.log('   Body: { email: "pankajkrjain@outlook.com", password: "yourpass" }');
console.log('');
console.log('2. On success, show NEW SCREEN with:');
console.log('   - 6 input boxes for OTP (one per digit)');
console.log('   - "Verify OTP" button');
console.log('   - Message: "Check pankajkrjain@outlook.com for code"');
console.log('');
console.log('3. When user enters OTP (242167), make POST to:');
console.log('   /api/auth/login/verify-otp');
console.log('   Body: { email: "pankajkrjain@outlook.com", otp: "242167" }');
console.log('');
console.log('4. On success → redirect to dashboard!');
console.log('');
console.log('='.repeat(60));
console.log('');

demonstrateOTPFlow();
