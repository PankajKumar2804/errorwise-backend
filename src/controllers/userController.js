const User = require('../models/User');
const ErrorQuery = require('../models/ErrorQuery');
const authService = require('../services/authService');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const totalQueries = await ErrorQuery.count({ where: { userId } });
    const thisMonthQueries = await ErrorQuery.count({
      where: {
        userId,
        createdAt: {
          [require('sequelize').Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        memberSince: user.createdAt
      },
      stats: {
        totalQueries,
        thisMonthQueries,
        subscriptionTier: 'free' // TODO: Implement subscription system
      }
    });

  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    // Validate input
    if (!username && !email) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    const updateData = {};
    if (username) updateData.username = username.trim();
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        where: { 
          email: email.trim(),
          id: { [require('sequelize').Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        return res.status(409).json({ error: 'Email is already taken' });
      }
      
      updateData.email = email.trim();
    }

    await User.update(updateData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'createdAt']
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Failed to update user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await authService.comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const hashedNewPassword = await authService.hashPassword(newPassword);
    await User.update({ password: hashedNewPassword }, { where: { id: userId } });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Failed to change password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await authService.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete user's error queries first (due to foreign key constraint)
    await ErrorQuery.destroy({ where: { userId } });
    
    // Delete user account
    await User.destroy({ where: { id: userId } });

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Failed to delete account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Get user dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent error queries
    const recentQueries = await ErrorQuery.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'errorMessage', 'errorCategory', 'createdAt', 'tags']
    });

    // Get error categories statistics
    const categoryStats = await ErrorQuery.findAll({
      where: { userId },
      attributes: [
        'errorCategory',
        [ErrorQuery.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['errorCategory'],
      raw: true
    });

    // Get monthly query count for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await ErrorQuery.findAll({
      where: {
        userId,
        createdAt: { [require('sequelize').Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [ErrorQuery.sequelize.fn('DATE_TRUNC', 'month', ErrorQuery.sequelize.col('createdAt')), 'month'],
        [ErrorQuery.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [ErrorQuery.sequelize.fn('DATE_TRUNC', 'month', ErrorQuery.sequelize.col('createdAt'))],
      order: [[ErrorQuery.sequelize.fn('DATE_TRUNC', 'month', ErrorQuery.sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Get total statistics
    const totalQueries = await ErrorQuery.count({ where: { userId } });
    const thisWeekQueries = await ErrorQuery.count({
      where: {
        userId,
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      summary: {
        totalQueries,
        thisWeekQueries,
        categoriesCount: categoryStats.length,
        subscriptionTier: 'free'
      },
      recentQueries,
      categoryStats,
      monthlyStats
    });

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
