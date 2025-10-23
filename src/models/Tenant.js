const { sequelize, DataTypes } = require('../config/database');

const Tenant = sequelize.define('Tenant', {
  tenant_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true
  },
  subscription_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subscription_plans',
      key: 'plan_id'
    }
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  tableName: 'tenants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Tenant;