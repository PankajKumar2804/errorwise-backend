#!/usr/bin/env node

/**
 * Database Status Checker
 * 
 * This script checks the current state of your ErrorWise database
 * and shows the status of Dodo Payments integration.
 */

require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking ErrorWise Database Status...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Check Subscriptions table structure
    console.log('📋 Subscriptions Table Structure:');
    const subscriptionsColumns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Subscriptions'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });

    console.table(subscriptionsColumns.map(col => ({
      Column: col.column_name,
      Type: col.data_type,
      Nullable: col.is_nullable === 'YES' ? '✅' : '❌',
      Default: col.column_default || 'NULL'
    })));

    // Check subscription plans
    console.log('\n💳 Available Subscription Plans:');
    const SubscriptionPlan = require('./src/models/SubscriptionPlan');
    const plans = await SubscriptionPlan.findAll({
      attributes: ['name', 'price', 'billing_interval', 'dodo_plan_id', 'is_active'],
      order: [['price', 'ASC']]
    });

    console.table(plans.map(p => ({
      Name: p.name,
      Price: `$${p.price}/${p.billing_interval}`,
      'Dodo Plan ID': p.dodo_plan_id || 'N/A (Free Plan)',
      Active: p.is_active ? '✅' : '❌'
    })));

    // Check current subscriptions
    console.log('\n👥 Current Subscriptions:');
    const Subscription = require('./src/models/Subscription');
    
    const subscriptions = await Subscription.findAll({
      attributes: ['tier', 'status', 'dodoSubscriptionId', 'userId', 'createdAt']
    });

    if (subscriptions.length > 0) {
      console.table(subscriptions.map(s => ({
        'User ID': s.userId,
        Tier: s.tier,
        Status: s.status,
        'Dodo Sub ID': s.dodoSubscriptionId || 'N/A',
        Created: s.createdAt.toLocaleDateString()
      })));
    } else {
      console.log('   No active subscriptions found.');
    }

    // Check environment configuration
    console.log('\n⚙️  Dodo Payments Configuration Status:');
    const dodoConfig = {
      'API Key': process.env.DODO_API_KEY ? '✅ Configured' : '❌ Missing',
      'Secret Key': process.env.DODO_SECRET_KEY ? '✅ Configured' : '❌ Missing',
      'Merchant ID': process.env.DODO_MERCHANT_ID ? '✅ Configured' : '❌ Missing',
      'Webhook Secret': process.env.DODO_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing',
      'Environment': process.env.DODO_ENVIRONMENT || 'sandbox',
      'Pro Plan ID': process.env.DODO_PRO_PLAN_ID || 'plan_pro_monthly',
      'Enterprise Plan ID': process.env.DODO_ENTERPRISE_PLAN_ID || 'plan_enterprise_monthly'
    };

    console.table(Object.entries(dodoConfig).map(([key, value]) => ({
      Setting: key,
      Status: value
    })));

    // Migration status
    console.log('\n🔄 Migration Status:');
    try {
      const migrations = await sequelize.query(`
        SELECT name FROM "SequelizeMeta" ORDER BY name;
      `, { type: sequelize.QueryTypes.SELECT });

      if (migrations.length > 0) {
        migrations.forEach(m => console.log(`   ✅ ${m.name}`));
      } else {
        console.log('   ℹ️  No migrations recorded (manual setup)');
      }
    } catch (error) {
      console.log('   ℹ️  Migration table not found (manual setup)');
    }

    console.log('\n🎉 Database status check completed!\n');

    // Recommendations
    console.log('📝 Recommendations:');
    if (!process.env.DODO_API_KEY || !process.env.DODO_SECRET_KEY) {
      console.log('   ⚠️  Configure Dodo Payments API keys in your .env file');
    }
    
    if (subscriptions.length === 0) {
      console.log('   💡 Create test users and subscriptions for development');
    }

    console.log('   ✅ Your database is ready for Dodo Payments integration!');

  } catch (error) {
    console.error('❌ Database status check failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

// CLI interface
if (require.main === module) {
  checkDatabaseStatus()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = checkDatabaseStatus;