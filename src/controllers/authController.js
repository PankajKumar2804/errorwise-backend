const User = require('../models/User');
const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    console.log('📋 Register request received:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await authService.hashPassword(password);
    const username = email.split('@')[0];

    const user = await User.create({
      email,
      password: hashed,
      username
    });

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, username: user.username },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('📋 Login request received:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await authService.comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { 
      httpOnly: true, 
      sameSite: 'Strict', 
      maxAge: 3600000 
    });
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, username: user.username },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });
  
  authService.verifyRefreshToken(token, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });
    const accessToken = authService.generateAccessToken(user);
    res.json({ accessToken });
  });
};

exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.json({ message: 'Logged out successfully' });
};
