'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table exists
    const tableExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');`
    );
    
    if (!tableExists[0][0].exists) {
      // Create users table if it doesn't exist
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        reset_password_token: {
          type: Sequelize.STRING,
          allowNull: true
        },
        reset_password_expires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        role: {
          type: Sequelize.ENUM('user', 'admin'),
          defaultValue: 'user'
        },
        subscription_status: {
          type: Sequelize.ENUM('free', 'team', 'premium'),
          defaultValue: 'free'
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        security_question_1: {
          type: Sequelize.STRING,
          allowNull: true
        },
        security_answer_1: {
          type: Sequelize.STRING,
          allowNull: true
        },
        security_question_2: {
          type: Sequelize.STRING,
          allowNull: true
        },
        security_answer_2: {
          type: Sequelize.STRING,
          allowNull: true
        },
        security_question_3: {
          type: Sequelize.STRING,
          allowNull: true
        },
        security_answer_3: {
          type: Sequelize.STRING,
          allowNull: true
        },
        google_id: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true
        },
        phone_number: {
          type: Sequelize.STRING,
          allowNull: true
        },
        is_phone_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        phone_verification_token: {
          type: Sequelize.STRING,
          allowNull: true
        },
        phone_verification_expires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        original_registration_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        account_recreation_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        last_login_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        login_otp: {
          type: Sequelize.STRING,
          allowNull: true
        },
        login_otp_expires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    } else {
      // Add missing columns if table exists
      const columns = await queryInterface.describeTable('users');
      
      // Add username if missing
      if (!columns.username) {
        await queryInterface.addColumn('users', 'username', {
          type: Sequelize.STRING,
          allowNull: true // Make nullable initially
        });
      }

      // Rename password_hash to password if needed
      if (columns.password_hash && !columns.password) {
        await queryInterface.renameColumn('users', 'password_hash', 'password');
      }

      // Add security question columns if missing
      if (!columns.security_question_1) {
        await queryInterface.addColumn('users', 'security_question_1', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      if (!columns.security_answer_1) {
        await queryInterface.addColumn('users', 'security_answer_1', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      if (!columns.security_question_2) {
        await queryInterface.addColumn('users', 'security_question_2', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      if (!columns.security_answer_2) {
        await queryInterface.addColumn('users', 'security_answer_2', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      if (!columns.security_question_3) {
        await queryInterface.addColumn('users', 'security_question_3', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      if (!columns.security_answer_3) {
        await queryInterface.addColumn('users', 'security_answer_3', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }

      // Add last_login_at if missing
      if (!columns.last_login_at) {
        await queryInterface.addColumn('users', 'last_login_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally remove columns or drop table
    // await queryInterface.dropTable('users');
  }
};
