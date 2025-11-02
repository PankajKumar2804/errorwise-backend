# 🛠️ ErrorWise Backend - Complete Setup Guide

> **Comprehensive installation and configuration guide** for setting up ErrorWise backend with all dependencies, services, and features.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Installation](#-installation)
3. [Database Setup](#-database-setup)
4. [Redis Setup](#-redis-setup)
5. [Environment Configuration](#-environment-configuration)
6. [Running the Server](#-running-the-server)
7. [Verification](#-verification)
8. [Email Configuration](#-email-configuration)
9. [SMS Integration](#-sms-integration)
10. [OAuth Setup](#-oauth-setup)
11. [Troubleshooting](#-troubleshooting)

---

## ✅ Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | >= 22.x | JavaScript runtime |
| **PostgreSQL** | >= 16.x | Primary database |
| **Redis** | >= 7.x | Sessions, caching, rate limiting |
| **npm** | >= 10.x | Package manager |

### Recommended Tools
- **Git** - Version control
- **Postman/Thunder Client** - API testing
- **pgAdmin** - PostgreSQL GUI (optional)
- **Redis Desktop Manager** - Redis GUI (optional)
- **Docker** - For containerized services (optional)

### System Requirements
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **OS:** Windows 10/11, macOS 11+, Linux (Ubuntu 20.04+)

---

## 📦 Installation

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/PankajKumar2804/errorwise-backend.git

# Or via SSH
git clone git@github.com:PankajKumar2804/errorwise-backend.git

# Navigate to project directory
cd errorwise-backend
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list --depth=0
```

### 3. Verify Node.js Version

```bash
# Check Node.js version (should be >= 22.x)
node --version

# Check npm version
npm --version
```

---

## 🗄️ Database Setup

### PostgreSQL Installation

#### Windows (via Chocolatey)
```powershell
# Install PostgreSQL
choco install postgresql

# Start PostgreSQL service
Start-Service postgresql-x64-16
```

#### Windows (Manual)
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer (default port: 5432)
3. Set password for `postgres` user
4. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

#### macOS (via Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@16

# Start service
brew services start postgresql@16
```

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE errorwise;

# Create user (optional)
CREATE USER errorwise_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE errorwise TO errorwise_user;

# Exit
\q
```

### Run Migrations

```bash
# Run user tracking migration
node migrate-user-tracking.js

# If you have Sequelize migrations
npx sequelize-cli db:migrate

# Verify tables
psql -d errorwise -c "\dt"
```

### Database Schema

The following tables will be created:

- **users** - User accounts with soft delete
- **deleted_user_tracking** - Permanent deletion tracking
- **error_queries** - Error analysis history
- **subscriptions** - Subscription management
- **payment_transactions** - Payment records
- **sessions** (if not using Redis)

---

## 🔴 Redis Setup

### Why Redis?
- **Session Management** - Store user sessions with 7-day expiry
- **Caching** - Cache frequently accessed data (users, subscriptions, stats)
- **Rate Limiting** - Tier-based request throttling
- **Performance** - Support 1000+ concurrent users

### Redis Installation

#### Option 1: Docker (Recommended)

```bash
# Pull Redis image
docker pull redis:latest

# Run Redis container
docker run -d \
  --name errorwise-redis \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:latest

# Verify running
docker ps | grep redis

# Test connection
docker exec -it errorwise-redis redis-cli ping
# Should return: PONG
```

#### Option 2: Windows (via Chocolatey)

```powershell
# Install Redis
choco install redis-64

# Start Redis service
redis-server --service-start

# Test connection
redis-cli ping
# Should return: PONG
```

#### Option 3: Windows (WSL2)

```bash
# Install Redis in WSL
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test connection
redis-cli ping
```

#### Option 4: macOS (Homebrew)

```bash
# Install Redis
brew install redis

# Start service
brew services start redis

# Test connection
redis-cli ping
```

#### Option 5: Linux (Ubuntu/Debian)

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
```

### Redis Configuration

Edit Redis config (optional):

```bash
# Find config file
redis-cli CONFIG GET dir

# Common locations:
# Linux: /etc/redis/redis.conf
# macOS: /usr/local/etc/redis.conf
# Windows: C:\Program Files\Redis\redis.windows.conf

# Recommended settings:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

### Redis CLI Quick Commands

```bash
# Connect to Redis
redis-cli

# Test connection
PING

# View all keys
KEYS *

# Monitor real-time commands
MONITOR

# Get key value
GET session:abc123

# Check memory usage
INFO memory

# Clear all data (careful!)
FLUSHALL
```

---

## 🔐 Environment Configuration

### 1. Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Or create manually
touch .env
```

### 2. Configure Environment Variables

Edit `.env` with your settings:

```env
# ====================================
# DATABASE CONFIGURATION
# ====================================
DATABASE_URL=postgres://postgres:your_password@localhost:5432/errorwise

# Or use individual variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=errorwise
DB_USER=postgres
DB_PASSWORD=your_password

# ====================================
# REDIS CONFIGURATION
# ====================================
REDIS_URL=redis://localhost:6379

# Or use individual variables
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password

# ====================================
# JWT SECRETS (CHANGE IN PRODUCTION!)
# ====================================
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_key_also_very_long_and_random

# Token expiry times
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ====================================
# AI API KEYS
# ====================================
# OpenAI (GPT-4, GPT-3.5)
OPENAI_API_KEY=sk-proj-...

# Google Gemini
GEMINI_API_KEY=AIzaSy...

# ====================================
# EMAIL CONFIGURATION (DEVELOPMENT)
# ====================================
# For development with Mailtrap
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password

# Email sender details
FROM_EMAIL=noreply@errorwise.com
FROM_NAME=ErrorWise

# ====================================
# EMAIL CONFIGURATION (PRODUCTION)
# ====================================
# For production with Gmail
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_gmail_app_password

# ====================================
# SMS CONFIGURATION (OPTIONAL)
# ====================================
# Twilio credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ====================================
# PAYMENT GATEWAY (DODO PAYMENTS)
# ====================================
DODO_API_KEY=your_dodo_api_key
DODO_SECRET_KEY=your_dodo_secret_key
DODO_MERCHANT_ID=your_merchant_id
DODO_WEBHOOK_SECRET=your_webhook_secret

# Payment URLs
DODO_API_URL=https://api.dodopayments.com
DODO_SUCCESS_URL=http://localhost:3000/payment/success
DODO_CANCEL_URL=http://localhost:3000/payment/cancel

# ====================================
# OAUTH CONFIGURATION (OPTIONAL)
# ====================================
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# ====================================
# SERVER CONFIGURATION
# ====================================
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# ====================================
# RATE LIMITING
# ====================================
# Max requests per window
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100

# Auth-specific rate limits
AUTH_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# ====================================
# LOGGING
# ====================================
LOG_LEVEL=info  # error, warn, info, debug
LOG_FILE=logs/app.log

# ====================================
# SECURITY
# ====================================
# Bcrypt salt rounds (10-12 recommended)
BCRYPT_ROUNDS=10

# Session settings
SESSION_SECRET=your_session_secret_key
SESSION_MAX_AGE=604800000  # 7 days in milliseconds

# CORS allowed origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Generate Secure Secrets

```bash
# Generate random JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generators
# https://generate-secret.vercel.app/64
```

### 4. Validate Environment

```bash
# Check if all required variables are set
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? '✅ DB configured' : '❌ DB missing')"
```

---

## 🚀 Running the Server

### Development Mode

```bash
# Start with auto-reload (using nodemon)
npm run dev

# Expected output:
# ✅ Database connected successfully
# ✅ Redis client connected
# 🚀 Server running on http://localhost:3001
```

### Production Mode

```bash
# Start server
npm start

# Or with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name errorwise-backend
pm2 save
pm2 startup
```

### Docker Compose (All Services)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: errorwise
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://postgres:your_password@postgres:5432/errorwise
      REDIS_URL: redis://redis:6379

volumes:
  postgres_data:
  redis_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## ✅ Verification

### 1. Health Check

```bash
# Check server health
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-27T10:30:00.000Z",
#   "uptime": 123.45,
#   "database": "connected",
#   "redis": "connected"
# }
```

### 2. Test Registration

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "securityQuestion": "What is your favorite color?",
    "securityAnswer": "Blue"
  }'
```

### 3. Verify Database

```bash
# Check user count
psql -d errorwise -c "SELECT COUNT(*) FROM users;"

# View recent registrations
psql -d errorwise -c "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

### 4. Verify Redis

```bash
# Connect to Redis
redis-cli

# Check session keys
KEYS session:*

# Check cache keys
KEYS cache:*

# Check rate limit keys
KEYS rate_limit:*

# View a session
GET session:abc123...
```

### 5. Test Rate Limiting

```bash
# Make multiple rapid requests
for i in {1..10}; do
  curl -i http://localhost:3001/api/health
done

# Check rate limit headers in response:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 90
# X-RateLimit-Reset: 1698412800
```

### 6. Run Test Suites

```bash
# Test abuse prevention
node test-abuse-prevention.js

# Test platform stats
node test-platform-stats.js

# Run Jest tests (if configured)
npm test
```

---

## 📧 Email Configuration

### Development Setup (Mailtrap)

1. Sign up at [mailtrap.io](https://mailtrap.io/)
2. Create an inbox
3. Copy SMTP credentials
4. Update `.env`:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
```

### Production Setup (Gmail)

1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. Update `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

### Test Email Sending

```bash
# Send test verification email
curl -X POST http://localhost:3001/api/auth/resend-verification \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check Mailtrap inbox or Gmail sent folder
```

---

## 📱 SMS Integration

### Twilio Setup

1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get phone number
3. Copy credentials from dashboard
4. Install Twilio SDK:

```bash
npm install twilio
```

5. Update `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

6. Update `src/services/userTrackingService.js`:

```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Replace email OTP sending with SMS
async sendPhoneOtp(user, phoneNumber) {
  const otp = this.generateOtp();
  
  // Send via Twilio
  await client.messages.create({
    body: `Your ErrorWise verification code: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
  
  // Save hashed OTP
  user.phoneVerificationToken = await bcrypt.hash(otp, 10);
  user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
}
```

---

## 🔑 OAuth Setup

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Client Secret
6. Update `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

7. Install Passport:

```bash
npm install passport passport-google-oauth20
```

8. Create OAuth routes (see `FRONTEND-INTEGRATION.md` for full implementation)

---

## 🐛 Troubleshooting

### Database Connection Errors

**Error:** `connection refused`

```bash
# Check PostgreSQL is running
# Windows:
Get-Service postgresql-x64-16

# Linux/macOS:
systemctl status postgresql

# Test connection manually
psql -U postgres -h localhost -p 5432
```

**Error:** `database "errorwise" does not exist`

```bash
# Create database
createdb errorwise

# Or via psql
psql -U postgres -c "CREATE DATABASE errorwise;"
```

### Redis Connection Errors

**Error:** `Redis connection timeout`

```bash
# Check Redis is running
# Windows:
redis-cli ping

# Linux/macOS:
systemctl status redis

# Docker:
docker ps | grep redis

# Restart Redis
# Windows:
redis-server --service-stop
redis-server --service-start

# Docker:
docker restart errorwise-redis
```

**Error:** `ECONNREFUSED 127.0.0.1:6379`

- Redis not installed → Install Redis
- Wrong REDIS_URL → Check `.env` configuration
- Firewall blocking → Allow port 6379

### Email Not Sending

**Issue:** Emails not received

1. Check SMTP credentials in `.env`
2. Check console logs for email content (console mode)
3. Verify Gmail App Password (not regular password)
4. Check spam folder
5. Test with Mailtrap first

### Port Already in Use

**Error:** `Port 3001 already in use`

```bash
# Find process using port 3001
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Linux/macOS:
lsof -i :3001

# Kill process
# Windows:
Stop-Process -Id PROCESS_ID

# Linux/macOS:
kill -9 PROCESS_ID
```

### Migration Errors

**Error:** `relation "users" does not exist`

```bash
# Run migrations
node migrate-user-tracking.js

# Or reset database
psql -d errorwise -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
node migrate-user-tracking.js
```

### Redis Keys Not Expiring

```bash
# Check Redis config
redis-cli CONFIG GET maxmemory-policy

# Should be: allkeys-lru or volatile-lru

# Set policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### High Memory Usage

**Redis using too much memory:**

```bash
# Check memory usage
redis-cli INFO memory

# Set memory limit
redis-cli CONFIG SET maxmemory 256mb

# Clear all keys (careful!)
redis-cli FLUSHALL
```

---

## 📊 Monitoring

### Server Logs

```bash
# View real-time logs
tail -f logs/app.log

# Filter errors only
tail -f logs/app.log | grep ERROR

# PM2 logs
pm2 logs errorwise-backend
```

### Redis Monitoring

```bash
# Real-time monitoring
redis-cli MONITOR

# Stats
redis-cli INFO stats

# Slow queries
redis-cli SLOWLOG GET 10
```

### Database Monitoring

```bash
# Active connections
psql -d errorwise -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Table sizes
psql -d errorwise -c "\dt+"

# Recent queries
psql -d errorwise -c "SELECT query, calls FROM pg_stat_statements ORDER BY calls DESC LIMIT 10;"
```

---

## 🎉 Success Indicators

When everything is configured correctly:

- ✅ Server starts without errors
- ✅ `GET /health` returns `200 OK` with "connected" status for DB and Redis
- ✅ Registration creates user with `is_email_verified = false`
- ✅ Email verification emails sent/logged
- ✅ Redis `KEYS *` shows session and cache keys
- ✅ Rate limiting headers appear in responses
- ✅ Platform stats endpoint returns real data
- ✅ JWT tokens generated and validated
- ✅ Database tables created with correct schema

---

## 📚 Next Steps

1. **Frontend Integration** - See [FRONTEND-INTEGRATION.md](./FRONTEND-INTEGRATION.md)
2. **API Documentation** - See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)
3. **Deployment** - See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Features** - See [FEATURES.md](./FEATURES.md)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/PankajKumar2804/errorwise-backend/issues)
- **Documentation:** [Full Docs](./docs/)
- **Email:** support@errorwise.com

---

**Last Updated:** October 27, 2025
**Version:** 1.0.0
