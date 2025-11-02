const { redis } = require('../utils/redisClient');
const logger = require('../utils/logger');

// Cache key prefixes
const CACHE_PREFIXES = {
  USER: 'cache:user:',
  SUBSCRIPTION: 'cache:subscription:',
  ERROR_QUERY: 'cache:error_query:',
  STATS: 'cache:stats:',
  PLAN: 'cache:plan:'
};

// Default TTL values (in seconds)
const DEFAULT_TTL = {
  USER: 30 * 60, // 30 minutes
  SUBSCRIPTION: 60 * 60, // 1 hour
  ERROR_QUERY: 5 * 60, // 5 minutes
  STATS: 15 * 60, // 15 minutes
  PLAN: 24 * 60 * 60 // 24 hours
};

/**
 * Generic cache wrapper
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not in cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>}
 */
async function cacheWrapper(key, fetchFunction, ttl = 300) {
  try {
    // Try to get from cache
    const cached = await redis.get(key);
    
    if (cached !== null) {
      logger.debug(`Cache HIT for key: ${key}`);
      return cached;
    }
    
    logger.debug(`Cache MISS for key: ${key}`);
    
    // Fetch fresh data
    const data = await fetchFunction();
    
    // Store in cache
    if (data !== null && data !== undefined) {
      await redis.set(key, data, ttl);
    }
    
    return data;
  } catch (error) {
    logger.error(`Cache wrapper error for key ${key}:`, error);
    // On error, try to fetch data directly
    try {
      return await fetchFunction();
    } catch (fetchError) {
      logger.error(`Fetch function error for key ${key}:`, fetchError);
      throw fetchError;
    }
  }
}

/**
 * Cache user data
 * @param {number} userId 
 * @param {Function} fetchFunction 
 * @returns {Promise<object>}
 */
async function cacheUser(userId, fetchFunction) {
  const key = `${CACHE_PREFIXES.USER}${userId}`;
  return cacheWrapper(key, fetchFunction, DEFAULT_TTL.USER);
}

/**
 * Get cached user
 * @param {number} userId 
 * @returns {Promise<object|null>}
 */
async function getCachedUser(userId) {
  const key = `${CACHE_PREFIXES.USER}${userId}`;
  return await redis.get(key);
}

/**
 * Invalidate user cache
 * @param {number} userId 
 */
async function invalidateUser(userId) {
  const key = `${CACHE_PREFIXES.USER}${userId}`;
  await redis.del(key);
  logger.info(`User cache invalidated for user ${userId}`);
}

/**
 * Cache subscription data
 * @param {number} userId 
 * @param {Function} fetchFunction 
 * @returns {Promise<object>}
 */
async function cacheSubscription(userId, fetchFunction) {
  const key = `${CACHE_PREFIXES.SUBSCRIPTION}${userId}`;
  return cacheWrapper(key, fetchFunction, DEFAULT_TTL.SUBSCRIPTION);
}

/**
 * Get cached subscription
 * @param {number} userId 
 * @returns {Promise<object|null>}
 */
async function getCachedSubscription(userId) {
  const key = `${CACHE_PREFIXES.SUBSCRIPTION}${userId}`;
  return await redis.get(key);
}

/**
 * Invalidate subscription cache
 * @param {number} userId 
 */
async function invalidateSubscription(userId) {
  const key = `${CACHE_PREFIXES.SUBSCRIPTION}${userId}`;
  await redis.del(key);
  logger.info(`Subscription cache invalidated for user ${userId}`);
}

/**
 * Cache error query result
 * @param {string} queryHash - Hash of the query
 * @param {Function} fetchFunction 
 * @returns {Promise<object>}
 */
async function cacheErrorQuery(queryHash, fetchFunction) {
  const key = `${CACHE_PREFIXES.ERROR_QUERY}${queryHash}`;
  return cacheWrapper(key, fetchFunction, DEFAULT_TTL.ERROR_QUERY);
}

/**
 * Cache platform statistics
 * @param {Function} fetchFunction 
 * @returns {Promise<object>}
 */
async function cachePlatformStats(fetchFunction) {
  const key = `${CACHE_PREFIXES.STATS}platform`;
  return cacheWrapper(key, fetchFunction, DEFAULT_TTL.STATS);
}

/**
 * Cache subscription plan
 * @param {string} planId 
 * @param {Function} fetchFunction 
 * @returns {Promise<object>}
 */
async function cachePlan(planId, fetchFunction) {
  const key = `${CACHE_PREFIXES.PLAN}${planId}`;
  return cacheWrapper(key, fetchFunction, DEFAULT_TTL.PLAN);
}

/**
 * Invalidate all caches for a specific prefix
 * @param {string} prefix 
 */
async function invalidateByPrefix(prefix) {
  try {
    const pattern = `${prefix}*`;
    const deleted = await redis.deleteByPattern(pattern);
    logger.info(`Invalidated ${deleted} cache entries with prefix ${prefix}`);
    return deleted;
  } catch (error) {
    logger.error(`Error invalidating cache with prefix ${prefix}:`, error);
    return 0;
  }
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  try {
    const deleted = await redis.deleteByPattern('cache:*');
    logger.info(`Cleared all caches: ${deleted} entries deleted`);
    return deleted;
  } catch (error) {
    logger.error('Error clearing all caches:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  try {
    const keys = await redis.keys('cache:*');
    const stats = {
      totalKeys: keys.length,
      byPrefix: {}
    };

    // Count keys by prefix
    for (const key of keys) {
      const prefix = key.split(':')[1];
      stats.byPrefix[prefix] = (stats.byPrefix[prefix] || 0) + 1;
    }

    return stats;
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    return { totalKeys: 0, byPrefix: {} };
  }
}

/**
 * Middleware to cache HTTP responses
 * @param {number} ttl - Cache duration in seconds
 * @param {Function} keyGenerator - Function to generate cache key from request
 */
function cacheMiddleware(ttl = 300, keyGenerator = (req) => req.originalUrl) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:http:${keyGenerator(req)}`;

    try {
      // Check cache
      const cached = await redis.get(key, false);
      
      if (cached) {
        logger.debug(`HTTP Cache HIT for ${key}`);
        const { statusCode, body, headers } = JSON.parse(cached);
        
        // Set cached headers
        Object.entries(headers).forEach(([name, value]) => {
          res.setHeader(name, value);
        });
        
        res.setHeader('X-Cache', 'HIT');
        return res.status(statusCode).send(body);
      }

      logger.debug(`HTTP Cache MISS for ${key}`);

      // Capture response
      const originalSend = res.send;
      res.send = function (body) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          const cacheData = {
            statusCode: res.statusCode,
            body: body,
            headers: res.getHeaders()
          };
          
          redis.set(key, JSON.stringify(cacheData), ttl).catch(err => {
            logger.error('Error caching HTTP response:', err);
          });
        }

        res.setHeader('X-Cache', 'MISS');
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

module.exports = {
  cacheWrapper,
  cacheUser,
  getCachedUser,
  invalidateUser,
  cacheSubscription,
  getCachedSubscription,
  invalidateSubscription,
  cacheErrorQuery,
  cachePlatformStats,
  cachePlan,
  invalidateByPrefix,
  clearAllCaches,
  getCacheStats,
  cacheMiddleware,
  CACHE_PREFIXES,
  DEFAULT_TTL
};
