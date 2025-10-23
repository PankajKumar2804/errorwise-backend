require('dotenv').config();
const { sequelize, DataTypes } = require('./src/config/database');

async function updateUsersTable() {
  try {
    console.log('🔄 Updating users table with missing columns...');
    
    // Get the query interface
    const queryInterface = sequelize.getQueryInterface();
    
    // Add missing columns to users table
    const missingColumns = [
      {
        name: 'profile',
        definition: {
          type: DataTypes.JSONB,
          defaultValue: {}
        }
      },
      {
        name: 'preferences', 
        definition: {
          type: DataTypes.JSONB,
          defaultValue: {}
        }
      },
      {
        name: 'is_active',
        definition: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        }
      },
      {
        name: 'last_login',
        definition: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        name: 'email_verified',
        definition: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        }
      },
      {
        name: 'updated_at',
        definition: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        name: 'tenant_id',
        definition: {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      }
    ];
    
    // Add each column if it doesn't exist
    for (const column of missingColumns) {
      try {
        await queryInterface.addColumn('users', column.name, column.definition);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }
    
    console.log('✅ Users table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

updateUsersTable();