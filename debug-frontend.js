const express = require('express');
const cors = require('cors');

// Create a simple debug server to log frontend requests
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Log all requests to help debug frontend
app.use((req, res, next) => {
  console.log(`\n🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Debug endpoint to mirror what the frontend is sending
app.post('/debug/auth/register', (req, res) => {
  console.log('\n🐛 DEBUG REGISTER REQUEST:');
  console.log('===========================');
  
  const { name, username, email, password } = req.body;
  
  console.log('Received fields:');
  console.log(`- name: ${name} ${name ? '❌ (should be username)' : ''}`);
  console.log(`- username: ${username} ${username ? '✅' : '❌ (required)'}`);
  console.log(`- email: ${email} ${email ? '✅' : '❌ (required)'}`);
  console.log(`- password: ${password ? '✅ (provided)' : '❌ (required)'}`);
  
  // Check what the actual backend expects
  const backendRequirements = {
    username: username || name, // Try to fix it
    email,
    password
  };
  
  console.log('\nWhat backend needs:');
  console.log(JSON.stringify(backendRequirements, null, 2));
  
  res.json({
    success: true,
    message: 'Debug - check console for details',
    receivedFields: req.body,
    expectedFields: backendRequirements,
    fixes: {
      fieldNameIssue: name && !username ? 'Change "name" to "username"' : null,
      usernameFormat: username && !/^[a-zA-Z0-9_]+$/.test(username) ? 'Username can only contain letters, numbers, and underscores' : null
    }
  });
});

app.post('/debug/auth/login', (req, res) => {
  console.log('\n🐛 DEBUG LOGIN REQUEST:');
  console.log('=========================');
  
  const { email, password } = req.body;
  
  console.log('Received fields:');
  console.log(`- email: ${email} ${email ? '✅' : '❌ (required)'}`);
  console.log(`- password: ${password ? '✅ (provided)' : '❌ (required)'}`);
  
  res.json({
    success: true,
    message: 'Debug - check console for details',
    receivedFields: req.body
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🔍 Debug server running on http://localhost:${PORT}`);
  console.log('\nTo debug your frontend requests:');
  console.log('1. Change your frontend API_BASE_URL to: http://localhost:5001/debug');
  console.log('2. Try to register/login from your frontend');
  console.log('3. Check this console for detailed request info');
  console.log('4. Fix the issues shown here');
  console.log('5. Change API_BASE_URL back to: http://localhost:5000/api');
  console.log('\nPress Ctrl+C to stop debug server\n');
});