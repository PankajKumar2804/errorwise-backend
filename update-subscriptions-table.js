require('dotenv').config();
const { sequelize, DataTypes } = require('./src/config/database');

async function updateSubscriptionsTable() {
  try {
    console.log('🔄 Updating subscriptions table with missing columns...');
    
    // Get the query interface
    const queryInterface = sequelize.getQueryInterface();
    
    // Add missing columns to subscriptions table
    const missingColumns = [
      {
        name: 'trial_end',
        definition: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        name: 'dodo_subscription_id',
        definition: {
          type: DataTypes.STRING(255),
          allowNull: true
        }
      },
      {
        name: 'dodo_customer_id',
        definition: {
          type: DataTypes.STRING(255),
          allowNull: true
        }
      },
      {
        name: 'metadata',
        definition: {
          type: DataTypes.JSONB,
          defaultValue: {}
        }
      },
      {
        name: 'created_at',
        definition: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        name: 'updated_at',
        definition: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      }
    ];
    
    // Add each column if it doesn't exist
    for (const column of missingColumns) {
      try {
        await queryInterface.addColumn('subscriptions', column.name, column.definition);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }
    
    // Also need to change the details column from TEXT to JSONB
    try {
      await queryInterface.changeColumn('subscriptions', 'details', {
        type: DataTypes.JSONB,
        defaultValue: {}
      });
      console.log(`✅ Changed details column to JSONB`);
    } catch (error) {
      console.log(`ℹ️  Details column change skipped:`, error.message);
    }
    
    console.log('✅ Subscriptions table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

updateSubscriptionsTable();