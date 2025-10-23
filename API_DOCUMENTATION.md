# ErrorWise Backend API Documentation

## Overview
ErrorWise is an AI-powered error analysis platform that helps developers understand, solve, and learn from coding errors. This document outlines all available API endpoints.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens passed as cookies. The authentication system supports:
- JWT access tokens (15 minutes)
- Refresh tokens (7 days)
- Cookie-based token management

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, 3-50 characters)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

### POST /auth/login
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

### POST /auth/logout
Logout user and clear authentication cookies.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Response (200):**
```json
{
  "message": "Token refreshed successfully"
}
```

---

## Error Analysis Endpoints

### POST /errors/analyze
Analyze an error using AI services.

**Request Body:**
```json
{
  "errorMessage": "string (required)",
  "codeSnippet": "string (optional)",
  "language": "string (optional, auto-detected if not provided)",
  "aiProvider": "string (optional: 'openai', 'gemini', 'auto')"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "analysis": {
    "errorCategory": "string",
    "explanation": "string",
    "solution": "string",
    "codeExample": "string",
    "confidence": "number (0-100)",
    "language": "string",
    "aiProvider": "string"
  },
  "responseTime": "number (ms)",
  "createdAt": "timestamp"
}
```

### GET /errors/categories
Get available error categories.

**Response (200):**
```json
{
  "categories": [
    "syntax-error",
    "runtime-error",
    "logic-error",
    "scope-error",
    "network-error",
    "permission-error",
    "performance-issue",
    "other"
  ]
}
```

---

## User Management Endpoints

### GET /users/profile
Get current user profile and statistics.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "memberSince": "timestamp"
  },
  "stats": {
    "totalQueries": "number",
    "thisMonthQueries": "number",
    "subscriptionTier": "string"
  }
}
```

### PUT /users/profile
Update user profile information.

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "createdAt": "timestamp"
  }
}
```

### PUT /users/password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### DELETE /users/account
Delete user account (requires password confirmation).

**Request Body:**
```json
{
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

### GET /users/dashboard
Get user dashboard data with statistics and recent queries.

**Response (200):**
```json
{
  "summary": {
    "totalQueries": "number",
    "thisWeekQueries": "number",
    "categoriesCount": "number",
    "subscriptionTier": "string"
  },
  "recentQueries": [...],
  "categoryStats": [...],
  "monthlyStats": [...]
}
```

---

## History Management Endpoints

### GET /history
Get paginated error query history with filtering options.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string, optional)
- `language` (string, optional)
- `search` (string, optional)
- `sortBy` (string, default: 'createdAt')
- `sortOrder` (string, default: 'DESC')

**Response (200):**
```json
{
  "queries": [...],
  "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "totalQueries": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  },
  "filters": {
    "category": "string",
    "language": "string",
    "search": "string"
  }
}
```

### GET /history/user
Get user history with advanced filtering.

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `search` (string)
- `category` (string)
- `sortBy` (string)
- `sortOrder` (string)

### GET /history/stats
Get user history statistics.

**Response (200):**
```json
{
  "totalQueries": "number",
  "queriesThisWeek": "number",
  "queriesThisMonth": "number",
  "categoriesBreakdown": [...]
}
```

### GET /history/:queryId
Get specific query details by ID.

**Response (200):**
```json
{
  "id": "uuid",
  "errorMessage": "string",
  "explanation": "string",
  "solution": "string",
  "errorCategory": "string",
  "aiProvider": "string",
  "userSubscriptionTier": "string",
  "responseTime": "number",
  "tags": ["string"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### DELETE /history/:queryId
Delete a specific error query.

**Response (200):**
```json
{
  "message": "Query deleted successfully"
}
```

---

## Subscription Management Endpoints

### GET /subscriptions/plans
Get available subscription plans.

**Response (200):**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "interval": "month",
      "features": {
        "maxQueries": 10,
        "aiProviders": ["mock"],
        "advancedAnalysis": false,
        "prioritySupport": false,
        "exportResults": false
      },
      "description": "Perfect for trying out ErrorWise"
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 9.99,
      "interval": "month",
      "features": {
        "maxQueries": 100,
        "aiProviders": ["openai", "gemini"],
        "advancedAnalysis": true,
        "prioritySupport": false,
        "exportResults": true
      },
      "description": "Great for individual developers"
    },
    {
      "id": "team",
      "name": "Team",
      "price": 29.99,
      "interval": "month",
      "features": {
        "maxQueries": 1000,
        "aiProviders": ["openai", "gemini"],
        "advancedAnalysis": true,
        "prioritySupport": true,
        "exportResults": true,
        "teamManagement": true
      },
      "description": "Perfect for development teams"
    }
  ]
}
```

### GET /subscriptions
Get current user subscription.

**Response (200):**
```json
{
  "tier": "string",
  "status": "string",
  "features": {...},
  "limits": {
    "queriesUsed": "number",
    "queriesRemaining": "number"
  }
}
```

### POST /subscriptions
Create a new subscription.

**Request Body:**
```json
{
  "planId": "string (required: 'pro' or 'team')"
}
```

**Response (201):**
```json
{
  "message": "Subscription created successfully",
  "subscription": {
    "id": "uuid",
    "tier": "string",
    "status": "string",
    "startDate": "timestamp",
    "endDate": "timestamp",
    "features": {...}
  }
}
```

### DELETE /subscriptions
Cancel current subscription.

**Response (200):**
```json
{
  "message": "Subscription cancelled successfully",
  "subscription": {
    "id": "uuid",
    "tier": "string",
    "status": "cancelled",
    "endDate": "timestamp"
  }
}
```

### GET /subscriptions/usage
Get subscription usage statistics.

**Response (200):**
```json
{
  "tier": "string",
  "usage": {
    "queriesUsed": "number",
    "queriesRemaining": "number",
    "maxQueries": "number"
  },
  "features": {...}
}
```

---

## Settings Management Endpoints

### GET /settings
Get user settings and preferences.

**Response (200):**
```json
{
  "id": "uuid",
  "preferences": {
    "notifications": {
      "email": "boolean",
      "push": "boolean",
      "errorAlerts": "boolean",
      "weeklyReports": "boolean"
    },
    "privacy": {
      "shareAnalytics": "boolean",
      "publicProfile": "boolean"
    },
    "ai": {
      "preferredProvider": "string",
      "analysisDepth": "string",
      "codeContext": "boolean"
    },
    "display": {
      "theme": "string",
      "language": "string",
      "timezone": "string"
    }
  },
  "updatedAt": "timestamp"
}
```

### PUT /settings
Update user settings.

**Request Body:**
```json
{
  "preferences": {
    "notifications": {...},
    "privacy": {...},
    "ai": {...},
    "display": {...}
  }
}
```

### PUT /settings/notifications
Update notification preferences.

**Request Body:**
```json
{
  "notifications": {
    "email": "boolean",
    "push": "boolean",
    "errorAlerts": "boolean",
    "weeklyReports": "boolean"
  }
}
```

### PUT /settings/privacy
Update privacy settings.

**Request Body:**
```json
{
  "privacy": {
    "shareAnalytics": "boolean",
    "publicProfile": "boolean"
  }
}
```

### PUT /settings/ai
Update AI preferences.

**Request Body:**
```json
{
  "ai": {
    "preferredProvider": "string (auto, openai, gemini, mock)",
    "analysisDepth": "string (basic, standard, advanced)",
    "codeContext": "boolean"
  }
}
```

### POST /settings/reset
Reset all settings to default values.

**Response (200):**
```json
{
  "message": "Settings reset to default successfully",
  "preferences": {...}
}
```

---

## Error Codes

### 400 Bad Request
- Invalid request body
- Missing required fields
- Validation errors

### 401 Unauthorized
- Invalid or expired tokens
- Missing authentication

### 403 Forbidden
- Insufficient permissions
- Subscription limits exceeded

### 404 Not Found
- Resource not found
- User not found

### 409 Conflict
- Email already exists
- Duplicate subscription

### 429 Too Many Requests
- Rate limiting exceeded

### 500 Internal Server Error
- Database errors
- AI service errors
- Unexpected server errors

---

## Rate Limiting

- Free tier: 10 requests per hour
- Pro tier: 100 requests per hour
- Team tier: 1000 requests per hour

Rate limiting is applied per user and resets every hour.

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:3000` (development frontend)
- `http://localhost:5173` (Vite development server)
- Production domains (to be configured)

---

## Security Headers

The API includes security headers:
- `helmet` for security headers
- `cors` for cross-origin requests
- `express-rate-limit` for rate limiting
- Cookie security settings (httpOnly, secure, sameSite)

---

## Database Models

### User
- `id` (UUID, primary key)
- `username` (string, unique)
- `email` (string, unique)
- `password` (string, hashed)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ErrorQuery
- `id` (UUID, primary key)
- `userId` (UUID, foreign key)
- `errorMessage` (text)
- `codeSnippet` (text)
- `language` (string)
- `explanation` (text)
- `solution` (text)
- `codeExample` (text)
- `errorCategory` (string)
- `confidence` (integer)
- `aiProvider` (string)
- `userSubscriptionTier` (string)
- `responseTime` (integer)
- `tags` (array)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Subscription
- `id` (UUID, primary key)
- `userId` (UUID, foreign key)
- `tier` (string)
- `status` (string)
- `startDate` (timestamp)
- `endDate` (timestamp)
- `stripeSubscriptionId` (string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### UserSettings
- `id` (UUID, primary key)
- `userId` (UUID, foreign key)
- `preferences` (JSON)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

---

## Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Required Environment Variables

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=errorwise
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
REDIS_URL=redis://localhost:6379
```

---

## Deployment

The application is ready for deployment on platforms like:
- Heroku
- Railway
- DigitalOcean
- AWS
- Vercel (for the frontend)

Make sure to configure production environment variables and database connections.