require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

console.log('1. Starting server initialization...');

// Parse JSON and log incoming requests
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.originalUrl}`, req.body);
  next();
});
app.use(cookieParser());

console.log('2. Basic middleware loaded');

// Enable security and CORS
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

console.log('3. Security middleware loaded');

try {
  // Import database and models
  console.log('4. Loading database configuration...');
  const { sequelize } = require('./src/config/database');
  
  console.log('5. Loading models...');
  const User = require('./src/models/User');
  const ErrorQuery = require('./src/models/ErrorQuery');
  const Subscription = require('./src/models/Subscription');
  
  console.log('6. Loading model associations...');
  require('./src/models/associations'); // Load model associations
  
  console.log('7. Models loaded successfully');
  
  // Simple registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    console.log('Registration endpoint hit');
    try {
      const { username, email, password } = req.body;
      
      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      console.log('Validation passed, checking for existing user...');
      
      // Check if user exists
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      console.log('User does not exist, creating new user...');
      
      // Hash password
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(password, 12);
      
      console.log('Password hashed, creating user...');
      
      // Create user
      const user = await User.create({
        username,
        email,
        password: hashed,
        subscription_tier: 'free',
        plan: 'free'
      });

      console.log('User created:', user.id);

      // Create default subscription
      await Subscription.create({
        user_id: user.id,
        plan: 'free',
        status: 'active'
      });

      console.log('Subscription created');

      // Remove password from response
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        subscription_tier: user.subscription_tier,
        plan: user.plan
      };

      res.status(201).json({ 
        user: userResponse, 
        token: 'mock-token',
        message: 'Registration successful'
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed", details: error.message });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  console.log('8. Routes configured');

  // Sync database
  (async () => {
    try {
      console.log('9. Syncing database...');
      await sequelize.sync();
      console.log('✅ Database synced');
    } catch (error) {
      console.error('❌ Database sync failed:', error.message);
    }
  })();

} catch (error) {
  console.error('❌ Server initialization error:', error);
  process.exit(1);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Server error', details: err.message });
});

// Start server
const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`🚀 Debug server running on port ${port}`);
});