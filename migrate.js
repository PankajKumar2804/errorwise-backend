#!/usr/bin/env node

/**
 * Database Migration Runner for Dodo Payments Update
 * 
 * This script runs database migrations to update the ErrorWise backend
 * from Stripe to Dodo Payments configuration.
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;

// Import database connection
const sequelize = require('./src/config/database');

class MigrationRunner {
  constructor() {
    this.migrationDir = path.join(__dirname, 'migrations');
    this.appliedMigrationsTable = 'SequelizeMeta';
  }

  async initialize() {
    try {
      console.log('🔌 Connecting to database...');
      await sequelize.authenticate();
      console.log('✅ Database connection established.');

      // Create migrations tracking table if it doesn't exist
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "${this.appliedMigrationsTable}" (
          name VARCHAR(255) NOT NULL PRIMARY KEY
        );
      `);

      console.log('✅ Migration tracking table ready.');
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      throw error;
    }
  }

  async getAppliedMigrations() {
    try {
      const [results] = await sequelize.query(`
        SELECT name FROM "${this.appliedMigrationsTable}" ORDER BY name;
      `);
      return results.map(row => row.name);
    } catch (error) {
      console.error('❌ Failed to get applied migrations:', error);
      return [];
    }
  }

  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationDir);
      return files
        .filter(file => file.endsWith('.js'))
        .sort();
    } catch (error) {
      console.error('❌ Failed to read migration directory:', error);
      return [];
    }
  }

  async runMigration(migrationName, direction = 'up') {
    try {
      const migrationPath = path.join(this.migrationDir, migrationName);
      console.log(`🔄 Running migration: ${migrationName} (${direction})`);

      // Import migration module
      delete require.cache[require.resolve(migrationPath)];
      const migration = require(migrationPath);

      // Run migration
      if (direction === 'up') {
        await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
        
        // Record migration as applied
        await sequelize.query(`
          INSERT INTO "${this.appliedMigrationsTable}" (name) 
          VALUES (?) 
          ON CONFLICT (name) DO NOTHING;
        `, {
          replacements: [migrationName]
        });
      } else {
        await migration.down(sequelize.getQueryInterface(), sequelize.constructor);
        
        // Remove migration from applied list
        await sequelize.query(`
          DELETE FROM "${this.appliedMigrationsTable}" WHERE name = ?;
        `, {
          replacements: [migrationName]
        });
      }

      console.log(`✅ Migration completed: ${migrationName}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationName}`, error);
      throw error;
    }
  }

  async runAllMigrations() {
    try {
      await this.initialize();

      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      console.log(`📊 Found ${migrationFiles.length} migration files`);
      console.log(`📊 ${appliedMigrations.length} migrations already applied`);

      const pendingMigrations = migrationFiles.filter(
        file => !appliedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations. Database is up to date!');
        return;
      }

      console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);

      for (const migration of pendingMigrations) {
        await this.runMigration(migration, 'up');
      }

      console.log('🎉 All migrations completed successfully!');

    } catch (error) {
      console.error('❌ Migration process failed:', error);
      throw error;
    }
  }

  async rollbackLastMigration() {
    try {
      await this.initialize();

      const appliedMigrations = await this.getAppliedMigrations();

      if (appliedMigrations.length === 0) {
        console.log('ℹ️  No migrations to rollback.');
        return;
      }

      const lastMigration = appliedMigrations[appliedMigrations.length - 1];
      console.log(`🔄 Rolling back migration: ${lastMigration}`);

      await this.runMigration(lastMigration, 'down');

      console.log('✅ Migration rollback completed!');

    } catch (error) {
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
  }

  async status() {
    try {
      await this.initialize();

      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      console.log('\n📊 Migration Status:');
      console.log('==================');

      for (const file of migrationFiles) {
        const status = appliedMigrations.includes(file) ? '✅ Applied' : '⏳ Pending';
        console.log(`${status} - ${file}`);
      }

      const pendingCount = migrationFiles.filter(
        file => !appliedMigrations.includes(file)
      ).length;

      console.log(`\n📈 Summary: ${appliedMigrations.length} applied, ${pendingCount} pending\n`);

    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await runner.runAllMigrations();
        break;

      case 'down':
      case 'rollback':
        await runner.rollbackLastMigration();
        break;

      case 'status':
        await runner.status();
        break;

      default:
        console.log(`
🔧 ErrorWise Database Migration Tool

Usage:
  node migrate.js <command>

Commands:
  up, migrate    - Run all pending migrations
  down, rollback - Rollback the last migration
  status         - Show migration status

Examples:
  node migrate.js up       # Apply all pending migrations
  node migrate.js status   # Check which migrations are applied
  node migrate.js rollback # Undo the last migration
        `);
        break;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted. Cleaning up...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Migration terminated. Cleaning up...');
  await sequelize.close();
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = MigrationRunner;