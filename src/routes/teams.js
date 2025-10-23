const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { verifyToken } = require('../middleware/auth');
const { validateTeamCreation, validateInvitation, validateErrorSharing } = require('../middleware/validation');

// Apply authentication middleware to all team routes
router.use(verifyToken);

// Team management routes
router.post('/', validateTeamCreation, teamController.createTeam);
router.get('/', teamController.getUserTeams);

// Team membership routes
router.post('/:teamId/invite', validateInvitation, teamController.inviteToTeam);
router.post('/:teamId/accept', teamController.acceptInvitation);

// Error sharing routes
router.post('/:teamId/errors', validateErrorSharing, teamController.shareError);
router.get('/:teamId/errors', teamController.getTeamErrors);

// Video chat routes
router.post('/:teamId/video/start', teamController.startVideoChat);

module.exports = router;