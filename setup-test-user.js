const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:28April2001%4023@127.0.0.1:5432/errorwise'
});

async function setupTestUser() {
  try {
    console.log('\n🔧 Setting up verified test user for login testing...\n');

    // Update test@example.com to be verified
    const updateResult = await pool.query(`
      UPDATE users 
      SET is_email_verified = true 
      WHERE email = 'test@example.com'
      RETURNING id, email, username, subscription_tier, is_email_verified
    `);

    if (updateResult.rows.length > 0) {
      console.log('✅ Updated test@example.com to verified!\n');
      const user = updateResult.rows[0];
      
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║          READY TO LOGIN - TEST CREDENTIALS              ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');
      console.log('   📧 Email:    test@example.com');
      console.log('   🔑 Password: Test123!@#');
      console.log('   ✅ Verified: true');
      console.log('   💳 Tier:     ' + user.subscription_tier);
      console.log('   👤 Username: ' + (user.username || 'testuser'));
      console.log('\n');
    } else {
      console.log('⚠️  test@example.com not found. Checking for other verified users...\n');
    }

    // Get all verified users
    const verifiedUsers = await pool.query(`
      SELECT email, username, subscription_tier, created_at, last_login_at
      FROM users 
      WHERE is_email_verified = true
      ORDER BY created_at DESC
    `);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ALL VERIFIED USERS IN DATABASE');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (verifiedUsers.rows.length === 0) {
      console.log('   ⚠️  No verified users found!\n');
    } else {
      verifiedUsers.rows.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email}`);
        console.log(`      Username: ${user.username || 'N/A'}`);
        console.log(`      Tier: ${user.subscription_tier}`);
        console.log(`      Last Login: ${user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}\n`);
      });
      
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`   Total: ${verifiedUsers.rows.length} verified user(s)`);
      console.log('═══════════════════════════════════════════════════════════\n');
    }

    // Show all unverified users too
    const unverifiedUsers = await pool.query(`
      SELECT email, username, created_at
      FROM users 
      WHERE is_email_verified = false
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (unverifiedUsers.rows.length > 0) {
      console.log('📋 UNVERIFIED USERS (First 5):');
      unverifiedUsers.rows.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email} (${user.username || 'no username'})`);
      });
      console.log('\n💡 To verify any user manually:');
      console.log('   UPDATE users SET is_email_verified = true WHERE email = \'email@example.com\';\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setupTestUser();
