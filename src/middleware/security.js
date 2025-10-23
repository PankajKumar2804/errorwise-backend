const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    userId: req.user?.id || 'anonymous'
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info(`Response ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      responseSize: JSON.stringify(body).length
    });
    
    return originalJson.call(this, body);
  };

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-src 'none';"
  );
  
  next();
};

// Request timeout middleware
const requestTimeout = (timeout = 30000) => { // 30 seconds default
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(`Request timeout: ${req.method} ${req.url}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        res.status(408).json({
          error: 'Request timeout'
        });
      }
    }, timeout);
    
    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    next();
  };
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeLimit = typeof maxSize === 'string' ? 
        parseFloat(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024) : 
        maxSize;
        
      if (parseInt(contentLength) > sizeLimit) {
        return res.status(413).json({
          error: 'Request entity too large'
        });
      }
    }
    
    next();
  };
};

// IP whitelist middleware (for admin endpoints)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Always allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      const localhostIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
      if (localhostIPs.includes(clientIP)) {
        return next();
      }
    }
    
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }
    
    logger.warn(`IP access denied: ${clientIP}`, {
      url: req.url,
      userAgent: req.get('User-Agent')
    });
    
    res.status(403).json({
      error: 'Access denied from this IP address'
    });
  };
};

// API key middleware (for external integrations)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required'
    });
  }
  
  // Validate API key (you should store these securely)
  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn(`Invalid API key attempt: ${apiKey}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(401).json({
      error: 'Invalid API key'
    });
  }
  
  next();
};

module.exports = {
  requestLogger,
  securityHeaders,
  requestTimeout,
  requestSizeLimiter,
  ipWhitelist,
  apiKeyAuth
};