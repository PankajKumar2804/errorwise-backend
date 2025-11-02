const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Check if columns exist before adding
    const tableDescription = await queryInterface.describeTable('users');
    
    // Add subscription fields to users table if they don't exist
    if (!tableDescription.subscription_tier) {
      await queryInterface.addColumn('users', 'subscription_tier', {
        type: DataTypes.ENUM('free', 'pro', 'team'),
        defaultValue: 'free',
        allowNull: false
      });
    }
    
    if (!tableDescription.subscription_status) {
      await queryInterface.addColumn('users', 'subscription_status', {
        type: DataTypes.ENUM('active', 'cancelled', 'expired', 'trial'),
        defaultValue: 'active',
        allowNull: false
      });
    }
    
    if (!tableDescription.subscription_end_date) {
      await queryInterface.addColumn('users', 'subscription_end_date', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }
    
    if (!tableDescription.subscription_start_date) {
      await queryInterface.addColumn('users', 'subscription_start_date', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }
    
    if (!tableDescription.trial_ends_at) {
      await queryInterface.addColumn('users', 'trial_ends_at', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface) => {
    // Remove subscription fields from users table
    await queryInterface.removeColumn('users', 'subscription_tier');
    await queryInterface.removeColumn('users', 'subscription_status');
    await queryInterface.removeColumn('users', 'subscription_end_date');
    await queryInterface.removeColumn('users', 'subscription_start_date');
    await queryInterface.removeColumn('users', 'trial_ends_at');
  }
};
