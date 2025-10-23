const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting Dodo Payments migration...');

    try {
      // 1. Update Subscriptions table - Add Dodo fields and remove/update Stripe fields
      console.log('📝 Updating Subscriptions table...');
      
      // Add new Dodo Payments columns
      await queryInterface.addColumn('Subscriptions', 'dodoSubscriptionId', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Dodo Payments subscription ID'
      });

      await queryInterface.addColumn('Subscriptions', 'dodoCustomerId', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Dodo Payments customer ID'
      });

      await queryInterface.addColumn('Subscriptions', 'dodoSessionId', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Dodo Payments session ID'
      });

      // Rename stripeSubscriptionId to legacyStripeId for backward compatibility
      try {
        await queryInterface.renameColumn('Subscriptions', 'stripeSubscriptionId', 'legacyStripeId');
      } catch (error) {
        console.log('ℹ️  stripeSubscriptionId column may not exist, skipping rename');
      }

      // Update tier enum to include 'enterprise'
      try {
        await queryInterface.changeColumn('Subscriptions', 'tier', {
          type: DataTypes.ENUM('free', 'pro', 'enterprise'),
          defaultValue: 'free'
        });
      } catch (error) {
        // If enum update fails, we'll handle it differently
        console.log('ℹ️  Updating tier enum through raw SQL...');
        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_Subscriptions_tier" ADD VALUE IF NOT EXISTS 'enterprise';
        `);
      }

      // 2. Update SubscriptionPlans table
      console.log('📝 Updating SubscriptionPlans table...');

      // Add Dodo Payments fields
      await queryInterface.addColumn('subscription_plans', 'dodo_plan_id', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Dodo Payments plan ID'
      });

      await queryInterface.addColumn('subscription_plans', 'dodo_product_id', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Dodo Payments product ID'
      });

      await queryInterface.addColumn('subscription_plans', 'stripe_plan_id', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Legacy Stripe plan ID (deprecated)'
      });

      await queryInterface.addColumn('subscription_plans', 'billing_interval', {
        type: DataTypes.ENUM('month', 'year'),
        defaultValue: 'month'
      });

      await queryInterface.addColumn('subscription_plans', 'trial_period_days', {
        type: DataTypes.INTEGER,
        defaultValue: 0
      });

      // 3. Insert/Update default subscription plans
      console.log('📝 Inserting default subscription plans...');

      const plans = [
        {
          name: 'Free Plan',
          price: 0.00,
          billing_interval: 'month',
          features: {
            monthlyAnalyses: 10,
            teamMembers: 1,
            supportLevel: 'community',
            advancedFeatures: false,
            apiAccess: false
          },
          limits: {
            maxQueries: 10,
            aiProviders: ['mock'],
            exportResults: false
          },
          max_users: 1,
          max_team_members: 1,
          description: 'Perfect for trying out ErrorWise',
          dodo_plan_id: null,
          dodo_product_id: null,
          is_active: true
        },
        {
          name: 'Pro Plan',
          price: 29.00,
          billing_interval: 'month',
          features: {
            monthlyAnalyses: 1000,
            teamMembers: 5,
            supportLevel: 'email',
            advancedFeatures: true,
            apiAccess: true,
            prioritySupport: false
          },
          limits: {
            maxQueries: 1000,
            aiProviders: ['openai', 'gemini'],
            exportResults: true
          },
          max_users: 5,
          max_team_members: 5,
          description: 'Great for individual developers and small teams',
          dodo_plan_id: process.env.DODO_PRO_PLAN_ID || 'plan_pro_monthly',
          dodo_product_id: process.env.DODO_PRO_PRODUCT_ID || 'prod_pro_plan',
          is_active: true
        },
        {
          name: 'Enterprise Plan',
          price: 99.00,
          billing_interval: 'month',
          features: {
            monthlyAnalyses: -1, // unlimited
            teamMembers: -1, // unlimited
            supportLevel: 'priority',
            advancedFeatures: true,
            apiAccess: true,
            prioritySupport: true,
            customIntegrations: true,
            onPremiseOption: true
          },
          limits: {
            maxQueries: -1, // unlimited
            aiProviders: ['openai', 'gemini'],
            exportResults: true,
            customIntegrations: true
          },
          max_users: -1, // unlimited
          max_team_members: -1, // unlimited
          description: 'Perfect for large development teams and enterprises',
          dodo_plan_id: process.env.DODO_ENTERPRISE_PLAN_ID || 'plan_enterprise_monthly',
          dodo_product_id: process.env.DODO_ENTERPRISE_PRODUCT_ID || 'prod_enterprise_plan',
          is_active: true
        }
      ];

      for (const plan of plans) {
        try {
          // Check if plan exists
          const [existing] = await queryInterface.sequelize.query(`
            SELECT plan_id FROM subscription_plans WHERE name = ?;
          `, {
            replacements: [plan.name],
            type: queryInterface.sequelize.QueryTypes.SELECT
          });

          if (existing) {
            // Update existing plan
            await queryInterface.bulkUpdate('subscription_plans', plan, { name: plan.name });
            console.log(`📝 Updated plan: ${plan.name}`);
          } else {
            // Insert new plan
            await queryInterface.bulkInsert('subscription_plans', [plan]);
            console.log(`📝 Created plan: ${plan.name}`);
          }
        } catch (error) {
          console.log(`⚠️  Error with plan ${plan.name}: ${error.message}`);
        }
      }

      // 4. Add indexes for better performance
      console.log('📝 Adding database indexes...');

      // Add indexes on new Dodo fields
      try {
        await queryInterface.addIndex('Subscriptions', ['dodoSubscriptionId'], {
          name: 'idx_subscriptions_dodo_subscription_id',
          unique: false
        });

        await queryInterface.addIndex('Subscriptions', ['dodoCustomerId'], {
          name: 'idx_subscriptions_dodo_customer_id',
          unique: false
        });

        await queryInterface.addIndex('subscription_plans', ['dodo_plan_id'], {
          name: 'idx_subscription_plans_dodo_plan_id',
          unique: false
        });
      } catch (error) {
        console.log('ℹ️  Some indexes may already exist, skipping...');
      }

      console.log('✅ Dodo Payments migration completed successfully!');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back Dodo Payments migration...');

    try {
      // Remove Dodo Payments columns
      await queryInterface.removeColumn('Subscriptions', 'dodoSubscriptionId');
      await queryInterface.removeColumn('Subscriptions', 'dodoCustomerId');
      await queryInterface.removeColumn('Subscriptions', 'dodoSessionId');

      // Rename back to stripeSubscriptionId
      try {
        await queryInterface.renameColumn('Subscriptions', 'legacyStripeId', 'stripeSubscriptionId');
      } catch (error) {
        console.log('ℹ️  legacyStripeId column may not exist');
      }

      // Remove columns from subscription_plans
      await queryInterface.removeColumn('subscription_plans', 'dodo_plan_id');
      await queryInterface.removeColumn('subscription_plans', 'dodo_product_id');
      await queryInterface.removeColumn('subscription_plans', 'stripe_plan_id');
      await queryInterface.removeColumn('subscription_plans', 'billing_interval');
      await queryInterface.removeColumn('subscription_plans', 'trial_period_days');

      // Remove indexes
      try {
        await queryInterface.removeIndex('Subscriptions', 'idx_subscriptions_dodo_subscription_id');
        await queryInterface.removeIndex('Subscriptions', 'idx_subscriptions_dodo_customer_id');
        await queryInterface.removeIndex('subscription_plans', 'idx_subscription_plans_dodo_plan_id');
      } catch (error) {
        console.log('ℹ️  Some indexes may not exist');
      }

      console.log('✅ Migration rollback completed!');

    } catch (error) {
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
  }
};