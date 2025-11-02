const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:28April2001%4023@127.0.0.1:5432/errorwise'
});

async function getVerifiedUsers() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║          VERIFIED USERS - READY FOR LOGIN              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        username, 
        is_email_verified, 
        subscription_tier, 
        created_at, 
        last_login_at
      FROM users 
      WHERE is_email_verified = true 
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('   ⚠️  No verified users found');
      console.log('   💡 Creating a test verified user...\n');
      
      // Create a verified test user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('TestUser123!@#', 12);
      
      const newUser = await pool.query(`
        INSERT INTO users (
          email, 
          username, 
          password, 
          is_email_verified, 
          subscription_tier
        ) VALUES (
          'verified@test.com',
          'VerifiedTestUser',
          $1,
          true,
          'free'
        )
        RETURNING id, email, username, subscription_tier
      `, [hashedPassword]);
      
      console.log('   ✅ Test user created!');
      console.log('   📧 Email: verified@test.com');
      console.log('   🔑 Password: TestUser123!@#');
      console.log('   💳 Tier: free');
      console.log('   ✅ Verified: true\n');
      
    } else {
      result.rows.forEach((user, idx) => {
        console.log(`USER #${idx + 1}:`);
        console.log('   📧 Email:', user.email);
        console.log('   👤 Username:', user.username || 'N/A');
        console.log('   ✅ Verified:', user.is_email_verified);
        console.log('   💳 Tier:', user.subscription_tier);
        console.log('   📅 Created:', new Date(user.created_at).toLocaleString());
        console.log('   🔐 Last Login:', user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never');
        console.log('   🆔 User ID:', user.id.substring(0, 8) + '...');
        console.log('');
      });
      
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`   Total Verified Users: ${result.rows.length}`);
      console.log('═══════════════════════════════════════════════════════════\n');
      
      // Show password hint
      console.log('⚠️  PASSWORD INFORMATION:');
      console.log('   Since emails are not working, I cannot retrieve passwords.');
      console.log('   You have two options:\n');
      console.log('   OPTION 1: Manually verify test@example.com');
      console.log('   -----------------------------------------');
      console.log('   UPDATE users SET is_email_verified = true');
      console.log('   WHERE email = \'test@example.com\';');
      console.log('   Password: Test123!@#\n');
      
      console.log('   OPTION 2: Create new verified user');
      console.log('   -----------------------------------------');
      console.log('   Run this script again and it will create one.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

getVerifiedUsers();
