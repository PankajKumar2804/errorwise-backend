# 🚀 ErrorWise Backend - Quick Setup Guide

## ✅ System Status

### Implemented Features:
- ✅ **User Authentication** (JWT-based)
- ✅ **Soft Delete** (paranoid mode preserves user data)
- ✅ **Permanent Tracking** (DeletedUserTracking table never deleted)
- ✅ **Email Verification** (token-based, 24h expiry)
- ✅ **Phone OTP** (6-digit OTP, 10min expiry, ready for SMS)
- ✅ **Google OAuth Support** (fields ready, needs OAuth flow)
- ✅ **Abuse Detection** (3+ deletions OR 2 within 30 days)
- ✅ **Platform Statistics** (real-time calculations from database)

### Test Results:
```
✅ Normal registration works
✅ Soft delete preserves data
✅ Permanent tracking records deletions
✅ Account recreation tracking works
✅ Original registration date preserved
✅ Abuse detection triggers at 3+ deletions (isAbuser flag set)
✅ Free tier access denied for abusers
✅ Email verification system works
✅ Phone OTP system ready
```

## 📋 Prerequisites

1. **PostgreSQL** running on `localhost:5432`
2. **Node.js** v14+ installed
3. **Redis** (optional, for caching)

## 🔧 Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgres://postgres:your_password@127.0.0.1:5432/errorwise

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email Service (Optional - works without it in console mode)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@errorwise.com
FROM_NAME=ErrorWise

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

### 📧 Gmail SMTP Setup (Optional):
If you want real emails instead of console logs:

1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an "App Password" for your app
4. Use that password in `SMTP_PASS`

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run migration (already done ✅)
node migrate-user-tracking.js

# 3. Start the server
node server.js
```

Server will start on `http://localhost:3001`

## 🧪 Testing

### Test Platform Stats:
```bash
node test-platform-stats.js
```

### Test Abuse Prevention:
```bash
node test-abuse-prevention.js
```

### Test API Endpoints:
```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "phoneNumber": "+1234567890"
  }'

# Check account history
curl -X POST http://localhost:3001/api/auth/account/history \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Get platform stats
curl http://localhost:3001/api/stats
```

## 📊 Database Schema

### Users Table (Enhanced):
- Standard fields: id, username, email, password, role, etc.
- **Soft Delete**: `deleted_at` (NULL = active)
- **Email Verification**: `is_email_verified`, `email_verification_token`, `email_verification_expires`
- **Phone Verification**: `phone_number`, `is_phone_verified`, `phone_verification_token`, `phone_verification_expires`
- **OAuth**: `google_id` (unique)
- **Tracking**: `original_registration_date`, `account_recreation_count`, `last_login_at`

### DeletedUserTracking Table (New):
- Permanent tracking (never deleted)
- SHA-256 hashed identifiers (email, phone)
- Deletion count and dates
- Abuse flags and reasons
- Query count before deletion

## 🔐 Security Features

### Abuse Prevention:
- **Detection Rule 1**: 3+ account deletions = permanent abuser flag
- **Detection Rule 2**: 2+ deletions within 30 days = abuser flag
- **Consequence**: No free tier access, must contact support
- **Privacy**: Email/phone hashed with SHA-256 for identification

### Verification:
- **Email**: Required for all users, 24h token expiry
- **Phone**: Optional, 6-digit OTP, 10min expiry
- **Google OAuth**: Ready (needs OAuth flow implementation)

## 🎯 Next Steps

### 1. Email Service (Optional):
Configure SMTP in `.env` for real email delivery. Currently works in "console mode" (logs to terminal).

### 2. SMS Integration:
Replace email OTP with real SMS using Twilio:
```bash
npm install twilio
```

Update `src/services/userTrackingService.js`:
```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

await client.messages.create({
  body: `Your ErrorWise code: ${otp}`,
  from: process.env.TWILIO_PHONE,
  to: phoneNumber
});
```

### 3. Google OAuth:
Install passport:
```bash
npm install passport passport-google-oauth20
```

Create OAuth routes and configure Google Console.

### 4. Frontend Integration:
Update frontend to use:
- `POST /api/auth/register/enhanced` (instead of regular register)
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/send-phone-otp` & `POST /api/auth/verify-phone-otp`
- `DELETE /api/auth/account` (with tracking)
- `POST /api/auth/account/history` (show warnings to returning users)

### 5. Rate Limiting:
Add rate limits to prevent OTP spam:
```javascript
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3 // 3 OTP requests per 15min
});

app.use('/api/auth/send-phone-otp', otpLimiter);
```

## 📖 Documentation

- **Full API Docs**: See `USER_TRACKING_SYSTEM.md`
- **Test Results**: Run `node test-abuse-prevention.js`
- **Platform Stats**: Run `node test-platform-stats.js`

## 🆘 Troubleshooting

### Email not sending:
- Check SMTP credentials in `.env`
- Check console logs for emails (console mode)
- Verify Gmail "Less secure app access" or use App Password

### Database connection error:
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database `errorwise` exists

### Migration errors:
- Re-run: `node migrate-user-tracking.js`
- Check PostgreSQL logs
- Ensure proper permissions

## 🎉 Success Indicators

When everything works:
- ✅ Server starts without errors
- ✅ `GET /api/stats` returns real platform statistics
- ✅ Registration creates users with verification required
- ✅ Email verification emails logged/sent
- ✅ Account deletion increments tracking count
- ✅ 3rd deletion sets `isAbuser = true`
- ✅ Abusers can't access free tier

## 📞 Support

For issues or questions:
- Check `USER_TRACKING_SYSTEM.md` for detailed API docs
- Run tests to verify system integrity
- Check server logs for errors

---

**System tested and verified: October 23, 2025** ✅
