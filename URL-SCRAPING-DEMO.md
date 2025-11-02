# 🔥 Quick Demo: URL Scraping in Action

## Real-World Example

### Scenario
User gets a CORS error and references a Stack Overflow discussion.

### Input (Error Message)
```javascript
"Getting CORS error when calling my API. 

See this helpful discussion: https://stackoverflow.com/questions/10636611/how-does-access-control-allow-origin-header-work

Error: Access to fetch at 'https://api.example.com/data' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present"
```

### Processing Flow

1. **URL Detection** ✅
   ```
   🔗 Found 1 URL(s) in error message
   URL: https://stackoverflow.com/questions/10636611/...
   ```

2. **Web Scraping** ✅
   ```
   🌐 Scraping URL: https://stackoverflow.com/questions/10636611/...
   ✅ Scraped 2847 characters from URL
   ```

3. **AI Summarization** ✅
   ```
   📝 Summarizing content from URL
   ✅ Summarized URL content (relevance: high)
   
   Summary: "CORS (Cross-Origin Resource Sharing) is a security feature that 
   restricts web pages from making requests to a different domain. The 
   Access-Control-Allow-Origin header must be set on the server to allow requests."
   
   Key Points:
   • Server must set Access-Control-Allow-Origin header
   • Cannot be fixed from client-side JavaScript
   • Options include: CORS proxy, server configuration, or JSONP
   • For development, can use browser extensions or disable CORS temporarily
   ```

4. **Enhanced Analysis** ✅
   ```
   🤖 Trying GEMINI (primary for free tier)
   🔵 Calling Gemini API with model: gemini-2.0-flash
   ✅ Gemini response received, parsing JSON...
   ```

### Output (AI Response)

```json
{
  "provider": "gemini",
  "category": "network",
  "confidence": 95,
  
  "explanation": "As explained in the Stack Overflow discussion, this CORS (Cross-Origin Resource Sharing) error occurs because your browser is blocking the request due to security restrictions. The error happens because the API server at 'https://api.example.com' hasn't configured the Access-Control-Allow-Origin header to allow requests from your local development server at 'http://localhost:3000'. This is a server-side security policy that protects APIs from unauthorized cross-origin requests.",
  
  "solution": "According to the referenced documentation, you need to fix this on the server side. Add the Access-Control-Allow-Origin header to your API responses. In Express.js, use the cors middleware: 'npm install cors', then 'app.use(cors())' or 'app.use(cors({origin: \"http://localhost:3000\"}))'. For specific endpoints, add 'res.header(\"Access-Control-Allow-Origin\", \"*\")' to allow all origins, or specify your exact origin for better security.",
  
  "codeExample": "// Install CORS middleware\n// npm install cors\n\nconst express = require('express');\nconst cors = require('cors');\nconst app = express();\n\n// Option 1: Allow all origins (development only)\napp.use(cors());\n\n// Option 2: Allow specific origin (recommended)\napp.use(cors({\n  origin: 'http://localhost:3000',\n  credentials: true\n}));\n\n// Option 3: Manual header (for specific routes)\napp.get('/api/data', (req, res) => {\n  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');\n  res.json({ data: 'Hello World' });\n});\n\napp.listen(3000);",
  
  "urlContext": [
    {
      "url": "https://stackoverflow.com/questions/10636611/...",
      "summary": "CORS is a security feature that restricts cross-origin requests...",
      "keyPoints": [
        "Server must set Access-Control-Allow-Origin header",
        "Cannot be fixed from client-side",
        "Use CORS middleware in Express",
        "Specify exact origins for security"
      ],
      "relevance": "high"
    }
  ],
  
  "demoInfo": {
    "remainingDemos": 2,
    "totalDemos": 3
  }
}
```

### Why This is Better

**Without URL Scraping:**
```json
{
  "explanation": "CORS error means cross-origin requests are blocked...",
  "solution": "Configure CORS on your server...",
  // Generic, no reference to Stack Overflow insights
}
```

**With URL Scraping:**
```json
{
  "explanation": "As explained in the Stack Overflow discussion, CORS...",
  "solution": "According to the referenced documentation, you need to...",
  "urlContext": [ /* Stack Overflow insights included */ ]
  // Specific, authoritative, references the exact discussion user mentioned
}
```

## Try It Yourself

### 1. Start Backend
```bash
cd C:\Users\panka\Cooey\errorwise-backend
npm run dev
```

### 2. Wait for Startup
```
🔑 AI Service API Keys Status:
   Gemini: ✅ Loaded (AIzaSyA7dTafkn89n8rW...)
   OpenAI: ✅ Loaded (sk-proj-Y4PgdIwoVzbX...)
   URL Scraping: ✅ Enabled
```

### 3. Test with PowerShell

```powershell
$body = @{
  errorMessage = @"
Getting authentication error with JWT tokens.

Reference: https://jwt.io/introduction

Error: JsonWebTokenError: invalid signature
"@
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Uri "http://localhost:3001/api/public/demo/analyze" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# View response
$response | ConvertTo-Json -Depth 10

# Check if URL was used
Write-Host "`nURL Context:" -ForegroundColor Yellow
$response.urlContext | ForEach-Object {
  Write-Host "  URL: $($_.url)" -ForegroundColor Cyan
  Write-Host "  Relevance: $($_.relevance)" -ForegroundColor White
}
```

### 4. Check Console Logs

You should see:
```
🔗 Found 1 URL(s) in error message
🌐 Scraping URL: https://jwt.io/introduction
✅ Scraped 2156 characters from https://jwt.io/introduction
📝 Summarizing content from https://jwt.io/introduction
✅ Summarized URL content (relevance: high)
🤖 Trying GEMINI (primary for free tier)
```

## More Examples

### GitHub Documentation
```javascript
{
  errorMessage: "React Hook error. See: https://react.dev/learn/synchronizing-with-effects"
}
// Will scrape official React docs and provide authoritative solution
```

### MDN Documentation
```javascript
{
  errorMessage: "Promise rejection error. Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
}
// Will extract MDN documentation about Promises
```

### Multiple URLs
```javascript
{
  errorMessage: `Database connection error. 
  See: https://www.postgresql.org/docs/current/runtime-config-connection.html
  Also: https://node-postgres.com/features/connecting`
}
// Will process both URLs and combine insights
```

## Performance Notes

- **Regular analysis**: 2-4 seconds
- **With 1 URL**: 6-10 seconds (includes scraping + summarization)
- **With 2 URLs**: 10-15 seconds (parallel processing)

The extra time is worth it for more accurate, documentation-backed solutions! 🚀

---

**Feature Status:** ✅ Ready to use!
**Test File:** `test-url-scraping.js`
**Documentation:** `URL-SCRAPING-FEATURE.md`
