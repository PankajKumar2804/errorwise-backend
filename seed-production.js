const { sequelize } = require('./src/config/database');

/**
 * Production Database Seeding Script
 * Populates initial data for ErrorWise subscription plans
 */

const seedSubscriptionPlans = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Insert subscription plans
    await sequelize.query(`
      INSERT INTO subscription_plans (name, price, features, max_users, description) VALUES
      (
        'Free', 
        0.00, 
        '["5 queries per day", "Basic error explanations", "General tips and guidance", "Community support"]', 
        1, 
        'Perfect for individual developers getting started with error analysis'
      ),
      (
        'Pro', 
        2.00, 
        '["Unlimited queries", "Clear detailed explanations", "2-3 solution approaches per error", "Error history tracking", "Priority email support", "Advanced AI models"]', 
        1, 
        'For professional developers who need comprehensive error analysis'
      ),
      (
        'Team', 
        10.00, 
        '["Everything in Pro", "Unlimited team members", "30-minute video chat sessions", "Team collaboration tools", "Shared error database", "Real-time collaboration", "Team analytics dashboard", "Dedicated team support"]', 
        -1, 
        'For development teams requiring collaboration and video meetings'
      )
      ON CONFLICT (name) DO UPDATE SET
        price = EXCLUDED.price,
        features = EXCLUDED.features,
        max_users = EXCLUDED.max_users,
        description = EXCLUDED.description;
    `);

    console.log('✅ Subscription plans seeded successfully');

    // Create default tenant for single-tenant mode
    await sequelize.query(`
      INSERT INTO tenants (name, domain, subscription_plan_id) VALUES
      ('ErrorWise Default', 'default', 1)
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Default tenant created');

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
};

/**
 * Main execution function
 */
const runSeeding = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run seeding
    await seedSubscriptionPlans();

    console.log('🚀 All seeding operations completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
};

// Export for use in other scripts
module.exports = {
  seedSubscriptionPlans,
  runSeeding
};

// Run if called directly
if (require.main === module) {
  runSeeding();
}