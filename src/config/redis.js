require('dotenv').config();

// Redis configuration
const redisConfig = {
  development: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    connectTimeout: 60000,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false
  },
  
  production: {
    url: process.env.REDIS_URL,
    connectTimeout: 60000,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    tls: process.env.REDIS_TLS ? {
      rejectUnauthorized: false
    } : null
  },
  
  test: {
    host: 'localhost',
    port: 6379,
    db: 15, // Use a different DB for tests
    connectTimeout: 60000,
    lazyConnect: true
  }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = {
  ...redisConfig[environment],
  environment
};