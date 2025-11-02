const sequelize = require('./src/config/database');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Force sync to recreate tables with new fields
    await sequelize.sync({ force: true });
    
    console.log('✅ Database synced successfully!');
    console.log('⚠️  All existing data has been cleared.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();