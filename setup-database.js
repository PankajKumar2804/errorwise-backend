require('dotenv').config();
const { sequelize } = require('./src/config/database');
require('./src/models/associations'); // Load model associations
const User = require('./src/models/User');
const ErrorQuery = require('./src/models/ErrorQuery');
const Subscription = require('./src/models/Subscription');

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🔄 Creating tables...');
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('✅ All tables created successfully');

    console.log('🔄 Creating test user...');
    const testUser = await User.create({
      username: 'Pankajkrjain',
      email: 'Pankajkrjain@outlook.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGwdcCJ.8UE/CX.', // hashed 'password123'
      subscription_tier: 'free',
      plan: 'free'
    });

    await Subscription.create({
      user_id: testUser.id,
      plan: 'free',
      status: 'active'
    });

    console.log('✅ Test user created successfully');
    console.log('📧 Email: Pankajkrjain@outlook.com');
    console.log('🔑 Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();