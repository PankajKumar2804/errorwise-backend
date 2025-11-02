const { redis } = require('../utils/redisClient');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Session configuration
const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';
const SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Create a new session for a user
 * @param {string} userId 
 * @param {object} userData 
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
async function createSession(userId, userData, token) {
  try {
    const sessionKey = `${SESSION_PREFIX}${token}`;
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    
    // Store session data
    const sessionData = {
      userId,
      ...userData,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    // Set session with expiration
    await redis.set(sessionKey, sessionData, SESSION_EXPIRY);
    
    // Add token to user's active sessions
    await redis.hSet(userSessionsKey, token, Date.now().toString());
    await redis.expire(userSessionsKey, SESSION_EXPIRY);
    
    logger.info(`Session created for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error creating session:', error);
    return false;
  }
}

/**
 * Get session data by token
 * @param {string} token 
 * @returns {Promise<object|null>}
 */
async function getSession(token) {
  try {
    const sessionKey = `${SESSION_PREFIX}${token}`;
    const sessionData = await redis.get(sessionKey);
    
    if (sessionData) {
      // Update last activity
      sessionData.lastActivity = Date.now();
      await redis.set(sessionKey, sessionData, SESSION_EXPIRY);
    }
    
    return sessionData;
  } catch (error) {
    logger.error('Error getting session:', error);
    return null;
  }
}

/**
 * Delete a specific session
 * @param {string} token 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
async function deleteSession(token, userId) {
  try {
    const sessionKey = `${SESSION_PREFIX}${token}`;
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    
    // Delete session
    await redis.del(sessionKey);
    
    // Remove from user's sessions
    if (userId) {
      await redis.hDel(userSessionsKey, token);
    }
    
    logger.info(`Session deleted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error deleting session:', error);
    return false;
  }
}

/**
 * Delete all sessions for a user
 * @param {string} userId 
 * @returns {Promise<number>} Number of sessions deleted
 */
async function deleteAllUserSessions(userId) {
  try {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    const sessions = await redis.hGetAll(userSessionsKey);
    
    if (Object.keys(sessions).length === 0) {
      return 0;
    }
    
    // Delete all session keys
    const sessionKeys = Object.keys(sessions).map(token => `${SESSION_PREFIX}${token}`);
    const deleted = await redis.del(sessionKeys);
    
    // Delete user sessions index
    await redis.del(userSessionsKey);
    
    logger.info(`Deleted ${deleted} sessions for user ${userId}`);
    return deleted;
  } catch (error) {
    logger.error('Error deleting user sessions:', error);
    return 0;
  }
}

/**
 * Get all active sessions for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
async function getUserSessions(userId) {
  try {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    const sessions = await redis.hGetAll(userSessionsKey);
    
    if (!sessions || Object.keys(sessions).length === 0) {
      return [];
    }
    
    // Get full session data for each token
    const sessionPromises = Object.keys(sessions).map(async (token) => {
      const sessionData = await getSession(token);
      return sessionData ? { ...sessionData, token } : null;
    });
    
    const sessionList = await Promise.all(sessionPromises);
    return sessionList.filter(session => session !== null);
  } catch (error) {
    logger.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Session middleware - validates and loads session from Redis
 */
const sessionMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return next(); // No token, continue without session
    }
    
    // Verify JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      
      // Load session from Redis
      const sessionData = await getSession(token);
      
      if (sessionData) {
        req.session = sessionData;
        req.user = {
          id: sessionData.userId,
          email: sessionData.email,
          username: sessionData.username,
          subscriptionTier: sessionData.subscriptionTier
        };
      } else {
        // Session expired or doesn't exist in Redis
        logger.warn(`Session not found in Redis for token: ${token.substring(0, 10)}...`);
      }
    } catch (jwtError) {
      logger.warn('Invalid JWT token:', jwtError.message);
    }
    
    next();
  } catch (error) {
    logger.error('Session middleware error:', error);
    next();
  }
};

/**
 * Require active session middleware
 */
const requireSession = async (req, res, next) => {
  if (!req.session || !req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to continue'
    });
  }
  next();
};

module.exports = {
  createSession,
  getSession,
  deleteSession,
  deleteAllUserSessions,
  getUserSessions,
  sessionMiddleware,
  requireSession,
  SESSION_EXPIRY
};
