# 🚀 Quick Start: Tier-Based AI Provider System

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install @anthropic-ai/sdk
```
✅ Already done!

### 2. Configure API Keys

Add to your `.env` file:
```env
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-key-here

# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIza-your-key-here

# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Note**: At minimum, configure ONE API key. Mock responses work without any keys!

### 3. Test It!

```bash
node tests/test-tier-based-providers.js
```

---

## 🎯 Usage Examples

### Basic Usage

```javascript
const aiService = require('./src/services/aiService');

// Free tier (uses Gemini Flash)
const result = await aiService.analyzeError({
  errorMessage: 'TypeError: Cannot read property of undefined',
  subscriptionTier: 'free'
});

console.log(result.provider);  // 'gemini'
console.log(result.model);     // 'gemini-1.5-flash'
```

### Pro Tier (Better Quality)

```javascript
// Pro tier (uses OpenAI GPT-3.5)
const result = await aiService.analyzeError({
  errorMessage: 'How to optimize this slow query?',
  subscriptionTier: 'pro'
});

console.log(result.provider);  // 'openai'
console.log(result.model);     // 'gpt-3.5-turbo'
```

### Team Tier (Best Quality)

```javascript
// Team tier (uses Claude 3.5 Sonnet)
const result = await aiService.analyzeError({
  errorMessage: 'Design a scalable microservices architecture',
  subscriptionTier: 'team'
});

console.log(result.provider);  // 'anthropic'
console.log(result.model);     // 'claude-3-5-sonnet-20241022'
```

---

## 📊 Tier Comparison

| Feature | Free 💡 | Pro 🚀 | Team 👥 |
|---------|---------|--------|---------|
| **Primary Model** | Gemini Flash | OpenAI GPT-3.5 | Claude 3.5 Sonnet |
| **Fallback Models** | 2 | 3 | 3 |
| **Max Tokens** | 800 | 1,200 | 2,000 |
| **Response Speed** | ⚡⚡⚡ Fast | ⚡⚡ Medium | ⚡ Best Quality |
| **Best For** | Simple bugs | Pro development | Enterprise/Critical |
| **Cost** | $ Low | $$ Medium | $$$ Premium |

---

## 🔄 How It Works

```
User Query
    ↓
Check Subscription Tier
    ↓
┌─────────────────────────────────┐
│  Free Tier:                     │
│  1. Try Gemini Flash ⚡          │
│  2. Try OpenAI GPT-3.5          │
│  3. Use Mock Response           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Pro Tier:                      │
│  1. Try OpenAI GPT-3.5 🎯       │
│  2. Try Gemini Flash            │
│  3. Try Claude Haiku            │
│  4. Use Mock Response           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Team Tier:                     │
│  1. Try Claude Sonnet 🌟        │
│  2. Try OpenAI GPT-4            │
│  3. Try Gemini Pro              │
│  4. Use Mock Response           │
└─────────────────────────────────┘
```

---

## 🎨 Provider Strengths

### **OpenAI** (GPT-3.5/GPT-4)
- ✅ Excellent code generation
- ✅ Strong debugging
- ✅ Consistent quality
- 💰 Medium cost

### **Gemini** (Flash/Pro)
- ✅ Very fast responses
- ✅ Cost-effective
- ✅ Good for simple queries
- 💰 Low cost

### **Claude** (Haiku/Sonnet)
- ✅ Best reasoning ability
- ✅ Great for architecture
- ✅ Long context understanding
- 💰 Higher cost (worth it!)

### **Mock Responses**
- ✅ Always available
- ✅ No API needed
- ✅ Comprehensive fallback
- 💰 Free

---

## 🧪 Test Different Scenarios

### Test 1: Simple Error (All Tiers)
```javascript
const error = "SyntaxError: Unexpected token";
const free = await analyzeError({ errorMessage: error, subscriptionTier: 'free' });
const pro = await analyzeError({ errorMessage: error, subscriptionTier: 'pro' });
const team = await analyzeError({ errorMessage: error, subscriptionTier: 'team' });

// All get good responses, but different models
```

### Test 2: Architecture Question (Best on Team)
```javascript
const question = "How to design a microservices architecture?";
const result = await analyzeError({ 
  errorMessage: question, 
  subscriptionTier: 'team'  // Claude excels at this!
});
```

### Test 3: Algorithm Optimization
```javascript
const problem = "Time limit exceeded on nested loops";
const result = await analyzeError({ 
  errorMessage: problem, 
  subscriptionTier: 'pro'  // OpenAI great for algorithms
});
```

---

## 💡 Best Practices

### 1. **Choose Right Tier for Query Type**
```javascript
// Simple syntax errors → Free tier is fine
// Complex debugging → Pro tier recommended
// System design → Team tier best
```

### 2. **Let Fallback Chain Work**
```javascript
// Don't worry if primary fails
// System auto-switches to next best option
// Always gets a response
```

### 3. **Monitor Which Provider is Used**
```javascript
const result = await analyzeError({...});
console.log(`Used: ${result.provider} (${result.model})`);
// Track patterns to optimize tier selection
```

---

## 🔧 Configuration

### Change Default Tier
```javascript
// In .env
DEFAULT_SUBSCRIPTION_TIER=pro
```

### Customize Tier Strategy
```javascript
// In src/services/aiService.js
const TIER_CONFIG = {
  pro: {
    primary: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
    // Customize as needed
  }
};
```

---

## 📈 Cost Estimation

### Monthly Cost Examples (1000 queries)

**Free Tier Users:**
- Gemini Flash: ~$0.38
- Total: ~$0.38/month

**Pro Tier Users:**
- OpenAI GPT-3.5: ~$2.00
- Total: ~$2.00/month

**Team Tier Users:**
- Claude Sonnet: ~$18.00
- Total: ~$18.00/month

*Costs include input + output tokens. Actual costs vary by query complexity.*

---

## 🚨 Troubleshooting

### All Providers Fail?
```javascript
// Check .env configuration
// Verify API keys are correct
// Check API quotas/billing
// Don't worry - mock response always works!
```

### Slow Response?
```javascript
// Free tier is fastest (Gemini Flash)
// Team tier prioritizes quality over speed
// Consider downgrading tier for speed-critical apps
```

### High Costs?
```javascript
// Use Free tier for simple queries
// Use Pro tier for most development
// Reserve Team tier for critical/complex queries
```

---

## 🎉 Summary

You now have:
- ✅ **3 AI Providers**: OpenAI, Gemini, Claude
- ✅ **3 Tier Strategies**: Optimized for Free/Pro/Team
- ✅ **Smart Fallbacks**: 100% uptime guarantee
- ✅ **Cost Optimized**: Right model for right query
- ✅ **Easy to Use**: Same API, automatic selection

**Just set your tier and let the system choose the best AI!** 🚀

---

## 📚 Further Reading

- 📖 [Full Documentation](./TIER_BASED_AI_PROVIDERS.md)
- 🧪 [Test Suite](../tests/test-tier-based-providers.js)
- ⚙️ [Configuration Example](../.env.example)

**Happy coding with intelligent AI selection!** 💻✨
