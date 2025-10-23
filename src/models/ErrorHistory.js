const { sequelize, DataTypes } = require('../config/database');

const ErrorHistory = sequelize.define('ErrorHistory', {
  error_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tenants',
      key: 'tenant_id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  error_data: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'error_history',
  timestamps: false
});

module.exports = ErrorHistory;