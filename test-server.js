require('dotenv').config();
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Simple test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test registration route without database operations
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  const { username, email, password } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Mock success response
  res.status(201).json({ 
    user: { 
      id: 'test-id',
      username, 
      email,
      subscription_tier: 'free'
    },
    token: 'test-token',
    message: 'Registration successful (test mode)'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
});