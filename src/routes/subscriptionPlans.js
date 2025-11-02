/**
 * Subscription Plans Routes
 * Public endpoints for fetching subscription pricing plans
 */

const express = require('express');
const router = express.Router();
const subscriptionPlansController = require('../controllers/subscriptionPlansController');

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get all subscription plans
 * @access  Public
 */
router.get('/plans', subscriptionPlansController.getPlans);

/**
 * @route   GET /api/subscriptions/plans/:planId
 * @desc    Get a specific plan by ID
 * @access  Public
 */
router.get('/plans/:planId', subscriptionPlansController.getPlanById);

/**
 * @route   GET /api/subscriptions/config
 * @desc    Get Dodo Payments configuration (public info only)
 * @access  Public
 */
router.get('/config', subscriptionPlansController.getDodoConfig);

module.exports = router;
