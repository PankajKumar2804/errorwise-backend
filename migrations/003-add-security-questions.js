const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'securityQuestion1', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('users', 'securityAnswer1', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('users', 'securityQuestion2', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('users', 'securityAnswer2', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('users', 'securityQuestion3', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('users', 'securityAnswer3', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✅ Successfully added security question columns');
    } catch (error) {
      console.error('❌ Error adding security question columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'securityAnswer3');
      await queryInterface.removeColumn('users', 'securityQuestion3');
      await queryInterface.removeColumn('users', 'securityAnswer2');
      await queryInterface.removeColumn('users', 'securityQuestion2');
      await queryInterface.removeColumn('users', 'securityAnswer1');
      await queryInterface.removeColumn('users', 'securityQuestion1');
      console.log('✅ Successfully removed security question columns');
    } catch (error) {
      console.error('❌ Error removing security question columns:', error);
      throw error;
    }
  }
};
