# 🎯 Tier-Based AI Provider System

## 📋 Overview

The AI service now features an **intelligent tier-based provider selection system** that automatically chooses the best AI model based on the user's subscription tier. This ensures optimal cost-performance balance while providing high-quality responses.

---

## 🌟 Supported AI Providers

### 1. **OpenAI** 
- **Models**: GPT-4, GPT-3.5-turbo
- **Best for**: General coding, debugging, comprehensive analysis
- **Strengths**: Excellent code generation, strong reasoning

### 2. **Google Gemini**
- **Models**: Gemini-1.5-Flash, Gemini-1.5-Pro
- **Best for**: Fast responses, multimodal tasks
- **Strengths**: Speed, cost-effective, good for simple queries

### 3. **Anthropic Claude** (NEW!)
- **Models**: Claude-3.5-Sonnet, Claude-3-Haiku
- **Best for**: Complex reasoning, long-context analysis
- **Strengths**: Best-in-class reasoning, excellent for architecture/design questions

### 4. **Mock Responses**
- **Best for**: Offline mode, API unavailability
- **Strengths**: Always available, comprehensive fallback

---

## 📊 Tier Configuration

### **Free Tier** 💡
```javascript
{
  primary: Gemini 1.5 Flash (800 tokens)     // Fast, cost-effective
  secondary: OpenAI GPT-3.5-turbo (800 tokens)  // Quality backup
  fallback: Mock Response                    // Always available
}
```

**Best for**: Simple debugging, basic queries, learning  
**Response Time**: ⚡ Fast  
**Cost**: $ Low

---

### **Pro Tier** 🚀
```javascript
{
  primary: OpenAI GPT-3.5-turbo (1200 tokens)   // High-quality AI
  secondary: Gemini 1.5 Flash (1200 tokens)     // Fast fallback
  tertiary: Claude 3 Haiku (1200 tokens)        // Advanced reasoning
  fallback: Mock Response                       // Always available
}
```

**Best for**: Professional development, complex bugs, architectural questions  
**Response Time**: ⚡⚡ Fast-Medium  
**Cost**: $$ Medium

---

### **Team Tier** 👥
```javascript
{
  primary: Claude 3.5 Sonnet (2000 tokens)      // Best reasoning
  secondary: OpenAI GPT-4 (2000 tokens)         // Most capable OpenAI
  tertiary: Gemini 1.5 Pro (2000 tokens)        // Advanced Gemini
  fallback: Mock Response                       // Always available
}
```

**Best for**: Enterprise projects, system design, critical debugging, team collaboration  
**Response Time**: ⚡⚡⚡ Medium (highest quality)  
**Cost**: $$$ Premium

---

## 🔄 Provider Fallback Chain

The system automatically tries providers in order until one succeeds:

```
User Query → Check Tier → Try Primary Provider
                              ↓ (if fails)
                         Try Secondary Provider
                              ↓ (if fails)
                         Try Tertiary Provider (Pro/Team only)
                              ↓ (if fails)
                         Use Mock Response (always works)
```

### Example Flow (Pro Tier):

1. **Try OpenAI GPT-3.5-turbo** 
   - ✅ Success → Return AI response
   - ❌ Fail (API down/quota exceeded) → Continue

2. **Try Gemini 1.5 Flash**
   - ✅ Success → Return AI response
   - ❌ Fail → Continue

3. **Try Claude 3 Haiku**
   - ✅ Success → Return AI response
   - ❌ Fail → Continue

4. **Use Mock Response** (Always available)
   - ✅ Always succeeds with comprehensive mock data

---

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Google Gemini Configuration
GEMINI_API_KEY=AIza...

# Anthropic Claude Configuration (NEW!)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Specify default tier
DEFAULT_SUBSCRIPTION_TIER=free
```

### API Key Setup

#### 1. **OpenAI API Key**
1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env` as `OPENAI_API_KEY`

#### 2. **Gemini API Key**
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env` as `GEMINI_API_KEY`

#### 3. **Anthropic API Key** (NEW!)
1. Visit https://console.anthropic.com/
2. Go to API Keys section
3. Create new API key
4. Add to `.env` as `ANTHROPIC_API_KEY`

---

## 💻 Usage

### Basic Usage

```javascript
const aiService = require('./src/services/aiService');

// Free tier user
const result = await aiService.analyzeError({
  errorMessage: 'TypeError: Cannot read property of undefined',
  subscriptionTier: 'free'
});

// Pro tier user
const result = await aiService.analyzeError({
  errorMessage: 'How to design a scalable microservices architecture?',
  subscriptionTier: 'pro'
});

// Team tier user (gets best models)
const result = await aiService.analyzeError({
  errorMessage: 'Complex system design question',
  subscriptionTier: 'team'
});
```

### Response Format

```javascript
{
  explanation: "Detailed explanation...",
  solution: "Step-by-step solution...",
  codeExample: "// Working code example",
  category: "runtime",
  tags: ["javascript", "typeerror"],
  confidence: 0.95,
  domainKnowledge: "Type safety, null checking...",
  preventionTips: [...],
  complexity: "O(1) time, O(1) space",
  relatedErrors: [...],
  debugging: [...],
  alternatives: [...],
  resources: [...],
  provider: "anthropic",        // Which provider was used
  model: "claude-3-5-sonnet",   // Which model was used
  language: "javascript",
  errorType: "runtime",
  timestamp: "2025-10-27T..."
}
```

---

## 🎯 Model Selection Strategy

### **Free Tier Strategy**
- **Focus**: Cost optimization, speed
- **Primary**: Gemini Flash (fastest, cheapest)
- **Rationale**: Free users get quick, reliable responses without high costs

### **Pro Tier Strategy**
- **Focus**: Quality & reliability
- **Primary**: OpenAI GPT-3.5 (proven quality)
- **Rationale**: Professional developers need consistent, high-quality answers

### **Team Tier Strategy**
- **Focus**: Best possible quality
- **Primary**: Claude 3.5 Sonnet (best reasoning)
- **Rationale**: Teams working on critical projects need the absolute best

---

## 📈 Cost Optimization

### Token Limits by Tier

| Tier | Max Tokens | Rationale |
|------|-----------|-----------|
| Free | 800 | Concise, focused responses |
| Pro | 1,200 | More detailed explanations |
| Team | 2,000 | Comprehensive, thorough analysis |

### Provider Cost Comparison (per 1M tokens)

| Provider | Model | Input Cost | Output Cost |
|----------|-------|-----------|-------------|
| Gemini | Flash | $0.075 | $0.30 |
| OpenAI | GPT-3.5 | $0.50 | $1.50 |
| OpenAI | GPT-4 | $30.00 | $60.00 |
| Anthropic | Haiku | $0.25 | $1.25 |
| Anthropic | Sonnet | $3.00 | $15.00 |
| Mock | N/A | $0 | $0 |

---

## 🔍 Provider Capabilities

### Question Type → Best Provider

| Question Type | Free Tier | Pro Tier | Team Tier |
|---------------|-----------|----------|-----------|
| Simple syntax error | Gemini ⚡ | OpenAI 🎯 | Claude 🚀 |
| Algorithm optimization | Gemini ⚡ | OpenAI 🎯 | Claude 🚀 |
| Architecture design | Gemini ⚡ | OpenAI 🎯 | **Claude 🌟** |
| Complex reasoning | Gemini ⚡ | OpenAI 🎯 | **Claude 🌟** |
| Code debugging | Gemini ⚡ | **OpenAI 🌟** | Claude 🚀 |
| DSA problems | Gemini ⚡ | **OpenAI 🌟** | Claude 🚀 |
| Security analysis | Gemini ⚡ | OpenAI 🎯 | **Claude 🌟** |

---

## 🧪 Testing Different Providers

### Test Script

```javascript
// tests/test-tier-based-providers.js
const aiService = require('../src/services/aiService');

async function testAllTiers() {
  const testError = 'TypeError: Cannot read property of undefined';
  
  console.log('Testing Free Tier...');
  const freeResult = await aiService.analyzeError({
    errorMessage: testError,
    subscriptionTier: 'free'
  });
  console.log(`Provider: ${freeResult.provider}, Model: ${freeResult.model}`);
  
  console.log('\nTesting Pro Tier...');
  const proResult = await aiService.analyzeError({
    errorMessage: testError,
    subscriptionTier: 'pro'
  });
  console.log(`Provider: ${proResult.provider}, Model: ${proResult.model}`);
  
  console.log('\nTesting Team Tier...');
  const teamResult = await aiService.analyzeError({
    errorMessage: testError,
    subscriptionTier: 'team'
  });
  console.log(`Provider: ${teamResult.provider}, Model: ${teamResult.model}`);
}

testAllTiers().catch(console.error);
```

---

## 🎨 Visual Provider Flow

```
┌─────────────────────────────────────────────────┐
│           User Submits Error Query              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Detect Subscription Tier                 │
│    • Free → Gemini Primary                      │
│    • Pro → OpenAI Primary                       │
│    • Team → Claude Primary                      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Try Primary Provider                   │
│                                                 │
│  ✅ Success → Return Response                   │
│  ❌ Failure → Continue to Secondary             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Try Secondary Provider                  │
│                                                 │
│  ✅ Success → Return Response                   │
│  ❌ Failure → Continue to Tertiary              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Try Tertiary Provider (Pro/Team)           │
│                                                 │
│  ✅ Success → Return Response                   │
│  ❌ Failure → Use Mock Response                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Mock Response (Always Works)            │
│     Comprehensive fallback solution             │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Benefits

### ✅ **Reliability**
- Multiple fallback options ensure service always responds
- Mock responses provide offline capability

### ✅ **Cost Optimization**
- Appropriate model selection based on tier
- No wasted costs on overp powered models for simple queries

### ✅ **Performance**
- Fast models for simple queries
- Best models for complex questions
- Tier-appropriate token limits

### ✅ **Flexibility**
- Easy to add new providers
- Configurable per-tier strategies
- Can adjust based on provider availability

### ✅ **Quality**
- Premium users get best models
- Free users still get good quality
- All users benefit from multi-provider support

---

## 🔧 Customization

### Adding a New Provider

```javascript
// 1. Install SDK
npm install new-ai-provider-sdk

// 2. Add to aiService.js
const NewAI = require('new-ai-provider-sdk');
const newAI = new NewAI({ apiKey: process.env.NEW_AI_KEY });

// 3. Create helper function
async function callNewAI(prompt, model, ...) {
  // Implementation
}

// 4. Update TIER_CONFIG
const TIER_CONFIG = {
  team: {
    primary: { provider: 'new-ai', model: 'best-model' },
    // ...
  }
};
```

### Modifying Tier Strategy

```javascript
// Change Pro tier to use Claude as primary
const TIER_CONFIG = {
  pro: {
    primary: { provider: 'anthropic', model: 'claude-3-haiku-20240307', maxTokens: 1200 },
    secondary: { provider: 'openai', model: 'gpt-3.5-turbo', maxTokens: 1200 },
    fallback: { provider: 'mock' }
  }
};
```

---

## 📊 Monitoring & Analytics

### Track Provider Usage

```javascript
// Add analytics to track which providers are used
const providerStats = {
  openai: 0,
  gemini: 0,
  anthropic: 0,
  mock: 0
};

// Increment in each helper function
function trackProvider(provider) {
  providerStats[provider]++;
  console.log('Provider Stats:', providerStats);
}
```

---

## 🎉 Summary

The tier-based AI provider system gives you:

- **🎯 Intelligent Model Selection**: Right model for right tier
- **💰 Cost Optimization**: No overspending on premium models
- **⚡ Performance**: Fast responses for all users
- **🛡️ Reliability**: Multiple fallbacks ensure uptime
- **🔧 Flexibility**: Easy to customize and extend
- **🌟 Quality**: Best possible responses for each tier

**Every user gets a great experience, optimized for their subscription level!** 🚀
