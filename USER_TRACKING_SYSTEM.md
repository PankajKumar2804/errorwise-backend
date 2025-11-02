# User Tracking & Abuse Prevention System

## 🎯 Overview

This system prevents users from abusing the free tier by deleting and recreating accounts. It tracks users across account deletions and enforces fair usage policies.

## ✅ Features Implemented

### 1. **Soft Delete with Permanent Tracking**
- Users can delete their accounts (soft delete)
- Account data preserved in `deleted_user_tracking` table
- Original registration date maintained
- Deletion count tracked

### 2. **Email Verification**
- Required for all new registrations
- 24-hour token expiration
- Resend verification option
- Auto-verified for Google OAuth

### 3. **Phone Verification (OTP)**
- Optional phone number verification
- 6-digit OTP sent via email (ready for SMS integration)
- 10-minute OTP expiration
- Prevents multi-account abuse

### 4. **Google OAuth Support**
- `googleId` field for OAuth integration
- Auto-verified email for Google users
- Prevents duplicate Google accounts

### 5. **Abuse Prevention**
- Tracks users by:
  - Email hash (SHA-256)
  - Phone hash (SHA-256)
  - Google ID
- Flags users who:
  - Delete account 3+ times
  - Delete and recreate within 30 days
- Restricted users:
  - Can register but no free tier benefits
  - Directed to contact support

## 📊 Database Schema

### Users Table (Enhanced)
```sql
users:
  - deleted_at (soft delete)
  - is_email_verified
  - email_verification_token
  - email_verification_expires
  - google_id (unique)
  - phone_number
  - is_phone_verified
  - phone_verification_token
  - phone_verification_expires
  - original_registration_date
  - account_recreation_count
  - last_login_at
```

### Deleted User Tracking Table (New)
```sql
deleted_user_tracking:
  - id (UUID)
  - original_user_id
  - email
  - email_hash (unique, SHA-256)
  - phone_number
  - phone_hash (SHA-256)
  - google_id
  - original_registration_date
  - deletion_date
  - deletion_count
  - total_queries_before_deletion
  - subscription_tier_at_deletion
  - is_abuser (flag)
  - abuse_reason
  - deletion_reason
  - ip_address_at_deletion
```

## 🔌 API Endpoints

### 1. Enhanced Registration
```http
POST /api/auth/register/enhanced
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123",
  "phoneNumber": "+1234567890",  // optional
  "googleId": "google_12345"      // optional
}

Response:
{
  "message": "Account created successfully. Please verify your email.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "john",
    "isEmailVerified": false,
    "isPhoneVerified": false
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "isReturningUser": false,
  "accountRecreationCount": 0,
  "hasFreeTierAccess": true,
  "requiresEmailVerification": true
}
```

### 2. Verify Email
```http
GET /api/auth/verify-email?token=verification_token

Response:
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

### 3. Resend Verification Email
```http
POST /api/auth/resend-verification
Authorization: Bearer {accessToken}

Response:
{
  "message": "Verification email sent"
}
```

### 4. Send Phone OTP
```http
POST /api/auth/send-phone-otp
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}

Response:
{
  "message": "OTP sent successfully",
  "otpSentTo": "email"  // or "sms" when integrated
}
```

### 5. Verify Phone OTP
```http
POST /api/auth/verify-phone-otp
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "otp": "123456"
}

Response:
{
  "message": "Phone verified successfully",
  "user": {
    "id": "uuid",
    "phoneNumber": "+1234567890",
    "isPhoneVerified": true
  }
}
```

### 6. Delete Account
```http
DELETE /api/auth/account
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "No longer needed"  // optional
}

Response:
{
  "message": "Account deleted successfully",
  "canRecreate": true,
  "note": "Your account history is preserved..."
}
```

### 7. Check Account History
```http
POST /api/auth/account/history
Content-Type: application/json

{
  "email": "john@example.com"
}

Response:
{
  "hasHistory": true,
  "deletionCount": 2,
  "originalRegistrationDate": "2025-01-15T10:00:00.000Z",
  "isAbuser": false,
  "message": "Welcome back! Your account history is preserved."
}
```

## 🔐 Abuse Detection Logic

### Detection Rules:
1. **Email Hash Match**: Exact email (case-insensitive)
2. **Phone Hash Match**: Exact phone number
3. **Google ID Match**: Exact Google ID

### Flagging Criteria:
- ❌ **3+ Deletions**: Automatic abuser flag
- ❌ **2+ Deletions within 30 days**: Abuser flag
- ⚠️ **Returning User**: Preserve original registration date

### Consequences for Abusers:
- Account created but `isActive = false`
- No JWT tokens issued
- Redirected to contact support
- No free tier query limits

## 🧪 Testing Scenarios

### Test 1: Normal Registration
```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/register/enhanced \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'

# Response: requiresEmailVerification: true
```

### Test 2: Email Verification
```bash
# Check email for token, then verify
curl http://localhost:3001/api/auth/verify-email?token=abc123xyz
```

### Test 3: Delete & Recreate (Abuse Test)
```bash
# 1. Delete account
curl -X DELETE http://localhost:3001/api/auth/account \
  -H "Authorization: Bearer {token}"

# 2. Register again (1st deletion)
curl -X POST http://localhost:3001/api/auth/register/enhanced \
  -d '{"email":"test@example.com","password":"test123"}'

# Response: isReturningUser: true, accountRecreationCount: 1

# 3. Delete again
# 4. Register again (2nd deletion)
# Response: accountRecreationCount: 2

# 5. Delete and register 3rd time
# Response: hasFreeTierAccess: false, isAbuser: true
```

### Test 4: Phone Verification
```bash
# 1. Send OTP
curl -X POST http://localhost:3001/api/auth/send-phone-otp \
  -H "Authorization: Bearer {token}" \
  -d '{"phoneNumber":"+1234567890"}'

# 2. Check email for OTP

# 3. Verify OTP
curl -X POST http://localhost:3001/api/auth/verify-phone-otp \
  -H "Authorization: Bearer {token}" \
  -d '{"otp":"123456"}'
```

## 🔄 User Journey

### New User:
1. Register → Email verification sent
2. Verify email → Access granted
3. (Optional) Add phone → OTP sent → Verify OTP
4. Use platform normally

### Returning User (1-2 deletions):
1. Register with same email
2. System detects previous deletion
3. Original registration date preserved
4. Account recreation count incremented
5. Full access granted with warning

### Abuser (3+ deletions):
1. Register with same email
2. System flags as abuser
3. Account created but `isActive = false`
4. No JWT tokens issued
5. Message: "Contact support for access"

## 🚀 Next Steps

### Frontend Integration:
1. Update registration form to use `/api/auth/register/enhanced`
2. Add email verification page
3. Add phone verification modal
4. Show warnings for returning users
5. Handle abuser cases (show contact support message)

### SMS Integration:
Replace email OTP with real SMS:
```javascript
// In userTrackingService.js, replace sendEmail with:
const twilio = require('twilio');
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

await client.messages.create({
  body: `Your verification code is: ${otp}`,
  from: TWILIO_PHONE,
  to: phoneNumber
});
```

### Google OAuth:
```javascript
// Example Google OAuth flow
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID
  });
  return ticket.getPayload();
}

// Then register with googleId
await registerUser({
  email: payload.email,
  username: payload.name,
  googleId: payload.sub
});
```

## ⚠️ Important Notes

1. **Data Privacy**: Email/phone hashes are one-way (SHA-256)
2. **Soft Delete**: Use `paranoid: true` - never hard delete
3. **GDPR Compliance**: Allow full data export on request
4. **Rate Limiting**: Add rate limits to prevent OTP spam
5. **Testing**: Use test emails for development

## 📈 Monitoring

Track these metrics:
- New registrations per day
- Email verification rate
- Phone verification rate
- Account deletion rate
- Returning user rate
- Abuser detection rate

## 🎯 Success Metrics

- ✅ 95%+ email verification rate
- ✅ < 5% account recreation rate
- ✅ < 1% abuser detection rate
- ✅ Zero free tier abuse
