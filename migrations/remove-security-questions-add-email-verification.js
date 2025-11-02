/**
 * Migration: Remove Security Questions and Add Email Verification
 * 
 * This migration:
 * 1. Removes security question columns (security_question_1/2/3, security_answer_1/2/3)
 * 2. Adds email verification columns (email_verification_token, email_verification_expires, is_email_verified)
 * 3. Sets all existing users as email verified (to avoid locking them out)
 */

const { Sequelize } = require('sequelize');
const sequelize = require('../src/config/database');

async function up() {
    const queryInterface = sequelize.getQueryInterface();
    const transaction = await sequelize.transaction();

    try {
        console.log('🔄 Starting migration: Remove security questions, add email verification...');

        // Check if table exists
        const tables = await queryInterface.showAllTables();
        if (!tables.includes('users')) {
            console.log('⚠️  Users table not found. Skipping migration.');
            await transaction.rollback();
            return;
        }

        // Get current table structure
        const tableDescription = await queryInterface.describeTable('users');

        // Add email verification columns if they don't exist
        if (!tableDescription.email_verification_token) {
            console.log('➕ Adding email_verification_token column...');
            await queryInterface.addColumn('users', 'email_verification_token', {
                type: Sequelize.STRING,
                allowNull: true
            }, { transaction });
        }

        if (!tableDescription.email_verification_expires) {
            console.log('➕ Adding email_verification_expires column...');
            await queryInterface.addColumn('users', 'email_verification_expires', {
                type: Sequelize.DATE,
                allowNull: true
            }, { transaction });
        }

        if (!tableDescription.is_email_verified) {
            console.log('➕ Adding is_email_verified column...');
            await queryInterface.addColumn('users', 'is_email_verified', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            }, { transaction });

            // Set all existing users as verified (grandfather them in)
            console.log('✅ Setting existing users as email verified...');
            await sequelize.query(
                'UPDATE users SET is_email_verified = true WHERE is_email_verified = false',
                { transaction }
            );
        }

        // Remove security question columns if they exist
        const securityColumns = [
            'security_question_1',
            'security_answer_1',
            'security_question_2',
            'security_answer_2',
            'security_question_3',
            'security_answer_3'
        ];

        for (const column of securityColumns) {
            if (tableDescription[column]) {
                console.log(`➖ Removing ${column} column...`);
                await queryInterface.removeColumn('users', column, { transaction });
            }
        }

        await transaction.commit();
        console.log('✅ Migration completed successfully!');
        console.log('📝 Summary:');
        console.log('   - Removed security question columns');
        console.log('   - Added email verification columns');
        console.log('   - Existing users marked as verified');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

async function down() {
    const queryInterface = sequelize.getQueryInterface();
    const transaction = await sequelize.transaction();

    try {
        console.log('🔄 Rolling back migration: Restore security questions...');

        // Add back security question columns
        const securityColumns = [
            { name: 'security_question_1', type: Sequelize.STRING },
            { name: 'security_answer_1', type: Sequelize.STRING },
            { name: 'security_question_2', type: Sequelize.STRING },
            { name: 'security_answer_2', type: Sequelize.STRING },
            { name: 'security_question_3', type: Sequelize.STRING },
            { name: 'security_answer_3', type: Sequelize.STRING }
        ];

        for (const col of securityColumns) {
            console.log(`➕ Adding back ${col.name} column...`);
            await queryInterface.addColumn('users', col.name, {
                type: col.type,
                allowNull: true
            }, { transaction });
        }

        // Remove email verification columns
        console.log('➖ Removing email verification columns...');
        await queryInterface.removeColumn('users', 'email_verification_token', { transaction });
        await queryInterface.removeColumn('users', 'email_verification_expires', { transaction });
        await queryInterface.removeColumn('users', 'is_email_verified', { transaction });

        await transaction.commit();
        console.log('✅ Rollback completed successfully!');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Rollback failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'up') {
        up()
            .then(() => {
                console.log('Migration completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('Migration failed:', error);
                process.exit(1);
            });
    } else if (command === 'down') {
        down()
            .then(() => {
                console.log('Rollback completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('Rollback failed:', error);
                process.exit(1);
            });
    } else {
        console.log('Usage: node remove-security-questions-add-email-verification.js [up|down]');
        process.exit(1);
    }
}

module.exports = { up, down };
