const rateLimit = require('express-rate-limit');

// General rate limiting for API endpoints
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs, // 15 minutes default
    max, // limit each IP to requests per windowMs
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for certain conditions
      return req.ip === '127.0.0.1' && process.env.NODE_ENV === 'development';
    }
  });
};

// Specific rate limiters for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts per 15 minutes
  'Too many authentication attempts, please try again later'
);

const errorAnalysisLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  20, // 20 error analysis requests per minute
  'Too many error analysis requests, please slow down'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per 15 minutes for general API
  'Too many requests from this IP, please try again later'
);

// Strict limiter for sensitive operations
const strictLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 requests per hour
  'Too many sensitive requests, please wait before trying again'
);

// Upload limiter
const uploadLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // 10 uploads per 5 minutes
  'Too many file uploads, please wait before uploading again'
);

module.exports = {
  authLimiter,
  errorAnalysisLimiter,
  generalLimiter,
  strictLimiter,
  uploadLimiter,
  createRateLimiter
};