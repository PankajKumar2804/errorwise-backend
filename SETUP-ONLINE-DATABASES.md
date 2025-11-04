# 🗄️ Setup Online PostgreSQL & Redis

## 🐘 PostgreSQL Database Options

### Option 1: Supabase (Recommended - Free Tier)

**Features:**
- ✅ Free 500MB database
- ✅ Automatic backups
- ✅ Built-in API
- ✅ Easy to use

**Setup Steps:**

1. **Create Account:**
   - Go to: https://supabase.com
   - Sign up with GitHub

2. **Create Project:**
   - Click "New Project"
   - Name: `errorwise`
   - Database Password: (save this!)
   - Region: Choose closest to you

3. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy "Connection string" (Transaction mode)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres`

4. **Update Backend .env:**
   ```bash
   DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
   ```

5. **Run Migrations:**
   ```bash
   cd errorwise-backend
   npm install
   node migrate.js
   ```

---

### Option 2: Neon (Serverless PostgreSQL)

**Features:**
- ✅ Free 3GB storage
- ✅ Serverless (auto-scaling)
- ✅ Instant branching

**Setup Steps:**

1. **Create Account:**
   - Go to: https://neon.tech
   - Sign up

2. **Create Project:**
   - Click "Create Project"
   - Name: `errorwise`
   - Region: Choose closest

3. **Get Connection String:**
   - Copy from dashboard
   - Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`

4. **Add to .env:**
   ```bash
   DATABASE_URL=your-neon-connection-string
   ```

---

### Option 3: ElephantSQL

**Features:**
- ✅ Free 20MB
- ✅ Simple setup
- ✅ Good for testing

**Setup Steps:**

1. **Create Account:**
   - Go to: https://www.elephantsql.com
   - Sign up

2. **Create Instance:**
   - Click "Create New Instance"
   - Plan: Tiny Turtle (Free)
   - Name: `errorwise`
   - Region: Choose closest

3. **Get URL:**
   - Click on instance
   - Copy "URL"

4. **Add to .env:**
   ```bash
   DATABASE_URL=postgres://xxx:xxx@jelani.db.elephantsql.com/xxx
   ```

---

### Option 4: Railway (All-in-One)

**Features:**
- ✅ $5/month free credit
- ✅ PostgreSQL + Redis + Hosting
- ✅ Easy deployment

**Setup Steps:**

1. **Create Account:**
   - Go to: https://railway.app
   - Sign up with GitHub

2. **Create Project:**
   - Click "New Project"
   - Select "Provision PostgreSQL"

3. **Get Connection String:**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "DATABASE_URL"

4. **Add Redis:**
   - Click "New"
   - Select "Redis"
   - Copy "REDIS_URL"

5. **Environment Variables:**
   ```bash
   DATABASE_URL=postgresql://xxx
   REDIS_URL=redis://xxx
   ```

---

## 🔴 Redis Cache Options

### Option 1: Upstash (Recommended - Free Tier)

**Features:**
- ✅ 10,000 commands/day free
- ✅ Serverless
- ✅ Global edge network
- ✅ REST API

**Setup Steps:**

1. **Create Account:**
   - Go to: https://upstash.com
   - Sign up

2. **Create Database:**
   - Click "Create Database"
   - Name: `errorwise-cache`
   - Type: Regional
   - Region: Choose closest

3. **Get Connection URL:**
   - Click on database
   - Copy "Redis URL"
   - Format: `redis://default:xxx@xxx.upstash.io:6379`

4. **Add to .env:**
   ```bash
   REDIS_URL=redis://default:your-password@xxx.upstash.io:6379
   ```

5. **Test Connection:**
   ```bash
   redis-cli -u redis://default:xxx@xxx.upstash.io:6379 ping
   ```

---

### Option 2: Redis Cloud (Formerly Redis Labs)

**Features:**
- ✅ 30MB free
- ✅ Full Redis compatibility
- ✅ High availability

**Setup Steps:**

1. **Create Account:**
   - Go to: https://redis.com/try-free/
   - Sign up

2. **Create Database:**
   - Click "New subscription"
   - Select "Free" plan
   - Name: `errorwise`

3. **Get Connection Details:**
   - Host: `redis-xxxxx.c123.us-east-1-2.ec2.cloud.redislabs.com`
   - Port: `12345`
   - Password: (copy this)

4. **Add to .env:**
   ```bash
   REDIS_URL=redis://default:your-password@host:port
   ```

---

### Option 3: Railway Redis

**Features:**
- ✅ Included in Railway $5 credit
- ✅ Auto-configured
- ✅ Works seamlessly with Railway deployment

**Setup Steps:**

1. **In Railway Project:**
   - Click "New"
   - Select "Add Redis"

2. **Get URL:**
   - Click on Redis service
   - Copy "REDIS_URL"

3. **Automatically connected** if deploying on Railway

---

## 🔧 Complete Setup Script

After choosing your providers, update your `.env` file:

```bash
# .env

# PostgreSQL (choose one)
DATABASE_URL=postgresql://user:pass@host:5432/database

# Redis (choose one)  
REDIS_URL=redis://default:pass@host:6379

# Other configs remain the same
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-super-secure-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

---

## 🧪 Test Your Connections

### Test PostgreSQL:
```bash
cd errorwise-backend
node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ Error:', err));
"
```

### Test Redis:
```bash
node -e "
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect()
  .then(() => { console.log('✅ Redis connected'); client.quit(); })
  .catch(err => console.error('❌ Error:', err));
"
```

---

## 📊 Recommended Combination for ErrorWise

### Free Tier (Development/Testing):
- **PostgreSQL**: Supabase (500MB free)
- **Redis**: Upstash (10k commands/day)
- **Cost**: $0/month

### Paid Tier (Production):
- **PostgreSQL**: Railway ($5-10/month)
- **Redis**: Railway (included)
- **Hosting**: Railway (included)
- **Cost**: ~$10-20/month total

### Enterprise:
- **PostgreSQL**: AWS RDS
- **Redis**: AWS ElastiCache
- **Hosting**: AWS EC2/ECS
- **Cost**: $50+/month

---

## ✅ Final Checklist

- [ ] PostgreSQL database created
- [ ] Database connection string saved
- [ ] Tables created (run migrations)
- [ ] Redis cache created
- [ ] Redis URL saved
- [ ] Environment variables updated
- [ ] Connections tested
- [ ] Backup strategy planned

---

## 🆘 Troubleshooting

### PostgreSQL Issues:

1. **Connection timeout:**
   - Check firewall settings
   - Verify IP whitelist (add 0.0.0.0/0 for Railway/Vercel)

2. **SSL Required error:**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   ```

3. **Tables not created:**
   ```bash
   cd errorwise-backend
   npx sequelize-cli db:migrate
   ```

### Redis Issues:

1. **Connection refused:**
   - Check REDIS_URL format
   - Verify credentials
   - Check SSL requirements

2. **Commands failing:**
   - Ensure Redis version compatibility
   - Check command limits (Upstash free tier)

---

## 📞 Support Links

- **Supabase**: https://supabase.com/docs
- **Upstash**: https://docs.upstash.com
- **Railway**: https://docs.railway.app
- **Neon**: https://neon.tech/docs

---

## 🎉 Ready to Deploy!

Once you have both database URLs:

1. Update `.env` file
2. Test connections locally
3. Push to GitHub
4. Deploy to hosting platform
5. Set environment variables on hosting
6. Run migrations
7. Test production deployment

Good luck! 🚀
