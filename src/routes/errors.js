const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const authenticateToken = require('../middleware/auth');

// All error routes require authentication
router.use(authenticateToken);

// POST /api/errors/analyze - Analyze an error with AI
router.post('/analyze', errorController.analyzeError);

// GET /api/errors/history - Get user's error query history
router.get('/history', errorController.getHistory);

// GET /api/errors/recent - Get user's recent error analyses
router.get('/recent', errorController.getRecentAnalyses);

// GET /api/errors/stats - Get user's error statistics
router.get('/stats', errorController.getStats);

// GET /api/errors/:id - Get specific error query details
router.get('/:id', errorController.getErrorQuery);

// DELETE /api/errors/:id - Delete an error query
router.delete('/:id', errorController.deleteErrorQuery);

module.exports = router;
