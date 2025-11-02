require('dotenv').config();
const sequelize = require('./src/config/database');

async function addPasswordResetColumns() {
    try {
        console.log('🔄 Adding password reset columns to users table...');
        
        // Add the reset_password_token column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255) NULL;
        `);
        
        // Add the reset_password_expires column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE NULL;
        `);
        
        console.log('✅ Successfully added password reset columns');
        console.log('   - reset_password_token (VARCHAR 255)');
        console.log('   - reset_password_expires (TIMESTAMP)');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add password reset columns:', error);
        process.exit(1);
    }
}

addPasswordResetColumns();