# 🚀 ErrorWise Frontend-Backend Integration Action Plan

**Target:** Make ErrorWise MVP fully deployment-ready with frontend integration

---

## 📌 PRIORITY 1: Critical Backend Fixes (2-3 hours)

### 1.1 ✅ Integrate Email Service into Auth Controller

**File:** `src/controllers/authController.js`

Add after successful registration (around line 160):

```javascript
// After creating user successfully
const user = await User.create({...});

// ✅ ADD THIS: Send welcome email
const emailService = require('../services/emailService');
try {
  await emailService.sendWelcomeEmail(user);
  logger.info('Welcome email sent to', user.email);
} catch (emailError) {
  logger.error('Failed to send welcome email:', emailError);
  // Don't fail registration if email fails
}
```

Add for password reset:

```javascript
// In password reset endpoint (around line 300)
const resetToken = crypto.randomBytes(32).toString('hex');
const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

// ✅ ADD THIS: Send password reset email
try {
  await emailService.sendPasswordResetEmail(user.email, user.username, resetUrl);
  logger.info('Password reset email sent to', user.email);
} catch (emailError) {
  logger.error('Failed to send password reset email:', emailError);
  return res.status(500).json({ error: 'Failed to send reset email' });
}
```

### 1.2 ✅ Integrate Email Service into Subscription Controller

**File:** `src/controllers/subscriptionController.js`

Add after successful subscription creation:

```javascript
// After payment success (in webhook handler or verifyPayment)
const emailService = require('../services/emailService');

try {
  await emailService.sendSubscriptionConfirmation(user, {
    planName: plan.name,
    monthlyLimit: plan.features.dailyQueries === -1 ? 'Unlimited' : plan.features.dailyQueries,
    teamLimit: plan.features.teamMembers || 1,
    nextBillingDate: subscription.endDate
  });
} catch (emailError) {
  logger.error('Failed to send subscription confirmation:', emailError);
}
```

### 1.3 ✅ Update .env Configuration

**File:** `.env` (create from `.env.example`)

```bash
# Development - Use Mailtrap or Ethereal (already configured)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
FROM_EMAIL=noreply@errorwise.com

# OR for Ethereal (automatic test accounts)
# The emailService.js already handles this in development mode

# Production - Use real SMTP service
NODE_ENV=production
EMAIL_SERVICE=gmail  # or sendgrid, mailgun
EMAIL_USER=noreply@errorwise.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@errorwise.com
```

### 1.4 ✅ Seed Subscription Plans to Database

**Run this command:**

```bash
node seed-plans.js
```

**Verify plans exist:**

```bash
# Connect to database and check
psql $DATABASE_URL -c "SELECT id, name, price, billing_interval FROM subscription_plans;"
```

If `seed-plans.js` doesn't exist, create it:

```javascript
// seed-plans.js
const sequelize = require('./src/config/database');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');

const plans = [
  {
    name: 'Free',
    price: 0,
    billing_interval: 'lifetime',
    features: {
      dailyQueries: 3,
      errorExplanation: true,
      fixSuggestions: false,
      codeExamples: false,
      documentationLinks: true,
      errorHistory: '7 days',
      teamFeatures: false,
      aiProvider: 'gemini-2.0-flash',
      maxTokens: 800,
      supportLevel: 'community',
      advancedAnalysis: false,
      priorityQueue: false
    },
    limits: { dailyQueries: 3, historyDays: 7 },
    max_users: 1,
    is_active: true,
    description: 'Perfect for trying out ErrorWise - 3 error explanations per day'
  },
  {
    name: 'Pro - Monthly',
    price: 2.00,
    billing_interval: 'month',
    trial_period_days: 7,
    features: {
      dailyQueries: -1,
      errorExplanation: true,
      fixSuggestions: true,
      codeExamples: true,
      documentationLinks: true,
      errorHistory: 'unlimited',
      teamFeatures: false,
      aiProvider: 'gpt-3.5-turbo',
      maxTokens: 1200,
      supportLevel: 'email',
      advancedAnalysis: true,
      priorityQueue: true
    },
    limits: { dailyQueries: -1 },
    max_users: 1,
    is_active: true,
    description: 'Unlimited queries with AI-powered fixes and code examples'
  },
  {
    name: 'Team - Monthly',
    price: 8.00,
    billing_interval: 'month',
    trial_period_days: 14,
    features: {
      dailyQueries: -1,
      errorExplanation: true,
      fixSuggestions: true,
      codeExamples: true,
      documentationLinks: true,
      errorHistory: 'unlimited',
      teamFeatures: true,
      teamMembers: 10,
      sharedHistory: true,
      teamDashboard: true,
      aiProvider: 'gpt-4',
      maxTokens: 2000,
      supportLevel: 'priority'
    },
    limits: { dailyQueries: -1, teamMembers: 10 },
    max_users: 10,
    is_active: true,
    description: 'Everything in Pro plus team collaboration and priority support'
  }
];

async function seedPlans() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync();
    console.log('✅ Database synced');

    // Clear existing plans (optional - remove in production)
    // await SubscriptionPlan.destroy({ where: {} });
    
    for (const planData of plans) {
      const [plan, created] = await SubscriptionPlan.findOrCreate({
        where: { name: planData.name },
        defaults: planData
      });
      
      if (created) {
        console.log(`✅ Created plan: ${plan.name}`);
      } else {
        console.log(`⚠️  Plan already exists: ${plan.name}`);
      }
    }

    const allPlans = await SubscriptionPlan.findAll();
    console.log(`\n📊 Total plans in database: ${allPlans.length}`);
    allPlans.forEach(p => {
      console.log(`   - ${p.name}: $${p.price}/${p.billing_interval}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
```

---

## 📌 PRIORITY 2: Frontend Requirements (CANNOT VERIFY - No Access)

### 2.1 Frontend Pages Checklist

#### A. Landing Page (`/`)
```jsx
// Requirements:
✅ Hero section with clear value proposition
✅ Features showcase
✅ Pricing section (call /api/subscriptions/plans)
✅ Call-to-action buttons (Sign Up, Get Started)
✅ Default zoom: 110% (add to root CSS)

// CSS for 110% scaling:
.landing-page {
  zoom: 1.10;
  /* OR */
  transform: scale(1.10);
  transform-origin: top center;
}
```

#### B. Registration Page (`/register`)
```jsx
// Must send:
POST /api/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "securityQuestion": "string",
  "securityAnswer": "string"
}

// Response:
{
  "success": true,
  "message": "Registration successful! Welcome email sent.",
  "user": { id, email, username },
  "token": "jwt_token"
}

// Actions:
✅ Save token to localStorage/cookie
✅ Redirect to /dashboard
✅ Show success message
```

#### C. Login Page (`/login`)
```jsx
// Must send:
POST /api/auth/login
{
  "email": "string",
  "password": "string"
}

// Response:
{
  "success": true,
  "token": "jwt_token",
  "user": { id, email, username, subscriptionTier }
}

// Actions:
✅ Save token to localStorage/cookie
✅ Redirect to /dashboard
✅ Handle 401 (wrong credentials)
✅ Show rate limit errors (5 attempts/15min)
```

#### D. Dashboard (`/dashboard`)
```jsx
// Must be protected (require authentication)
// Must send Authorization header:
Authorization: Bearer {jwt_token}

// Load user subscription info:
GET /api/subscriptions

// Display:
✅ Current tier (Free/Pro/Team)
✅ Usage stats (queries remaining)
✅ Quick actions (Analyze Error, View History)
✅ Upgrade button (if not Team tier)
```

#### E. Subscription/Pricing Page (`/pricing` or `/subscription`)
```jsx
// Load plans from backend:
GET /api/subscriptions/plans

// Response:
{
  "plans": [
    {
      "id": "free" | "pro" | "team",
      "name": "Free" | "Pro - Monthly" | "Team - Monthly",
      "price": 0 | 2 | 8,
      "interval": "lifetime" | "month",
      "features": { /* feature object */ },
      "popular": false | true | false,
      "description": "..."
    }
  ]
}

// Display:
✅ Three pricing cards (Free, Pro, Team)
✅ Feature comparison
✅ Current user's plan highlighted
✅ "Upgrade" or "Current Plan" buttons

// On upgrade click:
async function handleUpgrade(planId) {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planId: planId, // "pro" or "team"
      successUrl: `${window.location.origin}/dashboard?payment=success`,
      cancelUrl: `${window.location.origin}/pricing?payment=cancelled`
    })
  });
  
  const data = await response.json();
  
  if (data.sessionUrl) {
    // Redirect to payment page
    window.location.href = data.sessionUrl;
  }
}

// ⚠️ IMPORTANT: Plans must be fetched from backend, NOT hardcoded!
```

#### F. Profile Page (`/profile`)
```jsx
// Load user data:
GET /api/users/profile
Authorization: Bearer {jwt_token}

// Response:
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "subscriptionTier": "free" | "pro" | "team",
    "subscriptionStatus": "active" | "cancelled" | "expired",
    "subscriptionEndDate": "date"
  },
  "subscription": { /* subscription details */ },
  "usage": { /* usage stats */ }
}

// Display:
✅ User info (username, email)
✅ Current subscription tier
✅ Billing date
✅ Usage statistics
✅ "Manage Subscription" button
✅ "Change Password" option
✅ "Delete Account" option

// Update profile:
PUT /api/users/profile
{
  "username": "new_username",
  // other fields...
}

// Cancel subscription:
DELETE /api/subscriptions
Authorization: Bearer {jwt_token}
```

### 2.2 Authentication Flow in Frontend

```javascript
// 1. Create auth utility (utils/auth.js)
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// 2. Create API utility (utils/api.js)
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    }
  });
  
  // Handle 401 (token expired)
  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  return response.json();
};

// 3. Create protected route wrapper
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 4. Use in routes
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### 2.3 Subscription Upgrade Flow (Frontend)

```javascript
// SubscriptionPage.jsx
import { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
    loadCurrentSubscription();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await apiCall('/api/subscriptions/plans');
      setPlans(response.plans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await apiCall('/api/subscriptions');
      setCurrentPlan(response.subscription.tier);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setLoading(true);
      const response = await apiCall('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          planId: planId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancelled`
        })
      });

      if (response.sessionUrl) {
        // Redirect to payment gateway
        window.location.href = response.sessionUrl;
      } else if (response.subscription) {
        // Trial activated (development mode)
        alert('Trial subscription activated!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to upgrade subscription. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      <h1>Choose Your Plan</h1>
      
      <div className="pricing-cards">
        {plans.map(plan => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            <h2>{plan.name}</h2>
            <div className="price">
              <span className="amount">${plan.price}</span>
              <span className="interval">/{plan.interval}</span>
            </div>
            <p className="description">{plan.description}</p>
            
            <ul className="features">
              {plan.features.dailyQueries === -1 ? (
                <li>✅ Unlimited queries</li>
              ) : (
                <li>✅ {plan.features.dailyQueries} queries/day</li>
              )}
              {plan.features.fixSuggestions && <li>✅ Fix suggestions</li>}
              {plan.features.codeExamples && <li>✅ Code examples</li>}
              {plan.features.teamFeatures && <li>✅ Team collaboration</li>}
              <li>✅ {plan.features.errorHistory} history</li>
              <li>✅ {plan.features.supportLevel} support</li>
            </ul>
            
            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading || currentPlan === plan.id}
              className={currentPlan === plan.id ? 'current-plan' : 'upgrade-btn'}
            >
              {currentPlan === plan.id ? 'Current Plan' : 
               plan.price === 0 ? 'Free' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📌 PRIORITY 3: Feature-Based Access Control

### 3.1 Backend Already Implements Feature Gating

The backend has `subscriptionMiddleware.js` that enforces:

```javascript
// Free tier features:
- 3 queries/day ✅
- Error explanation only ✅
- 7-day history ✅

// Pro tier features:
- Unlimited queries ✅
- Fix suggestions ✅
- Code examples ✅
- Unlimited history ✅

// Team tier features:
- All Pro features ✅
- Team collaboration ✅
- Team dashboard ✅
- 10 team members ✅
```

### 3.2 Frontend Must Respect Feature Limits

```javascript
// Check if feature is available before showing UI
const canUseFeature = (featureName) => {
  const userTier = getCurrentUserTier(); // from API
  
  const featureAccess = {
    fixSuggestions: ['pro', 'team'],
    codeExamples: ['pro', 'team'],
    teamFeatures: ['team'],
    exportHistory: ['pro', 'team']
  };
  
  return featureAccess[featureName]?.includes(userTier) ?? false;
};

// Example usage in component:
{canUseFeature('fixSuggestions') ? (
  <button onClick={showFixSuggestions}>Get Fix Suggestions</button>
) : (
  <button onClick={() => navigate('/pricing')} className="upgrade-prompt">
    🔒 Upgrade to Pro for Fix Suggestions
  </button>
)}
```

---

## 📌 PRIORITY 4: Testing Checklist

### 4.1 Backend API Testing

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Get subscription plans
curl http://localhost:5000/api/subscriptions/plans

# 3. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234",
    "securityQuestion": "What is your pet name?",
    "securityAnswer": "Fluffy"
  }'

# 4. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'

# 5. Get user subscription (use token from login)
curl http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.2 Frontend Testing

- [ ] Landing page loads and displays correctly at 110% zoom
- [ ] Registration form submits and redirects to dashboard
- [ ] Login form authenticates and saves token
- [ ] Dashboard loads user subscription data
- [ ] Subscription page displays plans from backend API
- [ ] Upgrade button initiates payment flow
- [ ] Profile page displays user information
- [ ] Logout clears token and redirects to login

### 4.3 Integration Testing

- [ ] Register → Receive welcome email
- [ ] Forgot password → Receive reset email
- [ ] Upgrade subscription → Redirect to payment → Return to dashboard
- [ ] Cancel subscription → Receive confirmation email
- [ ] Free tier: Limited to 3 queries/day
- [ ] Pro tier: Unlimited queries with fix suggestions
- [ ] Error analysis works for all tiers

---

## 📌 PRIORITY 5: Deployment Checklist

### 5.1 Environment Variables (Production)

```bash
# ✅ Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?ssl=true
REDIS_URL=redis://user:pass@host:6379

# ✅ JWT
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>

# ✅ Email Service
NODE_ENV=production
EMAIL_SERVICE=sendgrid  # or gmail, mailgun
EMAIL_USER=noreply@errorwise.com
EMAIL_PASS=<app-password>
EMAIL_FROM=noreply@errorwise.com

# ✅ AI Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# ✅ Payment (Dodo Payments)
DODO_API_KEY=...
DODO_WEBHOOK_SECRET=...

# ✅ Application
PORT=5000
FRONTEND_URL=https://errorwise.com
BCRYPT_ROUNDS=12
```

### 5.2 Database Migration

```bash
# 1. Connect to production database
export DATABASE_URL="postgresql://..."

# 2. Run migrations
npx sequelize-cli db:migrate

# 3. Seed subscription plans
node seed-plans.js

# 4. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM subscription_plans;"
# Should return: 3 (Free, Pro, Team)
```

### 5.3 SSL/HTTPS Setup

```bash
# If using Nginx:
server {
    listen 443 ssl http2;
    server_name api.errorwise.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.errorwise.com;
    return 301 https://$server_name$request_uri;
}
```

### 5.4 PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name errorwise-backend

# Set up auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs errorwise-backend
```

---

## 📞 Summary

### ✅ What's Working:
- Authentication system ✅
- SQL injection protection ✅
- Rate limiting ✅
- Subscription system logic ✅
- Feature gating ✅
- Database schema ✅

### ⚠️ What Needs Fixing (Backend):
1. ❌ Integrate email service into auth controller
2. ❌ Integrate email service into subscription controller
3. ❌ Seed subscription plans to database
4. ❌ Configure production environment variables

### ❓ What Cannot Be Verified (Frontend):
1. ❓ Frontend repository not accessible
2. ❓ Pages implementation unknown
3. ❓ Authentication flow integration
4. ❓ Subscription page plan display
5. ❓ Landing page 110% scaling

### 🎯 Next Steps:
1. **Fix Priority 1 items** (2-3 hours)
2. **Access frontend repository** to verify integration
3. **Test end-to-end flows**
4. **Deploy to staging environment**
5. **Conduct final QA**
6. **Deploy to production** 🚀

---

**Need help with any specific item? Let me know!**
