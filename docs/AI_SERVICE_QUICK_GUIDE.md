# AI Service Quick Reference Guide

## 🚀 Quick Start

### Basic Usage

```javascript
const aiService = require('./src/services/aiService');

const result = await aiService.analyzeError({
  errorMessage: 'Your error message here',
  subscriptionTier: 'free' // or 'pro' or 'team'
});

console.log(result.explanation);
console.log(result.solution);
```

### With Code Context

```javascript
const result = await aiService.analyzeError({
  errorMessage: 'TypeError: Cannot read property name of undefined',
  codeSnippet: `
    const user = null;
    console.log(user.name);
  `,
  fileName: 'app.js',
  lineNumber: 42,
  language: 'javascript',
  subscriptionTier: 'pro'
});
```

## 📊 Response Structure

```javascript
{
  // Core fields (all tiers)
  explanation: "Detailed explanation of the error",
  solution: "Step-by-step solution",
  codeExample: "Working code example",
  category: "error category",
  tags: ["relevant", "tags"],
  confidence: 0.9,
  
  // Enhanced fields (Pro/Team)
  domainKnowledge: "Domain concepts applied",
  preventionTips: ["tip1", "tip2"],
  complexity: "O(n log n) time, O(1) space",
  
  // Team tier only
  relatedErrors: ["similar error 1"],
  debugging: ["debug step 1"],
  alternatives: ["alternative approach"],
  resources: ["reference link"],
  
  // Metadata
  provider: "openai",
  model: "gpt-3.5-turbo",
  language: "javascript",
  errorType: "runtime",
  timestamp: "2025-10-27T..."
}
```

## 🎯 Supported Error Types

### Programming Errors
- **Type Errors**: Null/undefined access, type mismatches
- **Reference Errors**: Undefined variables, scope issues
- **Syntax Errors**: Invalid syntax, parsing errors
- **Import Errors**: Missing modules, wrong imports

### Algorithm Errors
- **Time Limit Exceeded**: Inefficient algorithms
- **Stack Overflow**: Missing base cases, infinite recursion
- **Complexity Issues**: Suboptimal algorithm choices

### Mathematical Errors
- **Division by Zero**: Mathematical precondition violations
- **Overflow/Underflow**: Numeric range violations
- **Precision Errors**: Floating-point arithmetic issues

### Logic Errors
- **Conditional Errors**: Wrong boolean logic
- **Assertion Failures**: Logic invariant violations
- **Incorrect Results**: Flawed reasoning

### Data Structure Errors
- **Index Out of Bounds**: Array access violations
- **Off-by-One Errors**: Loop boundary issues

## 💡 Domain Coverage

### When to Use This Service

✅ **Algorithm Problems**
```javascript
// Example: Inefficient search
errorMessage: "Time limit exceeded"
// AI suggests: Binary search instead of linear search
// Includes: Complexity analysis, optimal solution
```

✅ **Mathematical Issues**
```javascript
// Example: Floating-point comparison
errorMessage: "0.1 + 0.2 !== 0.3"
// AI suggests: Epsilon-based comparison
// Includes: IEEE 754 explanation, correct formula
```

✅ **Logic Errors**
```javascript
// Example: Wrong conditional
errorMessage: "Function returns incorrect result"
// AI suggests: Truth table, correct boolean logic
// Includes: Test cases, verification strategy
```

✅ **DSA Problems**
```javascript
// Example: Wrong data structure
errorMessage: "Slow lookup performance"
// AI suggests: Hash table instead of array
// Includes: Time/space trade-offs
```

## 🔧 Tips for Best Results

### 1. Provide Context
```javascript
// ✅ Good
analyzeError({
  errorMessage: "Division by zero",
  codeSnippet: "result = a / b",
  language: "python",
  fileName: "calculator.py"
})

// ❌ Not ideal
analyzeError({
  errorMessage: "Error in my code"
})
```

### 2. Include Code Snippets
```javascript
// ✅ Include relevant code
codeSnippet: `
function factorial(n) {
  return n * factorial(n - 1); // Missing base case!
}
`

// Helps AI identify: recursion error, missing base case
```

### 3. Specify Language
```javascript
language: 'javascript' // Auto-detected if not specified
// Supported: javascript, python, java, c++, go, rust, etc.
```

### 4. Choose Appropriate Tier
```javascript
// Free: Quick answers
subscriptionTier: 'free'

// Pro: Detailed analysis + complexity
subscriptionTier: 'pro'

// Team: Comprehensive + alternatives
subscriptionTier: 'team'
```

## 📈 Common Use Cases

### Algorithm Optimization
```javascript
const result = await aiService.analyzeError({
  errorMessage: 'Function too slow for large input',
  codeSnippet: 'for loop doing O(n²) work',
  subscriptionTier: 'pro'
});

// Result includes:
// - Current complexity: O(n²)
// - Optimal solution: O(n log n)
// - Code example with better algorithm
```

### Mathematical Debugging
```javascript
const result = await aiService.analyzeError({
  errorMessage: 'Calculation gives wrong result',
  codeSnippet: 'compound interest formula',
  subscriptionTier: 'pro'
});

// Result includes:
// - Formula verification
// - Correct mathematical approach
// - Edge case handling
```

### Logic Error Detection
```javascript
const result = await aiService.analyzeError({
  errorMessage: 'Conditional logic failing',
  codeSnippet: 'if (age > 18 || isStudent)',
  subscriptionTier: 'pro'
});

// Result includes:
// - Boolean logic analysis
// - Truth table
// - Correct conditional
```

## 🛠️ Helper Functions

### Detect Language
```javascript
const language = aiService.detectLanguage(
  'TypeError: undefined',
  'const x = y;'
);
// Returns: 'javascript'
```

### Detect Error Type
```javascript
const errorType = aiService.detectErrorType(
  'Division by zero error'
);
// Returns: 'mathematical'
```

### Parse Stack Trace
```javascript
const frames = aiService.parseStackTrace(errorMessage);
// Returns: [{ function, file, line, column }, ...]
```

## ⚡ Performance Tips

1. **Use Batch Analysis** (Team tier only)
```javascript
const results = await aiService.analyzeBatchErrors(
  [error1, error2, error3],
  'team'
);
```

2. **Cache Results**
```javascript
// Results include timestamp - implement caching
const cacheKey = `${errorMessage}-${language}`;
// Check cache before calling API
```

3. **Optimize Prompts**
```javascript
// Include only relevant code snippets
// Keep snippets under 50 lines for best results
```

## 🔍 Debugging the AI Service

### Enable Verbose Logging
```javascript
// Set in environment or code
process.env.DEBUG = 'ai-service';
```

### Check API Status
```javascript
// OpenAI failing? Falls back to Gemini
// Both failing? Uses enhanced mock responses
```

### Validate Responses
```javascript
if (result.provider === 'mock') {
  console.log('Using fallback - configure API keys');
}
```

## 📚 Additional Resources

- [Full Documentation](./AI_SERVICE_ENHANCED.md)
- [Test Suite](../tests/test-ai-service-enhanced.js)
- [API Reference](../src/services/aiService.js)

## 🐛 Troubleshooting

### "Empty response"
- Check API keys in `.env`
- Verify internet connection
- Check API quotas

### "Low confidence"
- Provide more context
- Include code snippet
- Specify language

### "Incorrect solution"
- Upgrade subscription tier
- Add more code context
- Include stack trace

## 💬 Support

For issues or questions:
1. Check documentation
2. Run test suite
3. Review API logs
4. Contact support

---

**Last Updated**: October 2025  
**Version**: 2.0.0 Enhanced
