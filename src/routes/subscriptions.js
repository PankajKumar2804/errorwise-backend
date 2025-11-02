const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/auth');

// Public endpoints (no auth required)
router.post('/webhook', subscriptionController.handleWebhook);
router.get('/plans', subscriptionController.getPlans);
// All other subscription routes require authentication
router.use(authMiddleware);
// Get user subscription
router.get('/', subscriptionController.getSubscription);

// Create subscription
router.post('/', subscriptionController.createSubscription);

// Update subscription (legacy)
router.put('/', subscriptionController.updateSubscription);

// Cancel subscription
router.delete('/', subscriptionController.cancelSubscription);

// Get subscription usage
router.get('/usage', subscriptionController.getUsage);

// Verify payment
router.post('/verify-payment', subscriptionController.verifyPayment);

module.exports = router;
