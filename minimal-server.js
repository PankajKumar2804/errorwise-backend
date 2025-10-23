require('dotenv').config();
const express = require('express');
const app = express();

console.log('Starting minimal server...');

// Basic middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.originalUrl}`, req.body);
  next();
});

// Test endpoint without database
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration endpoint hit');
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    console.log('Basic validation passed');
    
    // Try to load models one by one
    console.log('Loading User model...');
    const User = require('./src/models/User');
    console.log('User model loaded');
    
    console.log('Loading Subscription model...');
    const Subscription = require('./src/models/Subscription');
    console.log('Subscription model loaded');
    
    console.log('Checking database connection...');
    const { sequelize } = require('./src/config/database');
    await sequelize.authenticate();
    console.log('Database connection verified');
    
    console.log('Checking for existing user...');
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.log('No existing user found');
    
    console.log('Hashing password...');
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 12);
    console.log('Password hashed');
    
    console.log('Creating user...');
    const user = await User.create({
      username,
      email,
      password: hashed,
      subscription_tier: 'free',
      plan: 'free'
    });
    console.log('User created with ID:', user.id);
    
    console.log('Creating subscription...');
    const subscription = await Subscription.create({
      user_id: user.id,
      plan: 'free',
      status: 'active'
    });
    console.log('Subscription created with ID:', subscription.id);
    
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      subscription_tier: user.subscription_tier,
      plan: user.plan
    };

    console.log('Sending success response');
    res.status(201).json({ 
      user: userResponse, 
      token: 'test-token',
      message: 'Registration successful'
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

app.get('/health', (req, res) => {
  console.log('Health check');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const port = 5002;
console.log(`Starting server on port ${port}...`);
app.listen(port, () => {
  console.log(`🚀 Minimal server running on port ${port}`);
});