# 🎯 Abuse Prevention System - Quick Reference

## ✅ What's Working

### 1. **Soft Delete System**
- Users can delete accounts without losing data
- `deletedAt` timestamp marks deletion
- Data recoverable on re-registration

### 2. **Permanent Tracking**
- `deleted_user_tracking` table never deletes records
- Tracks users via SHA-256 hashed email/phone
- Deletion count increments with each deletion

### 3. **Abuse Detection**
```javascript
// Automatically flags users as abusers if:
- 3+ account deletions (any timeframe)
- 2+ deletions within 30 days

// Consequences:
- hasFreeTierAccess = false
- No query limits for free tier
- Account still accessible but restricted
```
future implementations 

### 4. **Email Verification**
- 24-hour token expiration
- HTML email templates
- Resend verification option
- Console mode for development (SMTP not required)

### 5. **Phone OTP Verification**
- 6-digit OTP codes
- 10-minute expiration
- Bcrypt-hashed storage
- Currently sends via email (ready for SMS)

### 6. **Google OAuth Ready**
- `googleId` field added
- Unique constraint prevents duplicates
- OAuth flow needs implementation

---

## 📋 Test Results Summary

```
✅ Normal registration works
✅ Soft delete preserves data
✅ Permanent tracking records deletions
✅ Account recreation tracking works
✅ Original registration date preserved
✅ Abuse detection triggers at 3+ deletions
✅ Free tier access denied for abusers
✅ Email verification system works
✅ Phone OTP system ready
```

---

## 🔌 Available API Endpoints

### Enhanced Registration
```bash
POST /api/auth/register/enhanced
{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123",
  "phoneNumber": "+1234567890"  # optional
}
```

### Email Verification
```bash
GET /api/auth/verify-email?token=abc123xyz
```

### Resend Verification
```bash
POST /api/auth/resend-verification
Authorization: Bearer {token}
```

### Send Phone OTP
```bash
POST /api/auth/send-phone-otp
Authorization: Bearer {token}
{
  "phoneNumber": "+1234567890"
}
```

### Verify Phone OTP
```bash
POST /api/auth/verify-phone-otp
Authorization: Bearer {token}
{
  "otp": "123456"
}
```

### Delete Account
```bash
DELETE /api/auth/account
Authorization: Bearer {token}
{
  "reason": "No longer needed"  # optional
}
```

### Check Account History
```bash
POST /api/auth/account/history
{
  "email": "john@example.com"
}
```

---

## 🗄️ Database Schema

### Users Table (New Fields)
```sql
deleted_at                    TIMESTAMP
is_email_verified            BOOLEAN (default: false)
email_verification_token     VARCHAR(255)
email_verification_expires   TIMESTAMP
google_id                    VARCHAR(255) UNIQUE
phone_number                 VARCHAR(20)
is_phone_verified            BOOLEAN (default: false)
phone_verification_token     VARCHAR(255)
phone_verification_expires   TIMESTAMP
original_registration_date   TIMESTAMP
account_recreation_count     INTEGER (default: 0)
last_login_at                TIMESTAMP
```

### Deleted User Tracking Table
```sql
id                              UUID PRIMARY KEY
original_user_id               UUID
email                          VARCHAR(255)
email_hash                     VARCHAR(64) UNIQUE
phone_number                   VARCHAR(20)
phone_hash                     VARCHAR(64)
google_id                      VARCHAR(255)
original_registration_date     TIMESTAMP
deletion_date                  TIMESTAMP
deletion_count                 INTEGER (default: 1)
total_queries_before_deletion  INTEGER
subscription_tier_at_deletion  VARCHAR(50)
is_abuser                      BOOLEAN (default: false)
abuse_reason                   TEXT
deletion_reason                TEXT
ip_address_at_deletion         VARCHAR(45)
```

---

## 🚀 Next Steps

### 1. Configure Email Service (High Priority)
Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@errorwise.com
FROM_NAME=ErrorWise
FRONTEND_URL=http://localhost:3000
```

### 2. Integrate SMS Service (Medium Priority)
Replace email OTP with Twilio:
```javascript
// Install: npm install twilio
const twilio = require('twilio');
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: `Your ErrorWise code: ${otp}`,
  from: TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

### 3. Implement Google OAuth (Medium Priority)
```bash
# Install dependencies
npm install passport passport-google-oauth20

# Add to .env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 4. Frontend Integration (High Priority)
Create UI components for:
- Email verification page
- Phone OTP modal
- Account history warnings
- Abuser restriction messages

### 5. Rate Limiting (High Priority)
Add rate limits to prevent spam:
```javascript
// On verification endpoints
- 3 email verifications per hour per IP
- 5 OTP requests per hour per user
- 10 registration attempts per hour per IP
```

---

## 🧪 Testing

Run the comprehensive test suite:
```bash
node test-abuse-prevention.js
```

Test individual scenarios:
```bash
# Test normal registration
curl -X POST http://localhost:3001/api/auth/register/enhanced \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'

# Test account history
curl -X POST http://localhost:3001/api/auth/account/history \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🔒 Security Best Practices

1. **Email/Phone Hashing**: SHA-256 one-way hashing for privacy
2. **Password Hashing**: bcrypt with salt rounds
3. **Token Expiry**: 24h for email, 10min for OTP
4. **Rate Limiting**: Prevent brute force and spam
5. **HTTPS Only**: Enforce SSL in production
6. **CORS**: Restrict to frontend domain only

---

## 📊 Monitoring Metrics

Track these in your analytics:
- New registrations per day
- Email verification rate (target: 95%+)
- Phone verification rate (target: 80%+)
- Account deletion rate (target: <5%)
- Account recreation rate (target: <10%)
- Abuser detection rate (target: <1%)

---

## 🐛 Troubleshooting

### Issue: Emails not sending
**Solution**: Check SMTP credentials in `.env` or use console mode for development

### Issue: OTP verification fails
**Solution**: Ensure OTP is entered within 10 minutes and matches exactly

### Issue: Account recreation count not incrementing
**Solution**: Check `deleted_user_tracking` table has emailHash match

### Issue: Soft delete not working
**Solution**: Verify `paranoid: true` in User model and `deletedAt` column exists

---

## 📖 Documentation Files

- `USER_TRACKING_SYSTEM.md` - Complete system documentation
- `test-abuse-prevention.js` - Comprehensive test suite
- `migrate-user-tracking.js` - Database migration script

---

## 🎉 Success!

Your abuse prevention system is now fully functional and ready to prevent free tier abuse while maintaining a great user experience for legitimate users!
