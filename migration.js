'use strict';

/**
 * ErrorWise Database Migration - Complete Schema
 * Includes: Users, Subscriptions, Teams, Error Management, Payment Integration
 * Updated: Team collaboration with unlimited members & 30-minute video sessions
 * Payment Provider: Dodo Payments (migrated from Stripe)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Subscription plans (Updated for tier-based system)
    await queryInterface.createTable('subscription_plans', {
      plan_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      price: { type: Sequelize.DECIMAL(8,2), allowNull: false },
      features: { type: Sequelize.JSONB, defaultValue: [] },
      limits: { type: Sequelize.JSONB, defaultValue: {} },
      max_users: { type: Sequelize.INTEGER, defaultValue: 1 },
      max_team_members: { type: Sequelize.INTEGER, defaultValue: -1 }, // -1 = unlimited
      video_session_duration: { type: Sequelize.INTEGER, defaultValue: 30 }, // minutes
      description: { type: Sequelize.TEXT },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2. Tenants (Multi-tenant support)
    await queryInterface.createTable('tenants', {
      tenant_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      domain: { type: Sequelize.STRING(255), unique: true },
      subscription_plan_id: {
        type: Sequelize.INTEGER,
        references: { model: 'subscription_plans', key: 'plan_id' },
        onDelete: 'SET NULL'
      },
      settings: { type: Sequelize.JSONB, defaultValue: {} },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 3. Users (Updated with Dodo Payments integration)
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      username: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(255), unique: true, allowNull: false },
      password: { type: Sequelize.STRING(255), allowNull: false },
      subscription_tier: { type: Sequelize.STRING(50), defaultValue: 'free' },
      plan: { type: Sequelize.STRING(20), defaultValue: 'free' },
      
      // Dodo Payments integration (migrated from Stripe)
      dodo_customer_id: { type: Sequelize.STRING(255), unique: true },
      
      // Multi-tenant support
      tenant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tenants', key: 'tenant_id' },
        onDelete: 'CASCADE'
      },
      
      // Profile & settings
      profile: { type: Sequelize.JSONB, defaultValue: {} },
      preferences: { type: Sequelize.JSONB, defaultValue: {} },
      
      // Status tracking
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      last_login: { type: Sequelize.DATE },
      email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 4. Subscriptions (Dodo Payments integration)
    await queryInterface.createTable('subscriptions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      plan: { type: Sequelize.STRING, allowNull: false, defaultValue: 'free' },
      status: { 
        type: Sequelize.ENUM('active', 'cancelled', 'expired', 'pending', 'trial'),
        allowNull: false, 
        defaultValue: 'active' 
      },
      
      // Subscription periods
      start_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      end_date: { type: Sequelize.DATE },
      trial_end: { type: Sequelize.DATE },
      
      // Dodo Payments details
      dodo_subscription_id: { type: Sequelize.STRING(255) },
      dodo_customer_id: { type: Sequelize.STRING(255) },
      
      // Additional data
      details: { type: Sequelize.JSONB, defaultValue: {} },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 5. Teams (Team collaboration with unlimited members & video sessions)
    await queryInterface.createTable('teams', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { 
        type: Sequelize.STRING(100), 
        allowNull: false,
        validate: { len: [3, 100] }
      },
      description: { type: Sequelize.TEXT },
      
      // Team ownership & subscription
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'subscriptions', key: 'id' },
        onDelete: 'CASCADE'
      },
      
      // Team limits (unlimited members feature)
      max_members: { 
        type: Sequelize.INTEGER, 
        defaultValue: -1, // -1 means unlimited
        allowNull: false 
      },
      
      // Video collaboration
      video_room_id: { 
        type: Sequelize.STRING(255), 
        unique: true 
      },
      
      // Team settings (30-minute video sessions)
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {
          allow_guest_access: false,
          require_approval: true,
          enable_video_chat: true,
          enable_screen_sharing: true,
          video_session_duration_minutes: 30,
          unlimited_participants: true
        }
      },
      
      // Status & metadata
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 6. Team Members (Unlimited team collaboration)
    await queryInterface.createTable('team_members', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      
      // Team & user relationship
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      
      // Member role & status
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'member'),
        defaultValue: 'member',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'left'),
        defaultValue: 'pending',
        allowNull: false
      },
      
      // Invitation tracking
      invited_by: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      invited_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      joined_at: { type: Sequelize.DATE },
      
      // Member permissions
      permissions: {
        type: Sequelize.JSONB,
        defaultValue: {
          can_invite_members: false,
          can_manage_errors: true,
          can_start_video_chat: true,
          can_view_analytics: false
        }
      },
      
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 7. Shared Errors (Team error sharing & collaboration)
    await queryInterface.createTable('shared_errors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      
      // Team & sharing relationship
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'id' },
        onDelete: 'CASCADE'
      },
      shared_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      error_query_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'error_queries', key: 'id' },
        onDelete: 'CASCADE'
      },
      
      // Error details
      title: { 
        type: Sequelize.STRING(200), 
        allowNull: false,
        validate: { len: [5, 200] }
      },
      description: { type: Sequelize.TEXT },
      category: { type: Sequelize.STRING(100) },
      
      // Priority & status
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('open', 'discussing', 'resolved', 'archived'),
        defaultValue: 'open'
      },
      
      // Collaboration features
      tags: { type: Sequelize.JSONB, defaultValue: [] },
      discussion_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      votes: {
        type: Sequelize.JSONB,
        defaultValue: { upvotes: [], downvotes: [] }
      },
      
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 8. User Settings (Enhanced preferences)
    await queryInterface.createTable('user_settings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      
      // User preferences
      preferences: { 
        type: Sequelize.JSONB,
        defaultValue: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          email_notifications: true,
          push_notifications: false
        }
      },
      
      // Notification settings
      notifications_enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
      notification_preferences: {
        type: Sequelize.JSONB,
        defaultValue: {
          team_invitations: true,
          error_shared: true,
          video_chat_started: true,
          weekly_summary: false
        }
      },
      
      // Integrations & connectors
      connectors: { type: Sequelize.JSONB, defaultValue: {} },
      api_keys: { type: Sequelize.JSONB, defaultValue: {} },
      
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 9. Error Queries (AI-powered error analysis)
    await queryInterface.createTable('error_queries', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      
      // User & tenant relationship
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tenants', key: 'tenant_id' },
        onDelete: 'CASCADE'
      },
      
      // Error details
      error_message: { type: Sequelize.TEXT, allowNull: false },
      explanation: { type: Sequelize.TEXT },
      solutions: { type: Sequelize.JSONB, defaultValue: [] },
      explained: { type: Sequelize.BOOLEAN, defaultValue: false },
      
      // Subscription & AI tracking
      subscription_tier: { type: Sequelize.STRING, allowNull: false, defaultValue: 'free' },
      ai_model: { type: Sequelize.STRING(255) },
      ai_provider: { type: Sequelize.STRING(255) },
      
      // Analysis metadata
      error_type: { type: Sequelize.STRING(100) },
      programming_language: { type: Sequelize.STRING(50) },
      confidence_score: { type: Sequelize.FLOAT },
      processing_time_ms: { type: Sequelize.INTEGER },
      
      // Usage tracking
      view_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      shared_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 10. Error History (Legacy error tracking)
    await queryInterface.createTable('error_history', {
      error_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      tenant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tenants', key: 'tenant_id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      error_data: { type: Sequelize.JSONB, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 11. Tenant Settings (Multi-tenant configuration)
    await queryInterface.createTable('tenant_settings', {
      setting_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      tenant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tenants', key: 'tenant_id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      key: { type: Sequelize.STRING(100), allowNull: false },
      value: { type: Sequelize.TEXT },
      data_type: { 
        type: Sequelize.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: 'string'
      },
      description: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    // 12. Usage Logs (Analytics & monitoring)
    await queryInterface.createTable('usage_logs', {
      log_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      tenant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tenants', key: 'tenant_id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      action: { type: Sequelize.STRING(255), allowNull: false },
      resource_type: { type: Sequelize.STRING(100) },
      resource_id: { type: Sequelize.STRING(255) },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      ip_address: { type: Sequelize.INET },
      user_agent: { type: Sequelize.TEXT },
      timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // =====================================================
    // INDEXES - Performance optimization
    // =====================================================
    
    // Core relationship indexes
    await queryInterface.addIndex('users', ['tenant_id'], { name: 'idx_users_tenant_id' });
    await queryInterface.addIndex('users', ['subscription_tier'], { name: 'idx_users_subscription_tier' });
    await queryInterface.addIndex('users', ['dodo_customer_id'], { name: 'idx_users_dodo_customer_id' });
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['username'], { name: 'idx_users_username' });
    
    // Subscription indexes
    await queryInterface.addIndex('subscriptions', ['user_id'], { name: 'idx_subscriptions_user_id' });
    await queryInterface.addIndex('subscriptions', ['status'], { name: 'idx_subscriptions_status' });
    await queryInterface.addIndex('subscriptions', ['dodo_subscription_id'], { name: 'idx_subscriptions_dodo_id' });
    
    // Team collaboration indexes
    await queryInterface.addIndex('teams', ['owner_id'], { name: 'idx_teams_owner_id' });
    await queryInterface.addIndex('teams', ['subscription_id'], { name: 'idx_teams_subscription_id' });
    await queryInterface.addIndex('teams', ['video_room_id'], { name: 'idx_teams_video_room_id' });
    
    // Team member indexes
    await queryInterface.addIndex('team_members', ['team_id'], { name: 'idx_team_members_team_id' });
    await queryInterface.addIndex('team_members', ['user_id'], { name: 'idx_team_members_user_id' });
    await queryInterface.addIndex('team_members', ['team_id', 'user_id'], { 
      name: 'idx_team_members_unique', 
      unique: true 
    });
    await queryInterface.addIndex('team_members', ['role'], { name: 'idx_team_members_role' });
    await queryInterface.addIndex('team_members', ['status'], { name: 'idx_team_members_status' });
    
    // Error analysis indexes
    await queryInterface.addIndex('error_queries', ['user_id'], { name: 'idx_error_queries_user_id' });
    await queryInterface.addIndex('error_queries', ['tenant_id'], { name: 'idx_error_queries_tenant_id' });
    await queryInterface.addIndex('error_queries', ['subscription_tier'], { name: 'idx_error_queries_tier' });
    await queryInterface.addIndex('error_queries', ['created_at'], { name: 'idx_error_queries_created_at' });
    await queryInterface.addIndex('error_queries', ['explained'], { name: 'idx_error_queries_explained' });
    
    // Shared error indexes
    await queryInterface.addIndex('shared_errors', ['team_id'], { name: 'idx_shared_errors_team_id' });
    await queryInterface.addIndex('shared_errors', ['shared_by'], { name: 'idx_shared_errors_shared_by' });
    await queryInterface.addIndex('shared_errors', ['error_query_id'], { name: 'idx_shared_errors_query_id' });
    await queryInterface.addIndex('shared_errors', ['status'], { name: 'idx_shared_errors_status' });
    await queryInterface.addIndex('shared_errors', ['priority'], { name: 'idx_shared_errors_priority' });
    
    // System indexes
    await queryInterface.addIndex('error_history', ['tenant_id'], { name: 'idx_error_history_tenant_id' });
    await queryInterface.addIndex('usage_logs', ['tenant_id'], { name: 'idx_usage_logs_tenant_id' });
    await queryInterface.addIndex('usage_logs', ['user_id'], { name: 'idx_usage_logs_user_id' });
    await queryInterface.addIndex('usage_logs', ['timestamp'], { name: 'idx_usage_logs_timestamp' });
    await queryInterface.addIndex('tenant_settings', ['tenant_id'], { name: 'idx_tenant_settings_tenant_id' });
    await queryInterface.addIndex('user_settings', ['user_id'], { name: 'idx_user_settings_user_id' });

    console.log('✅ ErrorWise database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - subscription_plans (tier-based pricing)');
    console.log('   - tenants (multi-tenant support)');
    console.log('   - users (Dodo Payments integration)');
    console.log('   - subscriptions (Free/Pro/Team plans)');
    console.log('   - teams (unlimited members, 30-min video)');
    console.log('   - team_members (collaboration roles)');
    console.log('   - shared_errors (team error sharing)');
    console.log('   - error_queries (AI analysis)');
    console.log('   - user_settings (preferences)');
    console.log('   - System tables (history, logs, settings)');
    console.log('🚀 Ready for production deployment!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Rolling back ErrorWise database migration...');
    
    // Drop tables in reverse order to avoid foreign key conflicts
    await queryInterface.dropTable('usage_logs');
    await queryInterface.dropTable('tenant_settings');
    await queryInterface.dropTable('error_history');
    await queryInterface.dropTable('shared_errors');
    await queryInterface.dropTable('error_queries');
    await queryInterface.dropTable('user_settings');
    await queryInterface.dropTable('team_members');
    await queryInterface.dropTable('teams');
    await queryInterface.dropTable('subscriptions');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('tenants');
    await queryInterface.dropTable('subscription_plans');
    
    console.log('✅ ErrorWise database rollback completed!');
  }
};
