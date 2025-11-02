const { redis } = require('../utils/redisClient');
const logger = require('../utils/logger');

/**
 * Rate limiter middleware using Redis
 * Implements sliding window rate limiting
 * 
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.keyPrefix - Redis key prefix
 * @param {Function} options.keyGenerator - Function to generate unique key for client
 * @param {Function} options.handler - Custom handler for rate limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Skip counting successful requests
 * @param {boolean} options.skipFailedRequests - Skip counting failed requests
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 100, // 100 requests per window default
    keyPrefix = 'ratelimit:',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    handler = (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return async (req, res, next) => {
    try {
      const key = `${keyPrefix}${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get current request count
      const current = await redis.get(key, false);
      let requests = current ? JSON.parse(current) : { count: 0, resetTime: now + windowMs };

      // Check if window has expired
      if (now > requests.resetTime) {
        requests = { count: 0, resetTime: now + windowMs };
      }

      // Check rate limit
      if (requests.count >= max) {
        const retryAfter = Math.ceil((requests.resetTime - now) / 1000);
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(requests.resetTime).toISOString());
        res.setHeader('Retry-After', retryAfter);
        
        logger.warn(`Rate limit exceeded for ${key}`);
        return handler(req, res);
      }

      // Increment counter
      requests.count++;
      const ttl = Math.ceil((requests.resetTime - now) / 1000);
      await redis.set(key, JSON.stringify(requests), ttl);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requests.count));
      res.setHeader('X-RateLimit-Reset', new Date(requests.resetTime).toISOString());

      // Optionally skip counting based on response
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = res.send;
        res.send = function (body) {
          const shouldSkip =
            (skipSuccessfulRequests && res.statusCode < 400) ||
            (skipFailedRequests && res.statusCode >= 400);

          if (shouldSkip) {
            // Decrement counter
            requests.count--;
            redis.set(key, JSON.stringify(requests), ttl).catch(err => {
              logger.error('Error updating rate limit:', err);
            });
          }

          return originalSend.call(this, body);
        };
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // On error, allow request to proceed (fail open)
      next();
    }
  };
}

/**
 * Pre-configured rate limiters for different use cases
 */
const rateLimiters = {
  // General API rate limit - 100 requests per minute
  general: createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    keyPrefix: 'ratelimit:general:'
  }),

  // Strict rate limit for auth endpoints - 5 attempts per 15 minutes
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: 'ratelimit:auth:',
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many authentication attempts',
        message: 'Please try again in 15 minutes',
        retryAfter: 900
      });
    }
  }),

  // API key rate limit - 1000 requests per hour
  api: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    keyPrefix: 'ratelimit:api:',
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip
  }),

  // Error query rate limit - 50 requests per minute
  errorQuery: createRateLimiter({
    windowMs: 60 * 1000,
    max: 50,
    keyPrefix: 'ratelimit:errors:',
    keyGenerator: (req) => `${req.user?.id || req.ip}`
  }),

  // Upload rate limit - 10 uploads per 5 minutes
  upload: createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    keyPrefix: 'ratelimit:upload:',
    keyGenerator: (req) => `${req.user?.id || req.ip}`
  })
};

/**
 * User-specific rate limiter based on subscription tier
 */
function createTieredRateLimiter() {
  const tierLimits = {
    free: { windowMs: 60 * 1000, max: 10 },
    pro: { windowMs: 60 * 1000, max: 50 },
    team: { windowMs: 60 * 1000, max: 200 }
  };

  return async (req, res, next) => {
    const userTier = req.user?.subscriptionTier || 'free';
    const limits = tierLimits[userTier] || tierLimits.free;

    const limiter = createRateLimiter({
      ...limits,
      keyPrefix: `ratelimit:tier:${userTier}:`,
      keyGenerator: (req) => `${req.user?.id || req.ip}`
    });

    return limiter(req, res, next);
  };
}

/**
 * Reset rate limit for a specific key
 * @param {string} key 
 */
async function resetRateLimit(key) {
  try {
    await redis.del(key);
    logger.info(`Rate limit reset for ${key}`);
    return true;
  } catch (error) {
    logger.error('Error resetting rate limit:', error);
    return false;
  }
}

/**
 * Get current rate limit status for a key
 * @param {string} key 
 */
async function getRateLimitStatus(key) {
  try {
    const data = await redis.get(key, false);
    if (!data) {
      return { limited: false, count: 0, resetTime: null };
    }

    const requests = JSON.parse(data);
    return {
      limited: requests.count >= requests.max,
      count: requests.count,
      remaining: Math.max(0, requests.max - requests.count),
      resetTime: new Date(requests.resetTime)
    };
  } catch (error) {
    logger.error('Error getting rate limit status:', error);
    return null;
  }
}

module.exports = {
  createRateLimiter,
  rateLimiters,
  createTieredRateLimiter,
  resetRateLimit,
  getRateLimitStatus
};
