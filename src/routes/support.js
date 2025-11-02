/**
 * Support System Routes
 * Routes for Feedback, Contact Messages, and Help Center
 */

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const rateLimit = require('express-rate-limit');

// Rate limiters
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many feedback submissions, please try again later.'
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: 'Too many contact requests, please try again later.'
});

const ticketLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 tickets per hour
  message: 'Too many ticket submissions, please try again later.'
});

/**
 * ============================================
 * PUBLIC ROUTES
 * ============================================
 */

// Help Center Articles (Public)
router.get('/help/articles', supportController.getHelpArticles);
router.get('/help/articles/:slug', supportController.getHelpArticle);
router.post('/help/articles/:slug/rate', supportController.rateHelpArticle);

/**
 * ============================================
 * FEEDBACK ROUTES
 * ============================================
 */

// Submit feedback (optional auth - can be anonymous or authenticated)
router.post('/feedback', optionalAuth, feedbackLimiter, supportController.submitFeedback);

// Get user's own feedback history (authenticated)
router.get('/feedback/me', authMiddleware, supportController.getUserFeedback);

// Admin routes
router.get('/feedback/all', authMiddleware, isAdmin, supportController.getAllFeedback);

/**
 * ============================================
 * CONTACT MESSAGE ROUTES
 * ============================================
 */

// Submit contact message (optional auth)
router.post('/contact', optionalAuth, contactLimiter, supportController.submitContactMessage);

// Admin routes
router.get('/contact/all', authMiddleware, isAdmin, supportController.getAllContactMessages);
router.patch('/contact/:id', authMiddleware, isAdmin, supportController.updateContactMessage);

/**
 * ============================================
 * HELP CENTER TICKET ROUTES
 * ============================================
 */

// Create help ticket (optional auth)
router.post('/help/tickets', optionalAuth, ticketLimiter, supportController.createHelpTicket);

// Get user's tickets (authenticated or by email)
router.get('/help/tickets/me', optionalAuth, supportController.getUserHelpTickets);

// Get specific ticket details
router.get('/help/tickets/:ticketNumber', optionalAuth, supportController.getHelpTicket);

// Add response to ticket
router.post('/help/tickets/:ticketNumber/responses', optionalAuth, supportController.addTicketResponse);

// Admin routes
router.get('/help/tickets/all/list', authMiddleware, isAdmin, supportController.getAllHelpTickets);
router.patch('/help/tickets/:ticketNumber', authMiddleware, isAdmin, supportController.updateHelpTicket);

module.exports = router;
