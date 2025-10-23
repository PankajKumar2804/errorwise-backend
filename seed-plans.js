#!/usr/bin/env node

/**
 * Seed Script for Subscription Plans
 * 
 * This script populates the database with default subscription plans
 * configured for Dodo Payments integration.
 */

require('dotenv').config();
const sequelize = require('./src/config/database');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');

const defaultPlans = [
  {
    name: 'Free Plan',
    price: 0.00,
    billing_interval: 'month',
    trial_period_days: 0,
    features: {
      monthlyAnalyses: 10,
      teamMembers: 1,
      supportLevel: 'community',
      advancedFeatures: false,
      apiAccess: false,
      prioritySupport: false,
      exportResults: false
    },
    limits: {
      maxQueries: 10,
      aiProviders: ['mock'],
      teamMembers: 1,
      apiRequests: 0
    },
    max_users: 1,
    max_team_members: 1,
    description: 'Perfect for trying out ErrorWise with basic error analysis capabilities.',
    dodo_plan_id: null, // Free plan doesn't need Dodo integration
    dodo_product_id: null,
    is_active: true
  },
  {
    name: 'Pro Plan',
    price: 29.00,
    billing_interval: 'month',
    trial_period_days: 14,
    features: {
      monthlyAnalyses: 1000,
      teamMembers: 5,
      supportLevel: 'email',
      advancedFeatures: true,
      apiAccess: true,
      prioritySupport: false,
      exportResults: true,
      customIntegrations: false
    },
    limits: {
      maxQueries: 1000,
      aiProviders: ['openai', 'gemini'],
      teamMembers: 5,
      apiRequests: 10000
    },
    max_users: 5,
    max_team_members: 5,
    description: 'Great for individual developers and small teams with advanced error analysis and team collaboration.',
    dodo_plan_id: process.env.DODO_PRO_PLAN_ID || 'plan_pro_monthly',
    dodo_product_id: process.env.DODO_PRO_PRODUCT_ID || 'prod_pro_plan',
    is_active: true
  },
  {
    name: 'Enterprise Plan',
    price: 99.00,
    billing_interval: 'month',
    trial_period_days: 30,
    features: {
      monthlyAnalyses: -1, // unlimited
      teamMembers: -1, // unlimited
      supportLevel: 'priority',
      advancedFeatures: true,
      apiAccess: true,
      prioritySupport: true,
      exportResults: true,
      customIntegrations: true,
      onPremiseOption: true,
      ssoIntegration: true,
      customReporting: true
    },
    limits: {
      maxQueries: -1, // unlimited
      aiProviders: ['openai', 'gemini'],
      teamMembers: -1, // unlimited
      apiRequests: -1 // unlimited
    },
    max_users: -1, // unlimited
    max_team_members: -1, // unlimited
    description: 'Perfect for large development teams and enterprises with unlimited access and premium support.',
    dodo_plan_id: process.env.DODO_ENTERPRISE_PLAN_ID || 'plan_enterprise_monthly',
    dodo_product_id: process.env.DODO_ENTERPRISE_PRODUCT_ID || 'prod_enterprise_plan',
    is_active: true
  },
  // Yearly plans with discounts
  {
    name: 'Pro Plan (Yearly)',
    price: 290.00, // ~17% discount (2 months free)
    billing_interval: 'year',
    trial_period_days: 14,
    features: {
      monthlyAnalyses: 1000,
      teamMembers: 5,
      supportLevel: 'email',
      advancedFeatures: true,
      apiAccess: true,
      prioritySupport: false,
      exportResults: true,
      customIntegrations: false
    },
    limits: {
      maxQueries: 1000,
      aiProviders: ['openai', 'gemini'],
      teamMembers: 5,
      apiRequests: 10000
    },
    max_users: 5,
    max_team_members: 5,
    description: 'Annual Pro subscription with 17% savings (2 months free).',
    dodo_plan_id: process.env.DODO_PRO_YEARLY_PLAN_ID || 'plan_pro_yearly',
    dodo_product_id: process.env.DODO_PRO_PRODUCT_ID || 'prod_pro_plan',
    is_active: true
  },
  {
    name: 'Enterprise Plan (Yearly)',
    price: 990.00, // ~17% discount (2 months free)
    billing_interval: 'year',
    trial_period_days: 30,
    features: {
      monthlyAnalyses: -1,
      teamMembers: -1,
      supportLevel: 'priority',
      advancedFeatures: true,
      apiAccess: true,
      prioritySupport: true,
      exportResults: true,
      customIntegrations: true,
      onPremiseOption: true,
      ssoIntegration: true,
      customReporting: true
    },
    limits: {
      maxQueries: -1,
      aiProviders: ['openai', 'gemini'],
      teamMembers: -1,
      apiRequests: -1
    },
    max_users: -1,
    max_team_members: -1,
    description: 'Annual Enterprise subscription with 17% savings (2 months free).',
    dodo_plan_id: process.env.DODO_ENTERPRISE_YEARLY_PLAN_ID || 'plan_enterprise_yearly',
    dodo_product_id: process.env.DODO_ENTERPRISE_PRODUCT_ID || 'prod_enterprise_plan',
    is_active: true
  }
];

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Starting subscription plans seeding...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synced');

    console.log(`📦 Seeding ${defaultPlans.length} subscription plans...`);

    for (const planData of defaultPlans) {
      try {
        const [plan, created] = await SubscriptionPlan.findOrCreate({
          where: { name: planData.name },
          defaults: planData
        });

        if (created) {
          console.log(`✅ Created plan: ${plan.name}`);
        } else {
          // Update existing plan with new data
          await plan.update(planData);
          console.log(`🔄 Updated plan: ${plan.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to seed plan: ${planData.name}`, error.message);
      }
    }

    // Display summary
    console.log('\n📊 Subscription Plans Summary:');
    const plans = await SubscriptionPlan.findAll({
      attributes: ['name', 'price', 'billing_interval', 'dodo_plan_id', 'is_active'],
      order: [['price', 'ASC']]
    });

    console.table(plans.map(p => ({
      Name: p.name,
      Price: `$${p.price}/${p.billing_interval}`,
      'Dodo Plan ID': p.dodo_plan_id || 'N/A',
      Active: p.is_active ? '✅' : '❌'
    })));

    console.log('\n🎉 Subscription plans seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// CLI interface
if (require.main === module) {
  seedSubscriptionPlans()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedSubscriptionPlans, defaultPlans };