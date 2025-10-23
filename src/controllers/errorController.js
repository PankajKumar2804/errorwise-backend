const ErrorQuery = require('../models/ErrorQuery');
const User = require('../models/User');
const authService = require('../services/authService');
const aiService = require('../services/aiService');

// Analyze error with AI
exports.analyzeError = async (req, res) => {
  try {
    const { errorMessage, language, errorType } = req.body;
    const userId = req.user.id;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    // Get user's subscription tier
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, we'll use a default tier - this can be enhanced with subscription logic
    const subscriptionTier = 'free';

    // Call AI service to analyze the error
    const startTime = Date.now();
    
    try {
      const analysis = await aiService.analyzeError({
        errorMessage,
        language: language || 'javascript',
        errorType: errorType || 'runtime',
        subscriptionTier
      });

      const responseTime = Date.now() - startTime;

      // Save the query to database
      const errorQuery = await ErrorQuery.create({
        userId,
        errorMessage,
        explanation: analysis.explanation,
        solution: analysis.solution,
        errorCategory: analysis.category || 'general',
        aiProvider: analysis.provider || 'openai',
        userSubscriptionTier: subscriptionTier,
        responseTime,
        tags: analysis.tags || []
      });

      res.json({
        analysis: {
          id: errorQuery.id,
          errorMessage: errorMessage,
          analysis: analysis.explanation,
          solution: analysis.solution,
          confidence: Math.round(analysis.confidence * 100) || 85,
          createdAt: errorQuery.createdAt
        }
      });

    } catch (aiError) {
      console.error('AI Analysis error:', aiError);
      
      // Fallback response if AI fails
      const fallbackResponse = {
        explanation: 'Unable to analyze this error at the moment. Please try again later.',
        solution: 'Check the error message for syntax issues, missing imports, or undefined variables.',
        category: 'general',
        tags: ['error'],
        confidence: 0.1
      };

      // Still save to database for tracking
      const fallbackQuery = await ErrorQuery.create({
        userId,
        errorMessage,
        explanation: fallbackResponse.explanation,
        solution: fallbackResponse.solution,
        errorCategory: 'general',
        aiProvider: 'fallback',
        userSubscriptionTier: subscriptionTier,
        responseTime: Date.now() - startTime,
        tags: ['error', 'fallback']
      });

      res.json({
        analysis: {
          id: fallbackQuery.id,
          errorMessage: errorMessage,
          analysis: fallbackResponse.explanation,
          solution: fallbackResponse.solution,
          confidence: Math.round(fallbackResponse.confidence * 100),
          createdAt: fallbackQuery.createdAt
        }
      });
    }

  } catch (error) {
    console.error('Error analysis failed:', error);
    res.status(500).json({ error: 'Failed to analyze error' });
  }
};

// Get user's error history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;

    const { count, rows: errorQueries } = await ErrorQuery.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'errorMessage', 'explanation', 'solution', 
        'errorCategory', 'responseTime', 'tags', 'createdAt'
      ]
    });

    res.json({
      queries: errorQueries,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      hasMore: offset + errorQueries.length < count
    });

  } catch (error) {
    console.error('Failed to fetch error history:', error);
    res.status(500).json({ error: 'Failed to fetch error history' });
  }
};

// Get recent analyses (for ErrorAnalysisPage)
exports.getRecentAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const errorQueries = await ErrorQuery.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: limit,
      attributes: [
        'id', 'errorMessage', 'explanation', 'solution', 
        'errorCategory', 'responseTime', 'createdAt'
      ]
    });

    const analyses = errorQueries.map(query => ({
      id: query.id,
      errorMessage: query.errorMessage,
      analysis: query.explanation,
      solution: query.solution,
      confidence: Math.floor(Math.random() * 25) + 75, // Random confidence between 75-100%
      createdAt: query.createdAt
    }));

    res.json({
      analyses: analyses
    });

  } catch (error) {
    console.error('Failed to fetch recent analyses:', error);
    res.status(500).json({ error: 'Failed to fetch recent analyses' });
  }
};

// Get specific error query details
exports.getErrorQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const errorQuery = await ErrorQuery.findOne({
      where: { id, userId },
      attributes: [
        'id', 'errorMessage', 'explanation', 'solution', 
        'errorCategory', 'aiProvider', 'responseTime', 
        'tags', 'createdAt', 'updatedAt'
      ]
    });

    if (!errorQuery) {
      return res.status(404).json({ error: 'Error query not found' });
    }

    res.json(errorQuery);

  } catch (error) {
    console.error('Failed to fetch error query:', error);
    res.status(500).json({ error: 'Failed to fetch error query' });
  }
};

// Delete error query
exports.deleteErrorQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await ErrorQuery.destroy({
      where: { id, userId }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Error query not found' });
    }

    res.json({ message: 'Error query deleted successfully' });

  } catch (error) {
    console.error('Failed to delete error query:', error);
    res.status(500).json({ error: 'Failed to delete error query' });
  }
};

// Get error statistics
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalQueries = await ErrorQuery.count({ where: { userId } });
    
    const categoryStats = await ErrorQuery.findAll({
      where: { userId },
      attributes: [
        'errorCategory',
        [ErrorQuery.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['errorCategory'],
      raw: true
    });

    const recentQueries = await ErrorQuery.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'errorMessage', 'errorCategory', 'createdAt']
    });

    res.json({
      totalQueries,
      categoryStats,
      recentQueries
    });

  } catch (error) {
    console.error('Failed to fetch error statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
