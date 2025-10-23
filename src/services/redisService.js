const redis = require('redis');
const logger = require('../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.times_connected > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.info('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Redis connection error:', error);
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Cache operations
  async set(key, value, expireInSeconds = 3600) {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }

      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, expireInSeconds, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Session management
  async setSession(sessionId, sessionData, expireInSeconds = 86400) {
    return await this.set(`session:${sessionId}`, sessionData, expireInSeconds);
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key, windowInSeconds = 3600, maxRequests = 100) {
    try {
      if (!this.isConnected) {
        return { allowed: true, remaining: maxRequests };
      }

      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, windowInSeconds);
      }

      const remaining = Math.max(0, maxRequests - current);
      const allowed = current <= maxRequests;

      return { allowed, remaining, current };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }

  // Cache error analysis results
  async cacheErrorAnalysis(errorHash, analysisResult, expireInSeconds = 86400) {
    const key = `error_analysis:${errorHash}`;
    return await this.set(key, analysisResult, expireInSeconds);
  }

  async getCachedErrorAnalysis(errorHash) {
    const key = `error_analysis:${errorHash}`;
    return await this.get(key);
  }

  // User analytics cache
  async cacheUserAnalytics(userId, analytics, expireInSeconds = 3600) {
    const key = `user_analytics:${userId}`;
    return await this.set(key, analytics, expireInSeconds);
  }

  async getUserAnalytics(userId) {
    const key = `user_analytics:${userId}`;
    return await this.get(key);
  }

  // Invalidate cache patterns
  async invalidatePattern(pattern) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis pattern invalidation error:', error);
      return false;
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;