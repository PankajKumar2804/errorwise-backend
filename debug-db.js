require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    console.log('Loading User model...');
    const User = require('./src/models/User');
    console.log('✅ User model loaded');
    
    console.log('Loading Subscription model...');
    const Subscription = require('./src/models/Subscription');
    console.log('✅ Subscription model loaded');
    
    console.log('Testing model associations...');
    require('./src/models/associations');
    console.log('✅ Model associations loaded');
    
    console.log('Syncing database...');
    await sequelize.sync();
    console.log('✅ Database sync successful');
    
    console.log('Testing user creation...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpassword', 12);
    
    const user = await User.create({
      username: 'testuser_debug',
      email: 'debug@test.com',
      password: hashedPassword,
      subscription_tier: 'free',
      plan: 'free'
    });
    console.log('✅ User created:', user.id);
    
    // Clean up
    await User.destroy({ where: { email: 'debug@test.com' } });
    console.log('✅ Test user cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testConnection();