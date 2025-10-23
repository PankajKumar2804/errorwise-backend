# 🚀 ErrorWise Production Deployment Guide

## 📋 Overview

This guide covers deploying your ErrorWise application to production with:
- **Domain hosting**
- **PostgreSQL database**
- **Redis cache**
- **Environment setup**
- **SSL/HTTPS**
- **Database migrations**

---

## 🏗️ **DEPLOYMENT OPTIONS**

### Option 1: **Railway** (Recommended - Easy & Fast)
### Option 2: **Heroku**
### Option 3: **DigitalOcean App Platform**
### Option 4: **AWS/Azure** (Advanced)
### Option 5: **VPS (Ubuntu)** (Full Control)

---

## 🚀 **OPTION 1: RAILWAY DEPLOYMENT (RECOMMENDED)**

### **Why Railway?**
✅ Easy PostgreSQL + Redis setup  
✅ Automatic deployments from GitHub  
✅ Custom domains  
✅ Environment variables  
✅ Free tier available  

### **Step 1: Prepare Your Code**

1. **Create production environment file:**
```bash
# Create .env.production
cp .env .env.production
```

2. **Update package.json for production:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step needed'",
    "migrate": "node migration.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### **Step 2: Railway Setup**

1. **Sign up at Railway:**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create new project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `errorwise-backend` repository

3. **Add PostgreSQL Database:**
   - In Railway dashboard, click "New Service"
   - Choose "PostgreSQL"
   - Railway will create a database instance

4. **Add Redis:**
   - In Railway dashboard, click "New Service"  
   - Choose "Redis"
   - Railway will create a Redis instance

### **Step 3: Environment Variables**

In Railway, go to your backend service → Variables, add:

```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://username:password@host:port/database

# Redis (Railway provides this automatically)  
REDIS_URL=redis://default:password@host:port

# JWT Secrets
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here

# API Keys
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

# Dodo Payments
DODO_API_KEY=your_dodo_api_key
DODO_API_URL=https://api.dodopayments.com/v1
DODO_WEBHOOK_SECRET=your_webhook_secret
DODO_PRO_PLAN_ID=your_pro_plan_id
DODO_TEAM_PLAN_ID=your_team_plan_id

# Production settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# Email (if using)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@your-domain.com
```

### **Step 4: Custom Domain**

1. **In Railway:**
   - Go to your service → Settings → Domains
   - Click "Generate Domain" (gets you a .railway.app domain)
   - Or add custom domain: `api.your-domain.com`

2. **DNS Settings** (if using custom domain):
   ```
   Type: CNAME
   Name: api
   Value: your-app.railway.app
   ```

---

## 🎯 **OPTION 2: HEROKU DEPLOYMENT**

### **Step 1: Heroku Setup**

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create errorwise-backend
```

### **Step 2: Add Heroku Add-ons**

```bash
# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini

# Check add-ons
heroku addons
```

### **Step 3: Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set OPENAI_API_KEY=your_openai_key
heroku config:set DODO_API_KEY=your_dodo_key
heroku config:set FRONTEND_URL=https://your-domain.com
```

### **Step 4: Deploy**

```bash
# Deploy to Heroku
git push heroku main

# Run migrations
heroku run node migration.js
```

---

## 💾 **DATABASE MIGRATION GUIDE**

Your `migration.js` file contains your complete database schema. Here's how to run it in production:

### **Tables Created:**
1. `subscription_plans` - Your tier plans
2. `tenants` - Multi-tenant support
3. `users` - User accounts (UUID primary keys)
4. `subscriptions` - User subscriptions
5. `user_settings` - User preferences
6. `error_history` - Error tracking
7. `error_queries` - Error analysis history
8. `tenant_settings` - Tenant configurations
9. `usage_logs` - Usage analytics

### **Run Migration:**

```bash
# On Railway/Heroku
node migration.js

# Or if you have Sequelize CLI
npx sequelize-cli db:migrate
```

### **Seed Initial Data:**

Create a seed file for your subscription plans:

```javascript
// seeds/subscription-plans.js
const { sequelize } = require('../src/config/database');

const seedPlans = async () => {
  try {
    await sequelize.query(`
      INSERT INTO subscription_plans (name, price, features, max_users, description) VALUES
      ('Free', 0.00, '["5 queries per day", "Basic explanations", "Community support"]', 1, 'Perfect for individual developers'),
      ('Pro', 2.00, '["Unlimited queries", "Detailed explanations", "2-3 solution approaches", "Priority support"]', 1, 'For professional developers'),
      ('Team', 10.00, '["Everything in Pro", "Unlimited team members", "30-minute video sessions", "Team collaboration"]', -1, 'For development teams')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Subscription plans seeded');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

module.exports = seedPlans;
```

---

## 🔧 **FRONTEND DEPLOYMENT**

### **Option 1: Vercel (Recommended for React)**

1. **Connect GitHub to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your `errorwise-frontend` repository

2. **Environment Variables in Vercel:**
   ```bash
   VITE_API_URL=https://your-backend.railway.app
   VITE_APP_NAME=ErrorWise
   ```

3. **Custom Domain:**
   - In Vercel dashboard → Domains
   - Add `your-domain.com`

### **Option 2: Netlify**

```bash
# Build command
npm run build

# Publish directory  
dist

# Environment variables
VITE_API_URL=https://your-backend.railway.app
```

---

## 🌐 **DOMAIN SETUP**

### **1. Buy Domain:**
- Namecheap, GoDaddy, or Cloudflare

### **2. DNS Configuration:**

```bash
# For your main site (frontend)
Type: A
Name: @  
Value: <Vercel IP> or CNAME to vercel-domain

# For API (backend)
Type: CNAME
Name: api
Value: your-backend.railway.app

# For www redirect
Type: CNAME  
Name: www
Value: your-domain.com
```

### **3. SSL/HTTPS:**
- Railway/Vercel provide automatic SSL
- Or use Cloudflare for additional protection

---

## ⚙️ **PRODUCTION ENVIRONMENT FILE**

Create `.env.production`:

```bash
# Database - Railway/Heroku provides these
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://default:pass@host:port

# Security
NODE_ENV=production
JWT_SECRET=super_secure_jwt_secret_64_chars_long_please_change_this_now
JWT_REFRESH_SECRET=super_secure_refresh_secret_64_chars_long_change_this_too

# API Keys - Get from providers
OPENAI_API_KEY=sk-proj-your-openai-key
GEMINI_API_KEY=your-gemini-key

# Dodo Payments - Get from Dodo dashboard
DODO_API_KEY=your-production-dodo-key
DODO_API_URL=https://api.dodopayments.com/v1
DODO_WEBHOOK_SECRET=your-webhook-secret
DODO_PRO_PLAN_ID=plan_pro_id_from_dodo
DODO_TEAM_PLAN_ID=plan_team_id_from_dodo

# URLs
FRONTEND_URL=https://your-domain.com
PORT=3000

# Email (optional)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@your-domain.com

# Security headers
CORS_ORIGIN=https://your-domain.com
```

---

## 🔄 **DEPLOYMENT CHECKLIST**

### **Before Deploying:**
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Redis connection tested  
- [ ] API keys validated
- [ ] Domain purchased
- [ ] DNS configured

### **After Deploying:**
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Test API endpoints
- [ ] Test user registration
- [ ] Test payment integration
- [ ] Test team features
- [ ] Monitor logs
- [ ] Set up backups

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

1. **Database Connection Failed:**
   ```bash
   # Check DATABASE_URL format
   postgresql://username:password@host:port/database_name
   ```

2. **Redis Connection Failed:**
   ```bash
   # Check REDIS_URL format  
   redis://default:password@host:port
   ```

3. **CORS Errors:**
   ```javascript
   // In server.js, update CORS
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

4. **Environment Variables:**
   ```bash
   # Check if variables are loaded
   console.log('DATABASE_URL:', process.env.DATABASE_URL);
   ```

---

## 💰 **COST ESTIMATION**

### **Railway (Recommended):**
- **Free Tier**: $0/month (500 hours)
- **Pro**: $5/month (unlimited)
- **PostgreSQL**: $5/month  
- **Redis**: $3/month
- **Custom Domain**: Free
- **Total**: ~$13/month

### **Heroku:**
- **Dyno**: $7/month
- **PostgreSQL**: $9/month
- **Redis**: $15/month  
- **Total**: ~$31/month

### **Domain:**
- **.com domain**: ~$12/year

---

## 🎯 **NEXT STEPS**

1. **Choose deployment platform** (Railway recommended)
2. **Set up databases** (PostgreSQL + Redis)
3. **Configure environment variables**
4. **Deploy backend**
5. **Deploy frontend**  
6. **Configure domain & DNS**
7. **Test everything**
8. **Monitor & maintain**

## 📞 **Need Help?**

If you run into issues:
1. Check the platform's documentation
2. Monitor logs for error messages
3. Test locally first
4. Verify environment variables
5. Check database connections

**Your ErrorWise app is ready for production! 🚀**