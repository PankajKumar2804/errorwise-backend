/**
 * Send OTP to specific user (pankajkrjain@outlook.com)
 */

require('dotenv').config();
const User = require('./src/models/User');
const sequelize = require('./src/config/database');
const emailService = require('./src/utils/emailService');
const bcrypt = require('bcryptjs');

async function sendOTPToUser() {
  try {
    await sequelize.authenticate();
    console.log('🔍 Finding user: pankajkrjain@outlook.com\n');
    
    const user = await User.findOne({ where: { email: 'pankajkrjain@outlook.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('');
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP in database
    await User.update(
      {
        loginOTP: otpHash,
        loginOTPExpires: otpExpires
      },
      { where: { id: user.id } }
    );
    
    console.log('🔐 Generated OTP:', otp);
    console.log('⏰ Expires:', otpExpires.toLocaleString());
    console.log('');
    
    // Initialize email service
    await emailService.initialize();
    
    // Send OTP email
    console.log('📧 Sending OTP email to Mailtrap...');
    await emailService.sendEmail({
      to: user.email,
      subject: 'Your ErrorWise Login Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Verification 🔐</h1>
            </div>
            <div class="content">
              <p>Hi ${user.username},</p>
              <p>Your login verification code is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't try to log in, please ignore this email and secure your account.</p>
              <div class="footer">
                <p>© 2025 ErrorWise. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Login Verification
        
        Hi ${user.username},
        
        Your login verification code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't try to log in, please ignore this email.
        
        Best regards,
        The ErrorWise Team
      `
    });
    
    console.log('✅ OTP email sent successfully!\n');
    console.log('📬 Next steps:');
    console.log('   1. Check your Mailtrap inbox: https://mailtrap.io/inboxes');
    console.log('   2. Find the email with subject "Your ErrorWise Login Code"');
    console.log('   3. Copy the 6-digit OTP code');
    console.log('   4. Go to http://localhost:3000/ and login');
    console.log('   5. Enter the OTP when prompted');
    console.log('');
    console.log('🔑 OTP Code (for quick reference):', otp);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

sendOTPToUser();
