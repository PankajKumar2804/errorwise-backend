const { sequelize, DataTypes } = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  plan_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  limits: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  max_users: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  max_team_members: {
    type: DataTypes.INTEGER,
    defaultValue: -1 // -1 = unlimited
  },
  video_session_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // minutes
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubscriptionPlan;