const ErrorQuery = require('../models/ErrorQuery');
const { Op } = require('sequelize');

// GET /api/history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ErrorQuery.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'errorMessage', 'explanation', 'solution', 'errorCategory',
        'aiProvider', 'userSubscriptionTier', 'responseTime', 'tags', 'createdAt'
      ]
    });
    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch query history' });
  }
};

// GET /api/history/user
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', category = '', sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = { userId };

    if (search.trim()) {
      whereClause[Op.or] = [
        { errorMessage: { [Op.iLike]: `%${search}%` } },
        { explanation: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category.trim()) {
      whereClause.errorCategory = category;
    }
    const { rows: queries, count: total } = await ErrorQuery.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'errorMessage', 'explanation', 'solution', 'errorCategory',
        'aiProvider', 'userSubscriptionTier', 'responseTime', 'tags', 'createdAt'
      ]
    });

    res.json({
      queries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQueries: total,
        hasNextPage: offset + queries.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch query history' });
  }
};

// GET /api/history/:queryId
exports.getQueryById = async (req, res) => {
  try {
    const { queryId } = req.params;
    const userId = req.user.id;
    const query = await ErrorQuery.findOne({
      where: { id: queryId, userId },
      attributes: [
        'id', 'errorMessage', 'explanation', 'solution', 'errorCategory',
        'aiProvider', 'userSubscriptionTier', 'responseTime', 'tags', 'createdAt', 'updatedAt'
      ]
    });
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    res.json(query);
  } catch (error) {
    console.error('Error fetching query by ID:', error);
    res.status(500).json({ error: 'Failed to fetch query details' });
  }
};

// DELETE /api/history/:queryId
exports.deleteQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const userId = req.user.id;
    const deleted = await ErrorQuery.destroy({
      where: { id: queryId, userId }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Query not found' });
    }
    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ error: 'Failed to delete query' });
  }
};

// GET /api/history/stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalQueries = await ErrorQuery.count({ where: { userId } });
    
    // Get queries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const queriesThisWeek = await ErrorQuery.count({
      where: {
        userId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Get queries from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const queriesThisMonth = await ErrorQuery.count({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Get category breakdown
    const categoryStats = await ErrorQuery.findAll({
      where: { userId },
      attributes: [
        'errorCategory',
        [ErrorQuery.sequelize.fn('COUNT', ErrorQuery.sequelize.col('errorCategory')), 'count']
      ],
      group: ['errorCategory'],
      raw: true
    });

    res.json({
      totalQueries,
      queriesThisWeek,
      queriesThisMonth,
      categoriesBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};