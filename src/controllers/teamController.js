const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const SharedError = require('../models/SharedError');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new team (Team subscription required)
 */
exports.createTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, maxMembers = -1 } = req.body; // -1 means unlimited

    // Check if user has team subscription
    const user = await User.findByPk(userId, {
      include: [{
        model: Subscription,
        as: 'subscription'
      }]
    });

    if (!user || user.subscription_tier !== 'team') {
      return res.status(403).json({
        error: 'Team subscription required',
        message: 'You need a Team subscription to create teams'
      });
    }

    // Generate unique video room ID
    const videoRoomId = `errorwise-team-${uuidv4()}`;

    // Create team with unlimited members by default
    const team = await Team.create({
      name,
      description,
      owner_id: userId,
      subscription_id: user.subscription?.id,
      max_members: maxMembers,
      video_room_id: videoRoomId
    });

    // Add owner as team member
    await TeamMember.create({
      team_id: team.id,
      user_id: userId,
      role: 'owner',
      status: 'active',
      joined_at: new Date(),
      permissions: {
        can_invite_members: true,
        can_manage_errors: true,
        can_start_video_chat: true,
        can_view_analytics: true
      }
    });

    res.status(201).json({
      message: 'Team created successfully',
      team: {
        ...team.toJSON(),
        member_count: 1,
        role: 'owner',
        unlimited_members: team.max_members === -1
      }
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

/**
 * Get user's teams
 */
exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const teams = await Team.findAll({
      include: [
        {
          model: TeamMember,
          as: 'members',
          where: { user_id: userId },
          attributes: ['role', 'status', 'joined_at']
        },
        {
          model: TeamMember,
          as: 'all_members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          }]
        }
      ]
    });

    const teamsWithCounts = teams.map(team => ({
      ...team.toJSON(),
      member_count: team.all_members.length,
      role: team.members[0]?.role,
      status: team.members[0]?.status
    }));

    res.json({ teams: teamsWithCounts });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

/**
 * Invite user to team
 */
exports.inviteToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role = 'member' } = req.body;
    const inviterId = req.user.id;

    // Check if inviter has permission
    const inviterMembership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: inviterId },
      include: [{
        model: Team,
        as: 'team'
      }]
    });

    if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to invite members'
      });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ where: { email } });
    if (!userToInvite) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this email address'
      });
    }

    // Check if user is already a member
    const existingMember = await TeamMember.findOne({
      where: { team_id: teamId, user_id: userToInvite.id }
    });

    if (existingMember) {
      return res.status(400).json({
        error: 'Already a member',
        message: 'User is already a member of this team'
      });
    }

    // Check team member limit (only if not unlimited)
    const team = inviterMembership.team;
    if (team.max_members > 0) {
      const memberCount = await TeamMember.count({
        where: { team_id: teamId, status: { [sequelize.Op.in]: ['pending', 'active'] } }
      });

      if (memberCount >= team.max_members) {
        return res.status(400).json({
          error: 'Team full',
          message: 'Team has reached maximum member limit'
        });
      }
    }

    // Create invitation
    const invitation = await TeamMember.create({
      team_id: teamId,
      user_id: userToInvite.id,
      role,
      status: 'pending',
      invited_by: inviterId
    });

    // TODO: Send invitation email

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        user: {
          username: userToInvite.username,
          email: userToInvite.email
        },
        role,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Invite to team error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

/**
 * Accept team invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const invitation = await TeamMember.findOne({
      where: { 
        team_id: teamId, 
        user_id: userId, 
        status: 'pending' 
      }
    });

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found',
        message: 'No pending invitation found for this team'
      });
    }

    await invitation.update({
      status: 'active',
      joined_at: new Date()
    });

    res.json({
      message: 'Successfully joined the team',
      team_id: teamId,
      role: invitation.role
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

/**
 * Share error with team
 */
exports.shareError = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { errorQueryId, title, description, category, priority = 'medium' } = req.body;
    const userId = req.user.id;

    // Check if user is team member
    const membership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: userId, status: 'active' }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be a team member to share errors'
      });
    }

    const sharedError = await SharedError.create({
      team_id: teamId,
      shared_by: userId,
      error_query_id: errorQueryId,
      title,
      description,
      category,
      priority
    });

    res.status(201).json({
      message: 'Error shared with team successfully',
      shared_error: sharedError
    });
  } catch (error) {
    console.error('Share error error:', error);
    res.status(500).json({ error: 'Failed to share error' });
  }
};

/**
 * Get team shared errors
 */
exports.getTeamErrors = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20, status, category } = req.query;

    // Check if user is team member
    const membership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: userId, status: 'active' }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be a team member to view shared errors'
      });
    }

    const whereClause = { team_id: teamId };
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const { count, rows: sharedErrors } = await SharedError.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sharedBy',
          attributes: ['id', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      shared_errors: sharedErrors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get team errors error:', error);
    res.status(500).json({ error: 'Failed to fetch team errors' });
  }
};

/**
 * Start video chat session
 */
exports.startVideoChat = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if user is team member with video chat permissions
    const membership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: userId, status: 'active' },
      include: [{
        model: Team,
        as: 'team'
      }]
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be a team member to start video chats'
      });
    }

    if (!membership.permissions?.can_start_video_chat) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to start video chats'
      });
    }

    // Generate video chat session with 30-minute duration limit
    const sessionId = `${membership.team.video_room_id}-${Date.now()}`;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes from now
    
    res.json({
      message: 'Video chat session created',
      session: {
        id: sessionId,
        room_id: membership.team.video_room_id,
        started_by: req.user.username,
        started_at: startTime.toISOString(),
        expires_at: endTime.toISOString(),
        duration_limit_minutes: 30,
        join_url: `${process.env.FRONTEND_URL}/team/${teamId}/video/${sessionId}`,
        unlimited_participants: true
      }
    });
  } catch (error) {
    console.error('Start video chat error:', error);
    res.status(500).json({ error: 'Failed to start video chat' });
  }
};

module.exports = exports;