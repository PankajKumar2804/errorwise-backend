require('dotenv').config();
const User = require('./src/models/User');

async function verifyUserEmail() {
  try {
    const email = process.argv[2] || 'pankajkrjain@outlook.com';
    
    console.log(`\n🔍 Looking for user: ${email}\n`);
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('\nAvailable users:');
      const allUsers = await User.findAll({ attributes: ['email', 'isEmailVerified'] });
      allUsers.forEach(u => {
        console.log(`  • ${u.email} - Verified: ${u.isEmailVerified}`);
      });
      process.exit(1);
    }
    
    console.log('📊 Current Status:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email Verified: ${user.isEmailVerified}`);
    console.log(`  Active: ${user.isActive}`);
    
    if (!user.isEmailVerified) {
      console.log('\n✅ Manually verifying email...');
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();
      console.log('✅ Email verified successfully!');
    } else {
      console.log('\n✅ Email already verified!');
    }
    
    console.log('\n🎉 User can now login!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUserEmail();
