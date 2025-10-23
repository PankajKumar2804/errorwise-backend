// src/models/associations.js
const User = require('./User');
const ErrorQuery = require('./ErrorQuery');
const Subscription = require('./Subscription');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const SharedError = require('./SharedError');
const SubscriptionPlan = require('./SubscriptionPlan');
const Tenant = require('./Tenant');
const ErrorHistory = require('./ErrorHistory');
const TenantSettings = require('./TenantSettings');
const UsageLog = require('./UsageLog');
const UserSettings = require('./userSettings');

// User associations
User.hasMany(ErrorQuery, {
  foreignKey: 'user_id',
  as: 'errorQueries'
});

User.hasOne(Subscription, {
  foreignKey: 'user_id',
  as: 'subscription'
});

User.hasMany(Team, {
  foreignKey: 'owner_id',
  as: 'ownedTeams'
});

User.hasMany(TeamMember, {
  foreignKey: 'user_id',
  as: 'teamMemberships'
});

User.hasMany(SharedError, {
  foreignKey: 'shared_by',
  as: 'sharedErrors'
});

// ErrorQuery associations
ErrorQuery.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

ErrorQuery.hasMany(SharedError, {
  foreignKey: 'error_query_id',
  as: 'sharedInstances'
});

// Subscription associations
Subscription.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Subscription.hasMany(Team, {
  foreignKey: 'subscription_id',
  as: 'teams'
});

// Team associations
Team.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});

Team.belongsTo(Subscription, {
  foreignKey: 'subscription_id',
  as: 'subscription'
});

Team.hasMany(TeamMember, {
  foreignKey: 'team_id',
  as: 'members'
});

Team.hasMany(TeamMember, {
  foreignKey: 'team_id',
  as: 'all_members'
});

Team.hasMany(SharedError, {
  foreignKey: 'team_id',
  as: 'sharedErrors'
});

// TeamMember associations
TeamMember.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

TeamMember.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team'
});

TeamMember.belongsTo(User, {
  foreignKey: 'invited_by',
  as: 'inviter'
});

// SharedError associations
SharedError.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team'
});

SharedError.belongsTo(User, {
  foreignKey: 'shared_by',
  as: 'sharedBy'
});

SharedError.belongsTo(ErrorQuery, {
  foreignKey: 'error_query_id',
  as: 'errorQuery'
});

// SubscriptionPlan associations
SubscriptionPlan.hasMany(Tenant, {
  foreignKey: 'subscription_plan_id',
  as: 'tenants'
});

// Tenant associations
Tenant.belongsTo(SubscriptionPlan, {
  foreignKey: 'subscription_plan_id',
  as: 'subscriptionPlan'
});

Tenant.hasMany(User, {
  foreignKey: 'tenant_id',
  as: 'users'
});

Tenant.hasMany(ErrorQuery, {
  foreignKey: 'tenant_id',
  as: 'errorQueries'
});

Tenant.hasMany(ErrorHistory, {
  foreignKey: 'tenant_id',
  as: 'errorHistory'
});

Tenant.hasMany(TenantSettings, {
  foreignKey: 'tenant_id',
  as: 'tenantSettings'
});

Tenant.hasMany(UsageLog, {
  foreignKey: 'tenant_id',
  as: 'usageLogs'
});

// User additional associations
User.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

User.hasOne(UserSettings, {
  foreignKey: 'user_id',
  as: 'userSettings'
});

User.hasMany(ErrorHistory, {
  foreignKey: 'user_id',
  as: 'errorHistory'
});

User.hasMany(UsageLog, {
  foreignKey: 'user_id',
  as: 'usageLogs'
});

// ErrorQuery additional associations
ErrorQuery.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// ErrorHistory associations
ErrorHistory.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

ErrorHistory.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// TenantSettings associations
TenantSettings.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// UsageLog associations
UsageLog.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

UsageLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// UserSettings associations
UserSettings.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  User,
  ErrorQuery,
  Subscription,
  Team,
  TeamMember,
  SharedError,
  SubscriptionPlan,
  Tenant,
  ErrorHistory,
  TenantSettings,
  UsageLog,
  UserSettings
};