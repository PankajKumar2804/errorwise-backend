const sequelize = require('./src/config/database');
const migration = require('./migrations/004-update-subscription-fields');

async function runMigration() {
  try {
    console.log('🔄 Starting subscription fields migration...\n');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface());
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Added columns:');
    console.log('   - subscription_tier (ENUM: free, pro, team)');
    console.log('   - subscription_status (ENUM: active, cancelled, expired, trial)');
    console.log('   - subscription_end_date (DATE)');
    console.log('   - subscription_start_date (DATE)');
    console.log('   - trial_ends_at (DATE)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();
