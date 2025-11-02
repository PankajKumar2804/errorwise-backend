const redis = require('redis');
const logger = require('./logger');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis: Too many reconnection attempts, giving up');
        return new Error('Redis reconnection failed');
      }
      // Exponential backoff: 50ms, 100ms, 200ms, etc.
      return Math.min(retries * 50, 3000);
    }
  }
});

// Redis event listeners
redisClient.on('connect', () => {
  logger.info('Redis client connected');
  console.log('✅ Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready to use');
  console.log('✅ Redis ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
  console.error('❌ Redis error:', err.message);
});

redisClient.on('end', () => {
  logger.warn('Redis connection closed');
  console.log('⚠️  Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
  console.log('🔄 Redis reconnecting...');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    console.error('❌ Failed to connect to Redis:', error.message);
    // Don't throw - allow app to continue without Redis
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed gracefully');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
});

// Helper functions for common operations
const redisHelpers = {
  /**
   * Set a key-value pair with optional expiration
   * @param {string} key 
   * @param {any} value 
   * @param {number} expiresIn - Expiration in seconds
   */
  async set(key, value, expiresIn = null) {
    try {
      if (!redisClient.isOpen) return false;
      
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (expiresIn) {
        await redisClient.setEx(key, expiresIn, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get value by key
   * @param {string} key 
   * @param {boolean} parseJSON - Whether to parse as JSON
   */
  async get(key, parseJSON = true) {
    try {
      if (!redisClient.isOpen) return null;
      
      const value = await redisClient.get(key);
      if (!value) return null;
      
      if (parseJSON) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Delete one or more keys
   * @param {string|string[]} keys 
   */
  async del(keys) {
    try {
      if (!redisClient.isOpen) return 0;
      
      const keyArray = Array.isArray(keys) ? keys : [keys];
      return await redisClient.del(keyArray);
    } catch (error) {
      logger.error(`Redis DEL error:`, error);
      return 0;
    }
  },

  /**
   * Check if key exists
   * @param {string} key 
   */
  async exists(key) {
    try {
      if (!redisClient.isOpen) return 0;
      return await redisClient.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Set expiration on key
   * @param {string} key 
   * @param {number} seconds 
   */
  async expire(key, seconds) {
    try {
      if (!redisClient.isOpen) return 0;
      return await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Increment value (for counters, rate limiting)
   * @param {string} key 
   */
  async incr(key) {
    try {
      if (!redisClient.isOpen) return 0;
      return await redisClient.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Get all keys matching pattern
   * @param {string} pattern 
   */
  async keys(pattern) {
    try {
      if (!redisClient.isOpen) return [];
      return await redisClient.keys(pattern);
    } catch (error) {
      logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  },

  /**
   * Delete all keys matching pattern
   * @param {string} pattern 
   */
  async deleteByPattern(pattern) {
    try {
      if (!redisClient.isOpen) return 0;
      
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        return await this.del(keys);
      }
      return 0;
    } catch (error) {
      logger.error(`Redis deleteByPattern error for pattern ${pattern}:`, error);
      return 0;
    }
  },

  /**
   * Hash operations - set field in hash
   * @param {string} key 
   * @param {string} field 
   * @param {any} value 
   */
  async hSet(key, field, value) {
    try {
      if (!redisClient.isOpen) return 0;
      
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return await redisClient.hSet(key, field, stringValue);
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      return 0;
    }
  },

  /**
   * Hash operations - get field from hash
   * @param {string} key 
   * @param {string} field 
   * @param {boolean} parseJSON 
   */
  async hGet(key, field, parseJSON = true) {
    try {
      if (!redisClient.isOpen) return null;
      
      const value = await redisClient.hGet(key, field);
      if (!value) return null;
      
      if (parseJSON) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  },

  /**
   * Hash operations - get all fields from hash
   * @param {string} key 
   */
  async hGetAll(key) {
    try {
      if (!redisClient.isOpen) return {};
      return await redisClient.hGetAll(key);
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  },

  /**
   * Hash operations - delete field from hash
   * @param {string} key 
   * @param {string|string[]} fields 
   */
  async hDel(key, fields) {
    try {
      if (!redisClient.isOpen) return 0;
      
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      return await redisClient.hDel(key, fieldArray);
    } catch (error) {
      logger.error(`Redis HDEL error for key ${key}:`, error);
      return 0;
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  redis: redisHelpers
};
