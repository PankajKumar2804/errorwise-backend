const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * DeletedUserTracking Model
 * Permanently tracks users who delete accounts to prevent abuse
 * This data is never deleted and helps identify returning users
 */
const DeletedUserTracking = sequelize.define('DeletedUserTracking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Original user information
  originalUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'original_user_id'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'email'
  },
  emailHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email_hash'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone_number'
  },
  phoneHash: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone_hash'
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'google_id'
  },
  // Tracking information
  originalRegistrationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'original_registration_date'
  },
  deletionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'deletion_date'
  },
  deletionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'deletion_count'
  },
  // Usage statistics at deletion time
  totalQueriesBeforeDeletion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_queries_before_deletion'
  },
  subscriptionTierAtDeletion: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'subscription_tier_at_deletion'
  },
  // Flags
  isAbuser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_abuser'
  },
  abuseReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'abuse_reason'
  },
  // Metadata
  deletionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'deletion_reason'
  },
  ipAddressAtDeletion: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address_at_deletion'
  }
}, {
  tableName: 'deleted_user_tracking',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DeletedUserTracking;
